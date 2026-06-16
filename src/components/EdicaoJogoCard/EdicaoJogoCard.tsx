'use client';

import { useState } from 'react';
import { atualizarHorarioJogoAction } from '@/app/actions/admin';

interface EdicaoJogoProps {
  jogoId: number;
  siglaCasa: string;
  siglaVisitante: string;
  dataHoraAtual: string;
}

export function EdicaoJogoCard({ jogoId, siglaCasa, siglaVisitante, dataHoraAtual }: EdicaoJogoProps) {
  // O input datetime-local precisa da string no formato YYYY-MM-DDTHH:mm
  // Removemos os segundos e o 'Z' final da string que vem do banco
  const dataFormatadaInicial = typeof dataHoraAtual === 'string' 
    ? dataHoraAtual.slice(0, 16) 
    : new Date(dataHoraAtual).toISOString().slice(0, 16);

  const [dataHora, setDataHora] = useState(dataFormatadaInicial);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  async function handleSalvar() {
    setLoading(true);
    setMsg(null);

    const res = await atualizarHorarioJogoAction(jogoId, dataHora);

    if (res.success) {
      setMsg({ text: '✅ Atualizado!', type: 'success' });
    } else {
      setMsg({ text: `❌ ${res.message}`, type: 'error' });
    }
    setLoading(false);

    // Oculta a mensagem de sucesso após 3 segundos
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', 
      padding: '12px', borderBottom: '1px solid #eee', background: '#fff', borderRadius: '8px'
    }}>
      <div style={{ width: '120px', fontWeight: 'bold' }}>
        {siglaCasa} x {siglaVisitante}
      </div>

      <input 
        type="datetime-local" 
        title="Data e Hora do Jogo"
        value={dataHora}
        onChange={(e) => setDataHora(e.target.value)}
        disabled={loading}
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />

      <button 
        onClick={handleSalvar} 
        disabled={loading || dataHora === dataFormatadaInicial}
        style={{ 
          padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
          background: dataHora !== dataFormatadaInicial ? '#0056b3' : '#ccc', 
          color: '#fff', border: 'none'
        }}
      >
        {loading ? 'Salvando...' : 'Salvar Novo Horário'}
      </button>

      {msg && <span style={{ color: msg.type === 'success' ? 'green' : 'red', fontSize: '0.9rem' }}>{msg.text}</span>}
    </div>
  );
}