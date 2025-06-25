import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { isToday, isTomorrow, isOverdue } from 'date-fns';
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

const Dashboard = () => {
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    financialSummary: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          <Button variant="outline" icon="Calendar">
            View Calendar
          </Button>
          <Button variant="primary" icon="Plus">
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
    </motion.div>
  );
};

export default Dashboard;