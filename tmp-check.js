const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const tables = ['employees','departments','attendances','attendance','leave_requests','users'];
(async () => {
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      console.log(table, '=>', error ? 'ERROR' : 'OK', error?.message || '');
    } catch (err) {
      console.log(table, '=> THROW', err.message);
    }
  }
})();
