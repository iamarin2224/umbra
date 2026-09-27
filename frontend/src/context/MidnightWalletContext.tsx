import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { InitialAPI, ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

export interface MidnightProvider {
  getAddress: () => Promise<string>;
  getConfiguration: () => Promise<Configuration>;
  getShieldedAddresses: () => Promise<{
    shieldedAddress: string;
    shieldedCoinPublicKey: string;
    shieldedEncryptionPublicKey: string;
  }>;
  getUnshieldedAddress: () => Promise<{ unshieldedAddress: string }>;
  networkId: string;
}

export interface MidnightWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  shortAddress: string | null;
  networkId: string;
  provider: MidnightProvider | null;
  error: string | null;
  availableWallets: Array<{ id: string; name: string; icon: string; apiVersion: string }>;
  connect: (walletId?: string) => Promise<void>;
  disconnect: () => void;
}

const MidnightWalletContext = createContext<MidnightWalletState | null>(null);

export function useMidnightWallet(): MidnightWalletState {
  const context = useContext(MidnightWalletContext);
  if (!context) {
    throw new Error('useMidnightWallet must be used within MidnightWalletProvider');
  }
  return context;
}

const STORAGE_KEY = 'umbra_wallet_connected';
const STORAGE_ADDRESS_KEY = 'umbra_wallet_address';
const STORAGE_WALLET_ID_KEY = 'umbra_wallet_id';
const NETWORK_ID = (import.meta.env.VITE_MIDNIGHT_NETWORK || 'preprod') as string;

function getAvailableWallets(): Array<{ id: string; api: InitialAPI }> {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.entries(window.midnight)
    .filter(([, api]) => api && typeof api.connect === 'function')
    .map(([id, api]) => ({ id, api }));
}

function getMidnightWallets(): Array<{ id: string; name: string; icon: string; apiVersion: string }> {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.entries(window.midnight)
    .filter(([, api]) => api && typeof api.connect === 'function')
    .map(([id, api]) => ({
      id,
      name: api.name || id,
      icon: api.icon || '',
      apiVersion: api.apiVersion || '',
    }));
}

export function MidnightWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      return localStorage.getItem(STORAGE_ADDRESS_KEY);
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<Array<{ id: string; name: string; icon: string; apiVersion: string }>>([]);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);

  // Scan for available Midnight / Lace wallets
  useEffect(() => {
    const scan = () => {
      setAvailableWallets(getMidnightWallets());
    };
    scan();
    const interval = setInterval(scan, 3000);
    return () => clearInterval(interval);
  }, []);

  // Clear stale wallet state if browser reloaded without an injected provider
  useEffect(() => {
    if (isConnected && !connectedApi && availableWallets.length === 0) {
      setIsConnected(false);
      setAddress(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_ADDRESS_KEY);
      localStorage.removeItem(STORAGE_WALLET_ID_KEY);
    }
  }, [isConnected, connectedApi, availableWallets]);

  const shortAddress = address
    ? `${address.slice(0, 11)}...${address.slice(-6)}`
    : null;

  const connect = useCallback(async (walletId?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('[Umbra-Wallet] Initializing wallet connection...');

      if (typeof window === 'undefined' || !window.midnight || Object.keys(window.midnight).length === 0) {
        throw new Error(
          'No Midnight wallet extension detected. Install and unlock 1am (or another Midnight DApp connector) to continue.',
        );
      }

      const wallets = getAvailableWallets();
      if (wallets.length === 0) {
        throw new Error('No compatible Midnight DApp connector found. Please ensure 1am is unlocked.');
      }

      let selected = wallets[0];
      if (walletId) {
        const found = wallets.find((w) => w.id === walletId);
        if (found) selected = found;
      }

      console.log(`[Umbra-Wallet] Connecting to ${selected.id} on network '${NETWORK_ID}'...`);
      const api = await selected.api.connect(NETWORK_ID);

      let walletAddress: string;
      try {
        const unshielded = await api.getUnshieldedAddress();
        walletAddress = unshielded.unshieldedAddress;
      } catch (err) {
        console.warn('[Umbra-Wallet] Unshielded address lookup failed, falling back to shielded:', err);
        const shielded = await api.getShieldedAddresses();
        walletAddress = shielded.shieldedAddress;
      }

      setConnectedApi(api);
      setAddress(walletAddress);
      setIsConnected(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_ADDRESS_KEY, walletAddress);
      localStorage.setItem(STORAGE_WALLET_ID_KEY, selected.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      console.error('[Umbra-Wallet] Connection error:', message);
      setError(message);
      setIsConnected(false);
      setAddress(null);
      setConnectedApi(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_ADDRESS_KEY);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setConnectedApi(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_ADDRESS_KEY);
    localStorage.removeItem(STORAGE_WALLET_ID_KEY);
  }, []);

  const provider: MidnightProvider | null = isConnected && connectedApi
    ? {
        getAddress: async () => {
          try {
            const unshielded = await connectedApi.getUnshieldedAddress();
            return unshielded.unshieldedAddress;
          } catch {
            const shielded = await connectedApi.getShieldedAddresses();
            return shielded.shieldedAddress;
          }
        },
        getConfiguration: () => connectedApi.getConfiguration(),
        getShieldedAddresses: () => connectedApi.getShieldedAddresses(),
        getUnshieldedAddress: () => connectedApi.getUnshieldedAddress(),
        networkId: NETWORK_ID,
      }
    : null;

  return (
    <MidnightWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        shortAddress,
        networkId: NETWORK_ID,
        provider,
        error,
        availableWallets,
        connect,
        disconnect,
      }}
    >
      {children}
    </MidnightWalletContext.Provider>
  );
}
