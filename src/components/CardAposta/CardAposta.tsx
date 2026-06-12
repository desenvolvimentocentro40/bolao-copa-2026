'use client';

import { useState } from 'react';
import { salvarPalpiteAction } from '@/app/actions/apostas';
import { obterSugestaoIAAction } from '@/app/actions/ai';
import styles from './CardAposta.module.css';

interface CardApostaProps {
  jogoId: number;
  timeCasa: string;
  siglaCasa: string;
  logoCasa: string;
  timeVisitante: string;
  siglaVisitante: string;
  logoVisitante: string;
  dataHora: string;
  fase: string;
  status: 'agendado' | 'em_andamento' | 'finalizado';
  palpiteCasaInicial: number | null;
  palpiteVisitanteInicial: number | null;
}

export function CardAposta({
  jogoId, timeCasa, siglaCasa, logoCasa,
  timeVisitante, siglaVisitante, logoVisitante,
  dataHora, fase, status, palpiteCasaInicial, palpiteVisitanteInicial
}: CardApostaProps) {
  
  const [golsCasa, setGolsCasa] = useState<string>(palpiteCasaInicial?.toString() ?? '');
  const [golsVis, setGolsVis] = useState<string>(palpiteVisitanteInicial?.toString() ?? '');
  const [loading, setLoading] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. O JavaScript puro já entende o formato que vem do banco graças à nossa config do Docker!
  const dataJogo = new Date(dataHora);
  
  // 2. Cálculos de data e hora (Subtraindo 10 minutos para a guilhotina)
  const dataEncerramento = new Date(dataJogo.getTime() - 10 * 60 * 1000);
  const encerrado = status !== 'agendado' || new Date() >= dataEncerramento;

  // 3. Formatação para exibir na tela (padrão Brasil)
  const formatadorHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dataLocalStr = dataJogo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  async function handleGerarPalpiteIA() {
    setLoadingIA(true);
    setMsg(null);

    const res = await obterSugestaoIAAction(jogoId);

    setLoadingIA(false);
    if (res.success && res.golsCasa !== undefined && res.golsVisitante !== undefined) {
      setGolsCasa(res.golsCasa.toString());
      setGolsVis(res.golsVisitante.toString());
      setMsg({ type: 'success', text: '💡 Sugestão do Oráculo carregada!' });
    } else {
      setMsg({ type: 'error', text: res.message || 'Erro ao consultar a IA.' });
    }
  }

  async function handleSalvar() {
    if (golsCasa === '' || golsVis === '') {
      setMsg({ type: 'error', text: 'Preencha ambos os placares.' });
      return;
    }

    setLoading(true);
    setMsg(null);

    const res = await salvarPalpiteAction(jogoId, parseInt(golsCasa), parseInt(golsVis));

    setLoading(false);
    if (res.success) {
      setMsg({ type: 'success', text: res.message });
    } else {
      setMsg({ type: 'error', text: res.message });
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem' }}>
          <span>⚽ Jogo: <strong>{dataLocalStr} às {formatadorHora.format(dataJogo)}</strong></span>
          <span style={{ color: encerrado ? '#dc3545' : '#e0a800', fontWeight: '500' }}>
            ⏳ Apostas até: {formatadorHora.format(dataEncerramento)}
          </span>
        </div>
        <span className={styles.fase}>{fase}</span>
      </div>

      <div className={styles.matchografia}>
        {/* Mandante */}
        <div className={styles.timeBlock}>
          <img src={logoCasa} alt={timeCasa} className={styles.logo} />
          <span className={styles.nomeTime}>{siglaCasa}</span>
        </div>

        {/* Inputs de Placar */}
        <div className={styles.placarWrapper}>
          <input 
            title="golscasa"
            type="number" 
            min="0"
            value={golsCasa} 
            onChange={(e) => setGolsCasa(e.target.value)}
            className={styles.inputPlacar} 
            disabled={encerrado || loading || loadingIA}
          />
          <span className={styles.vs}>X</span>
          <input 
            title="golsvis"
            type="number" 
            min="0"
            value={golsVis} 
            onChange={(e) => setGolsVis(e.target.value)}
            className={styles.inputPlacar} 
            disabled={encerrado || loading || loadingIA}
          />
        </div>

        {/* Visitante */}
        <div className={styles.timeBlock}>
          <img src={logoVisitante} alt={timeVisitante} className={styles.logo} />
          <span className={styles.nomeTime}>{siglaVisitante}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.btnIA}
            onClick={handleGerarPalpiteIA}
            disabled={encerrado || loading || loadingIA}
          >
            {loadingIA ? 'Consultando Oráculo...' : '💡 Sugerir Placar via IA'}
          </button>

          <button 
            onClick={handleSalvar} 
            className={styles.btnSalvar}
            disabled={encerrado || loading || loadingIA}
          >
            {encerrado ? 'Inscrições Encerradas' : loading ? 'Salvando...' : 'Salvar Palpite'}
          </button>
        </div>

        {msg && (
          <span className={`${styles.feedback} ${styles[msg.type]}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}