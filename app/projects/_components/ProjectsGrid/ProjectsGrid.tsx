import { useRef } from 'react';

import { useProjectStore } from '@/app/store';
import { useProjectsPageState } from '@/app/contexts/ProjectsPageContext';
import { generateIncrementingArray } from '@/app/utils';
import { useProjectsGrid } from '../../_hooks/useProjectsGrid';
import ProjectsGridNoResults from '../ProjectsGridNoResults/ProjectsGridNoResults';
import ProjectCard from '../ProjectCard/ProjectCard';
import IntersectionObserverWithCallback from '../IntersectionObserverWithCallback/IntersectionObserverWithCallback';
import ProjectCardSkeleton from '../ProjectCardSkeleton/ProjectCardSkeleton';
import DefaultBlurDataURL from '@/public/images/defaultBlurDataURL.png';

import styles from './ProjectsGrid.module.scss';

const INITIAL_LIST_SIZE = 10;

const skeletons = generateIncrementingArray(INITIAL_LIST_SIZE);

const ProjectsGrid = () => {
  const projects = useProjectStore((s) => s.projects);
  const { searchQuery, selectedCategoryId } = useProjectsPageState([
    'searchQuery',
    'selectedCategoryId',
  ]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { visibleProjects, shouldShowMoreProjects, increaseListSize } = useProjectsGrid(
    projects,
    selectedCategoryId,
    containerRef,
    searchQuery,
    INITIAL_LIST_SIZE
  );

  if (projects.length && !visibleProjects.length) {
    return <ProjectsGridNoResults />;
  }

  return (
    <section ref={containerRef} className={styles.projectsGrid}>
      {!projects.length
        ? skeletons.map((skeleton) => <ProjectCardSkeleton key={skeleton} />)
        : visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              blurDataURL={DefaultBlurDataURL.blurDataURL}
            />
          ))}

      {!!projects.length && (
        <IntersectionObserverWithCallback
          onIntersect={shouldShowMoreProjects ? increaseListSize : undefined}
        />
      )}
    </section>
  );
};

export default ProjectsGrid;
