import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight, CheckCircle, Github, Chrome } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col bg-white border-r border-slate-100 relative z-10 lg:flex-none lg:w-[480px] xl:w-[560px] h-full overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-12 min-h-full">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-700 text-static-white font-bold text-xl">
                H
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">HayatOS</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-slate-500 text-base">
                {isLogin 
                  ? 'Welcome back! Please enter your details.' 
                  : 'Start your 30-day free trial. Cancel anytime.'
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                 <div className="text-red-500 mt-0.5"><Lock size={16} /></div>
                 <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full name</label>
                  <div className="relative">
                     <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={18} />
                     </div>
                     <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-xs"
                      placeholder="Enter your name"
                      required={!isLogin}
                     />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                   <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                   </div>
                   <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-xs"
                    placeholder="Enter your email"
                    required
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                   <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={18} />
                   </div>
                   <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-xs"
                    placeholder="••••••••"
                    required
                   />
                   <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                   >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Must be at least 8 characters.</p>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <input type="checkbox" id="remember" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                     <label htmlFor="remember" className="text-sm font-medium text-slate-600">Remember for 30 days</label>
                  </div>
                  <button type="button" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Forgot password?</button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.99]"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign in' : 'Create account'} 
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>

              <div className="relative my-6">
                 <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                 </div>
                 <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors shadow-xs">
                    <Chrome size={20} /> <span className="hidden sm:inline">Google</span>
                 </button>
                 <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors shadow-xs">
                    <Github size={20} /> <span className="hidden sm:inline">GitHub</span>
                 </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
          
          <div className="mt-10 mx-auto w-full max-w-sm lg:w-96 flex items-center justify-between text-xs text-slate-400">
             <span>© 2024 HayatOS Inc.</span>
             <div className="flex gap-4">
                <a href="#" className="hover:text-slate-600">Privacy</a>
                <a href="#" className="hover:text-slate-600">Terms</a>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual (Use inline styles to enforce static dark mode regardless of app theme) */}
      <div className="hidden lg:block relative flex-1 h-full overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
        <div className="absolute inset-0">
           {/* Abstract Background Pattern */}
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475467 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
           
           {/* Gradient Orbs */}
           <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" style={{ backgroundColor: 'rgba(127, 86, 217, 0.3)' }}></div>
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center z-10">
           <div className="backdrop-blur-xl p-8 rounded-3xl max-w-lg shadow-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: '1px' }}>
              <div className="flex justify-center mb-6">
                 <div className="p-4 rounded-2xl shadow-lg" style={{ backgroundColor: '#7F56D9', boxShadow: '0 10px 15px -3px rgba(66, 48, 125, 0.2)' }}>
                    <CheckCircle size={32} color="white" />
                 </div>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>Manage your entire life in one place.</h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#cbd5e1' }}>
                 "HayatOS has completely transformed how I organize my day. The integration between habits, finance, and religion is seamless."
              </p>
              
              <div className="flex items-center justify-center gap-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                       <div key={i} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-medium z-${10-i}`} style={{ backgroundColor: '#334155', borderColor: '#1e293b', color: 'white' }}>
                          <User size={16} />
                       </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold z-0" style={{ backgroundColor: '#7F56D9', borderColor: '#1e293b', color: 'white' }}>
                       +2k
                    </div>
                 </div>
                 <div className="text-left">
                    <div className="flex gap-1 mb-0.5">
                       {[1,2,3,4,5].map(i => <User key={i} size={12} fill="currentColor" style={{ color: '#fbbf24' }} />)}
                    </div>
                    <p className="text-xs font-medium" style={{ color: '#cbd5e1' }}>Trusted by 2,000+ users</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;