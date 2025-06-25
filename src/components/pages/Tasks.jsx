import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import TaskList from '@/components/organisms/TaskList';
import taskService from '@/services/api/taskService';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';

const TaskForm = ({ task, farms, crops, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    farmId: '',
    cropId: '',
    title: '',
    type: '',
    dueDate: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const taskTypes = [
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'fertilizing', label: 'Fertilizing' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'cultivation', label: 'Cultivation' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        farmId: task.farmId?.toString() || '',
        cropId: task.cropId?.toString() || '',
        title: task.title || '',
        type: task.type || '',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
        priority: task.priority || 'medium'
      });
    } else {
      setFormData({
        farmId: '',
        cropId: '',
        title: '',
        type: '',
        dueDate: '',
        priority: 'medium'
      });
    }
    setErrors({});
  }, [task, isOpen]);

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
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.type) newErrors.type = 'Task type is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        farmId: parseInt(formData.farmId, 10),
        cropId: formData.cropId ? parseInt(formData.cropId, 10) : null,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      await onSubmit(taskData);
      toast.success(task ? 'Task updated successfully' : 'Task created successfully');
    } catch (error) {
      toast.error('Failed to save task');
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

  const farmCrops = crops.filter(c => c.farmId === parseInt(formData.farmId, 10));
  const cropOptions = [
    { value: '', label: 'No specific crop' },
    ...farmCrops.map(crop => ({ 
      value: crop.Id.toString(), 
      label: `${crop.cropType} (${crop.field})` 
    }))
  ];

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
              {task ? 'Edit Task' : 'Create New Task'}
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

            {formData.farmId && (
              <Select
                label="Crop (Optional)"
                name="cropId"
                value={formData.cropId}
                onChange={handleChange}
                options={cropOptions}
              />
            )}

            <Input
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Water corn field"
              error={errors.title}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Task Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={taskTypes}
                error={errors.type}
                required
              />

              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
              />
            </div>

            <Input
              label="Due Date & Time"
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
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
                icon={task ? 'Save' : 'Plus'}
              >
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);

      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      await taskService.delete(task.Id);
      setTasks(prev => prev.filter(t => t.Id !== task.Id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setTasks(prev => prev.map(t => t.Id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitForm = async (taskData) => {
    if (editingTask) {
      const updatedTask = await taskService.update(editingTask.Id, taskData);
      setTasks(prev => prev.map(t => t.Id === editingTask.Id ? updatedTask : t));
    } else {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [...prev, newTask]);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <SkeletonLoader type="card" className="h-8 w-48" />
          <SkeletonLoader type="card" className="h-10 w-32" />
        </div>
        <SkeletonLoader type="list" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Tasks"
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
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your farm tasks and activities</p>
        </div>
        <Button
          onClick={handleAddTask}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Add Task
        </Button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon="CheckSquare"
          title="No tasks yet"
          description="Create your first task to start organizing your farm activities."
          actionLabel="Create Your First Task"
          onAction={handleAddTask}
        />
      ) : (
        <TaskList
          tasks={tasks}
          farms={farms}
          crops={crops}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        farms={farms}
        crops={crops}
        isOpen={showForm}
        onSubmit={handleSubmitForm}
        onCancel={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
      />
    </motion.div>
  );
};

export default Tasks;