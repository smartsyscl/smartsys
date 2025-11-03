'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInUser } from '@/lib/auth';
import type { AuthError } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react'; 
import SmartSysLogo from '@/components/logo/SmartSysLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { user, error: signInError } = await signInUser(email, password);
    setLoading(false);

    if (signInError) {
        const specificError = signInError as AuthError;
        switch (specificError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Email o contraseña incorrectos.');
            break;
          case 'auth/invalid-email':
            setError('El formato del email es incorrecto.');
            break;
          case 'auth/multi-factor-auth-required':
             setError('Esta cuenta requiere autenticación de dos factores, la cual no está soportada en esta versión.');
             break;
          default:
            setError('Error al iniciar sesión. Intenta nuevamente.');
            break;
        }
        console.error('Login error:', specificError);
    } else if (user) {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <SmartSysLogo className="h-auto" />
          </div>
          <CardTitle className="text-2xl">Acceso Administrador</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Ingresar
                  </>
                )}
              </Button>
            </form>
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SmartSYS Digital Solutions
      </p>
    </div>
  );
}
