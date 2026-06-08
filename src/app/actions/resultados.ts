'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Atualiza o resultado real de um jogo e recalcula a pontuação de todos os palpites.
 */
export async function finalizarJogoAction(jogoId: number, golsCasa: number, golsVisitante: number) {
  try {
    // 1. Atualiza o status e os gols do jogo na tabela de jogos
    await query(
      `UPDATE jogos SET gols_casa = ?, gols_visitante = ?, status = 'finalizado' WHERE id = ?`,
      [golsCasa, golsVisitante, jogoId]
    );

    // 2. Busca todas as apostas feitas para esse jogo específico
    const apostas = await query<any[]>(
      'SELECT id, palpite_casa, palpite_visitante FROM apostas WHERE jogo_id = ?',
      [jogoId]
    );

    // 3. Calcula os pontos de cada aposta com base nas regras estabelecidas
    for (const aposta of apostas) {
      let pontosObtidos = 0;

      const pCasa = aposta.palpite_casa;
      const pVis = aposta.palpite_visitante;

      // Regra 1: Acerto na mosca (Placar exato) -> 5 pontos
      if (pCasa === golsCasa && pVis === golsVisitante) {
        pontosObtidos = 5;
      } else {
        // Verifica a tendência: quem ganhou ou se deu empate
        const tendenciaReal = Math.sign(golsCasa - golsVisitante); // 1 (Casa), -1 (Visitante), 0 (Empate)
        const tendenciaPalpite = Math.sign(pCasa - pVis);

        if (tendenciaReal === tendenciaPalpite) {
          const saldoReal = golsCasa - golsVisitante;
          const saldoPalpite = pCasa - pVis;

          // Regra 2: Acertou o vencedor/empate + Saldo de Gols -> 3 pontos
          if (saldoReal === saldoPalpite) {
            pontosObtidos = 3;
          } else {
            // Regra 3: Acertou apenas o vencedor ou apenas o empate -> 1 ponto
            pontosObtidos = 1;
          }
        }
        // Regra 4: Errou a tendência completa -> 0 pontos (padrão)
      }

      // 4. Salva a pontuação calculada de volta na tabela de apostas
      await query('UPDATE apostas SET pontos_obtidos = ? WHERE id = ?', [pontosObtidos, aposta.id]);
    }

    // Limpa o cache das páginas afetadas para atualizar as tabelas visualmente
    revalidatePath('/resultados');
    revalidatePath('/dashboard');

    return { success: true, message: 'Jogo finalizado e pontos distribuídos com sucesso!' };
  } catch (error) {
    console.error('Erro ao finalizar jogo:', error);
    return { success: false, message: 'Erro interno ao processar pontuações.' };
  }
}