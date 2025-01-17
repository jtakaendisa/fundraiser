import { AnimatePresence } from 'framer-motion';

import { Project } from '@/app/entities';
import AuthorizeProjectModal from '@/app/components/modals/AuthorizeProjectModal/AuthorizeProjectModal';
import BackProjectModal from '@/app/components/modals/BackProjectModal/BackProjectModal';
import EditProjectModal from '@/app/components/modals/EditProjectModal/EditProjectModal';
import DeleteProjectModal from '@/app/components/modals/DeleteProjectModal/DeleteProjectModal';

interface Props {
  project: Project;
  isAuthorizeProjectModalOpen: boolean;
  isBackProjectModalOpen: boolean;
  isEditProjectModalOpen: boolean;
  isDeleteProjectModalOpen: boolean;
  onAuthorizeProject: () => void;
  onBackProject: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

const ProjectDetailsContentModals = ({
  project,
  isAuthorizeProjectModalOpen,
  isBackProjectModalOpen,
  isEditProjectModalOpen,
  isDeleteProjectModalOpen,
  onAuthorizeProject,
  onBackProject,
  onEditProject,
  onDeleteProject,
}: Props) => {
  return (
    <AnimatePresence>
      {isAuthorizeProjectModalOpen && (
        <AuthorizeProjectModal projectId={project.id} onClose={onAuthorizeProject} />
      )}

      {isBackProjectModalOpen && (
        <BackProjectModal projectId={project.id} onClose={onBackProject} />
      )}

      {isEditProjectModalOpen && (
        <EditProjectModal project={project} onClose={onEditProject} />
      )}

      {isDeleteProjectModalOpen && (
        <DeleteProjectModal projectId={project.id} onClose={onDeleteProject} />
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailsContentModals;
