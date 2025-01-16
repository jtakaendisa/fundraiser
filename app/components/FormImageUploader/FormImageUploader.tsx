import {
  FieldError,
  FieldValues,
  Merge,
  Path,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { AnimatePresence } from 'framer-motion';

import FormImageUploaderInput from '../FormImageUploaderInput/FormImageUploaderInput';
import FormImageUploaderPreview from '../FormImageUploaderPreview/FormImageUploaderPreview';
import FormErrorMessage from '../FormErrorMessage/FormErrorMessage';

import styles from './FormImageUploader.module.scss';

interface Props<T extends FieldValues> {
  label: string;
  field: Path<T>;
  error?: Merge<FieldError, (FieldError | undefined)[]> | undefined;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
}

const FormImageUploader = <T extends FieldValues>({
  label,
  field,
  error,
  setValue,
  watch,
}: Props<T>) => {
  const watchImages = watch(field);

  return (
    <div className={styles.formImageUploader}>
      <FormImageUploaderInput
        field={field}
        label={label}
        images={watchImages}
        setValue={setValue}
      />

      {!!watchImages.length && <FormImageUploaderPreview images={watchImages} />}

      <AnimatePresence>
        {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
      </AnimatePresence>
    </div>
  );
};

export default FormImageUploader;
