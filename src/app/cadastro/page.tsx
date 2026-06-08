'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAction } from '../actions/register';
import styles from './cadastro.module.css';

export default function CadastroPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await registerAction(formData);

    if (result.success) {
      setStatus({ type: 'success', msg: 'Cadastro concluído! Redirecionando...' });
      setTimeout(() => router.push('/login'), 2500); // Dá tempo de ler a mensagem e envia pro login
    } else {
      setStatus({ type: 'error', msg: result.message });
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Novo Jogador</h1>
          <p className={styles.subtitle}>Junte-se ao Bolão Senai 4.0</p>
        </div>

        {status && (
          <div className={`${styles.message} ${styles[status.type]}`}>
            {status.msg}
          </div>
        )}

        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor="nome" className={styles.label}>Nome ou Apelido</label>
            <input type="text" id="nome" name="nome" className={styles.input} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>E-mail (Preferencialmente Senai)</label>
            <input type="email" id="email" name="email" className={styles.input} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="setor" className={styles.label}>Seu Setor</label>
            <select id="setor" name="setor" className={styles.select} required>
              <option value="">Selecione...</option>
              <option value="TI">TI / Desenvolvimento</option>
              <option value="Mecânica">Mecânica</option>
              <option value="Eletrônica">Eletrônica / Automação</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Direção">Direção</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="senha" className={styles.label}>Senha</label>
            <input type="password" id="senha" name="senha" className={styles.input} required minLength={6} />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Confirmar Inscrição'}
          </button>
        </form>

        <div className={styles.linkWrapper}>
          Já tem uma conta? <Link href="/login" className={styles.link}>Faça Login</Link>
        </div>
      </div>
    </main>
  );
}