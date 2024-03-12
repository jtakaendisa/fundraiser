'use client';

import { useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import Identicon from 'react-hooks-identicons';
import { FaEthereum } from 'react-icons/fa';

import {
  statusMap,
  useAccountStore,
  useModalStore,
  useProjectStore,
} from '@/app/store';
import { findDaysRemaining, truncateAccount } from '@/app/utils';
import EditProjectModal from '@/app/components/modals/EditProjectModal/EditProjectModal';
import DeleteProjectModal from '@/app/components/modals/DeleteProjectModal/DeleteProjectModal';
import BackProjectModal from '@/app/components/modals/BackProjectModal/BackProjectModal';
import ProgressBar from '@/app/components/ProgressBar/ProgressBar';
import Button from '@/app/components/Button/Button';
import { statusColorMap } from '@/app/components/Projects/Projects';

import styles from './ProjectDetails.module.scss';

const ProjectDetails = () => {
  const connectedAccount = useAccountStore((s) => s.connectedAccount);
  const project = useProjectStore((s) => s.project);
  const categories = useProjectStore((s) => s.categories);
  const backIsOpen = useModalStore((s) => s.backIsOpen);
  const editIsOpen = useModalStore((s) => s.editIsOpen);
  const deleteIsOpen = useModalStore((s) => s.deleteIsOpen);
  const setIsOpen = useModalStore((s) => s.setIsOpen);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    imageURLs,
    title,
    expiresAt,
    owner,
    backers,
    status,
    description,
    raised,
    cost,
    categoryId,
  } = project;

  if (!project) return null;

  return (
    <section className={styles.mainContainer}>
      {imageURLs?.length && (
        <div className={styles.imageGallery}>
          <div className={styles.imageLarge}>
            <Image
              src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${imageURLs[selectedImage]}`}
              alt={title}
              fill
              sizes="70vw"
              priority
            />
          </div>
          {imageURLs.length > 1 && (
            <div className={styles.imageRow}>
              {imageURLs.map((image, idx) => (
                <div
                  key={image}
                  className={classNames({
                    [styles.imageSmall]: true,
                    [styles.selected]: idx === selectedImage,
                  })}
                  onClick={() => setSelectedImage(idx)}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${image}`}
                    alt={title}
                    fill
                    sizes="10vw"
                    priority
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className={styles.info}>
        <h5>{title}</h5>
        <small>{findDaysRemaining(expiresAt)}</small>
        <small>{categories.find((category) => category.id === categoryId)?.name}</small>
        <div className={styles.row}>
          <div className={styles.backings}>
            <Identicon string={owner} size={15} />
            <small>{truncateAccount(owner, 4, 4)}</small>
            <small>{backers} Backings</small>
          </div>
          <small className={styles[statusColorMap[status]]}>{statusMap[status]}</small>
        </div>
        <p>{description}</p>
        <ProgressBar progress={(raised / cost) * 100} />
        <div className={styles.row}>
          <small>{raised} ETH Raised</small>
          <div className={styles.etherTarget}>
            <FaEthereum />
            <small>{cost} ETH</small>
          </div>
        </div>
        <div className={styles.buttons}>
          <Button onClick={() => setIsOpen('back')}>Back Project</Button>
          {connectedAccount === owner && (
            <>
              {status === 0 && (
                <Button color="gray" onClick={() => setIsOpen('edit')}>
                  Edit
                </Button>
              )}
              <Button color="red" onClick={() => setIsOpen('delete')}>
                Delete
              </Button>
              <Button color="orange">Payout</Button>
            </>
          )}
        </div>
      </div>
      {backIsOpen && <BackProjectModal project={project} />}
      {editIsOpen && <EditProjectModal project={project} />}
      {deleteIsOpen && <DeleteProjectModal project={project} />}
    </section>
  );
};

export default ProjectDetails;
