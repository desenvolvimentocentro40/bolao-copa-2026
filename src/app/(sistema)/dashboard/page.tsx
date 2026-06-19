import { query } from '@/lib/db';
import { LeaderboardTable } from './LeaderboardTable';
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
        <LeaderboardTable ranking={ranking} />
      </section>
    </div>
  );
}