import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isOverdue, isTomorrow, isToday } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';

const TaskList = ({ tasks, farms, crops, onToggleComplete, onEdit, onDelete }) => {
  const [filter, setFilter] = useState('all');

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm?.name || 'Unknown Farm';
  };

  const getCropName = (cropId) => {
    if (!cropId) return null;
    const crop = crops.find(c => c.Id === cropId);
    return crop?.cropType || 'Unknown Crop';
  };

  const getTaskPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'irrigation': return 'Droplets';
      case 'fertilizing': return 'Sprout';
      case 'harvesting': return 'Scissors';
      case 'monitoring': return 'Eye';
      case 'cultivation': return 'Shovel';
      default: return 'CheckSquare';
    }
  };

  const getDueDateStatus = (dueDate) => {
    const due = new Date(dueDate);
    if (isOverdue(due)) return { text: 'Overdue', color: 'error' };
    if (isToday(due)) return { text: 'Due Today', color: 'warning' };
    if (isTomorrow(due)) return { text: 'Due Tomorrow', color: 'info' };
    return { text: format(due, 'MMM dd'), color: 'default' };
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      case 'overdue': return !task.completed && isOverdue(new Date(task.dueDate));
      case 'today': return !task.completed && isToday(new Date(task.dueDate));
      default: return true;
    }
  });

  const handleToggleComplete = async (task) => {
    try {
      await onToggleComplete(task.Id);
      toast.success(task.completed ? 'Task marked as pending' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const filterButtons = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length },
    { key: 'overdue', label: 'Overdue', count: tasks.filter(t => !t.completed && isOverdue(new Date(t.dueDate))).length },
    { key: 'today', label: 'Today', count: tasks.filter(t => !t.completed && isToday(new Date(t.dueDate))).length }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map(button => (
          <Button
            key={button.key}
            variant={filter === button.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(button.key)}
            className="flex items-center space-x-2"
          >
            <span>{button.label}</span>
            <Badge variant={filter === button.key ? 'primary' : 'default'} size="xs">
              {button.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <ApperIcon name="CheckSquare" size={48} className="text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Create your first task to get started.'
              : `No ${filter} tasks at the moment.`
            }
          </p>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredTasks.map((task) => {
            const dueDateStatus = getDueDateStatus(task.dueDate);
            const cropName = getCropName(task.cropId);
            
            return (
              <motion.div key={task.Id} variants={itemVariants}>
                <Card className={`transition-all duration-200 ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="flex items-start space-x-4">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-1"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed 
                          ? 'bg-success border-success' 
                          : 'border-surface-300 hover:border-primary'
                      }`}>
                        {task.completed && (
                          <ApperIcon name="Check" size={12} className="text-white" />
                        )}
                      </div>
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <ApperIcon 
                              name={getTaskTypeIcon(task.type)} 
                              size={16} 
                              className="text-primary flex-shrink-0" 
                            />
                            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </h3>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <ApperIcon name="MapPin" size={14} className="mr-1" />
                              {getFarmName(task.farmId)}
                            </span>
                            {cropName && (
                              <span className="flex items-center">
                                <ApperIcon name="Sprout" size={14} className="mr-1" />
                                {cropName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Task Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge 
                            variant={getTaskPriorityColor(task.priority)}
                            size="xs"
                          >
                            {task.priority}
                          </Badge>
                          <Badge 
                            variant={dueDateStatus.color}
                            size="xs"
                          >
                            {dueDateStatus.text}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="Edit"
                            onClick={() => onEdit?.(task)}
                            className="text-gray-400 hover:text-primary"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="Trash2"
                            onClick={() => onDelete?.(task)}
                            className="text-gray-400 hover:text-error"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default TaskList;