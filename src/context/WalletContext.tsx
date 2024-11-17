'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Define a type for the Ethereum object to remove any
interface Ethereum {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: () => void) => void;
  removeListener: (event: string, callback: () => void) => void;
}

// Declare the ethereum property on the window object
declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

interface WalletContextType {
  address: string | null;
  balance: string | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Check if we're on the correct network (Taiko testnet)
        const network = await provider.getNetwork();
        if (network.chainId !== 1001) { // Taiko testnet chain ID
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x3E9' }], // 1001 in hexadecimal
            });
          } catch (switchError) {
            // Ensure switchError is an object with a code property
            if (typeof switchError === 'object' && switchError !== null && 'code' in switchError) {
              const { code } = switchError as { code: number }; // Type assertion
              // This error code indicates that the chain has not been added to MetaMask
              if (code === 4902) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x3E9',
                    chainName: 'Taiko Testnet',
                    nativeCurrency: {
                      name: 'KAIA',
                      symbol: 'KAIA',
                      decimals: 18
                    },
                    rpcUrls: ['https://kaia-kairos.blockpi.network/v1/rpc/public/'],
                    blockExplorerUrls: ['https://kairos.kaiascope.com/']
                  }],
                });
              } else {
                console.error('Failed to switch network:', switchError);
              }
            } else {
              console.error('Unexpected error switching network:', switchError);
            }
          }
        }
        
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = ethers.utils.formatEther(await provider.getBalance(address));
        
        setAddress(address);
        setBalance(balance);
        setSigner(signer);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
    setSigner(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        disconnectWallet();
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', disconnectWallet);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ address, balance, signer, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
