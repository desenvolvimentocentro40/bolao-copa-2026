import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Alterado de 'middleware' para 'proxy' conforme a nova convenção
export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Rotas que exigem autenticação
  const rotasProtegidas = ['/dashboard', '/apostas', '/resultados'];

  // Verifica se o usuário está tentando acessar uma rota protegida sem estar logado
  const ehRotaProtegida = rotasProtegidas.some((rota) => pathname.startsWith(rota));

  if (ehRotaProtegida && !token) {
    // Redireciona para a página de login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se o usuário já está logado e tenta ir para o login, joga ele para o dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configura em quais caminhos o proxy deve rodar
export const config = {
  matcher: ['/dashboard/:path*', '/apostas/:path*', '/resultados/:path*', '/login'],
};