import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { isToday, isTomorrow, isPast } from 'date-fns';

// Custom function to check if a date is overdue (past but not today)
const isOverdue = (date) => {
  return isPast(date) && !isToday(date);
};
import ApperIcon from '@/components/ApperIcon';
import StatCard from '@/components/molecules/StatCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import WeatherWidget from '@/components/organisms/WeatherWidget';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';
import taskService from '@/services/api/taskService';
import transactionService from '@/services/api/transactionService';

const QuickAddModal = ({ isOpen, onClose, onItemAdded }) => {
  const [selectedType, setSelectedType] = useState('');
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let newItem;
      switch (selectedType) {
        case 'task':
          newItem = await taskService.create({
            title: formData.title,
            description: formData.description || '',
            farmId: parseInt(formData.farmId),
            cropId: formData.cropId ? parseInt(formData.cropId) : null,
            priority: formData.priority || 'medium',
            dueDate: formData.dueDate,
            completed: false
          });
          break;
        case 'crop':
          newItem = await cropService.create({
            farmId: parseInt(formData.farmId),
            cropType: formData.cropType,
            quantity: parseFloat(formData.quantity),
            plantingDate: formData.plantingDate,
            expectedHarvest: formData.expectedHarvest,
            status: 'planted'
          });
          break;
        case 'farm':
          newItem = await farmService.create({
            name: formData.name,
            location: formData.location,
            size: parseFloat(formData.size),
            type: formData.type || 'mixed'
          });
          break;
        case 'transaction':
          newItem = await transactionService.create({
            type: formData.type,
            amount: parseFloat(formData.amount),
            category: formData.category,
            description: formData.description || '',
            farmId: formData.farmId ? parseInt(formData.farmId) : null,
            date: formData.date
          });
          break;
      }

      toast.success(`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} created successfully!`);
      onItemAdded(selectedType, newItem);
      onClose();
      setSelectedType('');
      setFormData({});
    } catch (error) {
      toast.error(`Failed to create ${selectedType}`);
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

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Add</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {!selectedType ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">What would you like to add?</h3>
              {[
                { type: 'task', label: 'Task', icon: 'CheckSquare', description: 'Add a new farm task' },
                { type: 'crop', label: 'Crop', icon: 'Sprout', description: 'Plant a new crop' },
                { type: 'farm', label: 'Farm', icon: 'MapPin', description: 'Register a new farm' },
                { type: 'transaction', label: 'Transaction', icon: 'DollarSign', description: 'Record a transaction' }
              ].map(({ type, label, icon, description }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <ApperIcon name={icon} size={20} className="text-primary" />
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedType('')}
                  className="text-primary hover:text-primary-dark"
                >
                  <ApperIcon name="ArrowLeft" size={20} />
                </button>
                <h3 className="text-lg font-medium text-gray-900 capitalize">Add {selectedType}</h3>
              </div>

              {selectedType === 'task' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm</label>
                    <select
                      required
                      value={formData.farmId || ''}
                      onChange={(e) => handleInputChange('farmId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a farm</option>
                      {farms.map(farm => (
                        <option key={farm.Id} value={farm.Id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority || 'medium'}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate || ''}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {selectedType === 'crop' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm</label>
                    <select
                      required
                      value={formData.farmId || ''}
                      onChange={(e) => handleInputChange('farmId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a farm</option>
                      {farms.map(farm => (
                        <option key={farm.Id} value={farm.Id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                    <select
                      required
                      value={formData.cropType || ''}
                      onChange={(e) => handleInputChange('cropType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select crop type</option>
                      <option value="Corn">Corn</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Soybeans">Soybeans</option>
                      <option value="Rice">Rice</option>
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Potatoes">Potatoes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.quantity || ''}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                    <input
                      type="date"
                      required
                      value={formData.plantingDate || ''}
                      onChange={(e) => handleInputChange('plantingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {selectedType === 'farm' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size (acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.size || ''}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {selectedType === 'transaction' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      required
                      value={formData.type || ''}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount || ''}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="seeds">Seeds</option>
                      <option value="equipment">Equipment</option>
                      <option value="fertilizer">Fertilizer</option>
                      <option value="labor">Labor</option>
                      <option value="harvest">Harvest</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedType('')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    financialSummary: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [farms, crops, tasks, financialSummary] = await Promise.all([
          farmService.getAll(),
          cropService.getAll(),
          taskService.getAll(),
          transactionService.getSummary()
        ]);

        setData({
          farms,
          crops,
          tasks,
          financialSummary
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => 
          task.Id === taskId ? updatedTask : task
        )
      }));
    } catch (error) {
      toast.error('Failed to update task');
    }
};

  const handleCalendarClick = () => {
    navigate('/tasks');
    toast.info('Navigating to task calendar view');
  };

const handleQuickAdd = () => {
    setIsQuickAddOpen(true);
  };

  const handleItemAdded = async (type, newItem) => {
    // Refresh dashboard data to include the new item
    try {
      const [farms, crops, tasks, financialSummary] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        transactionService.getSummary()
      ]);

      setData({
        farms,
        crops,
        tasks,
        financialSummary
      });
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
    }
  };
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader type="stat" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader type="card" count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const { farms, crops, tasks, financialSummary } = data;

  // Calculate dashboard metrics
  const activeCrops = crops.filter(crop => crop.status === 'growing').length;
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = pendingTasks.filter(task => isOverdue(new Date(task.dueDate)));
  const todayTasks = pendingTasks.filter(task => isToday(new Date(task.dueDate)));
  const upcomingTasks = pendingTasks.filter(task => isTomorrow(new Date(task.dueDate)));

  const getTaskPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening on your farms.</p>
        </div>
<div className="flex space-x-3">
          <Button variant="outline" icon="Calendar" onClick={handleCalendarClick}>
            View Calendar
          </Button>
          <Button variant="primary" icon="Plus" onClick={handleQuickAdd}>
            Quick Add
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="MapPin"
          title="Total Farms"
          value={farms.length}
          subtitle={`${farms.reduce((sum, farm) => sum + farm.size, 0)} acres total`}
          color="primary"
        />
        <StatCard
          icon="Sprout"
          title="Active Crops"
          value={activeCrops}
          subtitle={`${crops.length} total planted`}
          color="secondary"
        />
        <StatCard
          icon="CheckSquare"
          title="Pending Tasks"
          value={pendingTasks.length}
          subtitle={`${overdueTasks.length} overdue`}
          color={overdueTasks.length > 0 ? "error" : "accent"}
          trend={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'On track'}
          trendDirection={overdueTasks.length > 0 ? 'down' : 'up'}
        />
        <StatCard
          icon="DollarSign"
          title="Monthly Profit"
          value={`$${financialSummary?.profit?.toLocaleString() || '0'}`}
          subtitle={`${financialSummary?.transactionCount || 0} transactions`}
          color="success"
          trend="+12%"
          trendDirection="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ApperIcon name="Calendar" size={20} className="mr-2" />
              Today's Tasks
            </h3>
            <Button variant="ghost" size="sm" icon="ArrowRight">
              View All
            </Button>
          </div>

          {todayTasks.length === 0 ? (
            <EmptyState
              icon="CheckSquare"
              title="No tasks for today"
              description="You're all caught up! Check back tomorrow for new tasks."
            />
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => {
                const farm = farms.find(f => f.Id === task.farmId);
                const crop = crops.find(c => c.Id === task.cropId);
                
                return (
                  <div
                    key={task.Id}
                    className="flex items-center space-x-3 p-3 hover:bg-surface-50 rounded-lg transition-colors"
                  >
                    <button
                      onClick={() => handleToggleTask(task.Id)}
                      className="flex-shrink-0"
                    >
                      <div className="w-5 h-5 rounded border-2 border-surface-300 hover:border-primary flex items-center justify-center transition-colors">
                        {task.completed && (
                          <ApperIcon name="Check" size={12} className="text-primary" />
                        )}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                        <Badge variant={getTaskPriorityColor(task.priority)} size="xs">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {farm?.name} {crop && `• ${crop.cropType}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Weather Widget */}
        <div>
          <WeatherWidget />
        </div>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <Card className="border-l-4 border-l-error">
            <div className="flex items-start space-x-3">
              <ApperIcon name="AlertTriangle" size={20} className="text-error mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-error mb-2">
                  {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 3).map(task => {
                    const farm = farms.find(f => f.Id === task.farmId);
                    return (
                      <div key={task.Id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{task.title}</span>
                        <span className="text-xs text-gray-500">{farm?.name}</span>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="mt-3" icon="ArrowRight">
                  View All Overdue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ApperIcon name="Clock" size={20} className="mr-2" />
              Upcoming Tasks
            </h3>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Calendar" size={32} className="text-surface-300 mx-auto mb-2" />
              <p className="text-gray-600">No upcoming tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 4).map(task => {
                const farm = farms.find(f => f.Id === task.farmId);
                return (
                  <div key={task.Id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">{farm?.name}</p>
                    </div>
                    <Badge variant={getTaskPriorityColor(task.priority)} size="xs">
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
</div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onItemAdded={handleItemAdded}
      />
    </motion.div>
  );
};

export default Dashboard;