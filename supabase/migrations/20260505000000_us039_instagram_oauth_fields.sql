ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_user_id TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_token_expires_at TIMESTAMPTZ;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_username TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_followers_count INTEGER;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_followers_updated_at TIMESTAMPTZ;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_connected BOOLEAN NOT NULL DEFAULT false;
