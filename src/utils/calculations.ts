import { Activity, Participant, Settlement } from '../types';

export function calculateSettlements(
  participants: Participant[],
  activities: Activity[]
): Settlement[] {
  const balances: Record<string, number> = {};
  
  // Initialize balances
  participants.forEach(p => {
    balances[p.id] = 0;
  });
  
  // Calculate what each person owes/is owed
  activities.forEach(activity => {
    const splitAmount = activity.amount / activity.participants.length;
    
    // Person who paid gets credited
    balances[activity.paid_by] += activity.amount;
    
    // Each participant gets debited their share
    activity.participants.forEach(participantId => {
      balances[participantId] -= splitAmount;
    });
  });
  
  // Convert balances to settlements
  const settlements: Settlement[] = [];
  const debtors = Object.entries(balances).filter(([, amount]) => amount < 0);
  const creditors = Object.entries(balances).filter(([, amount]) => amount > 0);
  
  for (const [debtorId, debtAmount] of debtors) {
    let remainingDebt = Math.abs(debtAmount);
    
    for (const [creditorId, creditAmount] of creditors) {
      if (remainingDebt === 0 || creditAmount <= 0) continue;
      
      const settlementAmount = Math.min(remainingDebt, creditAmount);
      
      if (settlementAmount > 0.01) { // Avoid tiny settlements
        settlements.push({
          from: debtorId,
          to: creditorId,
          amount: Math.round(settlementAmount * 100) / 100
        });
        
        remainingDebt -= settlementAmount;
        balances[creditorId] -= settlementAmount;
      }
    }
  }
  
  return settlements;
}

export function formatCurrency(amount: number): string {
  return `NPR ${amount.toLocaleString('en-NP', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })}`;
}