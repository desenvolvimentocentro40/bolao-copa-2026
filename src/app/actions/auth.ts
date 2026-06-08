'use server';

//Actions permitem executar código no lado do servidor diretamente a partir de um formulário ou evento do React

import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

interface UserRow {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  setor: string;
  tipo: 'admin' | 'user' | 'ia';
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Preencha todos os campos.' };
  }

  try {
    // 1. Busca o usuário no MySQL
    const users = await query<UserRow[]>('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (users.length === 0) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }

    const user = users[0];

    // 2. Valida a senha criptografada
    const isPasswordValid = await comparePassword(password, user.senha_hash);
    if (!isPasswordValid) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }

    // 3. Gera o payload e o token JWT
    const token = generateToken({
      id: user.id,
      nome: user.nome,
      email: user.email,
      setor: user.setor,
      tipo: user.tipo,
    });

    // 4. Salva o token em um cookie HTTP-Only seguro
    //const cookieStore = await cookies();
    // cookieStore.set('auth_token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 60 * 60 * 24 * 7, // 7 dias
    //   path: '/',
    // });
    
    // 4. Salva o token em um cookie HTTP-Only seguro
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, { // <-- VOLTAMOS PARA auth_token
      httpOnly: true,
      secure: false, // Permite HTTP local e na VPS temporariamente
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return { success: true, message: 'Login realizado com sucesso!' };

  } catch (error) {
    console.error('Erro na action de login:', error);
    return { success: false, message: 'Erro interno no servidor.' };
  }
}

// Action para deslogar (Logout)
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}