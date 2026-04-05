/**
 * Calcula quién le debe cuánto a quién para liquidar el grupo.
 *
 * @param {Array} people   - [{ id, name }]
 * @param {Array} expenses - [{ id, title, amount, paidBy: personId, participants: [personId] }]
 * @returns {Array} transactions - [{ from: personId, to: personId, amount }]
 */
export function calculateSettlement(people, expenses) {
  const balances = {};
  people.forEach((p) => (balances[p.id] = 0));

  expenses.forEach(({ amount, paidBy, participants }) => {
    if (!participants || participants.length === 0) return;
    const share = amount / participants.length;

    // El que pagó recibe crédito por el total
    balances[paidBy] = (balances[paidBy] || 0) + amount;

    // Cada participante descuenta su parte
    participants.forEach((pid) => {
      balances[pid] = (balances[pid] || 0) - share;
    });
  });

  // Separar acreedores (balance > 0) y deudores (balance < 0)
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([id, balance]) => {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > 0.01) creditors.push({ id, amount: rounded });
    else if (rounded < -0.01) debtors.push({ id, amount: -rounded });
  });

  // Algoritmo greedy para minimizar transferencias
  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const transfer = Math.min(creditors[i].amount, debtors[j].amount);
    const rounded = Math.round(transfer * 100) / 100;

    if (rounded > 0.01) {
      transactions.push({
        from: debtors[j].id,
        to: creditors[i].id,
        amount: rounded,
      });
    }

    creditors[i].amount -= transfer;
    debtors[j].amount -= transfer;

    if (creditors[i].amount < 0.01) i++;
    if (debtors[j].amount < 0.01) j++;
  }

  return transactions;
}

/**
 * Calcula el total gastado y el gasto promedio por persona del grupo.
 */
export function groupStats(people, expenses) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = people.length > 0 ? total / people.length : 0;
  return { total, perPerson };
}

/**
 * Formatea un número como moneda (ARS por defecto).
 */
export function formatMoney(amount) {
  return `$${Math.round(amount * 100) / 100}`;
}
