-- Seed Club Talent V4：AI 搜索每日次数记录
-- 在 CloudBase PostgreSQL SQL 编辑器中执行一次即可。

CREATE TABLE IF NOT EXISTS public.ai_search_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  usage_date DATE NOT NULL,
  search_count INTEGER NOT NULL DEFAULT 0 CHECK (search_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, usage_date)
);

ALTER TABLE public.ai_search_usage ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.ai_search_usage FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ai_search_usage TO service_role;

CREATE INDEX IF NOT EXISTS ai_search_usage_date_idx
ON public.ai_search_usage (usage_date);
