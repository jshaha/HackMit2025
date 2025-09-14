import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export default function AuthButtons() {
  return (
    <Button 
      variant="outline" 
      className="flex items-center"
      disabled
    >
      <User className="w-4 h-4 mr-2" />
      Auth Disabled
    </Button>
  );
}