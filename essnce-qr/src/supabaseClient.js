import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydgykykvngciclkwmsou.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZ3lreWt2bmdjaWNsa3dtc291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzE4NTksImV4cCI6MjA4ODE0Nzg1OX0.x4lm2_bYzTp6WP01aXS2trDD8RfTCjP8EHseWF08_qU'

export const supabase = createClient(supabaseUrl, supabaseKey)