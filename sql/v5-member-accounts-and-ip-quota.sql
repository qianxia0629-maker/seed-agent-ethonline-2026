-- Seed Club Talent V5：成员账号资料归属 + AI 搜索原子配额
-- 在 CloudBase PostgreSQL 的 SQL 编辑器中完整执行一次。

-- 1. 每张成员卡记录创建者。旧资料保持 NULL，只能由管理员维护。
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS owner_id VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS members_one_profile_per_owner_idx
ON public.members (owner_id)
WHERE owner_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS members_owner_id_idx
ON public.members (owner_id);

-- 2. 已登录成员可以创建一张属于自己的资料，并且只能修改自己的资料。
GRANT SELECT, INSERT, UPDATE ON public.members TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.members_id_seq TO authenticated;

DROP POLICY IF EXISTS "member_can_insert_own_profile" ON public.members;
CREATE POLICY "member_can_insert_own_profile"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = (SELECT auth.uid())
  AND visibility = 'public'
);

DROP POLICY IF EXISTS "member_can_update_own_profile" ON public.members;
CREATE POLICY "member_can_update_own_profile"
ON public.members
FOR UPDATE
TO authenticated
USING (
  owner_id = (SELECT auth.uid())
)
WITH CHECK (
  owner_id = (SELECT auth.uid())
  AND visibility = 'public'
);

-- 管理员现有的 seedclub_admin_can_insert / update / delete 策略继续生效。
-- 普通成员没有 DELETE 策略，因此不能删除资料，也不能修改他人的资料。

-- 3. 原子占用每日 AI 搜索次数，避免并发请求绕过 10 次限制。
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

CREATE OR REPLACE FUNCTION public.consume_ai_search_quota(
  p_identity TEXT,
  p_usage_date DATE,
  p_daily_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INTEGER,
  remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_identity IS NULL OR length(p_identity) < 8 OR length(p_identity) > 160 THEN
    RAISE EXCEPTION 'invalid quota identity';
  END IF;

  IF p_daily_limit < 1 OR p_daily_limit > 100 THEN
    RAISE EXCEPTION 'invalid daily limit';
  END IF;

  INSERT INTO public.ai_search_usage (
    id,
    user_id,
    usage_date,
    search_count,
    updated_at
  )
  VALUES (
    p_identity || ':' || p_usage_date::TEXT,
    p_identity,
    p_usage_date,
    1,
    NOW()
  )
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    search_count = public.ai_search_usage.search_count + 1,
    updated_at = NOW()
  WHERE public.ai_search_usage.search_count < p_daily_limit
  RETURNING public.ai_search_usage.search_count INTO v_count;

  IF v_count IS NULL THEN
    SELECT u.search_count
    INTO v_count
    FROM public.ai_search_usage AS u
    WHERE u.user_id = p_identity
      AND u.usage_date = p_usage_date;

    RETURN QUERY SELECT FALSE, COALESCE(v_count, p_daily_limit), 0;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_count, GREATEST(0, p_daily_limit - v_count);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_search_quota(TEXT, DATE, INTEGER)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_ai_search_quota(TEXT, DATE, INTEGER)
TO service_role;
