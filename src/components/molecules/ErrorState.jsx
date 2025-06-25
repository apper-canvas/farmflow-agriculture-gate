import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data.',
  onRetry,
  className = ''
}) => {
  const errorMotion = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 }
  };

  const iconBounce = {
    animate: { y: [0, -5, 0] },
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
  };

  return (
    <motion.div
      {...errorMotion}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <motion.div {...iconBounce} className="mb-6">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
          <ApperIcon name="AlertTriangle" size={32} className="text-error" />
        </div>
      </motion.div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          icon="RefreshCw"
          className="hover:scale-105"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;