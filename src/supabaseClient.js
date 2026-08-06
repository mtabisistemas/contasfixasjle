import { createClient } from '@supabase/supabase-js';

// Tenta obter variáveis de ambiente se configuradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock inicial com as 27 contas do Word para funcionar imediatamente sem configuração inicial
export const INITIAL_MOCK_CONTAS = [
  { id: 1, dia_vencimento: 1, descricao: 'Aluguel Base SC', ativa: true },
  { id: 2, dia_vencimento: 3, descricao: 'Aluguel Base NH', ativa: true },
  { id: 3, dia_vencimento: 3, descricao: 'Água Base SC', ativa: true },
  { id: 4, dia_vencimento: 8, descricao: 'RGE Terreno SL', ativa: true },
  { id: 5, dia_vencimento: 10, descricao: 'Aluguel PR – AGUA VERDE', ativa: true },
  { id: 6, dia_vencimento: 10, descricao: 'Aluguel AP SC', ativa: true },
  { id: 7, dia_vencimento: 10, descricao: 'Condomínio SC', ativa: true },
  { id: 8, dia_vencimento: 10, descricao: 'Consórcio HS', ativa: true },
  { id: 9, dia_vencimento: 10, descricao: 'Rastreadores', ativa: true },
  { id: 10, dia_vencimento: 10, descricao: 'Seguros Star', ativa: true },
  { id: 11, dia_vencimento: 10, descricao: 'Claro NH', ativa: true },
  { id: 12, dia_vencimento: 10, descricao: 'Sebratel SL', ativa: true },
  { id: 13, dia_vencimento: 10, descricao: 'Luz APE – CELESC – SC', ativa: true },
  { id: 14, dia_vencimento: 10, descricao: 'Luz – BASE CELESC SC', ativa: true },
  { id: 15, dia_vencimento: 10, descricao: 'ALUGUEL – DESTAK – SC', ativa: true },
  { id: 16, dia_vencimento: 10, descricao: 'ALUGUEL – CONQUISTA – SL', ativa: true },
  { id: 17, dia_vencimento: 15, descricao: 'Ticket Combustível', ativa: true },
  { id: 18, dia_vencimento: 15, descricao: 'CLARO SC', ativa: true },
  { id: 19, dia_vencimento: 15, descricao: 'RECH TEC', ativa: true },
  { id: 20, dia_vencimento: 15, descricao: 'RECH JLE', ativa: true },
  { id: 21, dia_vencimento: 15, descricao: 'SMARTEC', ativa: true },
  { id: 22, dia_vencimento: 17, descricao: 'Contas Vivo e Claro', ativa: true },
  { id: 23, dia_vencimento: 18, descricao: 'Parcela Fluence', ativa: true },
  { id: 24, dia_vencimento: 18, descricao: 'RGE Base SL', ativa: true },
  { id: 25, dia_vencimento: 20, descricao: 'CLARO PR', ativa: true },
  { id: 26, dia_vencimento: 24, descricao: 'AGUA – COMUSA NH', ativa: true },
  { id: 27, dia_vencimento: 30, descricao: 'TICKET COMBUSTIVEL', ativa: true }
];
