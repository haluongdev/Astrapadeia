import type { ScreenId } from '../types';
import { getScreenByPath, getScreenMetadata } from './screenRegistry';

/** The view router's URL boundary. Keep URL handling outside visual components. */
export function screenFromLocation(hash: string): ScreenId | null {
  const pathname = hash.replace(/^#/, '').split('?')[0].replace(/\/$/, '') || '/home';
  return getScreenByPath(pathname)?.id ?? null;
}

export function hashForScreen(screenId: ScreenId): string {
  return `#${getScreenMetadata(screenId)?.path ?? '/home'}`;
}

/** Route IDs are the stable contract for API-ready features and mock navigation. */
export const STUDENT_QUICK_LINKS: ReadonlyArray<ScreenId> = [
  'overview-free', 'lessons', 'practice-setup', 'exam-catalog',
  'review-progress', 'vip-roadmap', 'ai', 'profile-settings'
];
export const CONTENT_ADMIN_LINKS: ReadonlyArray<ScreenId> = [
  'cms-lessons', 'cms-questions', 'cms-matrix', 'cms-grading', 'cms-rag', 'cms-feedback'
];
export const SYSTEM_ADMIN_LINKS: ReadonlyArray<ScreenId> = [
  'admin-overview', 'admin-roles', 'admin-config-audit'
];
