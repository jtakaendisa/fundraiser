'use client';

import { ethers } from 'ethers';
import { formatDistance } from 'date-fns';

import { Project, useAccountStore, useProjectStore } from '../store';
import { truncateAccount } from '../utils';
import contractAddress from '../abis/contractAddress.json';
import contractAbi from '../abis/app/contracts/BlockPledge.sol/BlockPledge.json';
import { AddFormInputs } from '../components/modals/AddProjectModal/AddProjectModal';
import { EditFormInputs } from '../components/modals/EditProjectModal/EditProjectModal';
import useEmail from './useEmail';
import { useCallback } from 'react';

const address = contractAddress.address;
const abi = contractAbi.abi;

const useBlockchain = () => {
  const { sendPaymentNotification } = useEmail();
  const connectedAccount = useAccountStore((s) => s.connectedAccount);
  const setConnectedAccount = useAccountStore((s) => s.setConnectedAccount);
  const setProjects = useProjectStore((s) => s.setProjects);
  const setProject = useProjectStore((s) => s.setProject);
  const setUserProjects = useProjectStore((s) => s.setUserProjects);
  const setStats = useProjectStore((s) => s.setStats);
  const setBackers = useProjectStore((s) => s.setBackers);
  const setCategories = useProjectStore((s) => s.setCategories);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length) {
        setConnectedAccount(accounts[0]);
      }
    } catch (error) {
      console.log((error as Error).message);
      throw new Error('No ethereum object.');
    }
  };

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(address, abi, signer);

    return contract;
  };

  const createProject = async ({
    title,
    description,
    imageURLs,
    cost,
    category,
    expiresAt,
  }: AddFormInputs) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return;

      const convertedCost = ethers.parseEther(cost);

      const tx = await contract.createProject(
        title,
        description,
        imageURLs,
        category,
        convertedCost,
        expiresAt
      );

      await tx.wait();
      await getProjects();
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const updateProject = async ({
    id,
    description,
    imageURLs,
  }: EditFormInputs & { id: number }) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return;

      const tx = await contract.updateProject(id, description, imageURLs);

      await tx.wait();
      await getProject(id!);
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const deleteProject = async (id: number, reason: string) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return;

      const tx = await contract.deleteProject(id, reason);

      await tx.wait();
      await getProject(id);
      await getBackers(id);
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const backProject = async (id: number, amount: string, comment: string) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return;

      const convertedAmount = ethers.parseEther(amount);

      const tx = await contract.backProject(id, comment, {
        from: connectedAccount,
        value: convertedAmount,
      });

      await tx.wait();
      await getProject(id);
      await getBackers(id);
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const acceptProject = async (id: number) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return;

      const tx = await contract.acceptProject(id);

      await tx.wait();
      await getProject(id);
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const rejectProject = async (id: number, reason: string) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return;

      const tx = await contract.rejectProject(id, reason);

      await tx.wait();
      await getProject(id);
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const getBackers = async (id: number) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return;

      const backers = await contract.getBackers(id);

      const formattedBackers = formatBackers(backers);

      if (backers.length) {
        setBackers(formattedBackers);
      }
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const getCategories = useCallback(async () => {
    try {
      const contract = await getContract();

      if (!contract) {
        throw new Error("Can't connect to smart contract");
      }

      const fetchedCategories = await contract.getCategories();
      const categories = formatCategories(fetchedCategories);

      return { categories };
    } catch (error) {
      console.error('Error loading categories:', (error as Error).message);
      throw error;
    }
  }, []);

  const getUserProjects = async (user: string) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return alert("Can't connect to smart contract");

      const userProjects = await contract.getUserProjects(user);

      const formattedUserProjects = userProjects
        .map((userProject: any) => formatProject(userProject))
        .reverse();

      if (userProjects.length) {
        setUserProjects(formattedUserProjects);
      }
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const formatProject = useCallback((project: any): Project => {
    return {
      id: Number(project[0]),
      owner: project[1].toLowerCase(),
      title: project[2],
      description: project[3],
      imageURLs: Array.from(project[4]) as string[],
      cost: Number(project[5]) / 10 ** 18,
      raised: Number(ethers.formatEther(project[6])),
      timestamp: new Date(Number(project[7])).getTime(),
      expiresAt: new Date(Number(project[8])).getTime(),
      backers: Number(project[9]),
      categoryId: Number(project[10]),
      status: Number(project[11]) as Project['status'],
      deletionReason: project[12],
      date: formatDate(Number(project[8]) * 1000),
    };
  }, []);

  const getProjects = useCallback(async () => {
    try {
      const contract = await getContract();

      if (!contract) {
        throw new Error("Can't connect to smart contract");
      }

      const fetchedProjects = await contract.getProjects();
      const fetchedStats = await contract.stats();

      const projects = fetchedProjects
        .map((project: any) => formatProject(project))
        .reverse();
      const stats = formatStats(fetchedStats);

      return { projects, stats };
    } catch (error) {
      console.error('Error loading projects:', (error as Error).message);
      throw error;
    }
  }, [formatProject]);

  const getProject = async (id: number) => {
    try {
      if (!window.ethereum) return alert('Please install Metamask');

      const contract = await getContract();

      if (!contract) return alert("Can't connect to smart contract");

      const project = await contract.getProject(id);

      const formattedProject = formatProject(project);

      if (formattedProject) {
        setProject(formattedProject);
      }
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const listenForProjectPayOut = async () => {
    const contract = await getContract();

    if (!contract) return;

    // contract.once('ProjectPaidOut', async (id, recipient, amount, timestamp) => {
    //   const formattedPayoutInfo = formatPayoutInfo(id, recipient, amount, timestamp);

    //   sendPaymentNotification(formattedPayoutInfo);
    // });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const month =
      date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatStats = (stats: any) => {
    return {
      totalProjects: Number(stats[0]),
      totalBackings: Number(stats[1]),
      totalDonations: Number(ethers.formatEther(stats[2])),
    };
  };

  const formatBackers = (backers: any[]) => {
    return backers
      .map((backer) => ({
        backer: truncateAccount(backer[0], 4, 4),
        contribution: Number(ethers.formatEther(backer[1])),
        timestamp: formatDistance(new Date(Number(backer[2]) * 1000), Date.now(), {
          addSuffix: true,
        }),
        comment: backer[3],
        refunded: backer[4],
      }))
      .reverse();
  };

  const formatCategories = (categories: any[]) => {
    return categories.map((category) => ({
      id: Number(category[0]),
      name: category[1],
    }));
  };

  const formatPayoutInfo = (id: any, recipient: any, amount: any, timestamp: any) => {
    return {
      id: Number(id),
      recipient,
      amount: Number(ethers.formatEther(amount)),
      timestamp: new Date(Number(timestamp) * 1000).toString(),
    };
  };

  return {
    connectWallet,
    getContract,
    createProject,
    updateProject,
    deleteProject,
    backProject,
    acceptProject,
    rejectProject,
    getProjects,
    getProject,
    getUserProjects,
    getBackers,
    getCategories,
    listenForProjectPayOut,
  };
};

export default useBlockchain;

// Declaration to tell TypeScript that 'ethereum' property exists on 'window'
declare global {
  interface Window {
    ethereum?: any;
  }
}
