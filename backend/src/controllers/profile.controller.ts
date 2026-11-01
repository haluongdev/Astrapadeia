import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { BadRequestError } from '../errors/AppError.js';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows } = await pool.query(
      "SELECT *, to_char(target_exam_date, 'YYYY-MM-DD') AS target_exam_date FROM student_profiles WHERE account_id = $1",
      [req.account!.id]
    );
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      user: {
        id: req.account!.id,
        fullName: req.account!.full_name,
        email: req.account!.email,
        phone: req.account!.phone,
        grade: req.account!.grade,
        status: req.account!.status,
      },
      profile: rows[0] || null,
    });
  } catch (error) { next(error); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  let client: import('pg').PoolClient | undefined;
  let inTransaction = false;
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestError('Dữ liệu hồ sơ không hợp lệ');
    }

    const { school, province, selectedSubjects, targetScores, targetExamDate, allowAiPersonalization, grade,
      fullName, className, avatarDataUrl } = body;
    if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 120)) {
      throw new BadRequestError('Họ tên phải từ 2 đến 120 ký tự');
    }
    if (className !== undefined && (typeof className !== 'string' || className.length > 40)) {
      throw new BadRequestError('Lớp học không hợp lệ');
    }
    if (avatarDataUrl !== undefined && avatarDataUrl !== null) {
      if (typeof avatarDataUrl !== 'string' || avatarDataUrl.length > 180000 ||
          !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatarDataUrl)) {
        throw new BadRequestError('Ảnh đại diện phải là PNG, JPEG hoặc WebP tối đa 100 KB');
      }
      const bytes = Buffer.from(avatarDataUrl.substring(avatarDataUrl.indexOf(',') + 1), 'base64');
      const png = bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
      const jpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const webp = bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
        bytes.subarray(8, 12).toString('ascii') === 'WEBP';
      if (bytes.length > 100 * 1024 || !bytes.length || !(png || jpeg || webp)) {
        throw new BadRequestError('Ảnh đại diện không hợp lệ hoặc vượt quá 100 KB');
      }
    }
    if (grade !== undefined && ![10, 11, 12].includes(grade)) throw new BadRequestError('Khối lớp không hợp lệ');
    if ([school, province].some(v => v !== undefined &&
      (typeof v !== 'string' || v.length > 200))) {
      throw new BadRequestError('Trường học hoặc tỉnh/thành không hợp lệ');
    }
    if (selectedSubjects !== undefined &&
      (!Array.isArray(selectedSubjects) || selectedSubjects.length > 30 ||
       !selectedSubjects.every((s: unknown) => typeof s === 'string' && s.length > 0 && s.length <= 80) ||
       new Set(selectedSubjects).size !== selectedSubjects.length)) {
      throw new BadRequestError('Danh sách môn học không hợp lệ');
    }
    if (targetScores !== undefined &&
      (!targetScores || typeof targetScores !== 'object' || Array.isArray(targetScores) ||
       Object.keys(targetScores).length > 30 ||
       !Object.entries(targetScores).every(([key, val]) =>
         key.length > 0 && key.length <= 80 && typeof val === 'number' &&
         Number.isFinite(val) && val >= 0 && val <= 10))) {
      throw new BadRequestError('Điểm mục tiêu không hợp lệ');
    }
    if (allowAiPersonalization !== undefined && typeof allowAiPersonalization !== 'boolean') {
      throw new BadRequestError('Lựa chọn cá nhân hóa AI không hợp lệ');
    }
    if (targetExamDate !== undefined && targetExamDate !== null &&
        (typeof targetExamDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(targetExamDate))) {
      throw new BadRequestError('Ngày thi mục tiêu không hợp lệ');
    }

    client = await pool.connect();
    await client.query('BEGIN');
    inTransaction = true;
    if (grade !== undefined || fullName !== undefined) {
      await client.query(
        'UPDATE accounts SET grade = COALESCE($2, grade), full_name = COALESCE($3, full_name) WHERE id = $1',
        [req.account!.id, grade ?? null, fullName === undefined ? null : fullName.trim()]
      );
    }
    const { rows } = await client.query(
      `INSERT INTO student_profiles
          (account_id, school, province, selected_subjects, target_scores, target_exam_date, ai_personalization, class_name, avatar_url)
        SELECT $1, $2, $3,
               COALESCE($4::text[], ARRAY[]::text[]),
               COALESCE($5::jsonb, '{}'::jsonb),
               $6::date, COALESCE($7::boolean, false), $8, $9
        WHERE EXISTS (
          SELECT 1 FROM account_roles
          WHERE account_id = $1 AND role_id = 'student'
        )
        ON CONFLICT (account_id) DO UPDATE SET
          school = COALESCE(EXCLUDED.school, student_profiles.school),
          province = COALESCE(EXCLUDED.province, student_profiles.province),
          selected_subjects = CASE WHEN $4::text[] IS NULL THEN student_profiles.selected_subjects ELSE EXCLUDED.selected_subjects END,
          target_scores = COALESCE($5::jsonb, student_profiles.target_scores),
          target_exam_date = COALESCE($6::date, student_profiles.target_exam_date),
          ai_personalization = COALESCE($7::boolean, student_profiles.ai_personalization),
          class_name = COALESCE($8, student_profiles.class_name),
          avatar_url = COALESCE($9, student_profiles.avatar_url)
        RETURNING *, to_char(target_exam_date, 'YYYY-MM-DD') AS target_exam_date`,
      [
        req.account!.id,
        school === undefined ? null : school.trim(),
        province === undefined ? null : province.trim(),
        selectedSubjects ?? null,
        targetScores === undefined ? null : JSON.stringify(targetScores),
        targetExamDate ?? null,
        allowAiPersonalization ?? null,
        className === undefined ? null : className.trim(),
        avatarDataUrl ?? null,
      ]
    );
    if (!rows.length) {
      throw new BadRequestError('Tài khoản không có quyền lưu hồ sơ Student');
    }
    await client.query('COMMIT');
    inTransaction = false;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ profile: rows[0] });
  } catch (error) {
    if (inTransaction && client) {
      try { await client.query('ROLLBACK'); } catch (rollbackError) { console.error('Profile rollback failed', rollbackError); }
    }
    next(error);
  } finally { client?.release(); }
}

export async function requestDeletion(req: Request, res: Response, next: NextFunction): Promise<void> {
  const client = await pool.connect();
  let open = false;
  try {
    await client.query('BEGIN');
    open = true;
    const existing = await client.query(
      `SELECT id FROM deletion_requests WHERE account_id = $1 AND status = 'new' LIMIT 1`,
      [req.account!.id]
    );
    if (!existing.rows.length) {
      await client.query(
        'INSERT INTO deletion_requests(account_id) VALUES ($1)',
        [req.account!.id]
      );
    }
    await client.query(
      'INSERT INTO audit_logs(actor_id, action, target_id) VALUES ($1, $2, $3)',
      [req.account!.id, 'DATA_DELETION_REQUEST', req.account!.id]
    );
    await client.query('COMMIT');
    open = false;
    res.status(202).json({
      status: 'new',
      message: 'Đã tiếp nhận yêu cầu xóa dữ liệu; yêu cầu chưa được thực thi'
    });
  } catch (error) {
    if (open) {
      try { await client.query('ROLLBACK'); } catch (rollbackError) {
        console.error('Deletion request rollback failed:', rollbackError);
      }
    }
    next(error);
  } finally { client.release(); }
}

// SCHOLYX_PROFILE_V2_EXPORT: Account-owned data only; no secret hashes or session tokens.
export async function exportMyData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const accountId = req.account!.id;
    const [account, profile, requests] = await Promise.all([
      pool.query(
        `SELECT id, full_name, email, phone, grade, status, created_at, last_login_at,
                consent_terms_version, consent_privacy_version, consent_at
         FROM accounts WHERE id = $1`, [accountId]),
      pool.query(
        `SELECT school, province, class_name, avatar_url, selected_subjects, target_scores,
                to_char(target_exam_date, 'YYYY-MM-DD') AS target_exam_date, ai_personalization
         FROM student_profiles WHERE account_id = $1`, [accountId]),
      pool.query(
        `SELECT status, created_at, handled_at
         FROM deletion_requests WHERE account_id = $1 ORDER BY created_at DESC`, [accountId])
    ]);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'attachment; filename="scholyx-personal-data.json"');
    res.json({
      exportedAt: new Date().toISOString(),
      scope: 'Account, student profile, and deletion requests only; learning activity export not yet supported',
      account: account.rows[0] ?? null,
      profile: profile.rows[0] ?? null,
      deletionRequests: requests.rows
    });
  } catch (error) { next(error); }
}
