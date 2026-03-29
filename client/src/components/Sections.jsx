import { motion } from 'framer-motion';
import { ArrowRight, Brain, ShieldCheck, Zap, CheckCircle, RefreshCw, Quote, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Badge, Card } from './UI';

export const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
    <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
      <div className="text-2xl font-bold tracking-tighter text-primary font-headline">Stratos Ledger</div>
      <div className="hidden md:flex items-center gap-8">
        <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body text-sm" href="#">Product</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-sm" href="#">Solutions</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-sm" href="#">Pricing</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-sm" href="#">Contact</a>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost">Login</Button>
        <Button>Get Started</Button>
      </div>
    </div>
  </nav>
);

export const Hero = () => (
  <section className="relative overflow-hidden px-8 pt-32 pb-20 md:pt-48 md:pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-container rounded-full blur-[120px]"></div>
    </div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Badge>Efficiency First</Badge>
      <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-primary tracking-tight mb-8 leading-[1.1]">
        Reimbursements, <br/><span className="text-secondary">Reimagined.</span>
      </h1>
      <p className="max-w-2xl text-on-surface-variant text-lg md:text-xl font-medium mb-10 leading-relaxed mx-auto">
        Empower your workforce with lightning-fast approvals and precision tracking. Stop chasing receipts and start scaling your business.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button className="px-10 py-4 text-lg">Get Started Free</Button>
        <Button variant="ghost" className="px-10 py-4 text-lg group">
          Book a Demo
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="mt-20 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 bg-surface-container-highest/70 backdrop-blur-md p-2"
    >
      <div className="aspect-video w-full rounded-xl bg-surface-container-low relative overflow-hidden">
        <img 
          className="w-full h-full object-cover" 
          src="https://picsum.photos/seed/dashboard/1200/800" 
          alt="Dashboard"
          referrerPolicy="no-referrer"
        />
      </div>
    </motion.div>
  </section>
);

export const Logos = () => (
  <section className="bg-surface-container-low py-16">
    <div className="max-w-7xl mx-auto px-8">
      <p className="text-center font-body text-xs uppercase tracking-[0.3em] text-on-surface-variant/60 mb-10">Trusted by the most innovative teams</p>
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all">
        {['Logo 1', 'Logo 2', 'Logo 3', 'Logo 4', 'Logo 5'].map((logo, i) => (
          <div key={i} className="h-8 w-24 bg-primary/20 rounded"></div>
        ))}
      </div>
    </div>
  </section>
);

export const Features = () => (
  <section className="py-24 px-8 max-w-7xl mx-auto">
    <div className="mb-16 text-center">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4">Precision-Engineered for Speed</h2>
      <p className="text-on-surface-variant max-w-xl mx-auto">Eliminate friction from your financial operations with our core platform pillars.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* AI Powered Extraction */}
      <Card variant="low" className="md:col-span-2 flex flex-col justify-between overflow-hidden relative group">
        <div className="max-w-md relative z-10">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6 text-white">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-2xl font-bold text-primary mb-4">AI-Powered Extraction</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Upload receipts and let our proprietary AI engine handle the data entry. We extract merchant data, taxes, and categories with 99.9% accuracy.
          </p>
        </div>
        <div className="mt-8 relative h-48 rounded-xl overflow-hidden shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
          <img 
            className="w-full h-full object-cover" 
            src="https://picsum.photos/seed/ai/800/600" 
            alt="AI Extraction"
            referrerPolicy="no-referrer"
          />
        </div>
      </Card>

      {/* Policy Compliance */}
      <Card className="bg-secondary text-white flex flex-col group overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="font-headline text-2xl font-bold mb-4">Policy Compliance</h3>
        <p className="opacity-80 leading-relaxed mb-8">
          Automatic flags for out-of-policy expenses ensure your finance team only reviews what truly matters. Custom rule sets tailored to your DNA.
        </p>
        <div className="mt-auto p-4 bg-white/10 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-error-container" />
            Duplicate Receipt Detected
          </div>
        </div>
      </Card>

      {/* Instant Payouts */}
      <Card variant="white" className="md:col-span-3 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container text-white flex items-center justify-center mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-3xl font-bold text-primary mb-4">Instant Payouts</h3>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Sync directly with your payroll and reimburse employees in seconds, not weeks. Support for 40+ currencies and global bank integrations.
          </p>
          <ul className="mt-6 space-y-3">
            <li className="flex items-center gap-2 text-primary font-medium">
              <CheckCircle className="w-5 h-5 text-secondary" />
              Direct ERP Synchronization
            </li>
            <li className="flex items-center gap-2 text-primary font-medium">
              <CheckCircle className="w-5 h-5 text-secondary" />
              Real-time Ledger Updates
            </li>
          </ul>
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-secondary font-headline">2.4s</div>
            <div className="text-xs font-body uppercase text-on-surface-variant/60 mt-1">Avg Approval Time</div>
          </div>
          <div className="bg-surface-container-high rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary font-headline">98%</div>
            <div className="text-xs font-body uppercase text-on-surface-variant/60 mt-1">Admin Reduction</div>
          </div>
          <div className="bg-primary text-white col-span-2 rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">Payroll Integration</div>
              <div className="text-sm opacity-70">Active & Syncing</div>
            </div>
            <RefreshCw className="w-8 h-8 text-secondary-container" />
          </div>
        </div>
      </Card>
    </div>
  </section>
);

export const Testimonial = () => (
  <section className="py-24 bg-primary overflow-hidden relative">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
    </div>
    <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
      <Quote className="w-16 h-16 text-white/20 mx-auto mb-8" />
      <blockquote className="font-headline text-2xl md:text-3xl font-medium text-white leading-snug mb-10 italic">
        "Stratos Ledger didn't just automate our expenses; they transformed our entire financial culture. What used to take our finance team 20 hours a week now takes less than 30 minutes of oversight."
      </blockquote>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-secondary">
          <img 
            className="w-full h-full object-cover" 
            src="https://picsum.photos/seed/person/200/200" 
            alt="Sarah Jenkins"
            referrerPolicy="no-referrer"
          />
        </div>
        <cite className="not-italic">
          <span className="block text-white font-bold text-lg">Sarah Jenkins</span>
          <span className="text-secondary-container font-body text-sm uppercase tracking-widest">CFO, TechScale Systems</span>
        </cite>
      </div>
    </div>
  </section>
);

export const CTA = () => (
  <section className="py-24 px-8 max-w-5xl mx-auto text-center">
    <Card variant="highest" className="p-12 md:p-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Zap className="w-64 h-64" />
      </div>
      <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary mb-8 relative z-10">Ready to streamline your finance operations?</h2>
      <p className="text-on-surface-variant text-lg mb-12 max-w-2xl mx-auto relative z-10">Join 5,000+ companies who have traded manual spreadsheets for precision automation.</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
        <Button className="px-10 py-5 text-lg">Get Started Free</Button>
        <Button variant="secondary" className="px-10 py-5 text-lg">Schedule Consultation</Button>
      </div>
    </Card>
  </section>
);

export const Footer = () => (
  <footer className="bg-surface-container-low w-full pt-16 pb-8">
    <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto border-t border-outline-variant pt-8">
      <div className="mb-8 md:mb-0 text-center md:text-left">
        <div className="text-lg font-bold text-primary font-headline mb-2">Stratos Ledger</div>
        <p className="text-on-surface-variant text-sm max-w-xs font-body">
          Precision in every transaction. The vault for your company's growth.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 mb-8 md:mb-0">
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-sm" href="#">Privacy Policy</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-sm" href="#">Terms of Service</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-sm" href="#">Security</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body text-sm" href="#">Status</a>
      </div>
      <div className="text-on-surface-variant/60 text-xs font-body text-center md:text-right">
        © 2024 Stratos Ledger. All rights reserved. Precision in every transaction.
      </div>
    </div>
  </footer>
);
