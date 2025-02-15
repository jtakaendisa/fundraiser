import ProjectDetailsImageGalleryImageCard from '../ProjectDetailsImageGalleryImageCard/ProjectDetailsImageGalleryImageCard';

import styles from './ProjectDetailsImageGalleryImageCards.module.scss';

interface Props {
  imageUrls: string[];
  selectedImageIndex: number;
  blurDataUrls: string[];
  onSelect: (index: number) => void;
}

const ProjectDetailsImageGalleryImageCards = ({
  imageUrls,
  selectedImageIndex,
  blurDataUrls,
  onSelect,
}: Props) => {
  return (
    <div className={styles.imageCards}>
      {imageUrls.map((imageUrl, index) => (
        <ProjectDetailsImageGalleryImageCard
          key={imageUrl}
          imageUrl={imageUrl}
          index={index}
          selectedImageIndex={selectedImageIndex}
          blurDataUrl={blurDataUrls[index]}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default ProjectDetailsImageGalleryImageCards;
