// src/app/(sistema)/admin/AdminFinalizarJogo.tsx
'use client';

import { useState } from 'react';
import { finalizarJogoAction } from '@/app/actions/resultados'; // Aquela Action que já tínhamos criado!
import styles from './admin.module.css';

interface JogoPendente {
  id: number;
  data_hora: Date;
  fase: string;
  sigla_casa: string;
  logo_casa: string;
  sigla_visitante: string;
  logo_visitante: string;
}

export function AdminFinalizarJogo({ jogos }: { jogos: JogoPendente[] }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleFinalizar(jogoId: number) {
    const inputCasa = document.getElementById(`casa-${jogoId}`) as HTMLInputElement;
    const inputVis = document.getElementById(`vis-${jogoId}`) as HTMLInputElement;

    const golsCasa = parseInt(inputCasa.value);
    const golsVis = parseInt(inputVis.value);

    if (isNaN(golsCasa) || isNaN(golsVis)) {
      alert('Preencha os dois placares antes de encerrar o jogo!');
      return;
    }

    if (confirm('Tem certeza? Essa ação vai distribuir os pontos e não pode ser desfeita.')) {
      setLoadingId(jogoId);
      
      const res = await finalizarJogoAction(jogoId, golsCasa, golsVis);
      
      if (res.success) {
        alert(res.message);
      } else {
        alert('Erro: ' + res.message);
      }
      
      setLoadingId(null);
    }
  }

  if (jogos.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>Nenhum jogo aguardando resultado no momento.</p>;
  }

  return (
    <div className={styles.gamesList}>
      {jogos.map((jogo) => (
        <div key={jogo.id} className={styles.gameItem}>
          
          <div className={styles.gameInfo}>
            {new Date(jogo.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} - {jogo.fase}
          </div>

          <div className={styles.matchDisplay}>
            <div className={styles.teamName}>
              <img src={jogo.logo_casa} alt={jogo.sigla_casa} className={styles.logo} />
              {jogo.sigla_casa}
            </div>

            <div className={styles.scoreInputGroup}>
              <input title="scoreInput1" type="number" min="0" id={`casa-${jogo.id}`} className={styles.scoreInput} disabled={loadingId === jogo.id} />
              <span style={{ fontWeight: 800, color: '#94a3b8' }}>X</span>
              <input title="scoreInput2" type="number" min="0" id={`vis-${jogo.id}`} className={styles.scoreInput} disabled={loadingId === jogo.id} />
            </div>

            <div className={`${styles.teamName} ${styles.right}`}>
              {jogo.sigla_visitante}
              <img src={jogo.logo_visitante} alt={jogo.sigla_visitante} className={styles.logo} />
            </div>
          </div>

          <button 
            className={styles.btnEndGame} 
            onClick={() => handleFinalizar(jogo.id)}
            disabled={loadingId === jogo.id}
          >
            {loadingId === jogo.id ? 'Calculando...' : 'Encerrar Partida'}
          </button>

        </div>
      ))}
    </div>
  );
}