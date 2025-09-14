import { supabase } from './supabase';
import { env } from '@/config/env';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  
  // Test 1: Environment Variables
  console.log('📋 Environment Variables:');
  console.log('  SUPABASE_URL:', env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  // Test 2: Basic Connection
  try {
    const { data, error } = await supabase.from('nodes').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
    console.log('✅ Database connection successful');
  } catch (err) {
    console.error('❌ Database test failed:', err);
    throw err;
  }

  // Test 3: Auth Service
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Auth service failed:', error);
      throw error;
    }
    console.log('✅ Auth service accessible');
    console.log('  Current session:', session ? 'Active' : 'None');
  } catch (err) {
    console.error('❌ Auth test failed:', err);
    throw err;
  }

  console.log('🎉 All Supabase tests passed!');
  return true;
}

// Test sign up
export async function testSignUp(email: string, password: string) {
  console.log('🔐 Testing Sign Up...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign up failed:', error);
      throw error;
    }
    
    console.log('✅ Sign up successful:', data);
    return data;
  } catch (err) {
    console.error('❌ Sign up test failed:', err);
    throw err;
  }
}

// Test sign in
export async function testSignIn(email: string, password: string) {
  console.log('🔑 Testing Sign In...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
    
    console.log('✅ Sign in successful:', data);
    return data;
  } catch (err) {
    console.error('❌ Sign in test failed:', err);
    throw err;
  }
}
