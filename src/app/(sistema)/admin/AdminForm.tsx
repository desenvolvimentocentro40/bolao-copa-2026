// src/app/(sistema)/admin/AdminForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { criarJogoAction } from '@/app/actions/admin';
import styles from './admin.module.css';

interface Time {
  id: number;
  nome: string;
  sigla: string;
}

export function AdminForm({ times }: { times: Time[] }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(event.currentTarget);
    const res = await criarJogoAction(formData);

    setMsg({ type: res.success ? 'success' : 'error', text: res.message });
    setLoading(false);

    if (res.success) {
      // Limpa o formulário após salvar com sucesso
      (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Fase do Campeonato</label>
          <select title="fase" name="fase" className={styles.select} required>
            <option value="">Selecione...</option>
            <option value="Segunda Fase">Segunda Fase</option>
            <option value="Oitavas de Final">Oitavas de Final</option>
            <option value="Quartas de Final">Quartas de Final</option>
            <option value="Semifinal">Semifinal</option>
            <option value="Disputa do 3º Lugar">Disputa do 3º Lugar</option>
            <option value="Final">Final</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Data e Hora</label>
          <input title="dataHora" type="datetime-local" name="dataHora" className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Time Casa (Mandante)</label>
          <select title="timeCasaId" name="timeCasaId" className={styles.select} required>
            <option value="">Selecione a Seleção</option>
            {times.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.sigla})</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Time Visitante</label>
          <select title="timeVisitanteId" name="timeVisitanteId" className={styles.select} required>
            <option value="">Selecione a Seleção</option>
            {times.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.sigla})</option>)}
          </select>
        </div>

        <button type="submit" className={`${styles.fullWidth} ${styles.btnSubmit}`} disabled={loading}>
          {loading ? 'Criando Partida...' : 'Criar Jogo e Liberar Palpites'}
        </button>

      </div>

      {msg && <div className={`${styles.feedback} ${styles[msg.type]}`}>{msg.text}</div>}
    </form>
  );
}