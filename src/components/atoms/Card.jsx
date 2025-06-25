import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-surface-200 transition-all duration-200';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-md hover:border-surface-300 cursor-pointer' : '';
  const clickable = onClick ? 'cursor-pointer' : '';

  const cardMotion = hover ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: onClick ? { scale: 0.98 } : {}
  } : {};

  const CardComponent = hover ? motion.div : 'div';

  return (
    <CardComponent
      {...(hover ? cardMotion : {})}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${paddings[padding]}
        ${hoverClasses}
        ${clickable}
        ${className}
      `}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;