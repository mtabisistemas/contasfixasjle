import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  KeyRound,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured, INITIAL_MOCK_CONTAS } from './supabaseClient';

// Logos Oficiais da JLE Telecom conforme especificado pelo usuário
const jleLogoLogin = '/jle_logo_login.png';   // Logo Azul (Texto em azul escuro para o card de login branco)
const jleLogoHeader = '/jle_logo_header.png'; // Logo Branco (Texto em branco transparente para o cabeçalho escuro)

const REQUIRED_PASSWORD = 'Jle@2026';

export default function App() {
  // Autenticação por Senha
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('jle_auth_session') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Estados da Aplicação
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  // Form de Nova/Edição de Conta
  const [formDia, setFormDia] = useState(1);
  const [formDescricao, setFormDescricao] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const mesesPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Handler de Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === REQUIRED_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
      localStorage.setItem('jle_auth_session', 'true');
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('jle_auth_session');
    setPasswordInput('');
  };

  // Carrega Dados do Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, currentYear, currentMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('contas')
          .select('*')
          .eq('ativa', true)
          .order('dia_vencimento', { ascending: true });

        if (!error && data && data.length > 0) {
          setContas(data);
        } else if (!error && data && data.length === 0) {
          const contasToInsert = INITIAL_MOCK_CONTAS.map(({ id, ...rest }) => rest);
          const { data: insertedData } = await supabase.from('contas').insert(contasToInsert).select();
          if (insertedData) {
            setContas(insertedData);
          } else {
            setContas(INITIAL_MOCK_CONTAS);
          }
        } else {
          setContas(INITIAL_MOCK_CONTAS);
        }
      } else {
        const savedContas = localStorage.getItem('contas_fixas_data');
        if (savedContas) {
          setContas(JSON.parse(savedContas));
        } else {
          setContas(INITIAL_MOCK_CONTAS);
          localStorage.setItem('contas_fixas_data', JSON.stringify(INITIAL_MOCK_CONTAS));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setContas(INITIAL_MOCK_CONTAS);
    } finally {
      setLoading(false);
    }
  };

  // Salvar Nova Conta ou Editar Existente no Supabase
  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!formDescricao.trim()) return;

    const diaNum = Number(formDia);
    const descStr = formDescricao.trim();

    try {
      if (editingBill) {
        if (isSupabaseConfigured && supabase) {
          await supabase
            .from('contas')
            .update({ dia_vencimento: diaNum, descricao: descStr })
            .eq('id', editingBill.id);
        }
      } else {
        const newBill = { dia_vencimento: diaNum, descricao: descStr, ativa: true };
        if (isSupabaseConfigured && supabase) {
          await supabase.from('contas').insert([newBill]);
        }
      }
    } catch (err) {
      console.error('Erro Supabase ao salvar:', err);
    }

    closeFormModal();
    await loadData();
  };

  // Excluir Conta no Supabase
  const handleDeleteBill = async (contaId) => {
    if (confirm('Tem certeza que deseja excluir esta conta permanentemente?')) {
      try {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('contas').delete().eq('id', contaId);
        }
      } catch (err) {
        console.error('Erro Supabase ao excluir:', err);
      }
      closeFormModal();
      await loadData();
    }
  };

  const openAddModal = () => {
    setEditingBill(null);
    setFormDia(1);
    setFormDescricao('');
    setShowAddModal(true);
  };

  const openEditModal = (bill) => {
    setEditingBill(bill);
    setFormDia(bill.dia_vencimento);
    setFormDescricao(bill.descricao);
    setShowAddModal(true);
  };

  const closeFormModal = () => {
    setShowAddModal(false);
    setEditingBill(null);
    setFormDescricao('');
    setFormDia(1);
  };

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const today = new Date();
  const isCurrentMonthActual = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;

  // ---------------- TELA DE BLOQUEIO / LOGIN COM LOGO JLE AZUL ----------------
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0B334B 0%, #104E70 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '44px 36px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            textAlign: 'center'
          }}
        >
          {/* Logo JLE Telecom Azul (Para o Card de Login Branco) */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <img
              src={jleLogoLogin}
              alt="JLE Telecom Logo Azul"
              style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <KeyRound
                size={20}
                color="#104E70"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                placeholder="Digite a senha de acesso..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  border: passwordError ? '2px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '1rem',
                  fontWeight: '500',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#F8FAFC'
                }}
                autoFocus
                required
              />
            </div>

            {passwordError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#EF4444',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '18px',
                  justifyContent: 'center'
                }}
              >
                <AlertCircle size={16} /> Senha incorreta! Tente novamente.
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#F3921F',
                color: '#FFFFFF',
                padding: '15px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(243, 146, 31, 0.4)'
              }}
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- TELA PRINCIPAL DO CALENDÁRIO COM LOGO JLE BRANCO MODO ESCURO ----------------
  return (
    <div className="app-container">
      {/* Header JLE Telecom */}
      <header className="app-header">
        <div className="header-brand">
          {/* Logo JLE Branco Transparente (Modo Escuro para o Cabeçalho Azul) */}
          <img src={jleLogoHeader} alt="JLE Telecom Logo Branco" className="header-logo-img" />
          <h1 className="header-title">
            Contas Fixas Financeiro
          </h1>
        </div>

        <div className="header-controls">
          <button className="btn btn-outline btn-today" onClick={goToToday}>
            Hoje
          </button>

          <div className="month-nav">
            <button className="btn-icon" onClick={prevMonth} aria-label="Mês anterior">
              <ChevronLeft size={20} />
            </button>
            <span className="month-title">
              {mesesPt[currentMonth - 1]} {currentYear}
            </span>
            <button className="btn-icon" onClick={nextMonth} aria-label="Próximo mês">
              <ChevronRight size={20} />
            </button>
          </div>

          <button className="btn btn-primary btn-add" onClick={openAddModal}>
            <Plus size={18} /> <span className="btn-add-text">Nova Conta</span>
          </button>

          <button className="btn btn-outline btn-logout" onClick={handleLogout} title="Sair do Painel">
            <LogOut size={18} /> <span className="btn-logout-text">Sair</span>
          </button>
        </div>
      </header>

      {/* Grid do Calendário */}
      <main className="calendar-main">
        <div className="calendar-grid">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="day-name-header">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="day-cell other-month"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const isToday = isCurrentMonthActual && today.getDate() === dayNum;
            const dayBills = contas.filter((c) => c.dia_vencimento === dayNum);
            const hasBills = dayBills.length > 0;

            return (
              <div key={dayNum} className={`day-cell ${isToday ? 'is-today' : ''} ${hasBills ? 'has-bills' : 'empty-day'}`}>
                <div className="day-cell-header">
                  <span className="day-number">{dayNum}</span>
                  {hasBills && (
                    <span className="bill-count-badge">
                      {dayBills.length} conta(s)
                    </span>
                  )}
                </div>

                {hasBills && (
                  <div className="bills-list">
                    {dayBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="bill-pill pending"
                        onClick={() => openEditModal(bill)}
                        title="Clique para editar ou excluir esta conta"
                      >
                        <span className="bill-title">{bill.descricao}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL: Adicionar / Editar Conta */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBill ? '✏️ Editar Conta Fixa' : '➕ Nova Conta Fixa'}</h2>
              <button className="btn-icon" onClick={closeFormModal}>
                <X size={20} color="#104E70" />
              </button>
            </div>

            <form onSubmit={handleSaveBill}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Dia do Vencimento (1 a 31):</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-input"
                  value={formDia}
                  onChange={(e) => setFormDia(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Descrição / Nome da Conta:</label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel Base SC, Água, Claro NH..."
                  className="form-input"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                {editingBill ? (
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: '#EF4444', color: 'white' }}
                    onClick={() => handleDeleteBill(editingBill.id)}
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                ) : (
                  <div></div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-outline" style={{ color: '#104E70' }} onClick={closeFormModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
