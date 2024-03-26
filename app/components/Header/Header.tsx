'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from 'firebase/auth';
import classNames from 'classnames';

import { useAccountStore, useProjectStore } from '@/app/store';
import {
  authStateChangeListener,
  formatAuthUserData,
  signOutAuthUser,
} from '@/app/services/authService';
import useBlockchain from '@/app/hooks/useBlockchain';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Button from '../Button/Button';
import Coin from '../categories/icons/Coin';

import styles from './Header.module.scss';

interface Props {
  refreshAuthUserData?: boolean;
}

const PATHS = {
  home: '/',
  projects: '/projects',
  userDashboard: '/user_dashboard',
  adminDashboard: '/admin_dashboard',
};

const Header = ({ refreshAuthUserData }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const connectedAccount = useAccountStore((s) => s.connectedAccount);
  const authUser = useAccountStore((s) => s.authUser);
  const setConnectedAccount = useAccountStore((s) => s.setConnectedAccount);
  const setAuthUser = useAccountStore((s) => s.setAuthUser);
  const setProjects = useProjectStore((s) => s.setProjects);
  const setStats = useProjectStore((s) => s.setStats);
  const setCategories = useProjectStore((s) => s.setCategories);
  const setSelectedCategory = useProjectStore((s) => s.setSelectedCategory);
  const { connectWallet, getProjects, getCategories, listenForEvents } =
    useBlockchain();
  const [refreshUi, setRefreshUi] = useState(false);

  const isAdmin = authUser?.uid === process.env.NEXT_PUBLIC_ADMIN_UID;

  const handleWalletConnection = useCallback(async () => {
    if (!window?.ethereum) return;

    const { accounts } = await connectWallet();

    if (accounts.length) {
      setConnectedAccount(accounts[0]);
    }
  }, [connectWallet, setConnectedAccount]);

  useEffect(() => {
    const handleChainChange = () => {
      window.location.reload();
    };

    handleWalletConnection();

    window.ethereum.on('accountsChanged', handleWalletConnection);
    window.ethereum.on('chainChanged', handleChainChange);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleWalletConnection);
      window.ethereum.removeListener('chainChanged', handleChainChange);
    };
  }, [handleWalletConnection]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { projects, stats } = await getProjects();
        const { categories } = await getCategories();

        setProjects(projects);
        setStats(stats);
        setCategories(categories);
      } catch (error) {
        console.log((error as Error).message);
      }
    };

    fetchData();
  }, [refreshUi, getProjects, getCategories, setProjects, setStats, setCategories]);

  useEffect(() => {
    const unsubscribe = authStateChangeListener(async (user: User) => {
      const formattedAuthUser = await formatAuthUserData(user);
      setAuthUser(formattedAuthUser);
    });

    return unsubscribe;
  }, [refreshAuthUserData, setAuthUser]);

  useEffect(() => {
    const unsubscribe = listenForEvents(() => setRefreshUi((prev) => !prev));

    return () => {
      unsubscribe.then((cleanup) => cleanup());
    };
  }, [listenForEvents]);

  console.log('header');

  return (
    <header className={styles.header}>
      <Link href={PATHS.home} className={styles.homeIcon}>
        <span>BlockPledge</span>
        <Coin />
      </Link>
      <li className={styles.navLinks}>
        <ul
          className={classNames({
            [styles.navLink]: true,
            [styles.selected]: PATHS.projects === pathname,
          })}
        >
          <Link href={PATHS.projects} onClick={() => setSelectedCategory(null)}>
            Explore Projects
          </Link>
        </ul>
        {authUser && !isAdmin && (
          <ul
            className={classNames({
              [styles.navLink]: true,
              [styles.selected]: PATHS.userDashboard === pathname,
            })}
          >
            <Link href={PATHS.userDashboard} onClick={() => setSelectedCategory(null)}>
              My Dashboard
            </Link>
          </ul>
        )}
        {isAdmin && (
          <ul
            className={classNames({
              [styles.navLink]: true,
              [styles.selected]: PATHS.adminDashboard === pathname,
            })}
          >
            <Link href={PATHS.adminDashboard} onClick={() => setSelectedCategory(null)}>
              Admin Dashboard
            </Link>
          </ul>
        )}
        {authUser ? (
          <ul className={styles.profileContainer}>
            <DropdownMenu
              authUser={authUser}
              connectedAccount={connectedAccount}
              onConnectWallet={handleWalletConnection}
              onSignOut={signOutAuthUser}
            />
          </ul>
        ) : (
          <ul>
            <Button inverted onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          </ul>
        )}
      </li>
    </header>
  );
};

export default Header;
