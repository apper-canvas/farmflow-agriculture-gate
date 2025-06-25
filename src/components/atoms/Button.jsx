import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 disabled:bg-primary/50',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50 disabled:bg-secondary/50',
    accent: 'bg-accent text-white hover:bg-accent/90 focus:ring-accent/50 disabled:bg-accent/50',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50 disabled:border-primary/50 disabled:text-primary/50',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary/50 disabled:text-primary/50'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const buttonMotion = {
    whileHover: { scale: disabled ? 1 : 1.05 },
    whileTap: { scale: disabled ? 1 : 0.95 }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <motion.button
      {...buttonMotion}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ApperIcon 
          name="Loader2" 
          size={iconSize}
          className={`animate-spin ${children ? 'mr-2' : ''}`}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon 
          name={icon} 
          size={iconSize}
          className={children ? 'mr-2' : ''}
        />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon 
          name={icon} 
          size={iconSize}
          className={children ? 'ml-2' : ''}
        />
      )}
    </motion.button>
  );
};

export default Button;