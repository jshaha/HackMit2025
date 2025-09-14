import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { testSignUp, testSignIn } from '@/lib/testSupabase';
import { XCircle, CheckCircle } from 'lucide-react';

export default function AuthTester() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestSignUp = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const data = await testSignUp(email, password);
      setResult({ success: true, data, type: 'signup' });
    } catch (error) {
      setResult({ success: false, error, type: 'signup' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSignIn = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const data = await testSignIn(email, password);
      setResult({ success: true, data, type: 'signin' });
    } catch (error) {
      setResult({ success: false, error, type: 'signin' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test-email">Email</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <Label htmlFor="test-password">Password</Label>
            <Input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleTestSignUp} 
            disabled={loading}
            variant="outline"
          >
            Test Sign Up
          </Button>
          <Button 
            onClick={handleTestSignIn} 
            disabled={loading}
            variant="outline"
          >
            Test Sign In
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">
                  {result.success ? '✅ Success' : '❌ Error'} - {result.type}
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>First try "Test Sign Up" to create a new account</li>
            <li>Then try "Test Sign In" to log in</li>
            <li>Check the browser console for detailed logs</li>
            <li>Look for any error messages in the result above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
