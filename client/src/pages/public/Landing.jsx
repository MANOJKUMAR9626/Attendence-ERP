import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Bot, ShieldCheck, Zap, BarChart3, GraduationCap, 
  CheckCircle2, Users, BrainCircuit, Lock, Cloud, Mail 
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI Risk Prediction",
      desc: "Our machine learning models forecast student attendance trajectories and identify at-risk patterns before they become critical.",
      icon: <Bot className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Real-Time Tracking",
      desc: "Socket.IO powered instant updates ensure parents and faculty are always on the same page with live dashboards.",
      icon: <Zap className="w-6 h-6 text-yellow-500" />
    },
    {
      title: "Parent Notifications",
      desc: "Automated alert system that dispatches instant warnings to parents when attendance drops below the 75% threshold.",
      icon: <Mail className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "Advanced Analytics",
      desc: "Visualize trends, generate heatmaps, and automate semester reports with a single click in beautiful charts.",
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />
    }
  ];

  const stats = [
    { label: "Students", value: "5000+" },
    { label: "Faculty", value: "250+" },
    { label: "Prediction Accuracy", value: "98%" },
    { label: "Digital Attendance", value: "100%" }
  ];

  const workflowSteps = [
    "Faculty Marks Attendance",
    "Attendance Stored in Database",
    "AI Predicts Risk",
    "Generate Report",
    "Notify Student & Parent",
    "Advisor Dashboard"
  ];

  const whyChooseUs = [
    { title: "AI Prediction", icon: <BrainCircuit className="w-5 h-5 text-blue-500" /> },
    { title: "Secure Authentication", icon: <Lock className="w-5 h-5 text-indigo-500" /> },
    { title: "Fast Performance", icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { title: "Cloud Ready", icon: <Cloud className="w-5 h-5 text-sky-500" /> },
    { title: "Email Notifications", icon: <Mail className="w-5 h-5 text-rose-500" /> },
    { title: "Parent Portal", icon: <Users className="w-5 h-5 text-emerald-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
      
      {/* Sticky Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 dark:border-white/5 glass-panel backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-[Poppins] font-bold text-xl tracking-tight text-slate-900 dark:text-white">SmartERP</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a>
              <a href="#workflow" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Workflow</a>
              <a href="#about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Contact</a>
            </div>

            <div className="flex gap-4">
              <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 tracking-wide uppercase">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              v2.0 Enterprise Engine
            </div>
            
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-[Poppins] font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
              AI-Powered <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Student Attendance</span> <br/>
              Management
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Predict attendance deficiency before it happens using Artificial Intelligence. Unify your institution with real-time tracking, seamless workflows, and instant parent notifications.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => navigate('/register')} 
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 card-hover"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-[#111827] border border-slate-800 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-white rounded-xl font-semibold transition-all">
                Login to Portal
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full max-w-2xl lg:max-w-none relative"
          >
            <div className="relative rounded-2xl glass-panel p-2 shadow-2xl shadow-indigo-900/10 dark:shadow-indigo-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl" />
              {/* Abstract Dashboard Illustration */}
              <div className="relative bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden border border-slate-800 dark:border-white/5 aspect-[4/3] flex flex-col">
                <div className="h-10 border-b border-slate-800 dark:border-white/5 flex items-center px-4 gap-2 bg-slate-50 dark:bg-[#111827]">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 p-6 grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-4">
                    <div className="h-32 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-100 dark:border-white/5 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-500/10 dark:from-indigo-500/20 to-transparent" />
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M0 80 Q 50 20 100 60 T 200 40 T 300 70 L 300 120 L 0 120 Z" fill="rgba(99, 102, 241, 0.1)" />
                        <path d="M0 80 Q 50 20 100 60 T 200 40 T 300 70" fill="none" stroke="#6366f1" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-800 dark:border-white/5" />
                      <div className="h-24 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-800 dark:border-white/5" />
                    </div>
                  </div>
                  <div className="col-span-1 space-y-4">
                    <div className="h-20 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-800 dark:border-white/5 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                    </div>
                    <div className="h-40 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-800 dark:border-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative z-10 bg-slate-50/50 dark:bg-[#111827]/50 border-y border-slate-800/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-[Poppins] font-bold text-slate-900 dark:text-white mb-4">Enterprise-Grade Intelligence</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to run a modern educational institution, powered by state-of-the-art machine learning.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl glass-panel border-none card-hover h-full flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-5 border border-slate-800 dark:border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-[Poppins] font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-20 relative border-b border-slate-800/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-200 dark:divide-white/5">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-4"
              >
                <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight font-[Poppins]">{stat.value}</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 relative bg-slate-50 dark:bg-[#111827]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-[Poppins] font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">A seamless, fully automated pipeline from the classroom to the parent's inbox.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-8 relative z-10">
              {workflowSteps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#111827] border-2 border-indigo-500 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)] z-10">
                    {i + 1}
                  </div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{step}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 border-t border-slate-800/50 dark:border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-[Poppins] font-bold text-slate-900 dark:text-white mb-4">Why Choose SmartERP</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {whyChooseUs.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl glass-panel border-none card-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-800 dark:border-white/5 shrink-0">
                  {item.icon}
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 dark:border-white/5 bg-white dark:bg-[#0B1120] pt-16 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="font-[Poppins] font-bold text-xl text-slate-900 dark:text-white">SmartERP</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                The most advanced AI-powered student attendance management system designed for modern educational institutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#workflow" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Workflow</a></li>
                <li><a href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Login</a></li>
                <li><a href="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Get Started</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@smarterp.edu</li>
                <li className="flex items-center gap-2"><Lock className="w-4 h-4" /> Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 dark:border-white/5 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} SmartERP Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
