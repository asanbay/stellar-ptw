// Простой тест подключения к Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cpczhwrxhhvimunluobp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwY3pod3J4aGh2aW11bmx1b2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzM2MjEsImV4cCI6MjA3OTgwOTYyMX0.ksmEMYMM7g0O4Nvr87V3Ivf7nhOy6MTPDEE8hRe1Hx4';

console.log('🔌 Подключение к Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Проверяем подключение через запрос к departments
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Ошибка:', error);
    } else {
      console.log('✅ Подключение успешно!');
      console.log('📊 Количество отделов:', data.length);
      console.log('Данные:', data);
    }
  } catch (err) {
    console.error('❌ Ошибка подключения:', err);
  }
}

testConnection();
