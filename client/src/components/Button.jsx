import { motion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', className = '', onClick }) => {
  const baseStyles = 'px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden';
  
  const variants = {
    primary: 'premium-gradient text-white shadow-[0_4px_12px_rgba(0,51,69,0.2)] hover:shadow-[0_8px_24px_rgba(0,51,69,0.3)]',
    secondary: 'bg-white text-primary border border-outline-variant hover:bg-surface-container-low shadow-sm',
    ghost: 'text-on-surface-variant hover:text-primary hover:bg-primary/5',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      {variant === 'primary' && (
        <motion.div 
          className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
        />
      )}
    </motion.button>
  );
};
