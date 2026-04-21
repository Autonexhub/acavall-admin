import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, X } from 'lucide-react';

export function ImpersonationBanner() {
  const { user, isImpersonating, stopImpersonating } = useAuth();

  if (!isImpersonating || !user?.impersonator) {
    return null;
  }

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none border-x-0 border-t-0 border-b-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md">
      <User className="h-4 w-4" />
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <span className="font-semibold whitespace-nowrap">Modo de visualización:</span>
          <span className="truncate">
            Viendo como <strong>{user.name}</strong> ({user.email})
          </span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground truncate">
            Admin: {user.impersonator.name}
          </span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => stopImpersonating()}
          className="shrink-0 w-full sm:w-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Salir de visualización
        </Button>
      </AlertDescription>
    </Alert>
  );
}
