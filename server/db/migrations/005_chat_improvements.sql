-- Chat Improvements Migration
-- Run this SQL in your Supabase SQL Editor

-- Add read_at column to messages table for read receipts
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add message_type column for different types (text, image, voice, gif)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';

-- Add duration column for voice messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT NULL;

-- Create typing indicators table (optional - for persistence)
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all typing_status" ON typing_status FOR ALL USING (true);
