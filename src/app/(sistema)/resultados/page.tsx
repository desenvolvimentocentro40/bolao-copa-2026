import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import styles from './resultados.module.css';

interface RowResultado {
  jogo_id: number;
  data_hora: Date;
  fase: string;
  gols_casa_real: number;
  gols_visitante_real: number;
  time_casa: string;
  logo_casa: string;
  time_visitante: string;
  logo_visitante: string;
  palpite_casa: number | null;
  palpite_visitante: number | null;
  pontos_obtidos: number | null;
}

async function fetchResultadosUsuario(usuarioId: number): Promise<RowResultado[]> {
  const sql = `
    SELECT 
      j.id AS jogo_id, j.data_hora, j.fase,
      j.gols_casa AS gols_casa_real, j.gols_visitante AS gols_visitante_real,
      t1.sigla AS time_casa, t1.logo_url AS logo_casa,
      t2.sigla AS time_visitante, t2.logo_url AS logo_visitante,
      a.palpite_casa, a.palpite_visitante, a.pontos_obtidos
    FROM jogos j
    JOIN times t1 ON j.time_casa_id = t1.id
    JOIN times t2 ON j.time_visitante_id = t2.id
    LEFT JOIN apostas a ON j.id = a.jogo_id AND a.usuario_id = ?
    WHERE j.status = 'finalizado'
    ORDER BY j.data_hora DESC;
  `;
  return query<RowResultado[]>(sql, [usuarioId]);
}

export default async function ResultadosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value || '';
  const usuario = verifyToken(token);

  if (!usuario) return <p>Sessão expirada. Faça login novamente.</p>;

  const resultados = await fetchResultadosUsuario(usuario.id);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Resultados dos Confrontos</h1>
      <p className={styles.subtitle}>Confira o placar oficial das partidas e o desempenho dos seus palpites.</p>

      <div className={styles.grid}>
        {resultados.map((res) => {
          const fezAposta = res.palpite_casa !== null && res.palpite_visitante !== null;
          const pontos = res.pontos_obtidos ?? 0;
          
          // Define a classe de cor da pontuação
          const ptsClass = styles[`pts${pontos}`] || styles.pts0;

          return (
            <div key={res.jogo_id} className={styles.resultCard}>
              <div className={styles.cardHeader}>
                <span>{new Date(res.data_hora).toLocaleDateString('pt-BR')}</span>
                <span>{res.fase}</span>
              </div>

              {/* Exibição do Placar Real */}
              <div className={styles.matchDisplay}>
                <div className={styles.timeInfo}>
                  <img src={res.logo_casa} alt={res.time_casa} className={styles.logo} />
                  <span className={styles.timeName}>{res.time_casa}</span>
                </div>

                <div className={styles.realScore}>
                  <span>{res.gols_casa_real}</span>
                  <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>X</span>
                  <span>{res.gols_visitante_real}</span>
                </div>

                <div className={styles.timeInfo}>
                  <img src={res.logo_visitante} alt={res.time_visitante} className={styles.logo} />
                  <span className={styles.timeName}>{res.time_visitante}</span>
                </div>
              </div>

              {/* Exibição do Palpite e Pontuação do Usuário */}
              <div className={styles.betSection}>
                <div className={styles.betText}>
                  {fezAposta ? (
                    <span>Seu palpite: <strong>{res.palpite_casa} x {res.palpite_visitante}</strong></span>
                  ) : (
                    <span style={{ color: 'var(--senai-red)' }}>Você não palpitou nesta partida.</span>
                  )}
                </div>
                <div className={`${styles.pointsBadge} ${ptsClass}`}>
                  +{pontos} pts
                </div>
              </div>
            </div>
          );
        })}

        {resultados.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1', textAlign: 'center' }}>
            Nenhuma partida foi finalizada até o momento. Fique de olho no início da rodada!
          </p>
        )}
      </div>
    </div>
  );
}