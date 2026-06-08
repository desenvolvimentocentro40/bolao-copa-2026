import { query } from '../src/lib/db';

// ID do usuário da IA que foi gerado no banco de dados (confira no seu SELECT se é o ID 2)
const IA_USER_ID = 2; 

interface JogoSemPalpite {
  id: number;
  time_casa: string;
  time_visitante: string;
}

/**
 * Função simulando a heurística de IA para prever placares da Copa.
 * Aqui você pode integrar com tensores, chamadas de modelos ou lógica matemática.
 */
export function gerarPlacarPreditivo(timeCasa: string, timeVisitante: string) {
    const pesos: { [key: string]: number } = { 'BRA': 5, 'ARG': 4, 'FRA': 4, 'USA': 3, 'MEX': 2, 'CAN': 2 };
    
    const forcaCasa = pesos[timeCasa] || 2;
    const forcaVisitante = pesos[timeVisitante] || 2;
  
    const golsCasa = Math.floor(Math.random() * 2) + (forcaCasa > forcaVisitante ? 1 : 0);
    const golsVisitante = Math.floor(Math.random() * 2) + (forcaVisitante > forcaCasa ? 1 : 0);
  
    return { golsCasa, golsVisitante };
  }

export async function executarPrevisoesIA() {
  console.log('🤖 [IA] Iniciando o processamento do Oráculo 4.0...');

  try {
    // 1. Busca jogos agendados que a IA ainda não palpitou
    const sqlJogos = `
      SELECT j.id, t1.sigla AS time_casa, t2.sigla AS time_visitante 
      FROM jogos j
      JOIN times t1 ON j.time_casa_id = t1.id
      JOIN times t2 ON j.time_visitante_id = t2.id
      WHERE j.status = 'agendado'
        AND j.id NOT IN (SELECT jogo_id FROM apostas WHERE usuario_id = ?)
    `;
    
    const jogosPendentes = await query<JogoSemPalpite[]>(sqlJogos, [IA_USER_ID]);

    if (jogosPendentes.length === 0) {
      console.log('🤖 [IA] Sem novos jogos para palpitar. O Oráculo está atualizado!');
      return;
    }

    console.log(`🤖 [IA] Encontrado(s) ${jogosPendentes.length} jogo(s) sem palpite. Processando...`);

    // 2. Loop para gerar e inserir os palpites no banco de dados
    for (const jogo of jogosPendentes) {
      const { golsCasa, golsVisitante } = gerarPlacarPreditivo(jogo.time_casa, jogo.time_visitante);
      
      const sqlInserirAposta = `
        INSERT INTO apostas (usuario_id, jogo_id, palpite_casa, palpite_visitante)
        VALUES (?, ?, ?, ?)
      `;
      
      await query(sqlInserirAposta, [IA_USER_ID, jogo.id, golsCasa, golsVisitante]);
      console.log(`⚽ [IA] Palpite registrado: ${jogo.time_casa} ${golsCasa} x ${golsVisitante} ${jogo.time_visitante}`);
    }

    console.log('🤖 [IA] Todos os palpites da Inteligência Artificial foram processados com sucesso!');

  } catch (error) {
    console.error('❌ [IA] Erro na execução do motor de previsões:', error);
  }
}

// Executa o script se rodar direto via terminal
if (require.main === module) {
  executarPrevisoesIA().then(() => process.exit(0));
}