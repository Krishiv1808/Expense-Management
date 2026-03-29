import { motion } from 'framer-motion';

export const Badge = ({ children, className = '' }) => {
  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-bold text-[10px] tracking-[0.2em] uppercase mb-6 border border-secondary/20 shadow-sm ${className}`}
    >
      {children}
    </motion.span>
  );
};

export const Card = ({ children, className = '', variant = 'low', hover = true }) => {
  const variants = {
    low: 'bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    high: 'bg-surface-container-high/80 backdrop-blur-lg border border-white/20 shadow-lg',
    highest: 'premium-gradient text-white shadow-2xl',
    white: 'bg-white shadow-[0_20px_50px_rgba(0,51,69,0.08)] border border-slate-100/50',
    glass: 'glass',
  };

  return (
    <motion.div 
      whileHover={hover ? { y: -5, transition: { duration: 0.3 } } : {}}
      className={`rounded-3xl p-8 relative overflow-hidden ${variants[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
};
