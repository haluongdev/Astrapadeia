-- Read-only verification (after 007 migration).
SELECT COUNT(*) AS total_appendix_permissions
FROM permissions WHERE id IN (
 'public.view','public.try','content.published.view','auth.access','profile.self',
 'study.practice','study.review','study.progress','ai.self','feedback.send','feedback.manage',
 'cms.lessons','cms.questions','cms.grading','cms.rag','cms.rules','cms.reports',
 'admin.accounts','rbac.manage','system.stats','system.config','system.audit',
 'system.deletions','vip.self','vip.plans','vip.transactions','vip.revenue'
);
SELECT r.id,r.is_system,COUNT(rp.permission_id)::int AS permission_count
FROM roles r LEFT JOIN role_permissions rp ON rp.role_id=r.id
GROUP BY r.id,r.is_system ORDER BY r.id;
SELECT role_id,permission_id FROM role_permissions
WHERE (role_id='qtv' AND permission_id IN('cms.questions','study.practice'))
OR (role_id='student' AND permission_id='rbac.manage');
