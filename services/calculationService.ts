
import { Person, Group, Expense, Settlement, PersonBalance } from '../types';

/**
 * Calculates totals (paid and owes) for each person based on active expenses.
 */
const calculatePersonTotals = (
  people: Person[],
  groups: Group[],
  expenses: Expense[]
): Record<string, { paid: number; owes: number }> => {
  const totals: Record<string, { paid: number; owes: number }> = {};
  people.forEach(p => totals[p.id] = { paid: 0, owes: 0 });

  // Only consider expenses that haven't been marked as paid
  const activeExpenses = expenses.filter(e => !e.isPaid);

  activeExpenses.forEach(exp => {
    // 1. Credit the payer
    if (exp.payerType === 'person') {
      if (totals[exp.payerId]) totals[exp.payerId].paid += exp.amount;
    } else {
      const group = groups.find(g => g.id === exp.payerId);
      if (group && group.memberIds.length > 0) {
        const shareOfCredit = exp.amount / group.memberIds.length;
        group.memberIds.forEach(mid => {
          if (totals[mid]) totals[mid].paid += shareOfCredit;
        });
      }
    }

    // 2. Burden the participants (debt)
    if (exp.participantIds.length > 0) {
      const shareOfBurden = exp.amount / exp.participantIds.length;
      exp.participantIds.forEach(pid => {
        if (totals[pid]) totals[pid].owes += shareOfBurden;
      });
    }
  });

  return totals;
};

/**
 * Greedy algorithm to minimize transactions between entities (debtors and creditors).
 */
const calculateGreedySettlements = (entityBalances: { name: string, net: number }[]): Settlement[] => {
  const debtors = entityBalances
    .filter(b => b.net < -0.01)
    .map(b => ({ ...b, net: Math.abs(b.net) }))
    .sort((a, b) => b.net - a.net);
    
  const creditors = entityBalances
    .filter(b => b.net > 0.01)
    .map(b => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  const calculatedSettlements: Settlement[] = [];
  let dIdx = 0;
  let cIdx = 0;
  const dCopy = debtors.map(d => ({ ...d }));
  const cCopy = creditors.map(c => ({ ...c }));

  while (dIdx < dCopy.length && cIdx < cCopy.length) {
    const debtor = dCopy[dIdx];
    const creditor = cCopy[cIdx];
    const amount = Math.min(debtor.net, creditor.net);
    
    if (amount > 0.005) {
      calculatedSettlements.push({ from: debtor.name, to: creditor.name, amount });
    }
    
    debtor.net -= amount;
    creditor.net -= amount;
    
    if (debtor.net < 0.01) dIdx++;
    if (creditor.net < 0.01) cIdx++;
  }
  return calculatedSettlements;
};

/**
 * Groups person balances into entity balances (groups or individual people outside groups).
 */
const getGroupEntityBalances = (
  people: Person[],
  groups: Group[],
  personBalances: PersonBalance[]
): { name: string, net: number }[] => {
  const groupEntityBalances: { name: string, net: number }[] = [];
  const processedPersonIds = new Set<string>();

  groups.forEach(group => {
    let groupNet = 0;
    let hasMembersWithBalance = false;
    group.memberIds.forEach(mid => {
      if (!processedPersonIds.has(mid)) {
        const pb = personBalances.find(b => b.personId === mid);
        if (pb) {
          groupNet += pb.net;
          processedPersonIds.add(mid);
          hasMembersWithBalance = true;
        }
      }
    });
    if (hasMembersWithBalance) {
      groupEntityBalances.push({ name: group.name, net: groupNet });
    }
  });

  // Add remaining individuals who aren't in processed groups
  people.forEach(p => {
    if (!processedPersonIds.has(p.id)) {
      const pb = personBalances.find(b => b.personId === p.id);
      if (pb) groupEntityBalances.push({ name: pb.name, net: pb.net });
    }
  });

  return groupEntityBalances;
};

/**
 * Calculates personal balances and optimized settlement plans for both 
 * individual and group-focused views.
 */
export const calculateBalancesAndSettlements = (
  people: Person[],
  groups: Group[],
  expenses: Expense[]
) => {
  if (people.length === 0) {
    return { balances: [], individualSettlements: [], groupSettlements: [] };
  }

  const totals = calculatePersonTotals(people, groups, expenses);

  const personBalances: PersonBalance[] = people.map(p => ({
    personId: p.id,
    name: p.name,
    paid: totals[p.id]?.paid || 0,
    owes: totals[p.id]?.owes || 0,
    net: (totals[p.id]?.paid || 0) - (totals[p.id]?.owes || 0)
  }));

  // Plan for individual settling
  const individualSettlements = calculateGreedySettlements(
    personBalances.map(b => ({ name: b.name, net: b.net }))
  );

  // Plan for group-level settling (treating group as a single entity)
  const groupEntityBalances = getGroupEntityBalances(people, groups, personBalances);

  return {
    balances: personBalances,
    individualSettlements,
    groupSettlements: calculateGreedySettlements(groupEntityBalances)
  };
};
