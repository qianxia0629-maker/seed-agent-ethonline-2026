-- Seed Club Talent V5.11：管理员可实时维护的中英双语众筹账本
-- 在上海 CloudBase PostgreSQL 的 SQL 编辑器中完整执行一次。

CREATE TABLE IF NOT EXISTS public.site_crowdfunding (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  owner_id VARCHAR(64) NOT NULL DEFAULT '2094762302839332865',
  evm_address VARCHAR(80) NOT NULL,
  raised_original VARCHAR(240) NOT NULL,
  raised_zh VARCHAR(480) NOT NULL,
  raised_en VARCHAR(480) NOT NULL,
  current_expenses_original TEXT NOT NULL CHECK (char_length(current_expenses_original) BETWEEN 1 AND 4000),
  current_expenses_zh TEXT NOT NULL CHECK (char_length(current_expenses_zh) BETWEEN 1 AND 8000),
  current_expenses_en TEXT NOT NULL CHECK (char_length(current_expenses_en) BETWEEN 1 AND 8000),
  future_budget_original TEXT NOT NULL CHECK (char_length(future_budget_original) BETWEEN 1 AND 4000),
  future_budget_zh TEXT NOT NULL CHECK (char_length(future_budget_zh) BETWEEN 1 AND 8000),
  future_budget_en TEXT NOT NULL CHECK (char_length(future_budget_en) BETWEEN 1 AND 8000),
  source_language VARCHAR(8) NOT NULL DEFAULT 'zh',
  translation_status VARCHAR(16) NOT NULL DEFAULT 'ready'
    CHECK (translation_status IN ('ready', 'fallback')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.site_crowdfunding (
  id,
  evm_address,
  raised_original,
  raised_zh,
  raised_en,
  current_expenses_original,
  current_expenses_zh,
  current_expenses_en,
  future_budget_original,
  future_budget_zh,
  future_budget_en
)
VALUES (
  1,
  '0xecf2930ba7d960cc598377ef25435349b0b619e0',
  '暂无已确认入账',
  '暂无已确认入账',
  'No confirmed contributions yet',
  E'品牌域名注册（1 年）：¥83\n云服务、数据库与函数：待账单对账\n已确认开支合计：¥83',
  E'品牌域名注册（1 年）：¥83\n云服务、数据库与函数：待账单对账\n已确认开支合计：¥83',
  E'Brand domain registration (1 year): ¥83\nCloud services, database, and functions: pending billing reconciliation\nTotal confirmed expenses: ¥83',
  E'域名续费：约 ¥90 / 年\n托管、CDN、数据库与云函数：¥0–100 / 月\nAI 搜索与自动翻译 API：¥0–300 / 月\n邮件通知、备份与安全：¥0–200 / 月\n扩容和突发费用预留：¥0–200 / 月\n年度预算合计：约 ¥90–9,690',
  E'域名续费：约 ¥90 / 年\n托管、CDN、数据库与云函数：¥0–100 / 月\nAI 搜索与自动翻译 API：¥0–300 / 月\n邮件通知、备份与安全：¥0–200 / 月\n扩容和突发费用预留：¥0–200 / 月\n年度预算合计：约 ¥90–9,690',
  E'Domain renewal: approx. ¥90 / year\nHosting, CDN, database, and cloud functions: ¥0–100 / month\nAI search and translation APIs: ¥0–300 / month\nEmail, backups, and security: ¥0–200 / month\nScaling and contingency reserve: ¥0–200 / month\nEstimated annual budget: approx. ¥90–9,690'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_crowdfunding ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.site_crowdfunding FROM anon, authenticated;
GRANT SELECT ON public.site_crowdfunding TO anon, authenticated;
GRANT UPDATE ON public.site_crowdfunding TO authenticated;

DROP POLICY IF EXISTS "site_crowdfunding_public_read" ON public.site_crowdfunding;
CREATE POLICY "site_crowdfunding_public_read"
ON public.site_crowdfunding
FOR SELECT
TO anon, authenticated
USING (TRUE);

DROP POLICY IF EXISTS "site_crowdfunding_admin_update" ON public.site_crowdfunding;
CREATE POLICY "site_crowdfunding_admin_update"
ON public.site_crowdfunding
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid())::TEXT = '2094762302839332865')
WITH CHECK (
  owner_id = '2094762302839332865'
  AND (SELECT auth.uid())::TEXT = '2094762302839332865'
);

CREATE OR REPLACE FUNCTION public.prepare_site_crowdfunding()
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

  NEW.id := 1;
  NEW.owner_id := v_uid;
  NEW.evm_address := btrim(NEW.evm_address);
  IF NEW.evm_address !~ '^0x[0-9a-fA-F]{40}$' THEN
    RAISE EXCEPTION 'invalid EVM address';
  END IF;

  NEW.raised_original := btrim(NEW.raised_original);
  NEW.raised_zh := COALESCE(NULLIF(btrim(NEW.raised_zh), ''), NEW.raised_original);
  NEW.raised_en := COALESCE(NULLIF(btrim(NEW.raised_en), ''), NEW.raised_original);
  NEW.current_expenses_original := btrim(NEW.current_expenses_original);
  NEW.current_expenses_zh := COALESCE(NULLIF(btrim(NEW.current_expenses_zh), ''), NEW.current_expenses_original);
  NEW.current_expenses_en := COALESCE(NULLIF(btrim(NEW.current_expenses_en), ''), NEW.current_expenses_original);
  NEW.future_budget_original := btrim(NEW.future_budget_original);
  NEW.future_budget_zh := COALESCE(NULLIF(btrim(NEW.future_budget_zh), ''), NEW.future_budget_original);
  NEW.future_budget_en := COALESCE(NULLIF(btrim(NEW.future_budget_en), ''), NEW.future_budget_original);
  NEW.source_language := CASE WHEN NEW.source_language IN ('zh', 'en', 'mixed') THEN NEW.source_language ELSE 'unknown' END;
  NEW.translation_status := CASE WHEN NEW.translation_status = 'ready' THEN 'ready' ELSE 'fallback' END;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_site_crowdfunding() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_site_crowdfunding() TO authenticated;

DROP TRIGGER IF EXISTS site_crowdfunding_prepare_update ON public.site_crowdfunding;
CREATE TRIGGER site_crowdfunding_prepare_update
BEFORE UPDATE ON public.site_crowdfunding
FOR EACH ROW
EXECUTE FUNCTION public.prepare_site_crowdfunding();

COMMENT ON TABLE public.site_crowdfunding IS
'Seed Club Talent 众筹到账、当前开支和未来预算的中英文公开账本；仅管理员可更新。';
