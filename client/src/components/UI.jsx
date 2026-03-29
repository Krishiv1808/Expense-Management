export const Badge = ({ children, className = '' }) => {
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full bg-surface-container text-secondary font-semibold text-xs tracking-widest uppercase mb-6 ${className}`}>
      {children}
    </span>
  );
};

export const Card = ({ children, className = '', variant = 'low' }) => {
  const variants = {
    low: 'bg-surface-container-low',
    high: 'bg-surface-container-high',
    highest: 'bg-surface-container-highest',
    white: 'bg-white shadow-xl shadow-primary/5 border border-slate-100',
  };

  return (
    <div className={`rounded-2xl p-8 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
