'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import styles from './Header.module.css';

// Adicionamos uma interface para receber a prop
interface HeaderProps {
  isAdmin?: boolean;
}

export function Header({ isAdmin = false }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push('/login');
  }

  // Lista base de itens do menu
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Jogos & Palpites', path: '/apostas' },
    { label: 'Resultados', path: '/resultados' },
    { label: 'Regras', path: '/regras' },
  ];

  // Injeta o link de Admin dinamicamente se a prop for verdadeira
  if (isAdmin) {
    navItems.push({ label: '⚙️ Painel Admin', path: '/admin' });
  }

  return (
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.brand}>
        <span className={styles.logoText}>Bolão<span className={styles.highlight}>4.0</span></span>
      </Link>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`${styles.navLink} ${pathname.startsWith(item.path) ? styles.active : ''}`}
          >
            {item.label}
          </Link>
        ))}
        
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Sair
        </button>
      </nav>
    </header>
  );
}