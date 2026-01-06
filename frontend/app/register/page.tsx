'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ email, password, name });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falló el registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2641] to-[#0f1c33] p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-900/90 backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Plane className="w-10 h-10 text-[#f47b20]" />
            <span className="font-black text-3xl uppercase tracking-wider text-[#f47b20]">Waylo</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Únete a Waylo</CardTitle>
          <CardDescription className="text-slate-400">
            Crea tu cuenta y comienza a planificar tus aventuras
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400 border border-red-800">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Nombre (opcional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#f47b20] focus:ring-[#f47b20]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#f47b20] focus:ring-[#f47b20]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#f47b20] focus:ring-[#f47b20]"
              />
              <p className="text-xs text-slate-500">Debe tener al menos 8 caracteres</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-[#f47b20] hover:bg-[#d66a1a] text-white font-bold py-6 rounded-xl transition-all" 
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            <p className="text-sm text-center text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[#f47b20] hover:text-[#ff8c3a] underline font-medium transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
