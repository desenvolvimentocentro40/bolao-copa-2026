'use server';

import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mail';

export async function registerAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;
  const setor = formData.get('setor') as string;

  if (!nome || !email || !senha || !setor) {
    return { success: false, message: 'Preencha todos os campos obrigatórios.' };
  }

  try {
    // 1. Verifica se o e-mail já está cadastrado
    const existingUser = await query<{id: number}[]>('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return { success: false, message: 'Este e-mail já está em uso.' };
    }

    // 2. Criptografa a senha
    const senhaHash = await hashPassword(senha);

    // 3. Insere o novo usuário
    await query(
      'INSERT INTO usuarios (nome, email, senha_hash, setor, tipo) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, setor, 'colaborador']
    );

    // 4. Dispara o e-mail de forma assíncrona (sem travar o retorno para o usuário)
    sendWelcomeEmail(email, nome);

    return { success: true, message: 'Cadastro realizado com sucesso!' };
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return { success: false, message: 'Erro interno ao realizar cadastro.' };
  }
}