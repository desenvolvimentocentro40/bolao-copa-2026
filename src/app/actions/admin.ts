// src/app/actions/admin.ts
'use server';

import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function criarJogoAction(formData: FormData) {
  try {
    // 1. Verificação de Segurança (Bloqueia intrusos)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return { success: false, message: 'Usuário não autenticado.' };

    const usuario = verifyToken(token);
    if (!usuario || usuario.tipo !== 'admin') {
      return { success: false, message: 'Acesso negado. Área restrita à diretoria.' };
    }

    // 2. Extração dos dados do formulário
    const timeCasaId = formData.get('timeCasaId');
    const timeVisitanteId = formData.get('timeVisitanteId');
    const dataHoraRaw = formData.get('dataHora')?.toString();
    const fase = formData.get('fase');

    if (!timeCasaId || !timeVisitanteId || !dataHoraRaw || !fase) {
      return { success: false, message: 'Preencha todos os campos do jogo.' };
    }

    if (timeCasaId === timeVisitanteId) {
      return { success: false, message: 'Os times escolhidos devem ser diferentes.' };
    }

    // Formata a data vinda do HTML (YYYY-MM-DDTHH:MM) para o padrão MySQL (YYYY-MM-DD HH:MM:SS)
    const dataHoraFormatada = dataHoraRaw.replace('T', ' ') + ':00';

    // 3. Inserção no banco de dados
    await query(
      `INSERT INTO jogos (time_casa_id, time_visitante_id, data_hora, status, fase)
       VALUES (?, ?, ?, 'agendado', ?)`,
      [timeCasaId, timeVisitanteId, dataHoraFormatada, fase]
    );

    // 4. Limpa o cache para o novo jogo aparecer na tela de apostas imediatamente
    revalidatePath('/apostas');

    return { success: true, message: 'Novo confronto criado e liberado para palpites!' };
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    return { success: false, message: 'Erro interno ao salvar no banco.' };
  }
}

export async function atualizarHorarioJogoAction(jogoId: number, novaDataHora: string) {
  try {
    // 1. Verificação de Segurança
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return { success: false, message: 'Usuário não autenticado.' };
    
    const usuario = verifyToken(token);
    if (!usuario || usuario.tipo !== 'admin') {
      return { success: false, message: 'Acesso negado. Área restrita à diretoria.' };
    }

    // 2. O input 'datetime-local' do HTML envia no formato "YYYY-MM-DDTHH:mm"
    // O MySQL prefere "YYYY-MM-DD HH:mm:00". Vamos formatar:
    const dataFormatada = novaDataHora.replace('T', ' ') + ':00';

    // 3. Atualiza na base de dados
    await query('UPDATE jogos SET data_hora = ? WHERE id = ?', [dataFormatada, jogoId]);

    // 4. Limpa o cache para que a alteração apareça imediatamente em todo o sistema
    revalidatePath('/'); // Atualiza a página inicial/dashboard
    revalidatePath('/apostas'); // Atualiza a tela de apostas
    revalidatePath('/admin'); // Atualiza a própria página de admin (caso a rota seja esta)
    
    return { success: true, message: 'Horário atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    return { success: false, message: 'Erro interno ao atualizar horário.' };
  }
}