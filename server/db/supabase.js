const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
// Replace these with your Supabase project credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fhbuymvlmxcalnavzsiw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoYnV5bXZsbXhjYWxuYXZ6c2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTc4MTEsImV4cCI6MjA4ODQ5MzgxMX0.OM_-4uFPGyvipyQL0rVVv6plnCtbqTM5tby5r1PDNHA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
