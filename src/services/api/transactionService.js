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
  },

  async exportToCSV(transactionsData, farms) {
    await delay(300);
    
    const getFarmName = (farmId) => {
      const farm = farms.find(f => f.Id === farmId);
      return farm?.name || 'Unknown Farm';
    };

    const csvHeaders = ['Date', 'Description', 'Farm', 'Category', 'Type', 'Amount'];
    const csvRows = transactionsData.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.description,
      getFarmName(transaction.farmId),
      transaction.category,
      transaction.type,
      transaction.amount
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  },

  async exportToPDF(transactionsData, farms, summary) {
    await delay(500);
    
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const getFarmName = (farmId) => {
      const farm = farms.find(f => f.Id === farmId);
      return farm?.name || 'Unknown Farm';
    };

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Financial Report', 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Summary
    if (summary) {
      doc.text(`Total Income: $${summary.income.toLocaleString()}`, 20, 45);
      doc.text(`Total Expenses: $${summary.expenses.toLocaleString()}`, 20, 52);
      doc.text(`Net Profit: $${summary.profit.toLocaleString()}`, 20, 59);
    }
    
    // Table
    const tableColumns = ['Date', 'Description', 'Farm', 'Category', 'Type', 'Amount'];
    const tableRows = transactionsData.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.description,
      getFarmName(transaction.farmId),
      transaction.category,
      transaction.type,
      `$${transaction.amount.toLocaleString()}`
    ]);

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 70,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  }
};

export default transactionService;