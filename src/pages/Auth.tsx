import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.png';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((e) => {
          if (e.path[0] === 'email') fieldErrors.email = e.message;
          if (e.path[0] === 'password') fieldErrors.password = e.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      let message = 'Error al iniciar sesión';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email o contraseña incorrectos';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Por favor confirma tu email antes de iniciar sesión';
      }
      toast({ title: message, variant: 'destructive' });
    } else {
      toast({ title: 'Bienvenido al CRM' });
      navigate('/');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar to-primary/20" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-sidebar-foreground">
          <div className="flex items-center gap-4 mb-8">
            <img src={logo} alt="Apuleyo Diseños" className="h-16 w-auto" />
          </div>
          <p className="text-xl text-sidebar-foreground/80 mb-6">
            Sistema de gestión de presupuestos para imprenta
          </p>
          <ul className="space-y-4 text-sidebar-foreground/70">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Gestiona tus clientes de forma eficiente
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Crea presupuestos profesionales
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Catálogo de productos configurable
            </li>
          </ul>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/10" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/10" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src={logo} alt="Apuleyo Diseños" className="h-14 w-auto" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Bienvenido de nuevo
            </h2>
            <p className="text-muted-foreground mt-2">
              Introduce tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pl-10 h-12"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-10 h-12"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium" 
              disabled={loading}
            >
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            © {new Date().getFullYear()} CRM Presupuestos
          </p>
        </div>
      </div>
    </div>
  );
}
