-- Add foto_url column to client_profiles for avatar upload support
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS foto_url TEXT;
