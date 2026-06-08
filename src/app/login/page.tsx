'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions/auth';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Bolão 4.0</h1>
        <p className={styles.subtitle}>Copa do Mundo 2026 - SENAI</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>E-mail Corporativo</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className={styles.input}
              placeholder="seu.nome@senai.br" 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Senha de Acesso</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className={styles.input}
              placeholder="••••••••" 
              required 
            />
          </div>

          {/* Grupo de botões unificados */}
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.btnEntrar} 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando na Arena...' : 'Entrar'}
            </button>

            <button 
              type="button" 
              className={styles.btnCadastrar}
              onClick={() => router.push('/cadastro')}
              disabled={isLoading}
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}