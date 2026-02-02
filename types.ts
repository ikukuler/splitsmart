
export interface Person {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
}

export interface Expense {
  id: string;
  payerId: string; // Can be a Person ID or a Group ID
  payerType: 'person' | 'group';
  amount: number;
  description: string;
  participantIds: string[]; // Always Person IDs for the share calculation
  isPaid?: boolean; // New property to track if this specific expense is settled
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface PersonBalance {
  personId: string;
  name: string;
  paid: number;
  owes: number;
  net: number;
}
