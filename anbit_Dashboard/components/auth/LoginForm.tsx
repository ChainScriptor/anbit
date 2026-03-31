import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Please enter your username or email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      // Backend expects username (looks up by username)
      await login(values.usernameOrEmail.trim(), values.password);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Κάτι πήγε στραβά κατά τη σύνδεση.',
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
      aria-label="Merchant login form"
    >
      <div className="space-y-2">
        <label
          htmlFor="usernameOrEmail"
          className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50"
        >
          Email address
        </label>
        <input
          id="usernameOrEmail"
          type="text"
          autoComplete="username"
          placeholder="example@anbit.com"
          className="h-14 w-full rounded-xl border border-white/5 bg-[#262626] px-4 text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:ring-1 focus:ring-white/30"
          {...register('usernameOrEmail')}
        />
        {errors.usernameOrEmail && (
          <p className="text-xs text-red-400">{errors.usernameOrEmail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-14 w-full rounded-xl border border-white/5 bg-[#262626] pl-4 pr-12 text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:ring-1 focus:ring-white/30"
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/70"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/30 bg-transparent accent-white focus:ring-white/30"
            {...register('remember')}
          />
          <span className="text-white/60">Remember me</span>
        </label>
        <button
          type="button"
          className="text-sm text-white/45 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white"
        >
          Forgot password?
        </button>
      </div>

      {serverError && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={isSubmitting}
        className="mt-1 inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#e63533] px-4 text-xl font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
            <span>Signing in...</span>
          </div>
        ) : (
          'Sign in'
        )}
      </motion.button>

      <div className="flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/30">OR</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <button
        type="button"
        className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-transparent text-base font-medium text-white transition hover:bg-white/5"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>Sign in with Google</span>
      </button>

      <p className="pt-8 text-center text-sm text-white/40">
        New to Anbit?
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="ml-1 font-semibold text-white transition-colors hover:text-[#e63533] hover:underline"
        >
          Create Account
        </button>
      </p>
    </form>
  );
};

