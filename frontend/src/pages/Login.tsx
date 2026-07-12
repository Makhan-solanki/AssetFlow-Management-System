import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldAlert, Layers } from 'lucide-react';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

interface LoginProps {
  onSuccess: () => void;
  onBack: () => void;
  initialIsSignUp?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onBack, initialIsSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [isForgot, setIsForgot] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login, signup, verifyEmail, forgotPassword, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    if (isForgot) {
      const success = await forgotPassword(email, password);
      if (success) {
        setSuccessMsg('Password has been reset successfully! You can now sign in.');
        setIsForgot(false);
        setPassword('');
      }
    } else if (isVerifying) {
      const success = await verifyEmail(email, verificationCode);
      if (success) onSuccess();
    } else if (isSignUp) {
      const code = await signup(name, email, password);
      if (code) {
        setIsVerifying(true);
        setSuccessMsg(`Account registered! For testing, your verification code is: ${code}. Please enter it below.`);
      }
    } else {
      const success = await login(email, password);
      if (success) onSuccess();
    }
  };

  const handleToggle = () => {
    clearError();
    setSuccessMsg('');
    setIsForgot(false);
    setIsVerifying(false);
    setIsSignUp(!isSignUp);
  };

  const handleToggleForgot = () => {
    clearError();
    setSuccessMsg('');
    setIsSignUp(false);
    setIsVerifying(false);
    setIsForgot(!isForgot);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-brand selection:text-white font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,59,235,0.04),transparent_60%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button 
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-slate-300 font-medium mb-6 block mx-auto transition-colors"
        >
          &larr; Back to Landing Page
        </button>
        
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Asset<span className="text-brand-400">Flow</span></span>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          {isVerifying ? 'Verify your email' : isForgot ? 'Reset your password' : isSignUp ? 'Create your account' : 'Sign in to your workspace'}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          {isVerifying ? `Enter OTP code sent to ${email}` : isForgot ? 'Enter your registered email and a new password' : 'Default signup creates an Employee account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-950/60 border border-red-800/40 text-red-300 p-4 rounded-xl text-xs flex items-start space-x-2.5 animate-in fade-in">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/60 border border-emerald-900/40 text-emerald-300 p-4 rounded-xl text-xs flex items-start space-x-2.5 animate-in fade-in">
                <Layers className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {isVerifying ? (
              <InputField
                label="Verification Code (6-Digit OTP)"
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            ) : (
              <>
                {isSignUp && (
                  <InputField
                    label="Full Name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                )}

                <InputField
                  label="Email address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                />

                <div>
                  <InputField
                    label={isForgot ? 'New Password' : 'Password'}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  
                  {!isSignUp && !isForgot && (
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={handleToggleForgot}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3"
              >
                {isVerifying ? 'Verify & Sign In' : isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
            {isVerifying ? (
              <button
                onClick={() => setIsVerifying(false)}
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors focus:outline-none"
              >
                Back to Sign Up
              </button>
            ) : isForgot ? (
              <button
                onClick={handleToggleForgot}
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors focus:outline-none"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={handleToggle}
                  className="text-brand-400 hover:text-brand-300 font-semibold transition-colors focus:outline-none"
                >
                  {isSignUp ? 'Sign In instead' : 'Create an account'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
