import ProjectDetailsImageGalleryImageCard from '../ProjectDetailsImageGalleryImageCard/ProjectDetailsImageGalleryImageCard';

import styles from './ProjectDetailsImageGalleryImageCards.module.scss';

interface Props {
  imageURLs: string[];
  selectedImageIndex: number;
  title: string;
  blurDataURLs: string[];
  onSelect: (index: number) => void;
}

const ProjectDetailsImageGalleryImageCards = ({
  imageURLs,
  selectedImageIndex,
  title,
  blurDataURLs,
  onSelect,
}: Props) => {
  return (
    <div className={styles.imageCards}>
      {imageURLs.map((imageURL, index) => (
        <ProjectDetailsImageGalleryImageCard
          key={imageURL}
          imageURL={imageURL}
          index={index}
          selectedImageIndex={selectedImageIndex}
          title={title}
          blurDataURLs={blurDataURLs}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default ProjectDetailsImageGalleryImageCards;
