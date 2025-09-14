import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/lib/supabase';
import { env } from '@/config/env';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DebugAuth() {
  const { user, isAuthenticated, loading, error } = useSupabaseAuth();

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', env.SUPABASE_URL);
      console.log('Supabase Key (first 20 chars):', env.SUPABASE_ANON_KEY?.substring(0, 20) + '...');
      
      const { data, error } = await supabase.from('nodes').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Supabase connection successful:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Connection test failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Current session:', session);
      return { success: true, session };
    } catch (err) {
      console.error('Auth test failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Variables */}
          <div>
            <h4 className="font-semibold mb-2">Environment Variables</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>SUPABASE_URL:</span>
                {env.SUPABASE_URL ? (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Set
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>SUPABASE_ANON_KEY:</span>
                {env.SUPABASE_ANON_KEY ? (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Set
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Connection Test */}
          <div>
            <h4 className="font-semibold mb-2">Connection Test</h4>
            <Button onClick={testConnection} variant="outline" size="sm">
              Test Supabase Connection
            </Button>
          </div>

          {/* Auth Test */}
          <div>
            <h4 className="font-semibold mb-2">Authentication Test</h4>
            <Button onClick={testAuth} variant="outline" size="sm">
              Test Auth Session
            </Button>
          </div>

          {/* Current State */}
          <div>
            <h4 className="font-semibold mb-2">Current State</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Loading:</span>
                <Badge variant={loading ? "default" : "outline"}>
                  {loading ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Authenticated:</span>
                <Badge variant={isAuthenticated ? "default" : "outline"}>
                  {isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>User ID:</span>
                <span className="font-mono text-xs">
                  {user?.id || "None"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>User Email:</span>
                <span className="font-mono text-xs">
                  {user?.email || "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Auth Error:</strong> {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Console Instructions */}
          <div>
            <h4 className="font-semibold mb-2">Debug Steps</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Open browser console (F12)</li>
              <li>Click "Test Supabase Connection" above</li>
              <li>Click "Test Auth Session" above</li>
              <li>Try to sign in and check console for errors</li>
              <li>Check Network tab for failed requests</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
