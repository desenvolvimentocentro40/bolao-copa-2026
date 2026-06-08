import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <main className={styles.container}>
      <div className={styles.heroCard}>
        <div className={styles.badge}>Copa do Mundo 2026</div>
        <h1 className={styles.title}>
          Bolão <span className={styles.highlight}>4.0</span>
        </h1>
        <p className={styles.subtitle}>
          A plataforma oficial de integração e palpites dos colaboradores do 
          <strong> SENAI Centro 4.0</strong>.
        </p>
        
        <div className={styles.divider} />
        
        <p className={styles.infoText}>
          Mostre que você entende de futebol, acumule pontos e dispute o topo do ranking com seus colegas de equipe!
        </p>

        <Link href="/login" className={styles.ctaButton}>
          Entrar na Arena
        </Link>
      </div>
    </main>
  );
}