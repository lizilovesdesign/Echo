import { createClient } from '@supabase/supabase-js';

const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'http://localhost:54321';
const TEST_SERVICE_ROLE_KEY = process.env.TEST_SERVICE_ROLE_KEY || 'test-service-role-key';

export const testSupabase = createClient(TEST_SUPABASE_URL, TEST_SERVICE_ROLE_KEY);

export async function createTestUser(email: string, password: string) {
  const { data, error } = await testSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

export async function deleteTestUser(userId: string) {
  const { error } = await testSupabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}

export async function signInAsTestUser(email: string, password: string) {
  const { data, error } = await testSupabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}
