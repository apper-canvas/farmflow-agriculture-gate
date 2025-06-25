import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import StatCard from '@/components/molecules/StatCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import transactionService from '@/services/api/transactionService';
import farmService from '@/services/api/farmService';

const TransactionForm = ({ transaction, farms, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    farmId: '',
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const expenseCategories = [
    { value: 'Seeds', label: 'Seeds' },
    { value: 'Fertilizer', label: 'Fertilizer' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Labor', label: 'Labor' },
    { value: 'Fuel', label: 'Fuel' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Other', label: 'Other' }
  ];

  const incomeCategories = [
    { value: 'Crop Sales', label: 'Crop Sales' },
    { value: 'Government Subsidies', label: 'Government Subsidies' },
    { value: 'Equipment Rental', label: 'Equipment Rental' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    if (transaction) {
      setFormData({
        farmId: transaction.farmId?.toString() || '',
        type: transaction.type || 'expense',
        category: transaction.category || '',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        date: transaction.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : ''
      });
    } else {
      const today = new Date();
      setFormData({
        farmId: '',
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: format(today, 'yyyy-MM-dd')
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.farmId) newErrors.farmId = 'Farm is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        farmId: parseInt(formData.farmId, 10),
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      await onSubmit(transactionData);
      toast.success(transaction ? 'Transaction updated successfully' : 'Transaction added successfully');
    } catch (error) {
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen) return null;

  const categoryOptions = formData.type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {transaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Farm"
              name="farmId"
              value={formData.farmId}
              onChange={handleChange}
              options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
              error={errors.farmId}
              required
            />

            <Select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' }
              ]}
            />

            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              error={errors.category}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount ($)"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                error={errors.amount}
                required
              />

              <Input
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                error={errors.date}
                required
              />
            </div>

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Corn seed - hybrid variety"
              error={errors.description}
              required
            />

            <div className="flex justify-end space-x-3 pt-6 border-t border-surface-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={transaction ? 'Save' : 'Plus'}
              >
                {transaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const TransactionTable = ({ transactions, farms, onEdit, onDelete }) => {
  const getTypeColor = (type) => {
    return type === 'income' ? 'success' : 'error';
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm?.name || 'Unknown Farm';
  };

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="DollarSign"
        title="No transactions yet"
        description="Start tracking your farm finances by adding your first transaction."
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Farm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-surface-200">
            {transactions.map((transaction) => (
              <motion.tr
                key={transaction.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hover:bg-surface-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={transaction.description}>
                    {transaction.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {getFarmName(transaction.farmId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="default" size="sm">
                    {transaction.category}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Badge
                      variant={getTypeColor(transaction.type)}
                      size="sm"
                      icon={transaction.type === 'income' ? 'TrendingUp' : 'TrendingDown'}
                    >
                      ${transaction.amount.toLocaleString()}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => onEdit?.(transaction)}
                      className="text-gray-400 hover:text-primary"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => onDelete?.(transaction)}
                      className="text-gray-400 hover:text-error"
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    farm: 'all',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionsData, farmsData, summaryData] = await Promise.all([
        transactionService.getAll(),
        farmService.getAll(),
        transactionService.getSummary()
      ]);

      setTransactions(transactionsData);
      setFarms(farmsData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message || 'Failed to load financial data');
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    if (!confirm(`Are you sure you want to delete this ${transaction.type}?`)) {
      return;
    }

    try {
      await transactionService.delete(transaction.Id);
      setTransactions(prev => prev.filter(t => t.Id !== transaction.Id));
      
      // Recalculate summary
      const updatedSummary = await transactionService.getSummary();
      setSummary(updatedSummary);
      
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleSubmitForm = async (transactionData) => {
    if (editingTransaction) {
      const updatedTransaction = await transactionService.update(editingTransaction.Id, transactionData);
      setTransactions(prev => prev.map(t => t.Id === editingTransaction.Id ? updatedTransaction : t));
    } else {
      const newTransaction = await transactionService.create(transactionData);
      setTransactions(prev => [...prev, newTransaction]);
    }
    
    // Recalculate summary
    const updatedSummary = await transactionService.getSummary();
    setSummary(updatedSummary);
    
    setShowForm(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesFarm = filters.farm === 'all' || transaction.farmId === parseInt(filters.farm, 10);
    const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesFarm && matchesSearch;
  });

  const farmOptions = [
    { value: 'all', label: 'All Farms' },
    ...farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expenses' }
  ];

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SkeletonLoader type="stat" count={3} />
        </div>
        <SkeletonLoader type="table" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Financial Data"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600">Track your farm income and expenses</p>
        </div>
        <Button
          onClick={handleAddTransaction}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon="TrendingUp"
            title="Total Income"
            value={`$${summary.income.toLocaleString()}`}
            color="success"
          />
          <StatCard
            icon="TrendingDown"
            title="Total Expenses"
            value={`$${summary.expenses.toLocaleString()}`}
            color="error"
          />
          <StatCard
            icon="DollarSign"
            title="Net Profit"
            value={`$${summary.profit.toLocaleString()}`}
            color={summary.profit >= 0 ? "success" : "error"}
            trend={summary.profit >= 0 ? "+12%" : "-8%"}
            trendDirection={summary.profit >= 0 ? "up" : "down"}
          />
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          icon="Search"
        />
        <Select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          options={typeOptions}
        />
        <Select
          value={filters.farm}
          onChange={(e) => setFilters(prev => ({ ...prev, farm: e.target.value }))}
          options={farmOptions}
        />
      </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        farms={farms}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Transaction Form Modal */}
      <TransactionForm
        transaction={editingTransaction}
        farms={farms}
        isOpen={showForm}
        onSubmit={handleSubmitForm}
        onCancel={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}
      />
    </motion.div>
  );
};

export default Finance;