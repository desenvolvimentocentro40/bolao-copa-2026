import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { Header } from '@/components/Header/Header';

export default async function SistemaLayout({ children }: { children: ReactNode }) {
  // Lê o token do usuário logado
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value || '';
  const usuario = verifyToken(token);

  // Verifica se é administrador
  const isUserAdmin = usuario?.tipo === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Passa a propriedade para o componente cliente */}
      <Header isAdmin={isUserAdmin} />
      
      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}