-- Date Proposals table for scheduling dates between matches
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS date_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(500),
  activity VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'counter', 'cancelled')),
  counter_date DATE,
  counter_time TIME,
  counter_location VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_date_proposals_match_id ON date_proposals(match_id);
CREATE INDEX IF NOT EXISTS idx_date_proposals_proposer_id ON date_proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_date_proposals_receiver_id ON date_proposals(receiver_id);
CREATE INDEX IF NOT EXISTS idx_date_proposals_status ON date_proposals(status);
CREATE INDEX IF NOT EXISTS idx_date_proposals_date ON date_proposals(date);

-- Enable Row Level Security
ALTER TABLE date_proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see date proposals they're involved in
CREATE POLICY "Users can view their date proposals" ON date_proposals
  FOR SELECT USING (auth.uid() = proposer_id OR auth.uid() = receiver_id);

-- Policy: Users can create date proposals
CREATE POLICY "Users can create date proposals" ON date_proposals
  FOR INSERT WITH CHECK (auth.uid() = proposer_id);

-- Policy: Users can update their received proposals (to respond)
CREATE POLICY "Receivers can respond to proposals" ON date_proposals
  FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = proposer_id);
