import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rzclncpeyzceqpjlkrwo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Y2xuY3BleXpjZXFwamxrcndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODg4MzksImV4cCI6MjA2OTg2NDgzOX0.tnBJBrEXZlcdVf6DsHBG3PxcNC5ig-xp0pUa88UZ43k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
