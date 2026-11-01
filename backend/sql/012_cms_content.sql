-- QTND CMS records. Apply as database owner/postgres in scholyx.
BEGIN;
CREATE TABLE IF NOT EXISTS public.cms_documents (
  kind text NOT NULL CHECK (kind IN ('lessons','questions','exams','rag')),
  content_id text NOT NULL CHECK (length(content_id) BETWEEN 1 AND 120),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload)='object'),
  updated_by uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(kind,content_id)
);
CREATE INDEX IF NOT EXISTS cms_documents_updated_idx ON public.cms_documents(updated_at DESC);
GRANT USAGE ON SCHEMA public TO scholyx_user;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.cms_documents TO scholyx_user;
COMMIT;
