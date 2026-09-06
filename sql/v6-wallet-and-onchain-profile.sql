-- Seed Agent / ETHOnline 2026 Day 2: wallet and onchain profile foundation.
-- Run this once in the CloudBase PostgreSQL SQL editor before deploying the Day 2 frontend.

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42);

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS ens_name VARCHAR(255);

ALTER TABLE public.members
DROP CONSTRAINT IF EXISTS members_wallet_address_format;

ALTER TABLE public.members
ADD CONSTRAINT members_wallet_address_format
CHECK (
  wallet_address IS NULL
  OR wallet_address ~ '^0x[0-9a-f]{40}$'
);

CREATE UNIQUE INDEX IF NOT EXISTS members_wallet_address_idx
ON public.members (wallet_address)
WHERE wallet_address IS NOT NULL;

COMMENT ON COLUMN public.members.wallet_address IS
'Public lowercase EVM address associated with the member profile. Ownership signature verification is a future step.';

COMMENT ON COLUMN public.members.ens_name IS
'Optional public ENS name supplied by the profile owner.';
