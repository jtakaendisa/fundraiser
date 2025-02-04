import { motion } from 'framer-motion';

import { Category } from '@/app/entities';
import { usePageNavigation } from '@/app/hooks/usePageNavigation';
import CategoryIcon from '@/app/components/icons/CategoryIcon';

import styles from './CategoryCard.module.scss';

interface Props {
  category: Category;
  index: number;
}

const revealVariants = {
  initial: {
    opacity: 0,
    y: 17,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.17,
      delay: index * 0.12,
    },
  }),
};

const splitName = (name: string) => name.split(' & ');

const CategoryCard = ({ category, index }: Props) => {
  const { navigateToPageWithTransition } = usePageNavigation();

  const { id, name } = category;

  const handleCategorySelect = () => {
    navigateToPageWithTransition(`/projects?categoryId=${id}`);
  };

  return (
    <motion.div
      variants={revealVariants}
      custom={index}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className={styles.categoryCard}
      onClick={handleCategorySelect}
    >
      <div className={styles.categoryIcon}>
        <CategoryIcon id={id} />
      </div>
      <div className={styles.categoryName}>
        {splitName(name).map((part, idx) => (
          <span key={part}>
            {part} {idx === 0 && '&'}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryCard;
