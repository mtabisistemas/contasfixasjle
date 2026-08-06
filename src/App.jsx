import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  XCircle,
  Settings,
  Trash2,
  Edit2,
  X,
  List,
  Grid
} from 'lucide-react';
import { supabase, isSupabaseConfigured, INITIAL_MOCK_CONTAS } from './supabaseClient';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contas, setContas] = useState([]);
  const [pagamentos, setPagamentos] = useState({}); // { conta_id: { pago_por, pago_em } }
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' ou 'list'

  // Modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Form de Nova Conta
  const [novoDia, setNovoDia] = useState(1);
  const [novaDescricao, setNovaDescricao] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const mesAnoStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const mesesPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Carrega Dados do Supabase ou LocalStorage
  useEffect(() => {
    loadData();
  }, [mesAnoStr]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Busca do Supabase Real
        const { data: dataContas, error: errContas } = await supabase
          .from('contas')
          .select('*')
          .eq('ativa', true)
          .order('dia_vencimento', { ascending: true });

        if (!errContas && dataContas) {
          setContas(dataContas);
        }

        const { data: dataPags, error: errPags } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('mes_ano', mesAnoStr);

        if (!errPags && dataPags) {
          const pagsMap = {};
          dataPags.forEach((p) => {
            pagsMap[p.conta_id] = p;
          });
          setPagamentos(pagsMap);
        }
      } else {
        // Fallback para LocalStorage / Mock
        const savedContas = localStorage.getItem('contas_fixas_data');
        if (savedContas) {
          setContas(JSON.parse(savedContas));
        } else {
          setContas(INITIAL_MOCK_CONTAS);
          localStorage.setItem('contas_fixas_data', JSON.stringify(INITIAL_MOCK_CONTAS));
        }

        const savedPags = localStorage.getItem(`pagamentos_${mesAnoStr}`);
        if (savedPags) {
          setPagamentos(JSON.parse(savedPags));
        } else {
          setPagamentos({});
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Alternar Pagamento (Marcar como Paga / Pendente)
  const togglePayment = async (contaId) => {
    const isPaid = Boolean(pagamentos[contaId]);
    const updatedPags = { ...pagamentos };

    if (isPaid) {
      delete updatedPags[contaId];
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('pagamentos')
          .delete()
          .eq('conta_id', contaId)
          .eq('mes_ano', mesAnoStr);
      }
    } else {
      const newPayment = {
        conta_id: contaId,
        mes_ano: mesAnoStr,
        pago_por: 'Web Financeiro',
        pago_em: new Date().toISOString()
      };
      updatedPags[contaId] = newPayment;

      if (isSupabaseConfigured && supabase) {
        await supabase.from('pagamentos').insert([newPayment]);
      }
    }

    setPagamentos(updatedPags);
    if (!isSupabaseConfigured) {
      localStorage.setItem(`pagamentos_${mesAnoStr}`, JSON.stringify(updatedPags));
    }
  };

  // Adicionar Nova Conta
  const handleAddBill = async (e) => {
    e.preventDefault();
    if (!novaDescricao.trim()) return;

    const newBill = {
      dia_vencimento: Number(novoDia),
      descricao: novaDescricao.trim(),
      ativa: true
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('contas').insert([newBill]).select();
      if (data) {
        setContas([...contas, data[0]]);
      }
    } else {
      const billWithId = { ...newBill, id: Date.now() };
      const updated = [...contas, billWithId];
      setContas(updated);
      localStorage.setItem('contas_fixas_data', JSON.stringify(updated));
    }

    setNovaDescricao('');
    setNovoDia(1);
    setShowAddModal(false);
  };

  // Excluir Conta
  const handleDeleteBill = async (contaId) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('contas').delete().eq('id', contaId);
    }
    const updated = contas.filter((c) => c.id !== contaId);
    setContas(updated);
    if (!isSupabaseConfigured) {
      localStorage.setItem('contas_fixas_data', JSON.stringify(updated));
    }
    setSelectedBill(null);
  };

  // Navegação de Mês
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Cálculos do Calendário
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const totalContas = contas.length;
  const pagasCount = Object.keys(pagamentos).length;
  const progressPercent = totalContas > 0 ? Math.round((pagasCount / totalContas) * 100) : 0;

  const today = new Date();
  const isCurrentMonthActual =
    today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;

  return (
    <div className="app-container">
      {/* Header Estilo Google Agenda - JLE Telecom */}
      <header className="app-header">
        <div className="header-brand">
          <img src="/jle_logo.png" alt="JLE Telecom Logo" className="header-logo" />
          <div>
            <h1>Contas Fixas Financeiro</h1>
            <p style={{ fontSize: '0.75rem', color: '#D1E4F0' }}>
              {isSupabaseConfigured ? '🟢 Conectado ao Supabase Cloud' : '🟡 Modo Local (Demo)'}
            </p>
          </div>
        </div>

        <div className="header-controls">
          <button className="btn btn-outline" onClick={goToToday}>
            Hoje
          </button>

          <div className="month-nav">
            <button className="btn-icon" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <span className="month-title">
              {mesesPt[currentMonth - 1]} {currentYear}
            </span>
            <button className="btn-icon" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Nova Conta
          </button>

          <button className="btn btn-outline" onClick={() => setShowConfigModal(true)}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Barra de Progresso */}
      <div className="progress-bar-container">
        <span>
          Progresso: <strong>{pagasCount}</strong> de <strong>{totalContas}</strong> contas pagas ({progressPercent}%)
        </span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Grade do Calendário */}
      <main className="calendar-main">
        <div className="calendar-grid">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="day-name-header">
              {day}
            </div>
          ))}

          {/* Células vazias de preenchimento antes do dia 1 */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="day-cell other-month"></div>
          ))}

          {/* Células dos Dias do Mês (1 a daysInMonth) */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const isToday = isCurrentMonthActual && today.getDate() === dayNum;
            const dayBills = contas.filter((c) => c.dia_vencimento === dayNum);

            return (
              <div key={dayNum} className={`day-cell ${isToday ? 'is-today' : ''}`}>
                <div className="day-cell-header">
                  <span className="day-number">{dayNum}</span>
                  {dayBills.length > 0 && (
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {dayBills.length} conta(s)
                    </span>
                  )}
                </div>

                <div className="bills-list">
                  {dayBills.map((bill) => {
                    const isPaid = Boolean(pagamentos[bill.id]);
                    return (
                      <div
                        key={bill.id}
                        className={`bill-pill ${isPaid ? 'paid' : 'pending'}`}
                        onClick={() => togglePayment(bill.id)}
                        title={isPaid ? 'Clique para desmarcar pago' : 'Clique para marcar como pago'}
                      >
                        {isPaid ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span className="bill-title">{bill.descricao}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL: Nova Conta */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Adicionar Nova Conta Fixa</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} color="#0f172a" />
              </button>
            </div>

            <form onSubmit={handleAddBill}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Dia do Vencimento (1 a 31):</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-input"
                  value={novoDia}
                  onChange={(e) => setNovoDia(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Descrição / Nome da Conta:</label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel Base SC, Água, Claro NH..."
                  className="form-input"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" style={{ color: '#0f172a' }} onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Configuração Supabase */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Configuração do Supabase Cloud</h2>
              <button className="btn-icon" onClick={() => setShowConfigModal(false)}>
                <X size={20} color="#0f172a" />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Para conectar esta interface ao seu banco de dados Supabase na nuvem, adicione as chaves no arquivo <code>.env</code> do seu projeto:
            </p>

            <pre style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, fontSize: '0.8rem' }}>
{`VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima`}
            </pre>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowConfigModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
