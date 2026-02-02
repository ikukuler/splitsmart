
import React, { useState, useMemo } from 'react';
import { Person, Group, Expense } from './types';
import { Sidebar } from './components/Sidebar';
import { ExpenseList } from './components/ExpenseList';
import { SettlementPane } from './components/SettlementPane';
import { calculateBalancesAndSettlements } from './services/calculationService';

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'squad' | 'ledger' | 'settle'>('ledger');

  const onAddPerson = (name: string) => {
    setPeople(prev => [...prev, { id: `p-${Date.now()}`, name }]);
  };

  const onRemovePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
    setGroups(prev => prev.map(g => ({ ...g, memberIds: g.memberIds.filter(mid => mid !== id) })).filter(g => g.memberIds.length >= 1));
    setExpenses(prev => prev.filter(e => !(e.payerType === 'person' && e.payerId === id)));
  };

  const onAddGroup = (name: string, memberIds: string[]) => {
    setGroups(prev => [...prev, { id: `g-${Date.now()}`, name, memberIds }]);
  };

  const onUpdateGroup = (id: string, name: string, memberIds: string[]) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name, memberIds } : g));
  };

  const onRemoveGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    setExpenses(prev => prev.filter(e => !(e.payerType === 'group' && e.payerId === id)));
  };

  const onAddExpense = (expData: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expData, id: `e-${Date.now()}`, isPaid: false }]);
  };

  const onUpdateExpense = (updatedExp: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExp.id ? updatedExp : e));
  };

  const onTogglePaid = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, isPaid: !e.isPaid } : e));
  };

  const onMarkAllAsPaid = () => {
    setExpenses(prev => prev.map(e => ({ ...e, isPaid: true })));
  };

  const onRemoveExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const hasUnpaid = useMemo(() => expenses.some(e => !e.isPaid), [expenses]);

  const { balances, individualSettlements, groupSettlements } = useMemo(() => {
    return calculateBalancesAndSettlements(people, groups, expenses);
  }, [people, groups, expenses]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full text-slate-900 bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        className={`${activeTab === 'squad' ? 'flex w-full' : 'hidden'} md:flex md:w-80 transition-all`}
        people={people} 
        groups={groups} 
        onAddPerson={onAddPerson} 
        onRemovePerson={onRemovePerson} 
        onAddGroup={onAddGroup} 
        onUpdateGroup={onUpdateGroup} 
        onRemoveGroup={onRemoveGroup}
      />
      <main className="flex-1 flex overflow-hidden">
        <ExpenseList 
          className={`${activeTab === 'ledger' ? 'flex w-full' : 'hidden'} md:flex md:flex-1 transition-all`}
          expenses={expenses} 
          people={people} 
          groups={groups} 
          onAddExpense={onAddExpense} 
          onUpdateExpense={onUpdateExpense} 
          onRemoveExpense={onRemoveExpense} 
          onTogglePaid={onTogglePaid}
        />
        <SettlementPane 
          className={`${activeTab === 'settle' ? 'flex w-full' : 'hidden'} md:flex md:w-96 transition-all`}
          balances={balances} 
          individualSettlements={individualSettlements} 
          groupSettlements={groupSettlements} 
          groups={groups} 
          onMarkAllAsPaid={onMarkAllAsPaid} 
          hasUnpaid={hasUnpaid}
        />
      </main>

      <nav className="md:hidden flex items-center justify-around h-16 bg-white border-t border-slate-200 shrink-0">
        <button onClick={() => setActiveTab('squad')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'squad' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fas fa-users-viewfinder text-lg"></i>
          <span className="text-[10px] font-bold uppercase">Squad</span>
        </button>
        <button onClick={() => setActiveTab('ledger')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'ledger' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fas fa-file-invoice text-lg"></i>
          <span className="text-[10px] font-bold uppercase">Ledger</span>
        </button>
        <button onClick={() => setActiveTab('settle')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'settle' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fas fa-calculator text-lg"></i>
          <span className="text-[10px] font-bold uppercase">Settle</span>
        </button>
      </nav>
    </div>
  );
}
