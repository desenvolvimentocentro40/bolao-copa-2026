import { query } from '@/lib/db';
import styles from './dashboard.module.css';

interface LeaderboardRow {
  id: number;
  nome: string;
  setor: string;
  tipo: 'admin' | 'colaborador' | 'ia';
  total_pontos: number;
}

// Como é um Server Component, podemos buscar dados assincronamente antes do render
async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const sql = `
    SELECT 
      u.id, 
      u.nome, 
      u.setor, 
      u.tipo,
      COALESCE(SUM(a.pontos_obtidos), 0) AS total_pontos
    FROM usuarios u
    LEFT JOIN apostas a ON u.id = a.usuario_id
    WHERE u.tipo != 'admin'
    GROUP BY u.id, u.nome, u.setor, u.tipo
    ORDER BY total_pontos DESC, u.nome ASC
  `;
  
  return query<LeaderboardRow[]>(sql);
}

export default async function DashboardPage() {
  const ranking = await getLeaderboard();

  // Função auxiliar para definir a classe CSS de destaque da posição
  const getPosClass = (index: number) => {
    if (index === 0) return styles.primeiro;
    if (index === 1) return styles.segundo;
    if (index === 2) return styles.terceiro;
    return '';
  };

  return (
    <div className={styles.container}>
      {/* Card de Boas-vindas */}
      <section className={styles.welcomeCard}>
        <h1>Painel do Colaborador</h1>
        <p>Acompanhe a classificação da equipe do Senai Centro 4.0 e ajuste seus palpites antes das partidas!</p>
      </section>

      {/* Seção da Tabela de Classificação */}
      <section className={styles.leaderboardSection}>
        <h2 className={styles.sectionTitle}>🏆 Classificação Geral</h2>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Pos</th>
                <th>Participante</th>
                <th>Setor</th>
                <th style={{ textAlign: 'right', width: '120px' }}>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, index) => (
                <tr key={player.id} className={styles.row}>
                  <td>
                    <span className={`${styles.posicao} ${getPosClass(index)}`}>
                      {index + 1}º
                    </span>
                  </td>
                  <td>
                    <span className={styles.nomeUsuario}>{player.nome}</span>
                    {player.tipo === 'ia' && (
                      <span className={styles.iaBadge}>Inteligência Artificial</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.setorBadge}>{player.setor}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={styles.pontos}>{player.total_pontos} pts</span>
                  </td>
                </tr>
              ))}

              {ranking.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhum jogador pontuou ainda. A Copa está prestes a começar!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}