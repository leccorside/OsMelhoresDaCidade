'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  X,
  FileText,
  DollarSign,
  Layers,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  fetchAdminAuditLogsApi,
  fetchAdminAuditStatsApi,
  AuditLogItem,
  AuditStatsItem,
} from '@/lib/api';

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AuditStatsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filtros
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal de Detalhes
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [logsRes, statsRes] = await Promise.all([
        fetchAdminAuditLogsApi({
          action: selectedAction,
          entity: selectedEntity,
          search: search.trim() || undefined,
          limit: 50,
        }),
        fetchAdminAuditStatsApi().catch(() => null),
      ]);

      setLogs(logsRes.logs || []);
      setTotal(logsRes.total || 0);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.error('Erro ao carregar trilha de auditoria:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAction, selectedEntity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const res = await fetchAdminAuditLogsApi({
        action: selectedAction,
        entity: selectedEntity,
        search: search.trim() || undefined,
        limit: 1000,
      });

      const listToExport = res.logs && res.logs.length > 0 ? res.logs : logs;

      if (!listToExport || listToExport.length === 0) {
        alert('Nenhum registro de auditoria disponível para exportação.');
        return;
      }

      const header = [
        'Data e Hora (ISO)',
        'Data Formatada',
        'Ação',
        'Entidade',
        'ID Entidade',
        'Operador',
        'E-mail',
        'Perfil',
        'IP de Origem',
        'Detalhes JSON',
      ].map((c) => `"${c}"`).join(';');

      const escapeVal = (v: any) => {
        if (v === null || v === undefined) return '""';
        return `"${String(v).replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
      };

      const rows = listToExport.map((l) =>
        [
          escapeVal(l.createdAt),
          escapeVal(new Date(l.createdAt).toLocaleString('pt-BR')),
          escapeVal(l.action),
          escapeVal(l.entity),
          escapeVal(l.entityId || ''),
          escapeVal(l.userName || 'Sistema'),
          escapeVal(l.userEmail || ''),
          escapeVal(l.userRole || ''),
          escapeVal(l.ipAddress || ''),
          escapeVal(l.details ? JSON.stringify(l.details) : ''),
        ].join(';')
      );

      const csvContent = `\uFEFF${header}\n${rows.join('\n')}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trilha_auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Falha ao exportar relatório CSV: ${err.message || 'Erro inesperado'}`);
    } finally {
      setExporting(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('PAYOUT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <DollarSign className="w-3.5 h-3.5" />
          {action}
        </span>
      );
    }
    if (action.includes('SPLIT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Layers className="w-3.5 h-3.5" />
          {action}
        </span>
      );
    }
    if (action.includes('COUPON') || action.includes('CREATE')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
        <Activity className="w-3.5 h-3.5" />
        {action}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-red-500 font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Governança & Segurança
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Trilha de Auditoria & Logs de Ações
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Histórico imutável de operações críticas, repasses PIX Asaas, configurações de split e movimentações de sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
            title="Exportar planilha Excel/CSV para controle contábil"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting ? 'Gerando Planilha...' : 'Exportar Excel / CSV'}
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold transition-all border border-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar Logs
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total de Eventos</span>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalCount ?? total}</div>
          <p className="text-xs text-gray-500 mt-1">Ações registradas desde o início</p>
        </div>

        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Últimas 24 Horas</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-400">{stats?.last24hCount ?? 0}</div>
          <p className="text-xs text-gray-500 mt-1">Atividades recentes monitoradas</p>
        </div>

        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Repasses PIX Auditados</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats?.recentPayouts ?? 0}</div>
          <p className="text-xs text-gray-500 mt-1">Transferências bancárias liquidadas</p>
        </div>

        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Alterações Críticas</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats?.recentConfigChanges ?? 0}</div>
          <p className="text-xs text-gray-500 mt-1">Ajustes de split, praças e cupons</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#181818] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por operador, e-mail ou ID..."
            className="w-full bg-[#111111] border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-[#111111] border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-red-500"
            >
              <option value="ALL">Todas as Ações</option>
              <option value="PAYOUT_PIX_EXECUTED">PAYOUT_PIX_EXECUTED</option>
              <option value="UPDATE_CITY_SPLIT">UPDATE_CITY_SPLIT</option>
              <option value="COUPON_CREATED">COUPON_CREATED</option>
            </select>
          </div>

          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="bg-[#111111] border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">Todas as Entidades</option>
            <option value="PAYOUT">PAYOUT</option>
            <option value="CITY">CITY</option>
            <option value="COUPON">COUPON</option>
            <option value="LISTING">LISTING</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-[#181818] border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-black/40 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Ação</th>
                <th className="py-3.5 px-4">Entidade</th>
                <th className="py-3.5 px-4">Operador Responsável</th>
                <th className="py-3.5 px-4">IP / Origem</th>
                <th className="py-3.5 px-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
                    Carregando trilha de auditoria...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Nenhum registro de auditoria encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-white">{log.entity}</span>
                      {log.entityId && (
                        <span className="text-xs text-gray-500 block font-mono truncate max-w-[120px]">
                          #{log.entityId}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">
                            {log.userName || log.userEmail || 'Sistema Automatizado'}
                          </div>
                          {log.userRole && (
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                              {log.userRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {log.ipAddress || '127.0.0.1 (Local)'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition-colors border border-gray-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspecionar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="p-4 bg-black/40 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando {logs.length} de {total} registros</span>
          <span>Atualizado em tempo real</span>
        </div>
      </div>

      {/* Modal de Inspeção de Log */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181818] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Inspeção do Log de Auditoria
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#111111] p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">Ação Executada</span>
                <span className="font-semibold text-white">{selectedLog.action}</span>
              </div>
              <div className="bg-[#111111] p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">Entidade / Alvo</span>
                <span className="font-semibold text-white">
                  {selectedLog.entity} {selectedLog.entityId ? `(#${selectedLog.entityId})` : ''}
                </span>
              </div>
              <div className="bg-[#111111] p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">Operador</span>
                <span className="font-semibold text-white">
                  {selectedLog.userName || selectedLog.userEmail || 'Sistema'}
                </span>
              </div>
              <div className="bg-[#111111] p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">Data e Hora</span>
                <span className="font-semibold text-white font-mono">{formatDate(selectedLog.createdAt)}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                Payload / Detalhes Estruturados (JSON)
              </span>
              <pre className="bg-[#111111] border border-gray-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-64 leading-relaxed">
                {selectedLog.details
                  ? JSON.stringify(selectedLog.details, null, 2)
                  : '{\n  "info": "Nenhum detalhe adicional registrado para este evento."\n}'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
