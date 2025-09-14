import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import SupabaseAuthButtons from '@/components/SupabaseAuthButtons';
import NodesManager from '@/components/NodesManager';
import DebugAuth from '@/components/DebugAuth';
import AuthTester from '@/components/AuthTester';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, User } from 'lucide-react';

export default function SupabaseExample() {
  const { user, isAuthenticated, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Supabase Database Example</h1>
              <p className="text-muted-foreground">
                React + TypeScript + Supabase integration
              </p>
            </div>
          </div>
          <SupabaseAuthButtons />
        </div>

        {/* User info */}
        {isAuthenticated && user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-sm font-mono">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
                  <p className="text-sm">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant="outline" className="text-green-600">
                    Authenticated
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Section */}
        <DebugAuth />
        
        {/* Auth Tester */}
        <AuthTester />

        {/* Database features */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Database Features</h2>
            <p className="text-muted-foreground mb-6">
              This example demonstrates Supabase authentication and database operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• User sign up/sign in</li>
                  <li>• Google OAuth</li>
                  <li>• Session management</li>
                  <li>• Protected routes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Create nodes</li>
                  <li>• Read user nodes</li>
                  <li>• Update nodes</li>
                  <li>• Delete nodes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">TypeScript</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Type-safe database calls</li>
                  <li>• Zod validation</li>
                  <li>• Auto-generated types</li>
                  <li>• Error handling</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Nodes manager */}
          <NodesManager />
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Create a Supabase project</h4>
              <p className="text-sm text-muted-foreground">
                Go to <a href="https://supabase.com" className="text-blue-600 hover:underline">supabase.com</a> and create a new project.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Set up the database</h4>
              <p className="text-sm text-muted-foreground">
                Run this SQL in your Supabase SQL editor:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs mt-2 overflow-x-auto">
{`-- Create nodes table
CREATE TABLE nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  parent_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own nodes
CREATE POLICY "Users can view their own nodes" ON nodes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own nodes
CREATE POLICY "Users can insert their own nodes" ON nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own nodes
CREATE POLICY "Users can update their own nodes" ON nodes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own nodes
CREATE POLICY "Users can delete their own nodes" ON nodes
  FOR DELETE USING (auth.uid() = user_id);`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Configure environment variables</h4>
              <p className="text-sm text-muted-foreground">
                Add your Supabase URL and anon key to your <code>.env</code> file:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs mt-2">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
