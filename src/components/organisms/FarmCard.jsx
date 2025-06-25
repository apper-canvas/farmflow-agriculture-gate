import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';

const FarmCard = ({ farm, cropCount = 0, taskCount = 0, onEdit, onDelete, onViewDetails }) => {
  const cardMotion = {
    whileHover: { scale: 1.02, y: -4 },
    transition: { duration: 0.2 }
  };

  return (
    <motion.div {...cardMotion}>
      <Card className="hover:shadow-lg border-l-4 border-l-primary">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="MapPin" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <ApperIcon name="MapPin" size={14} className="mr-1" />
                {farm.location}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              icon="Edit"
              onClick={() => onEdit?.(farm)}
              className="text-gray-400 hover:text-primary"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="Trash2"
              onClick={() => onDelete?.(farm)}
              className="text-gray-400 hover:text-error"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{farm.size}</div>
            <div className="text-xs text-gray-500 uppercase">{farm.sizeUnit}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{cropCount}</div>
            <div className="text-xs text-gray-500 uppercase">Crops</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{taskCount}</div>
            <div className="text-xs text-gray-500 uppercase">Tasks</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-surface-200">
          <div className="text-xs text-gray-500">
            Created {format(new Date(farm.createdAt), 'MMM dd, yyyy')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(farm)}
          >
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default FarmCard;