
import React, { useState, useMemo } from 'react';
import { PersonBalance, Settlement, Group } from '../types';

interface SettlementPaneProps {
  balances: PersonBalance[];
  individualSettlements: Settlement[];
  groupSettlements: Settlement[];
  groups: Group[];
  onMarkAllAsPaid: () => void;
  hasUnpaid: boolean;
  className?: string;
}

export const SettlementPane: React.FC<SettlementPaneProps> = ({ 
  balances, 
  individualSettlements, 
  groupSettlements, 
  groups, 
  onMarkAllAsPaid, 
  hasUnpaid, 
  className 
}) => {
  const [viewType, setViewType] = useState<'individual' | 'group'>('individual');
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null);

  const activeGroup = groups.find(g => g.id === filterGroupId);
  const activeGroupMemberIds = activeGroup ? new Set(activeGroup.memberIds) : null;

  const filteredBalances = useMemo(() => {
    if (!activeGroupMemberIds) return balances;
    return balances.filter(b => activeGroupMemberIds.has(b.personId));
  }, [balances, activeGroupMemberIds]);

  const filteredSettlements = useMemo(() => {
    const settlements = viewType === 'individual' ? individualSettlements : groupSettlements;
    if (!activeGroup || viewType === 'group') return settlements;
    
    return individualSettlements.filter(s => 
      activeGroup.memberIds.some(mid => {
        const name = balances.find(b => b.personId === mid)?.name;
        return s.from === name || s.to === name;
      })
    );
  }, [viewType, individualSettlements, groupSettlements, activeGroup, balances]);

  return (
    <div className={`p-4 md:p-6 bg-white border-l border-slate-200 overflow-y-auto flex flex-col ${className}`}>
      <div className="mb-6 flex justify-between items-start sticky top-0 bg-white pt-2 pb-4 z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Settlement</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Smart Transfers</p>
        </div>
        {hasUnpaid && (
          <button type="button" onClick={onMarkAllAsPaid} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
            <i className="fas fa-check-double text-xs"></i>
            <span className="text-[10px] font-black uppercase">Pay All</span>
          </button>
        )}
      </div>
      
      <div className="space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-xl">
           <button type="button" onClick={() => setViewType('individual')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewType === 'individual' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Personal</button>
           <button type="button" onClick={() => setViewType('group')} disabled={groups.length === 0} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-30 ${viewType === 'group' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Groups</button>
        </div>

        {groups.length > 0 && viewType === 'individual' && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Filter by Group</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setFilterGroupId(null)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${!filterGroupId ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                All People
              </button>
              {groups.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFilterGroupId(g.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${filterGroupId === g.id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredBalances.length === 0 && (
            <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed">
              <p className="text-[10px] text-slate-400 font-bold">No members to show.</p>
            </div>
          )}
          {filteredBalances.map((b) => (
            <div key={b.personId} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 relative">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{b.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Paid ${b.paid.toFixed(2)} — Owes ${b.owes.toFixed(2)}</p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${b.net >= 0.01 ? 'bg-green-50 text-green-700 border-green-100' : b.net <= -0.01 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                {b.net > 0.005 ? '+' : ''}{b.net.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 pb-20 md:pb-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated Plan</h3>
            <i className="fas fa-magic text-indigo-500 text-[10px]"></i>
          </div>
          
          {filteredSettlements.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <i className="fas fa-check-circle text-green-400 text-3xl mb-3"></i>
               <p className="text-[10px] text-slate-400 font-bold uppercase">All Squared Away</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSettlements.map((s, idx) => (
                <div key={idx} className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black text-indigo-200 uppercase">Transfer</span>
                    <span className="text-xl font-black">${s.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{s.from}</p></div>
                    <i className="fas fa-arrow-right text-indigo-300"></i>
                    <div className="flex-1 text-right min-w-0"><p className="text-xs font-bold truncate">{s.to}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
