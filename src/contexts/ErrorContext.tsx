import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createContext, ReactNode, useCallback, useState } from 'react';

export interface CustomError {
  kind: 'walletconnect' | 'upload' | 'invalid' | 'dexie' | 'success';
  reason: string;
}

export interface ErrorContextType {
  errors: CustomError[];
  addError: (error: CustomError) => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined,
);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<CustomError[]>([]);

  const addError = useCallback((error: CustomError) => {
    setErrors((prevErrors) => [...prevErrors, error]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError }}>
      {children}

      {errors.length > 0 && (
        <ErrorDialog
          error={errors[0]}
          setError={() => setErrors((prevErrors) => prevErrors.slice(1))}
        />
      )}
    </ErrorContext.Provider>
  );
}

export interface ErrorDialogProps {
  error: CustomError | null;
  setError: (error: CustomError | null) => void;
}

export default function ErrorDialog({ error, setError }: ErrorDialogProps) {
  let kind: string | null;

  switch (error?.kind) {
    case 'walletconnect':
      kind = 'WalletConnect';
      break;

    case 'upload':
      kind = 'Upload';
      break;

    case 'dexie':
      kind = 'Dexie';
      break;

    default:
      kind = null;
  }

  return (
    <Dialog open={error !== null} onOpenChange={() => setError(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{kind ? `${kind} ` : ''}Error</DialogTitle>
          <DialogDescription className='break-words hyphens-auto'>
            {error?.reason}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setError(null)} autoFocus>
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
