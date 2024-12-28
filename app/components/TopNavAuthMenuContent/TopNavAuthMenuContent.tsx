import { colors } from '@/app/constants';
import { AuthUser } from '@/app/store';
import { truncateAccount } from '@/app/utils';

import TopNavAuthMenuContentItem from '../TopNavAuthMenuContentItem/TopNavAuthMenuContentItem';
import FlipButton from '../FlipButton/FlipButton';
import Envelope from '../icons/Envelope';
import Wallet from '../icons/Wallet';

import styles from './TopNavAuthMenuContent.module.scss';

interface Props {
  authUser: AuthUser;
  connectedAccount: string;
  onSignOut: () => void;
}

const { whiteSolid } = colors;

const TopNavAuthMenuContent = ({ authUser, connectedAccount, onSignOut }: Props) => {
  const contentItems = [
    {
      label: authUser.email!,
      icon: <Envelope size={28} />,
    },
    {
      label: truncateAccount(connectedAccount, 4, 4),
      icon: <Wallet size={28} />,
    },
  ];

  return (
    <div className={styles.authMenuContent}>
      {contentItems.map(({ label, icon }) => (
        <TopNavAuthMenuContentItem key={label} label={label} icon={icon} />
      ))}

      <div className={styles.buttonContainer}>
        <FlipButton onClick={onSignOut} scale={0.8} backgroundColor1={whiteSolid}>
          Sign Out
        </FlipButton>
      </div>
    </div>
  );
};

export default TopNavAuthMenuContent;
