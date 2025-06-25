import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const StatCard = ({ 
  icon,
  title,
  value,
  subtitle,
  trend,
  trendDirection = 'up',
  color = 'primary',
  className = ''
}) => {
  const colors = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error/10'
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-gray-500'
  };

  const trendIcons = {
    up: 'TrendingUp',
    down: 'TrendingDown',
    neutral: 'Minus'
  };

  const cardMotion = {
    whileHover: { scale: 1.02, y: -2 },
    transition: { duration: 0.2 }
  };

  return (
    <motion.div {...cardMotion}>
      <Card className={`hover:shadow-md ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
                <ApperIcon name={icon} size={24} />
              </div>
              {trend && (
                <div className={`flex items-center space-x-1 ${trendColors[trendDirection]}`}>
                  <ApperIcon name={trendIcons[trendDirection]} size={16} />
                  <span className="text-sm font-medium">{trend}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;