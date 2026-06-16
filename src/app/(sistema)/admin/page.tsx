// src/app/(sistema)/admin/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { AdminForm } from './AdminForm';
import { AdminFinalizarJogo } from './AdminFinalizarJogo';
//import { EdicaoJogoCard } from '@/app/components/EdicaoJogoCard'; // Importe o componente que criamos
import styles from './admin.module.css';
import { EdicaoJogoCard } from '@/components/EdicaoJogoCard/EdicaoJogoCard';

// Busca os times para o dropdown de criação
async function fetchTimes() {
  return query<{id: number, nome: string, sigla: string}[]>(
    'SELECT id, nome, sigla FROM times ORDER BY nome ASC'
  );
}

// Busca os jogos que ainda não foram finalizados
async function fetchJogosPendentes() {
  const sql = `
    SELECT 
      j.id, j.data_hora, j.fase,
      t1.sigla AS sigla_casa, t1.logo_url AS logo_casa,
      t2.sigla AS sigla_visitante, t2.logo_url AS logo_visitante
    FROM jogos j
    JOIN times t1 ON j.time_casa_id = t1.id
    JOIN times t2 ON j.time_visitante_id = t2.id
    WHERE j.status = 'agendado' OR j.status = 'em_andamento'
    ORDER BY j.data_hora ASC
  `;
  return query<any[]>(sql);
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value || '';
  const usuario = verifyToken(token);

  if (!usuario || usuario.tipo !== 'admin') {
    redirect('/dashboard');
  }

  // Busca os dados paralelamente para carregar mais rápido
  const [times, jogosPendentes] = await Promise.all([
    fetchTimes(),
    fetchJogosPendentes()
  ]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Administração</h1>
        <p className={styles.subtitle}>Gerencie os confrontos e finalize as partidas para rodar a distribuição de pontos.</p>
      </header>

      {/* Seção 1: Criar Jogos (Mata-mata) */}
      <h2 className={styles.sectionTitle}>1. Criar Nova Partida (Fases Finais)</h2>
      <AdminForm times={times} />

      <hr className={styles.sectionDivider} />

      {/* Nova Seção 2: Editar Horários */}
      <h2 className={styles.sectionTitle}>2. Alterar Horários dos Jogos</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Ajuste a data e hora de jogos agendados. Isso irá alterar automaticamente a data de encerramento das apostas.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
        {jogosPendentes.map((jogo) => (
          <EdicaoJogoCard 
            key={jogo.id}
            jogoId={jogo.id}
            siglaCasa={jogo.sigla_casa}
            siglaVisitante={jogo.sigla_visitante}
            dataHoraAtual={jogo.data_hora}
          />
        ))}
        {jogosPendentes.length === 0 && (
          <p style={{ fontStyle: 'italic', color: '#666' }}>Nenhum jogo pendente para edição.</p>
        )}
      </div>

      <hr className={styles.sectionDivider} />

      {/* Seção 3: Encerrar Jogos Pendentes */}
      <h2 className={styles.sectionTitle}>3. Finalizar Partidas e Calcular Pontos</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Atenção: Ao preencher o placar e clicar em "Encerrar Partida", o sistema irá distribuir os pontos (5, 3, 1 ou 0) para todos os palpites imediatamente.
      </p>
      <AdminFinalizarJogo jogos={jogosPendentes} />
    </div>
  );
}