'use server';

import { query } from '@/lib/db';
import { gerarPlacarPreditivo } from '../../../ai/predict_engine'; // Caminho relativo saindo de src/app/actions/ para a raiz

interface JogoSiglas {
  time_casa: string;
  time_visitante: string;
}

export async function obterSugestaoIAAction(jogoId: number) {
  try {
    const sql = `
      SELECT t1.sigla AS time_casa, t2.sigla AS time_visitante
      FROM jogos j
      JOIN times t1 ON j.time_casa_id = t1.id
      JOIN times t2 ON j.time_visitante_id = t2.id
      WHERE j.id = ?
    `;
    
    const rows = await query<JogoSiglas[]>(sql, [jogoId]);
    
    if (rows.length === 0) {
      return { success: false, message: 'Jogo não encontrado.' };
    }

    const { time_casa, time_visitante } = rows[0];
    
    // Executa a heurística do motor da IA
    const placar = gerarPlacarPreditivo(time_casa, time_visitante);

    return { 
      success: true, 
      golsCasa: placar.golsCasa, 
      golsVisitante: placar.golsVisitante 
    };
  } catch (error) {
    console.error('Erro ao gerar palpite da IA:', error);
    return { success: false, message: 'Erro ao consultar o Oráculo.' };
  }
}