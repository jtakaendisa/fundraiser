import classNames from 'classnames';

import styles from './ProjectCarouselPaginationListItem.module.scss';

interface Props {
  pageNumber: number;
  selectedPage: number;
  onSelect: (selectedPage: number) => void;
}

const ProjectCarouselPaginationListItem = ({
  pageNumber,
  selectedPage,
  onSelect,
}: Props) => {
  const isSelected = pageNumber === selectedPage;

  return (
    <div className={styles.paginationListItem} onClick={() => onSelect(pageNumber)}>
      <span
        className={classNames({
          [styles.pageNumber]: true,
          [styles.selected]: isSelected,
        })}
      >
        {pageNumber}
      </span>

      <div
        className={classNames({
          [styles.indicator]: true,
          [styles.selected]: isSelected,
        })}
      />
    </div>
  );
};

export default ProjectCarouselPaginationListItem;