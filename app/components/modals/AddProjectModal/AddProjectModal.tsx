'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';

import { Category } from '@/app/entities';
import { convertToTimestamp, getTomorrowsDate } from '@/app/utils';
import { usePinata } from '@/app/hooks/usePinata';
import { useBlockchain } from '@/app/hooks/useBlockchain';
import Button from '../../Button/Button';
import xmarkSVG from '@/public/icons/xmark.svg';

import styles from '../modal.module.scss';

interface Props {
  closeModal: () => void;
}

export interface AddFormInputs {
  title: string;
  cost: string;
  expiresAt: Date | string | number;
  imageURLs: File[] | string[];
  category: number;
  description: string;
}

const AddProjectModal = ({ closeModal }: Props) => {
  const { createProject, getCategories } = useBlockchain();
  const { uploadFiles } = usePinata((uploading) => setUploading(uploading));
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitSuccessful },
  } = useForm<AddFormInputs>({
    defaultValues: {
      title: '',
      cost: '',
      expiresAt: '',
      imageURLs: [],
      category: 0,
      description: '',
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...selectedFiles].slice(0, 3); // Limit to three files

    setFiles(newFiles);
  };

  const onSubmit: SubmitHandler<AddFormInputs> = async (data) => {
    if (!files.length) {
      setFileError(true);
      return;
    }

    const { uploadedCids } = await uploadFiles(files);

    data.imageURLs = uploadedCids;
    data.expiresAt = convertToTimestamp(data.expiresAt as string);
    data.category = +data.category;

    await createProject(data);
    toast.success('Project created successfully, changes will reflect momentarily.');
    closeModal();
  };

  useEffect(() => {
    const fetchData = async () => {
      const { categories } = await getCategories();

      setCategories(categories);
    };

    fetchData();
  }, [getCategories]);

  useEffect(() => {
    reset();
  }, [isSubmitSuccessful, reset]);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.row}>
            <p>Add Project</p>
            <button
              className={classNames({
                [styles.close]: true,
                [styles.disabled]: uploading,
              })}
              type="button"
              onClick={() => closeModal()}
              disabled={uploading}
            >
              <Image src={xmarkSVG} alt="close" width={22} height={22} />
            </button>
          </div>
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
          <div className={styles.imagesContainer}>
            <label htmlFor="images">Project Images</label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              {...register('imageURLs', {
                onChange: handleChange,
              })}
            />
            <ul className={styles.imageList}>
              {files.map((file, index) => (
                <li key={index} className={styles.listItem}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className={styles.projectImage}
                    width={100}
                    height={100}
                  />
                  {file.name}
                  <button
                    onClick={() =>
                      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
                    }
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            {fileError && <span>Select at least 1 image to proceed</span>}
          </div>
          <select
            {...register('category', { required: true })}
            className={styles.categories}
          >
            {categories.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <textarea
            className={classNames(styles.input, styles.textArea)}
            placeholder="Description"
            {...register('description', { required: true })}
          />
          <Button disabled={uploading}>
            {uploading ? 'Uploading Images...' : 'Submit Project'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
