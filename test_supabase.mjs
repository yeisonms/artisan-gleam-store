import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://iahbqcycbiccrgdcwuzd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhaGJxY3ljYmljY3JnZGN3dXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjYxODYsImV4cCI6MjA5NTkwMjE4Nn0.oiLML7orVuTkFluo-VY8cTH_HQXyclkpQNtvKwwK5J4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: bgRes } = await supabase.rpc('get_balance_general');
  const { data: variants } = await supabase.from('product_variants').select('*');
  console.log("bgRes:", bgRes);
  console.log("variants:", variants);
}

test();
