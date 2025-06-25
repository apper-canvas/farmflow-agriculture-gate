import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  icon = 'Package',
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  className = ''
}) => {
  const emptyMotion = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 }
  };

  const iconFloat = {
    animate: { y: [0, -10, 0] },
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
  };

  return (
    <motion.div
      {...emptyMotion}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <motion.div {...iconFloat} className="mb-6">
        <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center">
          <ApperIcon name={icon} size={32} className="text-surface-400" />
        </div>
      </motion.div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          icon="Plus"
          className="hover:scale-105"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;