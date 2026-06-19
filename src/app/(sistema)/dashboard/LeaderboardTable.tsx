'use client';

import { useState } from 'react';
import { obterPalpitesUsuarioAction } from '@/app/actions/apostas';
import styles from './dashboard.module.css';

interface LeaderboardRow {
  id: number;
  nome: string;
  setor: string;
  tipo: 'admin' | 'colaborador' | 'ia';
  total_pontos: number;
}

interface PalpiteInfo {
  jogo_id: number;
  data_hora: string;
  fase: string;
  jogo_status: 'agendado' | 'em_andamento' | 'finalizado';
  gols_casa_real: number | null;
  gols_visitante_real: number | null;
  time_casa: string;
  time_casa_logo: string;
  time_casa_nome: string;
  time_visitante: string;
  time_visitante_logo: string;
  time_visitante_nome: string;
  palpite_casa: number | null;
  palpite_visitante: number | null;
  pontos_obtidos: number | null;
  palpite_oculto: boolean;
}

interface LeaderboardTableProps {
  ranking: LeaderboardRow[];
}

export function LeaderboardTable({ ranking }: LeaderboardTableProps) {
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);
  const [loadingPlayerId, setLoadingPlayerId] = useState<number | null>(null);
  const [playerBets, setPlayerBets] = useState<Record<number, PalpiteInfo[]>>({});

  const getPosClass = (index: number) => {
    if (index === 0) return styles.primeiro;
    if (index === 1) return styles.segundo;
    if (index === 2) return styles.terceiro;
    return '';
  };

  async function toggleExpand(playerId: number) {
    if (expandedPlayerId === playerId) {
      setExpandedPlayerId(null);
      return;
    }

    setExpandedPlayerId(playerId);

    // Se já tiver os palpites no cache, não busca de novo
    if (playerBets[playerId]) {
      return;
    }

    setLoadingPlayerId(playerId);
    const res = await obterPalpitesUsuarioAction(playerId);
    setLoadingPlayerId(null);

    if (res.success && res.palpites) {
      setPlayerBets((prev) => ({
        ...prev,
        [playerId]: res.palpites,
      }));
    }
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '80px' }}>Pos</th>
            <th>Participante</th>
            <th>Setor</th>
            <th style={{ textAlign: 'right', width: '150px' }}>Pontos</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((player, index) => {
            const isExpanded = expandedPlayerId === player.id;
            const isLoading = loadingPlayerId === player.id;
            const bets = playerBets[player.id] || [];

            // Estatísticas do jogador
            const palpitesValidos = bets.filter(b => b.palpite_casa !== null && b.palpite_visitante !== null);
            const totalPalpites = palpitesValidos.length;
            const jogosPontuados = bets.filter(b => b.pontos_obtidos !== null && b.pontos_obtidos > 0).length;

            return (
              <optgroup key={player.id} label={player.nome} style={{ display: 'contents' }}>
                <tr
                  className={`${styles.row} ${isExpanded ? styles.expandedRow : ''}`}
                  onClick={() => toggleExpand(player.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span className={`${styles.posicao} ${getPosClass(index)}`}>
                      {index + 1}º
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={styles.nomeUsuario}>{player.nome}</span>
                      {player.tipo === 'ia' && (
                        <span className={styles.iaBadge}>Inteligência Artificial</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.setorBadge}>{player.setor}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.pontos}>{player.total_pontos} pts</span>
                      <span className={`${styles.arrow} ${isExpanded ? styles.arrowUp : ''}`}>
                        ▼
                      </span>
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className={styles.accordionRow}>
                    <td colSpan={4}>
                      <div className={styles.accordionContent}>
                        {isLoading ? (
                          <div className={styles.loadingSpinner}>
                            <div className={styles.spinner}></div>
                            <span>Carregando palpites...</span>
                          </div>
                        ) : (
                          <>
                            {/* Resumo estatístico */}
                            <div className={styles.summaryStats}>
                              <div className={styles.statCard}>
                                <span className={styles.statLabel}>Total de Palpites</span>
                                <span className={styles.statVal}>{totalPalpites}</span>
                              </div>
                              <div className={styles.statCard}>
                                <span className={styles.statLabel}>Partidas que Pontuou</span>
                                <span className={styles.statVal}>{jogosPontuados}</span>
                              </div>
                              <div className={styles.statCard}>
                                <span className={styles.statLabel}>Aproveitamento</span>
                                <span className={styles.statVal}>
                                  {totalPalpites > 0
                                    ? `${Math.round((jogosPontuados / totalPalpites) * 100)}%`
                                    : '0%'}
                                </span>
                              </div>
                            </div>

                            {/* Título da seção */}
                            <h4 className={styles.accordionTitle}>⚽ Palpites Realizados</h4>

                            {/* Grid de palpites */}
                            {bets.length === 0 ? (
                              <p className={styles.emptyBets}>
                                Este participante ainda não realizou nenhum palpite.
                              </p>
                            ) : (
                              <div className={styles.betsGrid}>
                                {bets.map((bet) => {
                                  const formattedDate = new Date(bet.data_hora).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  });

                                  // Cores dos distintivos de pontos
                                  let ptsClass = styles.badgePtsPending;
                                  let ptsText = 'Aguardando';

                                  if (bet.jogo_status === 'finalizado') {
                                    const pts = bet.pontos_obtidos ?? 0;
                                    ptsText = `+${pts} pts`;
                                    if (pts === 5) {
                                      ptsClass = styles.badgePts5;
                                      ptsText += ' (Placar)';
                                    } else if (pts === 3) {
                                      ptsClass = styles.badgePts3;
                                      ptsText += ' (Saldo)';
                                    } else if (pts === 1) {
                                      ptsClass = styles.badgePts1;
                                      ptsText += ' (Resultado)';
                                    } else {
                                      ptsClass = styles.badgePts0;
                                    }
                                  } else if (bet.jogo_status === 'em_andamento') {
                                    ptsClass = styles.badgePtsLive;
                                    ptsText = 'Ao vivo';
                                  }

                                  return (
                                    <div
                                      key={bet.jogo_id}
                                      className={`${styles.betCard} ${
                                        bet.pontos_obtidos !== null && bet.pontos_obtidos > 0
                                          ? styles.betCardScored
                                          : ''
                                      }`}
                                    >
                                      <div className={styles.betCardHeader}>
                                        <span className={styles.betCardDate}>{formattedDate}</span>
                                        <span className={styles.betCardFase}>{bet.fase}</span>
                                      </div>

                                      <div className={styles.betCardMatch}>
                                        {/* Mandante */}
                                        <div className={styles.betCardTime} title={bet.time_casa_nome}>
                                          <img
                                            src={bet.time_casa_logo}
                                            alt={bet.time_casa}
                                            className={styles.miniLogo}
                                          />
                                          <span className={styles.timeSigla}>{bet.time_casa}</span>
                                        </div>

                                        {/* Palpite vs Placar Real */}
                                        <div className={styles.betCardScores}>
                                          <div className={styles.betCardPalpite}>
                                            {bet.palpite_oculto ? (
                                              <span className={styles.lockedPalpite} title="Palpite oculto até o início do jogo">
                                                🔒 Oculto
                                              </span>
                                            ) : (
                                              <span className={styles.palpiteText}>
                                                {bet.palpite_casa} x {bet.palpite_visitante}
                                              </span>
                                            )}
                                            <span className={styles.palpiteSub}>palpite</span>
                                          </div>

                                          <div className={styles.betCardDivider}></div>

                                          <div className={styles.betCardReal}>
                                            <span className={styles.realText}>
                                              {bet.jogo_status === 'finalizado'
                                                ? `${bet.gols_casa_real} x ${bet.gols_visitante_real}`
                                                : '- x -'}
                                            </span>
                                            <span className={styles.realSub}>placar real</span>
                                          </div>
                                        </div>

                                        {/* Visitante */}
                                        <div className={styles.betCardTime} title={bet.time_visitante_nome}>
                                          <img
                                            src={bet.time_visitante_logo}
                                            alt={bet.time_visitante}
                                            className={styles.miniLogo}
                                          />
                                          <span className={styles.timeSigla}>{bet.time_visitante}</span>
                                        </div>
                                      </div>

                                      <div className={styles.betCardFooter}>
                                        <span className={`${styles.ptsBadge} ${ptsClass}`}>
                                          {ptsText}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </optgroup>
            );
          })}

          {ranking.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Nenhum jogador pontuou ainda. A Copa está prestes a começar!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
