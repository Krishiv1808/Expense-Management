import { motion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', className = '', onClick }) => {
  const baseStyles = 'px-6 py-2.5 rounded-md font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-br from-primary to-primary-container text-white shadow-md hover:opacity-90',
    secondary: 'bg-white text-primary border border-outline-variant hover:bg-surface-container-low',
    ghost: 'text-on-surface-variant hover:text-primary transition-colors',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};
