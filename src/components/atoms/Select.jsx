import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = forwardRef(({ 
  label,
  options = [],
  error,
  placeholder = 'Select option...',
  className = '',
  required = false,
  ...props 
}, ref) => {
  const selectClasses = `
    w-full px-3 py-2 pr-10 border rounded-lg transition-all duration-200 appearance-none
    ${error 
      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
      : 'border-surface-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
    }
    ${props.disabled ? 'bg-surface-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ApperIcon name="ChevronDown" size={16} className="text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;