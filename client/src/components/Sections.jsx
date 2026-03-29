import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, ShieldCheck, Zap, CheckCircle, RefreshCw, Quote, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Badge, Card } from './UI';

const simpleFadeIn = {
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 }
};

export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-bold tracking-tighter text-primary font-headline">Stratos Ledger</div>
        <div className="hidden md:flex items-center gap-8">
          {['Product', 'Solutions', 'Pricing', 'Contact'].map((item) => (
            <a key={item} className="text-on-surface-variant hover:text-primary transition-all font-semibold font-body text-sm" href="#">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/signup')}>Get Started</Button>
        </div>
      </div>
    </nav>
  );
};

export const Hero = () => (
  <section className="px-8 pt-32 pb-20 md:pt-48 md:pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
    <motion.div {...simpleFadeIn}>
      <Badge>Efficiency First</Badge>
      <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-primary tracking-tight mb-8 leading-tight">
        Reimbursements, <br/><span className="text-secondary">Reimagined.</span>
      </h1>
      <p className="max-w-2xl text-on-surface-variant text-lg md:text-xl font-medium mb-12 opacity-80 mx-auto">
        Empower your workforce with lightning-fast approvals and precision tracking. Stop chasing receipts and start scaling your business.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button onClick={() => window.location.href='/signup'} className="px-10 py-4 text-lg">Get Started Free</Button>
        <Button variant="ghost" className="px-10 py-4 text-lg group font-bold">
          Book a Demo
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-28 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 bg-white p-2"
    >
      <div className="aspect-video w-full rounded-2xl bg-gray-50 relative overflow-hidden text-center flex items-center justify-center">
        <div className="p-12">
          <img 
            className="w-full h-full object-cover rounded-xl shadow-lg" 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
            alt="Dashboard"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </motion.div>
  </section>
);

export const Logos = () => (
  <section className="py-16 grayscale opacity-40">
    <div className="max-w-7xl mx-auto px-8">
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 text-lg font-bold text-on-surface-variant/40">
        {['Logo 1', 'Logo 2', 'Logo 3', 'Logo 4', 'Logo 5'].map((logo, i) => (
          <span key={logo}>{logo}</span>
        ))}
      </div>
    </div>
  </section>
);

export const Features = () => (
  <section className="py-24 px-8 max-w-7xl mx-auto">
    <motion.div {...simpleFadeIn} className="mb-16 text-center">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4 tracking-tight">Precision-Engineered for Speed</h2>
      <p className="text-on-surface-variant max-w-xl mx-auto font-medium opacity-70">Eliminate friction from your financial operations with our core platform pillars.</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="low" className="md:col-span-2 flex flex-col justify-between group shadow-sm bg-gray-50/50">
        <div>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6 text-white">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-2xl font-bold text-primary mb-4">AI-Powered Extraction</h3>
          <p className="text-on-surface-variant font-medium opacity-70">
            Upload receipts and let our proprietary AI engine handle the data entry. We extract merchant data, taxes, and categories with 99.9% accuracy.
          </p>
        </div>
        <div className="mt-8 relative h-48 rounded-2xl overflow-hidden shadow-md">
          <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=800" alt="AI Extraction" referrerPolicy="no-referrer" />
        </div>
      </Card>

      <Card variant="high" className="flex flex-col bg-secondary text-white border-none shadow-md">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="font-headline text-2xl font-bold mb-4">Policy Compliance</h3>
        <p className="opacity-80 font-medium mb-8">
          Automatic flags for out-of-policy expenses ensure your finance team only reviews what truly matters.
        </p>
        <div className="mt-auto p-4 bg-white/10 rounded-xl border border-white/10 text-sm font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-300" />
          Violation Alert
        </div>
      </Card>

      <Card variant="white" className="md:col-span-3 flex flex-col md:flex-row items-center gap-12 p-10 md:p-12 shadow-md">
        <div className="flex-1">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-3xl font-bold text-primary mb-4">Instant Payouts</h3>
          <p className="text-on-surface-variant font-medium opacity-70 leading-relaxed">
            Sync directly with your payroll and reimburse employees in seconds, not weeks. Support for 40+ currencies.
          </p>
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-3xl font-bold text-primary font-headline">2.4s</div>
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40 mt-1">Avg Approval</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-3xl font-bold text-primary font-headline">98%</div>
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40 mt-1">Efficiency</div>
          </div>
          <div className="bg-primary text-white col-span-2 rounded-2xl p-6 flex items-center justify-between shadow-xl">
            <div className="font-bold">ERP Synced</div>
            <RefreshCw className="w-6 h-6 opacity-60" />
          </div>
        </div>
      </Card>
    </div>
  </section>
);

export const Testimonial = () => (
  <section className="py-24 bg-primary px-8 text-center text-white">
    <div className="max-w-4xl mx-auto">
      <Quote className="w-12 h-12 text-white/20 mx-auto mb-8" />
      <blockquote className="font-headline text-2xl md:text-3xl font-semibold mb-10 leading-snug">
        "Stratos Ledger didn't just automate our expenses; they transformed our entire financial culture."
      </blockquote>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-white/20">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" alt="Sarah" referrerPolicy="no-referrer" />
        </div>
        <cite className="not-italic text-sm font-bold uppercase tracking-widest opacity-80">Sarah Jenkins, CFO</cite>
      </div>
    </div>
  </section>
);

export const CTA = () => (
  <section className="py-24 px-8 max-w-5xl mx-auto text-center">
    <Card variant="highest" className="p-12 md:p-20 bg-primary rounded-[40px] text-white overflow-hidden shadow-2xl" hover={false}>
      <h2 className="font-headline text-3xl md:text-5xl font-bold mb-8">Ready to streamline?</h2>
      <p className="opacity-80 text-lg mb-12 max-w-lg mx-auto leading-relaxed">Join 5,000+ companies who have traded manual spreadsheets for precision automation.</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={() => window.location.href='/signup'} className="px-10 py-4 text-lg bg-white text-primary border-none shadow-xl hover:bg-gray-100">Get Started Free</Button>
        <Button variant="outline" className="px-10 py-4 text-lg text-white border-white/30 truncate">Contact Sales</Button>
      </div>
    </Card>
  </section>
);

export const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-16">
    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
      <div>
        <div className="text-xl font-bold text-primary font-headline mb-2">Stratos Ledger</div>
        <p className="text-on-surface-variant text-sm font-medium opacity-60">Precision in every transaction.</p>
      </div>
      <div className="flex gap-8 text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Status</span>
      </div>
      <div className="text-on-surface-variant/40 text-xs font-bold uppercase tracking-widest">© 2024 Stratos Ledger</div>
    </div>
  </footer>
);
