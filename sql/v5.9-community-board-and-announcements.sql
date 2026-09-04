-- Seed Club Talent V5.9：中英双语成员留言板与更新公告
-- 在 CloudBase PostgreSQL 的 SQL 编辑器中完整执行一次。

CREATE TABLE IF NOT EXISTS public.message_board_posts (
  id BIGSERIAL PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(80) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  content_zh TEXT NOT NULL CHECK (char_length(content_zh) BETWEEN 1 AND 1200),
  content_en TEXT NOT NULL CHECK (char_length(content_en) BETWEEN 1 AND 1200),
  source_language VARCHAR(8) NOT NULL DEFAULT 'unknown',
  translation_status VARCHAR(16) NOT NULL DEFAULT 'ready'
    CHECK (translation_status IN ('ready', 'fallback')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS message_board_posts_created_at_idx
ON public.message_board_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS message_board_posts_owner_id_idx
ON public.message_board_posts (owner_id);

ALTER TABLE public.message_board_posts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.message_board_posts FROM anon, authenticated;
GRANT SELECT ON public.message_board_posts TO anon, authenticated;
GRANT INSERT, DELETE ON public.message_board_posts TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.message_board_posts_id_seq TO authenticated;

-- 所有人可以查看留言。
DROP POLICY IF EXISTS "message_board_public_read" ON public.message_board_posts;
CREATE POLICY "message_board_public_read"
ON public.message_board_posts
FOR SELECT
TO anon, authenticated
USING (TRUE);

-- 登录账号只能以自己的 UID 创建留言。
DROP POLICY IF EXISTS "message_board_member_insert" ON public.message_board_posts;
CREATE POLICY "message_board_member_insert"
ON public.message_board_posts
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid())::TEXT);

-- 普通成员只能删除自己的留言；管理员可以删除任意留言。
DROP POLICY IF EXISTS "message_board_owner_or_admin_delete" ON public.message_board_posts;
CREATE POLICY "message_board_owner_or_admin_delete"
ON public.message_board_posts
FOR DELETE
TO authenticated
USING (
  owner_id = (SELECT auth.uid())::TEXT
  OR (SELECT auth.uid())::TEXT = '2094762302839332865'
);

-- 由数据库写入真实账号 UID 和显示名，前端不能冒充其他成员。
CREATE OR REPLACE FUNCTION public.prepare_message_board_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid TEXT;
  v_author_name TEXT;
BEGIN
  v_uid := (SELECT auth.uid())::TEXT;
  IF v_uid IS NULL OR v_uid = '' THEN
    RAISE EXCEPTION 'member login required';
  END IF;

  NEW.content := btrim(NEW.content);
  IF char_length(NEW.content) < 1 OR char_length(NEW.content) > 500 THEN
    RAISE EXCEPTION 'message length must be between 1 and 500 characters';
  END IF;

  NEW.owner_id := v_uid;
  NEW.created_at := NOW();
  NEW.content_zh := COALESCE(NULLIF(btrim(NEW.content_zh), ''), NEW.content);
  NEW.content_en := COALESCE(NULLIF(btrim(NEW.content_en), ''), NEW.content);
  NEW.source_language := CASE
    WHEN NEW.source_language IN ('zh', 'en', 'mixed') THEN NEW.source_language
    ELSE 'unknown'
  END;
  NEW.translation_status := CASE
    WHEN NEW.translation_status = 'ready' THEN 'ready'
    ELSE 'fallback'
  END;

  IF v_uid = '2094762302839332865' THEN
    NEW.author_name := 'Seed Club 管理员';
  ELSE
    SELECT NULLIF(btrim(m.name), '')
    INTO v_author_name
    FROM public.members AS m
    WHERE m.owner_id = v_uid
    LIMIT 1;

    NEW.author_name := COALESCE(v_author_name, 'Seed Club 成员');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_message_board_post() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_message_board_post() TO authenticated;

DROP TRIGGER IF EXISTS message_board_prepare_post
ON public.message_board_posts;

CREATE TRIGGER message_board_prepare_post
BEFORE INSERT ON public.message_board_posts
FOR EACH ROW
EXECUTE FUNCTION public.prepare_message_board_post();

COMMENT ON TABLE public.message_board_posts IS
'Seed Club Talent 公共留言板；只有已登录账号可以发布，留言身份由数据库绑定。';

-- 网站更新公告：所有访客看到当前公告，只有管理员可以新增、修改或删除。
CREATE TABLE IF NOT EXISTS public.site_announcements (
  id BIGSERIAL PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL,
  title_original VARCHAR(120) NOT NULL CHECK (char_length(title_original) BETWEEN 1 AND 120),
  content_original TEXT NOT NULL CHECK (char_length(content_original) BETWEEN 1 AND 2000),
  title_zh VARCHAR(240) NOT NULL,
  content_zh TEXT NOT NULL CHECK (char_length(content_zh) BETWEEN 1 AND 4000),
  title_en VARCHAR(240) NOT NULL,
  content_en TEXT NOT NULL CHECK (char_length(content_en) BETWEEN 1 AND 4000),
  source_language VARCHAR(8) NOT NULL DEFAULT 'unknown',
  translation_status VARCHAR(16) NOT NULL DEFAULT 'ready'
    CHECK (translation_status IN ('ready', 'fallback')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_announcements_active_updated_idx
ON public.site_announcements (active, updated_at DESC);

ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.site_announcements FROM anon, authenticated;
GRANT SELECT ON public.site_announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_announcements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.site_announcements_id_seq TO authenticated;

DROP POLICY IF EXISTS "site_announcements_public_read" ON public.site_announcements;
CREATE POLICY "site_announcements_public_read"
ON public.site_announcements
FOR SELECT
TO anon, authenticated
USING (
  active = TRUE
  OR (SELECT auth.uid())::TEXT = '2094762302839332865'
);

DROP POLICY IF EXISTS "site_announcements_admin_insert" ON public.site_announcements;
CREATE POLICY "site_announcements_admin_insert"
ON public.site_announcements
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = '2094762302839332865'
  AND (SELECT auth.uid())::TEXT = '2094762302839332865'
);

DROP POLICY IF EXISTS "site_announcements_admin_update" ON public.site_announcements;
CREATE POLICY "site_announcements_admin_update"
ON public.site_announcements
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid())::TEXT = '2094762302839332865')
WITH CHECK (
  owner_id = '2094762302839332865'
  AND (SELECT auth.uid())::TEXT = '2094762302839332865'
);

DROP POLICY IF EXISTS "site_announcements_admin_delete" ON public.site_announcements;
CREATE POLICY "site_announcements_admin_delete"
ON public.site_announcements
FOR DELETE
TO authenticated
USING ((SELECT auth.uid())::TEXT = '2094762302839332865');

CREATE OR REPLACE FUNCTION public.prepare_site_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid TEXT;
BEGIN
  v_uid := (SELECT auth.uid())::TEXT;
  IF v_uid <> '2094762302839332865' THEN
    RAISE EXCEPTION 'administrator permission required';
  END IF;

  NEW.owner_id := v_uid;
  NEW.title_original := btrim(NEW.title_original);
  NEW.content_original := btrim(NEW.content_original);
  NEW.title_zh := COALESCE(NULLIF(btrim(NEW.title_zh), ''), NEW.title_original);
  NEW.content_zh := COALESCE(NULLIF(btrim(NEW.content_zh), ''), NEW.content_original);
  NEW.title_en := COALESCE(NULLIF(btrim(NEW.title_en), ''), NEW.title_original);
  NEW.content_en := COALESCE(NULLIF(btrim(NEW.content_en), ''), NEW.content_original);
  NEW.source_language := CASE
    WHEN NEW.source_language IN ('zh', 'en', 'mixed') THEN NEW.source_language
    ELSE 'unknown'
  END;
  NEW.translation_status := CASE
    WHEN NEW.translation_status = 'ready' THEN 'ready'
    ELSE 'fallback'
  END;
  NEW.updated_at := NOW();

  IF TG_OP = 'INSERT' THEN
    UPDATE public.site_announcements SET active = FALSE WHERE active = TRUE;
    NEW.created_at := NOW();
    NEW.active := TRUE;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_site_announcement() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_site_announcement() TO authenticated;

DROP TRIGGER IF EXISTS site_announcement_prepare_write
ON public.site_announcements;

CREATE TRIGGER site_announcement_prepare_write
BEFORE INSERT OR UPDATE ON public.site_announcements
FOR EACH ROW
EXECUTE FUNCTION public.prepare_site_announcement();

COMMENT ON TABLE public.site_announcements IS
'Seed Club Talent 中英文更新公告；发布新公告时自动停用上一条。';
