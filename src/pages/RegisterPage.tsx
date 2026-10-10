import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/errors';
import { AuthLayout } from './AuthLayout';

const schema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(100),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .max(72, 'Password is too long')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try {
      await signUp({ name, email, password });
      toast.success('Account created');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create account'));
    }
  });

  return (
    <AuthLayout title="Create your account" subtitle="Start budgeting in under a minute.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          hint="8+ characters with a letter and a number"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
