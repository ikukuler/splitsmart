
import React, { useState, useMemo, useEffect } from 'react';
import { Person, Group, Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  people: Person[];
  groups: Group[];
  onRemoveExpense: (id: string) => void;
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (exp: Expense) => void;
  onTogglePaid: (id: string) => void;
  className?: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  people, 
  groups, 
  onRemoveExpense, 
  onAddExpense, 
  onUpdateExpense, 
  onTogglePaid, 
  className 
}) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payerKey, setPayerKey] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (participantIds.length === 0 && people.length > 0 && !editingId) {
      setParticipantIds(people.map(p => p.id));
    }
  }, [people, editingId]);

  const toggleParticipant = (id: string) => {
    setParticipantIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
      return b.id.localeCompare(a.id);
    });
  }, [expenses]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !payerKey || participantIds.length === 0) return;
    const [type, id] = payerKey.split(':');
    if (editingId) {
      onUpdateExpense({
        id: editingId,
        description: desc,
        amount: parseFloat(amount),
        payerId: id,
        payerType: type as 'person' | 'group',
        participantIds: [...participantIds]
      });
      setEditingId(null);
    } else {
      onAddExpense({
        description: desc,
        amount: parseFloat(amount),
        payerId: id,
        payerType: type as 'person' | 'group',
        participantIds: [...participantIds],
        isPaid: false
      });
    }
    setDesc('');
    setAmount('');
    setPayerKey('');
    setParticipantIds(people.map(p => p.id));
    setIsFormOpen(false);
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setDesc(exp.description);
    setAmount(exp.amount.toString());
    setPayerKey(`${exp.payerType}:${exp.payerId}`);
    setParticipantIds(exp.participantIds);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onRemoveExpense(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const closeForm = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
    setPayerKey('');
    setParticipantIds(people.map(p => p.id));
    setIsFormOpen(false);
  };

  return (
    <div className={`flex-1 flex flex-col bg-slate-50 overflow-hidden ${className}`}>
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${isFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeForm} />
      
      <div className={`
        fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 md:relative md:inset-auto md:translate-y-0 md:rounded-none md:shadow-none md:border-b md:border-slate-200 md:z-10
        ${isFormOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        <div className="md:hidden flex justify-center py-3" onClick={closeForm}>
          <div className="w-12 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className={`fas ${editingId ? 'fa-pen-to-square' : 'fa-plus-circle'} text-indigo-600`}></i>
              {editingId ? 'Edit Entry' : 'Log Expense'}
            </h2>
            <button type="button" onClick={closeForm} className="text-slate-400 hover:text-red-500 p-2 lg:hidden">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Description</label>
                <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Beer, Taxi, etc." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-7 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="0.00" required />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Paid By</label>
                <select value={payerKey} onChange={(e) => setPayerKey(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 text-sm" required>
                  <option value="">Choose Payer</option>
                  <optgroup label="People">
                    {people.map(p => <option key={`person:${p.id}`} value={`person:${p.id}`}>{p.name}</option>)}
                  </optgroup>
                  <optgroup label="Groups">
                    {groups.map(g => <option key={`group:${g.id}`} value={`group:${g.id}`}>The {g.name} Group</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className={`w-full ${editingId ? 'bg-amber-500' : 'bg-indigo-600'} text-white py-3 rounded-xl font-bold shadow-md text-sm transition-all active:scale-95`}>
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Splitting With</span>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setParticipantIds(people.map(p => p.id))} className="text-[10px] text-indigo-600 font-bold">ALL</button>
                  <button type="button" onClick={() => setParticipantIds([])} className="text-[10px] text-slate-400 font-bold">NONE</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pb-4 md:pb-0">
                {people.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleParticipant(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${participantIds.includes(p.id) ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Transaction Ledger</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
        {sortedExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
            <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
            <p className="text-sm font-medium">Nothing recorded here yet.</p>
          </div>
        ) : (
          sortedExpenses.map(exp => {
            const payerName = exp.payerType === 'person' ? people.find(p => p.id === exp.payerId)?.name : groups.find(g => g.id === exp.payerId)?.name;
            const isPaid = exp.isPaid;
            return (
              <div key={exp.id} className={`bg-white p-4 rounded-2xl border transition-all flex justify-between items-center gap-4 ${isPaid ? 'opacity-60 bg-slate-100/50 grayscale' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-lg ${isPaid ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <i className={`fas ${isPaid ? 'fa-check-circle' : 'fa-receipt'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-bold text-slate-800 leading-tight truncate ${isPaid ? 'line-through' : ''}`}>{exp.description}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Paid by <span className="font-bold text-indigo-600">{payerName}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">{exp.participantIds.length} Split</span>
                       <span className="text-[9px] text-slate-400 font-medium">${(exp.amount / exp.participantIds.length).toFixed(2)} each</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  <span className={`text-lg md:text-xl font-black text-slate-800 tracking-tighter ${isPaid ? 'text-slate-400' : ''}`}>${exp.amount.toFixed(2)}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => onTogglePaid(exp.id)} className={`p-2 rounded-lg ${isPaid ? 'text-green-500' : 'text-slate-300 hover:text-green-500'}`}><i className={`fas ${isPaid ? 'fa-check-double' : 'fa-check'}`}></i></button>
                    {!isPaid && <button type="button" onClick={() => startEdit(exp)} className="p-2 text-slate-300 hover:text-amber-500"><i className="fas fa-edit"></i></button>}
                    <button type="button" onClick={() => setDeleteConfirmId(exp.id)} className="p-2 text-slate-300 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce-subtle"
      >
        <i className="fas fa-plus text-xl"></i>
      </button>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Are you sure?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This transaction record will be permanently deleted. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite;
        }
      `}</style>
    </div>
  );
};
