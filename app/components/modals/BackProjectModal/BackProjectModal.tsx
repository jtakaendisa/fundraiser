'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';

import { Project } from '@/app/entities';
import { useAccountStore } from '@/app/store';
import { backProjectFirebase } from '@/app/services/authService';
import { useBlockchain } from '@/app/hooks/useBlockchain';
import Button from '../../Button/Button';
import xmarkSVG from '@/public/icons/xmark.svg';

import styles from '../modal.module.scss';

interface Props {
  project: Project | null;
  closeModal: () => void;
}

export interface BackFormInputs {
  cost: string;
  comment: string;
}

const BackProjectModal = ({ project, closeModal }: Props) => {
  const authUser = useAccountStore((s) => s.authUser);
  const connectedAcount = useAccountStore((s) => s.connectedAccount);
  const { backProject } = useBlockchain();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitSuccessful },
  } = useForm<BackFormInputs>({
    defaultValues: {
      cost: '',
      comment: '',
    },
  });

  const onSubmit: SubmitHandler<BackFormInputs> = async ({ cost, comment }) => {
    if (!project) return;

    if (connectedAcount && authUser) {
      await backProject(project.id, cost, comment, connectedAcount);
      await backProjectFirebase(authUser, project.id);
    }

    toast.success(
      'Thank you! Your donation has been received, changes will reflect momentarily.'
    );

    closeModal();
  };

  useEffect(() => {
    reset();
  }, [isSubmitSuccessful, reset]);

  if (!project) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.row}>
            <p>{project.title}</p>
            <button className={styles.close} type="button" onClick={() => closeModal()}>
              <Image src={xmarkSVG} alt="close" width={22} height={22} />
            </button>
          </div>
          <input
            className={styles.input}
            type="number"
            step={0.01}
            min={0.01}
            placeholder="Amount (ETH)"
            {...register('cost', { required: true })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Comment (Optional)"
            {...register('comment')}
          />

          <Button>Back Project</Button>
        </form>
      </div>
    </div>
  );
};

export default BackProjectModal;
