import { toast } from 'react-toastify';

const transactionService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "amount" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "farm_id" } }
        ],
        orderBy: [{ fieldName: "date", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords('transaction', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
      return response.data.map(transaction => ({
        Id: transaction.Id,
        farmId: transaction.farm_id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "amount" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "farm_id" } }
        ]
      };

      const response = await apperClient.getRecordById('transaction', parseInt(id, 10), params);

      if (!response || !response.data) {
        return null;
      }

      // Transform data to match UI expectations
      const transaction = response.data;
      return {
        Id: transaction.Id,
        farmId: transaction.farm_id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date
      };
    } catch (error) {
      console.error(`Error fetching transaction with ID ${id}:`, error);
      throw error;
    }
  },

  async getByFarmId(farmId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "amount" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "farm_id" } }
        ],
        where: [
          {
            FieldName: "farm_id",
            Operator: "EqualTo",
            Values: [parseInt(farmId, 10)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('transaction', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
      return response.data.map(transaction => ({
        Id: transaction.Id,
        farmId: transaction.farm_id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date
      }));
    } catch (error) {
      console.error('Error fetching transactions by farm ID:', error);
      throw error;
    }
  },

  async getSummary() {
    try {
      const transactions = await this.getAll();
      
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
    } catch (error) {
      console.error('Error calculating transaction summary:', error);
      throw error;
    }
  },

  async create(transactionData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: transactionData.description,
          type: transactionData.type,
          category: transactionData.category,
          amount: parseFloat(transactionData.amount),
          description: transactionData.description,
          date: transactionData.date,
          farm_id: parseInt(transactionData.farmId, 10)
        }]
      };

      const response = await apperClient.createRecord('transaction', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          const transaction = successfulRecords[0].data;
          return {
            Id: transaction.Id,
            farmId: transaction.farm_id,
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date
          };
        }
      }

      throw new Error('Failed to create transaction');
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async update(id, transactionData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id, 10),
          Name: transactionData.description,
          type: transactionData.type,
          category: transactionData.category,
          amount: parseFloat(transactionData.amount),
          description: transactionData.description,
          date: transactionData.date,
          farm_id: parseInt(transactionData.farmId, 10)
        }]
      };

      const response = await apperClient.updateRecord('transaction', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const transaction = successfulUpdates[0].data;
          return {
            Id: transaction.Id,
            farmId: transaction.farm_id,
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date
          };
        }
      }

      throw new Error('Failed to update transaction');
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('transaction', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  async exportToCSV(transactionsData, farms) {
    try {
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
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  },

  async exportToPDF(transactionsData, farms, summary) {
    try {
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
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }
};

export default transactionService;