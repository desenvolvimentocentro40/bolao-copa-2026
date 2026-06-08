import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { CardAposta } from '@/components/CardAposta/CardAposta';
import styles from './apostas.module.css';

interface JogoApostaRow {
  jogo_id: number;
  data_hora: Date;
  fase: string;
  status: 'agendado' | 'em_andamento' | 'finalizado';
  time_casa: string;
  sigla_casa: string;
  logo_casa: string;
  time_visitante: string;
  sigla_visitante: string;
  logo_visitante: string;
  palpite_casa: number | null;
  palpite_visitante: number | null;
}

async function fetchJogosComPalpites(usuarioId: number): Promise<JogoApostaRow[]> {
  const sql = `
    SELECT 
      j.id AS jogo_id,
      j.data_hora,
      j.fase,
      j.status,
      t1.nome AS time_casa, t1.sigla AS sigla_casa, t1.logo_url AS logo_casa,
      t2.nome AS time_visitante, t2.sigla AS sigla_visitante, t2.logo_url AS logo_visitante,
      a.palpite_casa,
      a.palpite_visitante
    FROM jogos j
    JOIN times t1 ON j.time_casa_id = t1.id
    JOIN times t2 ON j.time_visitante_id = t2.id
    LEFT JOIN apostas a ON j.id = a.jogo_id AND a.usuario_id = ?
    ORDER BY j.data_hora ASC;
  `;
  return query<JogoApostaRow[]>(sql, [usuarioId]);
}

export default async function ApostasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value || '';
  const usuario = verifyToken(token);

  if (!usuario) {
    return <p>Sessão expirada. Faça login novamente.</p>;
  }

  const jogos = await fetchJogosComPalpites(usuario.id);

  // Lógica de agrupamento: Separa o array de jogos em um objeto com base na "fase"
  const jogosAgrupados = jogos.reduce((acc, jogo) => {
    const fase = jogo.fase;
    if (!acc[fase]) acc[fase] = [];
    acc[fase].push(jogo);
    return acc;
  }, {} as Record<string, JogoApostaRow[]>);

  // Ordena as chaves (ex: "Grupo A", "Grupo B") em ordem alfabética
  const fasesOrdenadas = Object.keys(jogosAgrupados).sort();

  return (
    <div>
      <h1 className={styles.pageTitle}>Jogos & Palpites</h1>
      <p className={styles.pageSubtitle}>Preencha seus placares. O bloqueio ocorre automaticamente no horário do jogo.</p>
      
      {/* Mapeia cada fase renderizando seu título e seu grid específico */}
      {fasesOrdenadas.map((fase) => (
        <section key={fase} className={styles.section}>
          <h2 className={styles.faseTitle}>{fase}</h2>
          
          <div className={styles.grid}>
            {jogosAgrupados[fase].map((jogo) => (
              <CardAposta 
                key={jogo.jogo_id}
                jogoId={jogo.jogo_id}
                timeCasa={jogo.time_casa}
                siglaCasa={jogo.sigla_casa}
                logoCasa={jogo.logo_casa}
                timeVisitante={jogo.time_visitante}
                siglaVisitante={jogo.sigla_visitante}
                logoVisitante={jogo.logo_visitante}
                dataHora={jogo.data_hora.toISOString()}
                fase={jogo.fase}
                status={jogo.status}
                palpiteCasaInicial={jogo.palpite_casa}
                palpiteVisitanteInicial={jogo.palpite_visitante}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}