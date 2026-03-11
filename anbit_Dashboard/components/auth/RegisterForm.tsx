import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

const registrationSchema = z.object({
  country: z.string().min(1, 'Please select a country'),
  businessType: z.enum(['Restaurant', 'Cafe', 'Bakery', 'Grocery', 'Other'], {
    required_error: 'Please select a business type',
  }),
  locations: z
    .string()
    .min(1, 'Please enter number of locations')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: 'Enter a valid positive number',
    }),
  venueName: z.string().min(2, 'Please enter venue name'),
  streetAddress: z.string().min(3, 'Please enter street address'),
  postalCode: z.string().min(2, 'Please enter postal code'),
  city: z.string().min(2, 'Please enter city'),
  firstName: z.string().min(2, 'Please enter first name'),
  lastName: z.string().min(2, 'Please enter last name'),
  phone: z.string().min(6, 'Please enter phone number'),
  email: z.string().email('Please enter a valid email'),
  wantsCouriers: z.boolean().optional(),
});

type RegistrationValues = z.infer<typeof registrationSchema>;

const countries = ['Greece', 'Cyprus', 'Italy', 'Spain', 'Other'];

export const RegisterForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      country: 'Greece',
      businessType: 'Restaurant',
      locations: '1',
      wantsCouriers: true,
    },
  });

  const onSubmit = async (values: RegistrationValues) => {
    // TODO: σύνδεση με πραγματικό registration endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Registration submit', values);
    setIsSubmitted(true);
    reset({
      country: 'Greece',
      businessType: 'Restaurant',
      locations: '1',
      wantsCouriers: true,
    });
  };

  return (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9.707 16.293 6.414 13l1.414-1.414 1.879 1.879 4.95-4.95L16.071 10.9l-6.364 6.364z"
              />
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Your business has been submitted
          </h2>
          <p className="text-xs text-slate-600">
            Our team will review your details and contact you shortly to
            complete your Anbit merchant onboarding.
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="mt-2 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            Submit another venue
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="register"
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          noValidate
          aria-label="Merchant registration form"
        >
          {/* Country + Business type */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="country"
                className="block text-xs font-medium text-slate-700"
              >
                Country
              </label>
              <select
                id="country"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                {...register('country')}
              >
                <option value="">Select a country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-0.5 text-xs text-red-500">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="businessType"
                className="block text-xs font-medium text-slate-700"
              >
                Business type
              </label>
              <select
                id="businessType"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                {...register('businessType')}
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Cafe">Cafe</option>
                <option value="Bakery">Bakery</option>
                <option value="Grocery">Grocery</option>
                <option value="Other">Other</option>
              </select>
              {errors.businessType && (
                <p className="mt-0.5 text-xs text-red-500">
                  {errors.businessType.message}
                </p>
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-1.5">
            <label
              htmlFor="locations"
              className="block text-xs font-medium text-slate-700"
            >
              Number of locations
            </label>
            <input
              id="locations"
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
              {...register('locations')}
            />
            {errors.locations && (
              <p className="mt-0.5 text-xs text-red-500">
                {errors.locations.message}
              </p>
            )}
          </div>

          {/* Business info */}
          <div className="mt-2 border-t border-slate-100 pt-1">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Business information
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="venueName"
                  className="block text-xs font-medium text-slate-700"
                >
                  Venue name
                </label>
                <input
                  id="venueName"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                  {...register('venueName')}
                />
                {errors.venueName && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.venueName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="streetAddress"
                  className="block text-xs font-medium text-slate-700"
                >
                  Street address
                </label>
                <input
                  id="streetAddress"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                  {...register('streetAddress')}
                />
                {errors.streetAddress && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.streetAddress.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="postalCode"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Postal code
                  </label>
                  <input
                    id="postalCode"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                    {...register('postalCode')}
                  />
                  {errors.postalCode && (
                    <p className="mt-0.5 text-xs text-red-500">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="city"
                    className="block text-xs font-medium text-slate-700"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                    {...register('city')}
                  />
                  {errors.city && (
                    <p className="mt-0.5 text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Owner info */}
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Owner information
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="firstName"
                  className="block text-xs font-medium text-slate-700"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="lastName"
                  className="block text-xs font-medium text-slate-700"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="block text-xs font-medium text-slate-700"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="emailOwner"
                  className="block text-xs font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="emailOwner"
                  type="email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/10"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Couriers checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <Controller
              control={control}
              name="wantsCouriers"
              render={({ field }) => (
                <input
                  type="checkbox"
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 accent-[#e63533] focus:ring-[#e63533]"
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <span className="text-xs text-slate-600">
              I want Anbit couriers to deliver my orders
            </span>
          </div>

          {/* Terms + button */}
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            By clicking <span className="font-semibold">Get Started</span> you
            agree to the{' '}
            <button
              type="button"
              className="text-[#e63533] underline-offset-2 hover:text-[#c32a28] hover:underline"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              className="text-[#e63533] underline-offset-2 hover:text-[#c32a28] hover:underline"
            >
              Privacy Policy
            </button>
            .
          </p>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#e63533] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#e63533]/30 transition hover:bg-[#c32a28] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <span>Submitting...</span>
              </div>
            ) : (
              'Get Started'
            )}
          </motion.button>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

