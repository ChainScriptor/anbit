import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
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
      className="space-y-4"
      noValidate
      aria-label="Merchant login form"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="usernameOrEmail"
          className="block text-xs font-medium text-slate-700"
        >
          Username or email
        </label>
        <input
          id="usernameOrEmail"
          type="text"
          autoComplete="username"
          className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
          {...register('usernameOrEmail')}
        />
        {errors.usernameOrEmail && (
          <p className="mt-0.5 text-xs text-red-500">{errors.usernameOrEmail.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-0.5 text-xs text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-300 accent-[#e63533] focus:ring-[#e63533]"
            {...register('remember')}
          />
          <span className="text-slate-600">Remember me</span>
        </label>
        <button
          type="button"
          className="font-medium text-[#e63533] hover:text-[#c32a28]"
        >
          Forgot password?
        </button>
      </div>

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={isSubmitting}
        className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-[#e63533] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#e63533]/30 transition hover:bg-[#c32a28] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <span>Logging in...</span>
          </div>
        ) : (
          'Login to Anbit'
        )}
      </motion.button>

      <p className="text-center text-xs text-slate-600">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-[#e63533] hover:text-[#c32a28]"
        >
          Register
        </button>
      </p>
    </form>
  );
};

