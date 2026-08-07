import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  KeyRound,
  LogOut,
  AlertCircle,
  BookOpen,
  Download,
  Calendar as CalendarIcon,
  Clock,
  Edit2
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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // Dia selecionado para o Pop-up central
  const [editingBill, setEditingBill] = useState(null);

  // Modal de Confirmação de Exclusão
  const [billToDelete, setBillToDelete] = useState(null);

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

  // Solicitar Confirmação de Exclusão
  const confirmDeleteBill = (conta) => {
    setBillToDelete(conta);
  };

  // Excluir Conta Definitivamente
  const executeDeleteBill = async () => {
    if (!billToDelete) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('contas').delete().eq('id', billToDelete.id);
      }
    } catch (err) {
      console.error('Erro Supabase ao excluir:', err);
    }
    setBillToDelete(null);
    closeFormModal();
    await loadData();
  };

  const openAddModalForDay = (day) => {
    setEditingBill(null);
    setFormDia(day);
    setFormDescricao('');
    setShowAddModal(true);
  };

  const openAddModal = () => {
    openAddModalForDay(selectedDay || 1);
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

  // Contas do Dia Selecionado para o Pop-up
  const selectedDayBills = selectedDay
    ? contas.filter((c) => c.dia_vencimento === selectedDay)
    : [];

  // ---------------- TELA PRINCIPAL DO CALENDÁRIO COM LOGO JLE BRANCO ----------------
  return (
    <div className="app-container">
      {/* Header JLE Telecom */}
      <header className="app-header">
        <div className="header-brand">
          <img src={jleLogoHeader} alt="JLE Telecom Logo Branco" className="header-logo-img" />
          <h1 className="header-title">
            Contas Fixas Financeiro
          </h1>
        </div>

        <div className="header-controls">
          <button className="btn btn-primary btn-add-header" onClick={openAddModal} title="Nova Conta" aria-label="Nova Conta">
            <Plus size={18} /> <span className="btn-add-text">Nova Conta</span>
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

          <button 
            className="btn btn-icon btn-guide" 
            onClick={() => setShowGuideModal(true)} 
            title="Guia Interativo de Uso"
            aria-label="Guia de Uso"
            style={{ color: '#FFFFFF' }}
          >
            <BookOpen size={20} />
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
              <div
                key={dayNum}
                className={`day-cell ${isToday ? 'is-today' : ''} ${hasBills ? 'has-bills' : 'empty-day'}`}
                onClick={() => setSelectedDay(dayNum)}
                style={{ cursor: 'pointer' }}
                title={`Clique para visualizar todas as contas do dia ${dayNum}`}
              >
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
                    {dayBills.slice(0, 3).map((bill) => (
                      <div
                        key={bill.id}
                        className="bill-pill pending"
                      >
                        <span className="bill-title">{bill.descricao}</span>
                      </div>
                    ))}
                    {dayBills.length > 3 && (
                      <div className="bills-more-tag">
                        + {dayBills.length - 3} mais...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* ---------------- MODAL POP-UP CENTRAL DO DIA SELECIONADO ---------------- */}
      {selectedDay !== null && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-content day-popup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header day-popup-header">
              <div>
                <h2>📅 Dia {selectedDay} de {mesesPt[currentMonth - 1]}</h2>
                <p className="day-popup-subtitle">
                  {selectedDayBills.length === 0
                    ? 'Nenhuma conta agendada para este dia'
                    : `${selectedDayBills.length} conta(s) fixa(s) com vencimento neste dia`}
                </p>
              </div>
              <button className="btn-icon" onClick={() => setSelectedDay(null)} aria-label="Fechar">
                <X size={20} color="#104E70" />
              </button>
            </div>

            <div className="day-popup-body">
              {selectedDayBills.length === 0 ? (
                <div className="empty-day-state">
                  <Clock size={40} color="#94A3B8" />
                  <p>Nenhuma conta cadastrada para o dia {selectedDay}.</p>
                </div>
              ) : (
                <div className="day-bills-interactive-list">
                  {selectedDayBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="day-bill-card-item"
                      onClick={() => openEditModal(bill)}
                      title="Clique sobre a conta para abrir o formulário de edição/exclusão"
                    >
                      <div className="day-bill-card-info">
                        <span className="day-bill-tag">Dia {bill.dia_vencimento}</span>
                        <span className="day-bill-name">{bill.descricao}</span>
                      </div>
                      <div className="day-bill-card-action">
                        <Edit2 size={16} color="#F3921F" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions day-popup-footer">
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => openAddModalForDay(selectedDay)}
              >
                <Plus size={18} /> Adicionar Conta neste dia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Guia Interativo de Uso */}
      {showGuideModal && (
        <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="modal-content modal-guide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 Guia de Uso - Sistema Contas Fixas JLE Telecom</h2>
              <button className="btn-icon" onClick={() => setShowGuideModal(false)} aria-label="Fechar Guia">
                <X size={20} color="#104E70" />
              </button>
            </div>

            <div className="guide-body">
              {/* Botão de Download PDF */}
              <div className="guide-download-banner">
                <div>
                  <h3>Manual Completo em PDF</h3>
                  <p>Baixe o arquivo PDF oficial com fotos explicativas em alta resolução.</p>
                </div>
                <a 
                  href="/Guia_de_Uso_Contas_Fixas.pdf" 
                  download="Guia_de_Uso_Contas_Fixas.pdf" 
                  className="btn btn-primary btn-download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={18} /> Baixar PDF Oficial
                </a>
              </div>

              <div className="guide-sections-scroll">
                {/* Seção 1: Notificações Diárias no Telegram */}
                <section className="guide-section">
                  <h3>1. 📱 Notificações Diárias no Grupo do Telegram</h3>
                  <p>
                    Todos os dias, pontualmente às <strong>08:00 AM</strong>, o robô da JLE Telecom envia automaticamente 
                    um cartão visual no grupo do Telegram.
                  </p>
                  <ul>
                    <li><strong>Vencimentos de Hoje:</strong> exibe as contas a vencer no dia atual.</li>
                    <li><strong>Próximos 3 Dias:</strong> mostra as contas dos 3 dias seguintes para o financeiro se planejar.</li>
                    <li><strong>Botão de Acesso Direto:</strong> aperte o botão <code>Calendário (Senha Jle@2026)</code> para acessar a aplicação.</li>
                  </ul>
                  <div className="guide-img-container">
                    <img src="/NOTIFICAÇÃO GRUPO.jpg" alt="Notificação do Telegram" className="guide-img" />
                  </div>
                </section>

                {/* Seção 2: Acesso com Senha */}
                <section className="guide-section">
                  <h3>2. 🔐 Acesso e Segurança (Tela de Login)</h3>
                  <p>
                    Ao acessar a aplicação pelo computador ou celular, você verá a tela de bloqueio oficial da JLE Telecom.
                  </p>
                  <ul>
                    <li><strong>Senha Padrão:</strong> Digite <code>Jle@2026</code> e clique em <strong>Acessar Painel</strong>.</li>
                    <li>Sua sessão ficará salva no dispositivo para facilitar acessos futuros.</li>
                  </ul>
                  <div className="guide-img-container">
                    <img src="/TELA DE LOGIN.png" alt="Tela de Login" className="guide-img" />
                  </div>
                </section>

                {/* Seção 3: Tela Principal - Calendário */}
                <section className="guide-section">
                  <h3>3. 📅 Visualização no Calendário (Desktop e Celular)</h3>
                  <p>
                    O painel exibe um calendário mensal com todas as contas fixas distribuídas nos seus respectivos dias de vencimento.
                  </p>
                  <ul>
                    <li><strong>Dia Atual (Hoje):</strong> destacado com o número em um círculo laranja.</li>
                    <li><strong>Clique no Dia:</strong> clique sobre qualquer card de dia para abrir o pop-up com todas as contas agendadas.</li>
                    <li><strong>Modo Celular (Mobile):</strong> adaptado para navegação rápida na palma da mão.</li>
                  </ul>
                  <div className="guide-img-grid">
                    <div>
                      <p className="guide-img-label">Visualização no Computador (Desktop):</p>
                      <img src="/TELA PRINCIPAL - CALENDÁRIO (DESKTOP).png" alt="Calendário Desktop" className="guide-img" />
                    </div>
                    <div>
                      <p className="guide-img-label">Visualização no Celular (Mobile):</p>
                      <img src="/TELA PRINCIPAL - CALENDÁRIO (MOBILE).png" alt="Calendário Mobile" className="guide-img" />
                    </div>
                  </div>
                </section>

                {/* Seção 4: Adicionar Nova Conta */}
                <section className="guide-section">
                  <h3>4. ➕ Adicionar Nova Conta Fixa</h3>
                  <p>Para adicionar um novo vencimento recorrente no sistema:</p>
                  <ol>
                    <li>Clique no botão <strong>+ Nova Conta</strong> no topo ou dentro do pop-up do dia.</li>
                    <li>Preencha o <strong>Dia do Vencimento</strong> (entre 1 e 31) e o <strong>Nome/Descrição</strong>.</li>
                    <li>Clique em <strong>Salvar</strong>. A nova conta será sincronizada no Supabase e aparecerá nos disparos do Telegram!</li>
                  </ol>
                  <div className="guide-img-container">
                    <img src="/FORMULÁRIO NOVA CONTA.png" alt="Formulário Nova Conta" className="guide-img" />
                  </div>
                </section>

                {/* Seção 5: Editar ou Remover Conta */}
                <section className="guide-section">
                  <h3>5. ✏️ Editar ou Excluir uma Conta Existente</h3>
                  <p>Para alterar o dia ou a descrição de uma conta cadastrada:</p>
                  <ol>
                    <li>No pop-up do dia, clique sobre a conta que deseja alterar.</li>
                    <li>No formulário, altere os dados e clique em <strong>Salvar</strong>.</li>
                    <li>Para apagar a conta permanentemente, clique no botão vermelho <strong>Excluir</strong> e confirme.</li>
                  </ol>
                  <div className="guide-img-container">
                    <img src="/EDITAR OU REMOVER CONTA EXISTENTE.png" alt="Editar ou Remover Conta" className="guide-img" />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar / Editar Conta */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBill ? '✏️ Editar Conta Fixa' : '➕ Nova Conta Fixa'}</h2>
              <button className="btn-icon" onClick={closeFormModal} aria-label="Fechar">
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

              <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                {editingBill && (
                  <button
                    type="button"
                    className="btn btn-delete"
                    onClick={() => confirmDeleteBill(editingBill)}
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                )}
                <button type="button" className="btn btn-outline" style={{ color: '#104E70' }} onClick={closeFormModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {billToDelete && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setBillToDelete(null)}>
          <div className="modal-content modal-confirm-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirm-icon">
              <AlertCircle size={48} color="#EF4444" />
            </div>
            <h2>Confirmar Exclusão</h2>
            <p>
              Tem certeza que deseja excluir a conta <strong>"{billToDelete.descricao}"</strong> (Vencimento Dia {billToDelete.dia_vencimento})?
            </p>
            <p className="modal-confirm-subtext">Esta ação removerá a conta do sistema e dos avisos do Telegram.</p>
            
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ color: '#104E70' }} 
                onClick={() => setBillToDelete(null)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-delete"
                onClick={executeDeleteBill}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
