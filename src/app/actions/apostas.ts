'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface JogoInfo {
  data_hora: Date;
  status: 'agendado' | 'em_andamento' | 'finalizado';
}

export async function salvarPalpiteAction(jogoId: number, palpiteCasa: number, palpiteVisitante: number) {
  try {
    // 1. Validar o usuário através do JWT nos cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return { success: false, message: 'Usuário não autenticado.' };
    const usuario = verifyToken(token);
    if (!usuario) return { success: false, message: 'Sessão inválida.' };

    // 2. Verificar se o jogo existe e se já não iniciou/terminou
    const jogos = await query<JogoInfo[]>('SELECT data_hora, status FROM jogos WHERE id = ?', [jogoId]);
    if (jogos.length === 0) return { success: false, message: 'Jogo não encontrado.' };
    
    const jogo = jogos[0];
    const agora = new Date();
    
    // Subtrai exatamente 10 minutos (10 * 60 * 1000 milissegundos) da hora oficial do jogo
    const dataLimite = new Date(jogo.data_hora.getTime() - 10 * 60 * 1000);

    if (agora >= dataLimite || jogo.status !== 'agendado') {
      return { success: false, message: 'Tempo esgotado! As apostas encerram 10 minutos antes do jogo.' };
    }

    // 3. Salvar ou atualizar o palpite usando a restrição UNIQUE do MySQL
    const sql = `
      INSERT INTO apostas (usuario_id, jogo_id, palpite_casa, palpite_visitante)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE palpite_casa = VALUES(palpite_casa), palpite_visitante = VALUES(palpite_visitante)
    `;
    
    await query(sql, [usuario.id, jogoId, palpiteCasa, palpiteVisitante]);

    // Atualiza o cache da página de apostas para refletir o dado novo
    revalidatePath('/apostas');
    
    return { success: true, message: 'Palpite salvo com sucesso!' };
  } catch (error) {
    console.error('Erro ao salvar palpite:', error);
    return { success: false, message: 'Erro interno ao salvar palpite.' };
  }
}