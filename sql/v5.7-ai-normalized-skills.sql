-- Seed Club Talent V5.7: AI 标准技能与多语言检索词
-- 在 CloudBase PostgreSQL 的 SQL 编辑器中完整执行一次。

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS ai_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS ai_search_terms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS ai_skills_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.members.ai_skills IS
'AI 从成员原始资料中提炼出的统一技能标签，仅包含资料明确支持的能力。';

COMMENT ON COLUMN public.members.ai_search_terms IS
'用于搜索匹配的中英文技能同义词、缩写和相关专业词。';

COMMENT ON COLUMN public.members.ai_skills_updated_at IS
'AI 标准技能最近一次成功生成的时间。';

CREATE INDEX IF NOT EXISTS members_ai_skills_gin_idx
ON public.members USING GIN (ai_skills);

CREATE INDEX IF NOT EXISTS members_ai_search_terms_gin_idx
ON public.members USING GIN (ai_search_terms);
