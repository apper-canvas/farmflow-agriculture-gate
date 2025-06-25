import transactionsData from '../mockData/transactions.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let transactions = [...transactionsData];

const transactionService = {
  async getAll() {
    await delay(300);
    return [...transactions];
  },

  async getById(id) {
    await delay(200);
    const transaction = transactions.find(t => t.Id === parseInt(id, 10));
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return { ...transaction };
  },

  async getByFarmId(farmId) {
    await delay(250);
    return transactions.filter(t => t.farmId === parseInt(farmId, 10)).map(t => ({ ...t }));
  },

  async getSummary() {
    await delay(200);
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const profit = income - expenses;
    
    return {
      income,
      expenses,
      profit,
      transactionCount: transactions.length
    };
  },

  async create(transactionData) {
    await delay(400);
    const maxId = transactions.length > 0 ? Math.max(...transactions.map(t => t.Id)) : 0;
    const newTransaction = {
      ...transactionData,
      Id: maxId + 1,
      farmId: parseInt(transactionData.farmId, 10),
      amount: parseFloat(transactionData.amount),
      date: transactionData.date || new Date().toISOString()
    };
    transactions.push(newTransaction);
    return { ...newTransaction };
  },

  async update(id, transactionData) {
    await delay(350);
    const index = transactions.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    const updatedTransaction = {
      ...transactions[index],
      ...transactionData,
      Id: transactions[index].Id, // Prevent Id modification
      farmId: parseInt(transactionData.farmId || transactions[index].farmId, 10),
      amount: parseFloat(transactionData.amount || transactions[index].amount)
    };
    transactions[index] = updatedTransaction;
    return { ...updatedTransaction };
  },

  async delete(id) {
    await delay(250);
    const index = transactions.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    const deletedTransaction = transactions.splice(index, 1)[0];
    return { ...deletedTransaction };
  }
};

export default transactionService;