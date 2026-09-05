-- ETHOnline 2026: wallet-linked profiles and The Graph evidence cache.
-- Run once in the CloudBase PostgreSQL SQL editor before deploying V6.

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onchain_proof JSONB,
ADD COLUMN IF NOT EXISTS onchain_proof_updated_at TIMESTAMPTZ;

ALTER TABLE public.members
DROP CONSTRAINT IF EXISTS members_wallet_address_format;

ALTER TABLE public.members
ADD CONSTRAINT members_wallet_address_format
CHECK (
  wallet_address IS NULL
  OR wallet_address ~ '^0x[0-9a-f]{40}$'
);

CREATE INDEX IF NOT EXISTS members_wallet_address_idx
ON public.members (wallet_address)
WHERE wallet_address IS NOT NULL;

COMMENT ON COLUMN public.members.wallet_address IS
'Lowercase EVM address explicitly linked to the public member profile.';

COMMENT ON COLUMN public.members.wallet_connected_at IS
'Time the current wallet address was linked. Linking does not by itself prove legal identity.';

COMMENT ON COLUMN public.members.onchain_proof IS
'Cached structured activity evidence returned from live The Graph queries.';

COMMENT ON COLUMN public.members.onchain_proof_updated_at IS
'Time the cached The Graph activity evidence was last refreshed.';

