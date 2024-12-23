'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';

import { createAuthUser, createUserDocument } from '@/app/services/authService';
import Header from '../../components/TopNav/TopNav';
import Button from '../../components/Button/Button';

import styles from './page.module.scss';

interface SigninFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  accountType: string;
  wallet: string;
}

const SignupPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitSuccessful },
  } = useForm<SigninFormInputs>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'funder',
      wallet: '',
    },
  });

  const watchShowWallet = watch('accountType');

  const onSubmit: SubmitHandler<SigninFormInputs> = async (data) => {
    const { email, password, confirmPassword, accountType, wallet } = data;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await createAuthUser(email, password);
      if (response) {
        await createUserDocument(response.user, accountType, wallet);
        router.push('/');
      }
    } catch (error) {
      console.log('user creation encountered an error', (error as Error).message);
    }
  };

  useEffect(() => {
    reset();
  }, [isSubmitSuccessful, reset]);

  return (
    <div className={styles.signupPage}>
      <Header />
      <section>
        <div className={styles.card}>
          <h2 className={styles.heading}>Create Your Account</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formInput}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: true })}
              />
            </div>
            <div className={styles.formInput}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                {...register('password', { required: true })}
              />
            </div>
            <div className={styles.formInput}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { required: true })}
              />
            </div>
            <fieldset className={styles.formFieldset}>
              <legend>Select an account type:</legend>

              <div className={styles.formOption}>
                <label htmlFor="funder">Project Funder</label>
                <input
                  id="funder"
                  type="radio"
                  value="funder"
                  {...register('accountType')}
                />
              </div>

              <div className={styles.formOption}>
                <label htmlFor="owner">Project Owner</label>
                <input
                  id="owner"
                  type="radio"
                  value="owner"
                  {...register('accountType')}
                />
              </div>
            </fieldset>
            {watchShowWallet === 'owner' && (
              <div className={styles.formInput}>
                <label htmlFor="wallet">Crypto Wallet</label>
                <input
                  id="wallet"
                  type="text"
                  {...register('wallet', { required: true })}
                />
              </div>
            )}
            <div className={styles.buttonContainer}>
              <Button>Sign Up</Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SignupPage;
