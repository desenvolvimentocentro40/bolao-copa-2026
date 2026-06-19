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

    // 3. A Guilhotina: Bloqueia a gravação se passou do tempo ou se o jogo não estiver 'agendado'
    if (agora >= dataLimite || jogo.status !== 'agendado') {
      return { success: false, message: 'Tempo esgotado! As apostas encerram 10 minutos antes do jogo.' };
    }

    // 4. Salvar ou atualizar o palpite usando a restrição UNIQUE do MySQL
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

export async function obterPalpitesUsuarioAction(usuarioId: number) {
  try {
    const sql = `
      SELECT 
        j.id AS jogo_id, 
        j.data_hora, 
        j.fase, 
        j.status AS jogo_status,
        j.gols_casa AS gols_casa_real, 
        j.gols_visitante AS gols_visitante_real,
        t1.sigla AS time_casa, 
        t1.logo_url AS logo_casa, 
        t1.nome AS nome_casa,
        t2.sigla AS time_visitante, 
        t2.logo_url AS logo_visitante, 
        t2.nome AS nome_visitante,
        a.palpite_casa, 
        a.palpite_visitante, 
        a.pontos_obtidos
      FROM apostas a
      JOIN jogos j ON a.jogo_id = j.id
      JOIN times t1 ON j.time_casa_id = t1.id
      JOIN times t2 ON j.time_visitante_id = t2.id
      WHERE a.usuario_id = ?
      ORDER BY j.data_hora DESC
    `;
    const rows = await query<any[]>(sql, [usuarioId]);
    
    // Processar para ocultar palpites de jogos que ainda não fecharam aposta
    const agora = new Date();
    const processedRows = rows.map(r => {
      const dataJogo = new Date(r.data_hora);
      const dataLimite = new Date(dataJogo.getTime() - 10 * 60 * 1000);
      const encerrado = r.jogo_status !== 'agendado' || agora >= dataLimite;
      
      return {
        ...r,
        palpite_oculto: !encerrado,
        palpite_casa: encerrado ? r.palpite_casa : null,
        palpite_visitante: encerrado ? r.palpite_visitante : null,
        pontos_obtidos: encerrado ? r.pontos_obtidos : null,
      };
    });
    
    return { success: true, palpites: processedRows };
  } catch (error) {
    console.error('Erro ao obter palpites do usuário:', error);
    return { success: false, message: 'Erro ao carregar palpites.' };
  }
}