import React, { useState, useRef, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { SetupParams, WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { signIn, signOut, signedAccountId, callFunction } = useWalletSelector();

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        if (signedAccountId) {
          setWalletAddress(signedAccountId);
          setIsConnected(true);
        } else {
          setIsConnected(false);
          setWalletAddress('');
        }
      } catch (error) {
        console.error('Failed to fetch wallet address:', error);
      }
    };

    fetchWalletAddress();
  }, [signedAccountId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const connectWallet = async () => {
    try {
      signIn();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = async () => {
    try {
      await signOut();      
      setIsConnected(false);
      setWalletAddress('');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsDropdownOpen(false);
    
    // Toast notification at bottom right
    const notification = document.createElement('div');
    notification.textContent = 'Address copied!';
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>
      ) : (
        <>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 bg-white border border-gray-200 hover:border-purple-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {walletAddress.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium">{truncateAddress(walletAddress)}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <p className="text-xs font-mono text-gray-800 break-all">{walletAddress}</p>
              </div>
              
              <button
                onClick={copyAddress}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-150 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Address</span>
              </button>

              <button
                onClick={disconnectWallet}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center space-x-2 border-t border-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

