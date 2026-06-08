import styles from './regras.module.css';

export default function RegrasPage() {
  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>Regulamento de Pontuação</h1>
        <p className={styles.subtitle}>Entenda como os seus palpites são calculados pelo sistema após o apito final.</p>
      </div>

      {/* Grid com os blocos de pontuação */}
      <div className={styles.grid}>
        <div className={styles.ruleCard}>
          <div className={`${styles.badgePoints} ${styles.pts5}`}>5</div>
          <h3 className={styles.ruleTitle}>Placar Exato</h3>
          <p className={styles.ruleDescription}>
            Você acertou em cheio o número de gols de ambas as seleções. (Ex: Palpite 2x1 | Resultado 2x1).
          </p>
        </div>

        <div className={styles.ruleCard}>
          <div className={`${styles.badgePoints} ${styles.pts3}`}>3</div>
          <h3 className={styles.ruleTitle}>Vencedor e Saldo</h3>
          <p className={styles.ruleDescription}>
            Você acertou o time vencedor e o saldo de gols, mas errou o placar. (Ex: Palpite 2x0 | Resultado 3x1).
          </p>
        </div>

        <div className={styles.ruleCard}>
          <div className={`${styles.badgePoints} ${styles.pts1}`}>1</div>
          <h3 className={styles.ruleTitle}>Tendência Simples</h3>
          <p className={styles.ruleDescription}>
            Você acertou apenas quem ganharia a partida ou se haveria empate comum. (Ex: Palpite 1x0 | Resultado 3x2).
          </p>
        </div>

        <div className={styles.ruleCard}>
          <div className={`${styles.badgePoints} ${styles.pts0}`}>0</div>
          <h3 className={styles.ruleTitle}>Sem Pontuar</h3>
          <p className={styles.ruleDescription}>
            O resultado foi completamente diferente da tendência enviada no seu palpite.
          </p>
        </div>
      </div>

      {/* Seção Informativa de Prazos e Funcionamento */}
      <section className={styles.infoSection}>
        <h2 className={styles.infoTitle}>📌 Informações Importantes</h2>
        <ul className={styles.infoList}>
          <li>
            <strong>Bloqueio de Palpites:</strong> O sistema bloqueia os inputs de cada partida automaticamente no horário exato de início do jogo. Certifique-se de salvar antes!
          </li>
          <li>
            <strong>Disputa com o Oráculo:</strong> A Inteligência Artificial (Oráculo 4.0) também está computando palpites e gerando concorrência no ranking geral.
          </li>
          <li>
            <strong>Critério de Desempate:</strong> Caso dois ou mais colaboradores terminem a rodada com a mesma pontuação, o sistema organizará o desempate por ordem alfabética do nome cadastrado.
          </li>
        </ul>
      </section>
    </div>
  );
}