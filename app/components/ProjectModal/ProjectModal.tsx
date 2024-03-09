'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import classNames from 'classnames';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

import { ModalVariant, Project, useModalStore } from '@/app/store';
import useBlockchain from '@/app/hooks/useBlockchain';
import usePinata from '@/app/hooks/usePinata';
import { convertToTimestamp, getTomorrowsDate } from '@/app/utils';
import Button from '../Button/Button';
import newProject from '@/public/images/new-project.jpg';

import styles from './ProjectModal.module.scss';

interface Props {
  variant: ModalVariant;
  project?: Project;
}

export interface FormInputs {
  id?: number;
  title: string;
  cost: string;
  expiresAt: Date | string | number;
  imageURLs: File[] | string[];
  description: string;
}

const submitButtonMap = {
  add: 'Submit Project',
  back: 'Back Project',
  edit: 'Update Project',
  delete: 'Delete Project',
};

const ProjectModal = ({ variant, project }: Props) => {
  const modalTitleMap = {
    add: 'Add Project',
    back: project?.title,
    edit: project?.title,
    delete: project?.title,
  };

  const router = useRouter();
  const closeModal = useModalStore((s) => s.setIsOpen);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImageURLs, setExistingImageURLs] = useState(
    project ? project.imageURLs : []
  );
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState(false);
  const { createProject, updateProject, deleteProject, backProject } = useBlockchain();
  const { uploadFiles } = usePinata(setUploading);

  const defaultValues =
    project && variant === 'edit'
      ? {
          title: project.title,
          description: project.description,
          imageURLs: project.imageURLs,
          cost: project.cost.toString(),
          expiresAt: project.date,
        }
      : {
          title: '',
          description: '',
          imageURLs: [],
          cost: '',
          expiresAt: '',
        };

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitSuccessful },
  } = useForm<FormInputs>({ defaultValues: defaultValues });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    let newFiles: File[] = [];

    if (variant === 'add') {
      newFiles = [...files, ...selectedFiles].slice(0, 3); // Limit to three files
    }
    if (variant === 'edit') {
      const remainingSlots = Math.max(0, 3 - existingImageURLs.length);
      newFiles = [...files, ...selectedFiles].slice(0, remainingSlots); // Limit to remaining slots
    }

    setFiles(newFiles);
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    data.expiresAt = convertToTimestamp(data.expiresAt as string);

    if (variant === 'add' && !files.length) {
      setFileError(true);
      return;
    }

    if (variant === 'edit' && !files.length && !existingImageURLs.length) {
      setFileError(true);
      return;
    }

    if (files.length) {
      const { uploadedCids } = await uploadFiles(files);

      if (variant === 'edit') {
        const combinedCids = [...uploadedCids, ...existingImageURLs];
        data.imageURLs = combinedCids;
      } else {
        data.imageURLs = uploadedCids;
      }
    }

    switch (variant) {
      case 'add':
        await createProject(data);
        toast.success(
          'Project created successfully, changes will reflect momentarily.'
        );
        break;
      case 'back':
        if (!project) return;
        await backProject(project.id, data.cost);
        toast.success(
          'Thank you! Project backing has been received, changes will reflect momentarily.'
        );
        break;
      case 'edit':
        if (!project) return;
        await updateProject({ ...data, id: project.id });
        toast.success(
          'Project updated successfully, changes will reflect momentarily.'
        );
        break;
      case 'delete':
        if (!project) return;
        await deleteProject(project.id);
        toast.success(
          'Project deleted successfully, changes will reflect momentarily.'
        );
        router.push('/');
        break;
    }

    closeModal(variant);
  };

  useEffect(() => {
    reset();
  }, [isSubmitSuccessful, reset]);

  const InputFields = () => {
    switch (variant) {
      case 'add':
        return (
          <>
            <input
              className={styles.input}
              type="text"
              placeholder="Title"
              {...register('title', { required: true })}
            />
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
              type="date"
              placeholder="Expires"
              {...register('expiresAt', { required: true, min: getTomorrowsDate() })}
            />
            <input
              type="file"
              accept="image/*"
              multiple
              {...register('imageURLs', {
                onChange: handleChange,
              })}
            />
            <div>
              <h3>Selected Files:</h3>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width={100}
                      height={100}
                    />
                    {file.name}
                    <button
                      onClick={() =>
                        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              {fileError && <span>Select at least 1 image to proceed</span>}
            </div>
            <textarea
              className={classNames(styles.input, styles.textArea)}
              placeholder="Description"
              {...register('description', { required: true })}
            />
          </>
        );
      case 'back':
        return (
          <input
            className={styles.input}
            type="number"
            step={0.01}
            min={0.01}
            placeholder="Amount (ETH)"
            {...register('cost', { required: true })}
          />
        );
      case 'edit':
        return (
          <>
            <input
              type="file"
              accept="image/*"
              multiple
              {...register('imageURLs', {
                onChange: handleChange,
              })}
            />
            <div>
              <h3>Selected Files:</h3>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width={100}
                      height={100}
                    />
                    {file.name}
                    <button
                      onClick={() =>
                        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {existingImageURLs.map((image, index) => (
                  <li key={index}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${image}`}
                      alt={image}
                      width={100}
                      height={100}
                    />
                    image {index + 1}
                    <button
                      onClick={() =>
                        setExistingImageURLs((prevFiles) =>
                          prevFiles.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              {fileError && <span>Select at least 1 image to proceed</span>}
            </div>
            <textarea
              className={classNames(styles.input, styles.textArea)}
              placeholder="Description"
              {...register('description', { required: true })}
            />
          </>
        );
      case 'delete':
        return (
          <div className={styles.warning}>
            <p>Are you sure you wish to delete this project?</p>
            <span>This action is irreversable.</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.row}>
            <p>{modalTitleMap[variant]}</p>
            <button
              className={classNames({
                [styles.close]: true,
                [styles.disabled]: uploading,
              })}
              type="button"
              onClick={() => closeModal(variant)}
              disabled={uploading}
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className={styles.image}>
            {variant === 'add' ? (
              <Image src={newProject} alt="Create a Project" />
            ) : (
              project && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${project.imageURLs[0]}`}
                  alt={project.title}
                  fill
                  sizes="20vw"
                />
              )
            )}
          </div>
          <InputFields />
          <Button color={variant === 'delete' ? 'red' : undefined} disabled={uploading}>
            {uploading ? 'Uploading Images...' : submitButtonMap[variant]}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
