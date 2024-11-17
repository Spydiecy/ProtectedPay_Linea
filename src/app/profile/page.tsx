'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, ClockIcon, CheckCircleIcon, 
  UsersIcon, BanknotesIcon, ArrowPathIcon,
  ArrowUpIcon, WalletIcon, ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '@/context/WalletContext';
import { 
  getUserProfile, registerUsername, getUserByAddress,
  getTransferDetails, getGroupPaymentDetails, getSavingsPotDetails 
} from '@/utils/contract';

// Animation Variants
const fadeIn = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
  }
};

const pageTransition = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

const containerAnimation = {
  initial: "initial",
  animate: "animate",
  variants: {
    animate: {
      transition: { staggerChildren: 0.1 }
    }
  }
};

const iconFloat = {
  initial: { y: 0 },
  animate: { 
    y: [-5, 5, -5], 
    transition: { 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const cardHover = {
  initial: { y: 0 },
  hover: { 
    y: -5,
    transition: { duration: 0.2 }
  }
};

// Interfaces
interface Transfer {
  sender: string;
  recipient: string;
  amount: string;
  timestamp: number;
  status: number;
  remarks: string;
}

interface GroupPayment {
  creator: string;
  recipient: string;
  totalAmount: string;
  amountPerPerson: string;
  numParticipants: number;
  amountCollected: string;
  timestamp: number;
  status: number;
  remarks: string;
}

interface SavingsPot {
  name: string;
  targetAmount: string;
  currentAmount: string;
  timestamp: number;
  status: number;
  remarks: string;
}

// Constants
const statusLabels: { [key: number]: string } = {
  0: 'Pending',
  1: 'Claimed/Completed',
  2: 'Refunded',
};

const statusColors: { [key: number]: string } = {
  0: 'bg-yellow-500/20 text-yellow-500',
  1: 'bg-green-500/20 text-green-500',
  2: 'bg-red-500/20 text-red-500',
};

const potStatusLabels: { [key: number]: string } = {
  0: 'Active',
  1: 'Broken',
};

const potStatusColors: { [key: number]: string } = {
  0: 'bg-green-500/20 text-green-500',
  1: 'bg-gray-500/20 text-gray-500',
};

// Main Component
export default function ProfilePage() {
  const { address, balance, signer } = useWallet();
  const [username, setUsername] = useState('');
  const [registeredUsername, setRegisteredUsername] = useState('');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [groupPayments, setGroupPayments] = useState<GroupPayment[]>([]);
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('transfers');

  const fetchUserData = useCallback(async () => {
    if (!signer || !address) return;
    try {
      const profile = await getUserProfile(signer, address);
      
      // Fetch transfers
      const transferPromises = profile.transferIds.map(async (id) => {
        const details = await getTransferDetails(signer, id);
        return {
          ...details,
          sender: details.sender,
          recipient: details.recipient,
          amount: details.amount,
          timestamp: Number(details.timestamp),
          status: details.status,
          remarks: details.remarks
        };
      });
      const transfers = await Promise.all(transferPromises);
      setTransfers(transfers);

      // Fetch group payments
      const groupPaymentPromises = profile.groupPaymentIds.map(async (id) => {
        const details = await getGroupPaymentDetails(signer, id);
        return {
          ...details,
          creator: details.creator,
          recipient: details.recipient,
          totalAmount: details.totalAmount,
          amountPerPerson: details.amountPerPerson,
          numParticipants: Number(details.numParticipants),
          amountCollected: details.amountCollected,
          timestamp: Number(details.timestamp),
          status: details.status,
          remarks: details.remarks
        };
      });
      const payments = await Promise.all(groupPaymentPromises);
      setGroupPayments(payments);

      // Fetch savings pots
      const savingsPotPromises = profile.savingsPotIds.map(async (id) => {
        const details = await getSavingsPotDetails(signer, id);
        return {
          ...details,
          name: details.name,
          targetAmount: details.targetAmount,
          currentAmount: details.currentAmount,
          timestamp: Number(details.timestamp),
          status: details.status,
          remarks: details.remarks
        };
      });
      const pots = await Promise.all(savingsPotPromises);
      setSavingsPots(pots);

    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  }, [signer, address]);

  const fetchUsername = useCallback(async () => {
    if (!signer || !address) return;
    try {
      const fetchedUsername = await getUserByAddress(signer, address);
      setRegisteredUsername(fetchedUsername);
    } catch (err) {
      console.error('Failed to fetch username:', err);
    }
  }, [signer, address]);

  useEffect(() => {
    if (signer && address) {
      fetchUserData();
      fetchUsername();
    }
  }, [signer, address, fetchUserData, fetchUsername]);

  const handleRegisterUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setError('Please connect your wallet first');
      return;
    }

    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await registerUsername(signer, username);
      setSuccess('Username registered successfully! 🎉');
      setRegisteredUsername(username);
      setUsername('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to register username. Please try again.');
      } else {
        setError('Failed to register username. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Components
  const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    text: string;
    count?: number;
  }> = ({ active, onClick, icon, text, count }) => (
    <motion.button
      onClick={onClick}
      className={`
        relative px-4 py-2 rounded-xl font-medium flex items-center space-x-2
        transition-all duration-300
        ${active 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black' 
          : 'bg-black/40 backdrop-blur-xl border border-green-500/20 text-gray-400 hover:text-white'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span>{text}</span>
      {count !== undefined && (
        <span className={`
          px-2 py-0.5 rounded-full text-sm
          ${active ? 'bg-black/20' : 'bg-green-500/20'}
        `}>
          {count}
        </span>
      )}
      {active && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-lg -z-10"
          layoutId="activeTabIndicator"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );

  // Stats Card Component
  const StatsCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    percentage?: number;
  }> = ({ icon, label, value, percentage }) => (
    <motion.div
      className="relative group"
      variants={cardHover}
      initial="initial"
      whileHover="hover"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-green-500/20 group-hover:border-green-500/40 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="text-green-400 p-2 bg-green-500/10 rounded-lg">
            {icon}
          </div>
          {percentage !== undefined && (
            <div className={`text-sm ${percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {percentage > 0 ? '+' : ''}{percentage}%
            </div>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  // Empty State Component
  interface EmptyStateProps {
    icon: React.ReactNode;
    message: string;
  }

  const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => (
    <motion.div
      className="text-center py-12"
      variants={fadeIn}
    >
      <div className="text-green-400/40 mb-4">{icon}</div>
      <p className="text-gray-400">{message}</p>
    </motion.div>
  );

  // Transfer Card Component
  interface TransferCardProps {
    transfer: Transfer;
    userAddress: string | null;
  }

  const TransferCard: React.FC<TransferCardProps> = ({ transfer, userAddress }) => (
    <motion.div
      className="relative group"
      variants={cardHover}
      initial="initial"
      whileHover="hover"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-black/30 backdrop-blur-xl p-4 rounded-xl border border-green-500/10 group-hover:border-green-500/20 transition-colors duration-300">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-400 mb-1">
              {transfer.sender === userAddress ? 'Sent to:' : 'Received from:'}
            </p>
            <p className="text-green-400">
              {transfer.sender === userAddress ? transfer.recipient : transfer.sender}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Amount</p>
            <p className="text-green-400 font-semibold">{transfer.amount} KAIA</p>
          </div>
        </div>
        {transfer.remarks && (
          <div className="bg-black/20 p-2 rounded-lg text-sm text-gray-400 mb-2">
            {transfer.remarks}
          </div>
        )}
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className={`px-2 py-1 rounded-full ${statusColors[transfer.status]}`}>
            {statusLabels[transfer.status]}
          </span>
          <span className="text-gray-500">
            {new Date(transfer.timestamp * 1000).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );

  // Group Payment Card Component
  interface GroupPaymentCardProps {
    payment: GroupPayment;
    userAddress: string | null;
  }

  const GroupPaymentCard: React.FC<GroupPaymentCardProps> = ({ payment, userAddress }) => {
    const progress = (Number(payment.amountCollected) / Number(payment.totalAmount)) * 100;

    return (
      <motion.div
        className="relative group"
        variants={cardHover}
        initial="initial"
        whileHover="hover"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative bg-black/30 backdrop-blur-xl p-4 rounded-xl border border-green-500/10 group-hover:border-green-500/20 transition-colors duration-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-green-400 font-semibold mb-1">
                {payment.creator === userAddress ? 'Created Group Payment' : 'Participating in Payment'}
              </p>
              <p className="text-sm text-gray-400">To: {payment.recipient}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Progress</p>
              <p className="text-green-400 font-semibold">
                {payment.amountCollected} / {payment.totalAmount} KAIA
              </p>
            </div>
          </div>

          <div className="w-full bg-black/50 rounded-full h-2 mb-3">
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
            <span>Per Person: {payment.amountPerPerson} KAIA</span>
            <span>{payment.numParticipants} participants</span>
          </div>

          {payment.remarks && (
            <div className="bg-black/20 p-2 rounded-lg text-sm text-gray-400 mb-2">
              {payment.remarks}
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className={`px-2 py-1 rounded-full ${statusColors[payment.status]}`}>
              {statusLabels[payment.status]}
            </span>
            <span className="text-gray-500">
              {new Date(payment.timestamp * 1000).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Savings Pot Card Component
  interface SavingsPotCardProps {
    pot: SavingsPot;
  }

const SavingsPotCard: React.FC<SavingsPotCardProps> = ({ pot }) => {
  const progress = (Number(pot.currentAmount) / Number(pot.targetAmount)) * 100;

  return (
    <motion.div
      className="relative group"
      variants={cardHover}
      initial="initial"
      whileHover="hover"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-black/30 backdrop-blur-xl p-4 rounded-xl border border-green-500/10 group-hover:border-green-500/20 transition-colors duration-300">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-green-400 font-semibold mb-1">{pot.name}</h3>
            <p className="text-sm text-gray-400">Target: {pot.targetAmount} KAIA</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Saved</p>
            <p className="text-green-400 font-semibold">{pot.currentAmount} KAIA</p>
          </div>
        </div>

        <div className="w-full bg-black/50 rounded-full h-2 mb-3">
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        {pot.remarks && (
          <div className="bg-black/20 p-2 rounded-lg text-sm text-gray-400 mb-2">
            {pot.remarks}
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span className={`px-2 py-1 rounded-full ${potStatusColors[pot.status]}`}>
            {potStatusLabels[pot.status]}
          </span>
          <span className="text-gray-500">
            Created {new Date(pot.timestamp * 1000).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-black to-green-950">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
      <motion.div 
        className="container mx-auto px-4 py-20 relative z-10"
        {...containerAnimation}
      >
        {/* Profile Header */}
        <motion.div className="text-center mb-12">
          <motion.div
            className="inline-block mb-6"
            variants={iconFloat}
            initial="initial"
            animate="animate"
          >
            <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-xl border border-green-500/10">
              <UserCircleIcon className="w-16 h-16 text-green-400" />
            </div>
          </motion.div>

          <motion.div className="space-y-4">
            <h1 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                Welcome, {registeredUsername || 'User'}
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Manage your profile and view your activity across ProtectedPay
            </p>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={pageTransition}
        >
          <StatsCard
            icon={<WalletIcon className="w-6 h-6" />}
            label="Current Balance"
            value={`${balance || '0'} KAIA`}
          />
          <StatsCard
            icon={<ArrowUpIcon className="w-6 h-6" />}
            label="Total Transfers"
            value={transfers.length.toString()}
            percentage={transfers.length > 0 ? 
              ((transfers.filter(t => t.timestamp > Date.now()/1000 - 86400).length / transfers.length) * 100) : 0
            }
          />
          <StatsCard
            icon={<UsersIcon className="w-6 h-6" />}
            label="Group Payments"
            value={groupPayments.length.toString()}
          />
          <StatsCard
            icon={<BanknotesIcon className="w-6 h-6" />}
            label="Active Savings"
            value={`${savingsPots.filter(pot => pot.status === 0).length} Pots`}
          />
        </motion.div>

        {/* Username Registration Section */}
        {!registeredUsername ? (
          <motion.div 
            className="max-w-xl mx-auto mb-12"
            variants={pageTransition}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20">
                <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                  <UserCircleIcon className="w-6 h-6 text-green-400" />
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Register Username
                  </span>
                </h2>

                <div className="bg-black/20 p-4 rounded-xl mb-6">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-400 text-sm">
                      Choose a unique username to make it easier for others to send you funds.
                      This cannot be changed later.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRegisterUsername} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-green-400 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="Enter desired username"
                      required
                      minLength={3}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div className="flex items-start space-x-3">
                          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div className="flex items-start space-x-3">
                          <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{success}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || !signer}
                  >
                    {isLoading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <UserCircleIcon className="w-5 h-5" />
                        <span>Register Username</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Activity History Section */}
        <motion.div variants={pageTransition}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <ClockIcon className="w-6 h-6 text-green-400" />
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Activity History
                  </span>
                </h2>
                <motion.button
                  onClick={fetchUserData}
                  className="bg-black/30 p-2 rounded-lg text-green-400 hover:text-green-300 backdrop-blur-xl border border-green-500/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <TabButton 
                  active={activeTab === 'transfers'} 
                  onClick={() => setActiveTab('transfers')}
                  icon={<ArrowUpIcon className="w-5 h-5" />}
                  text="Transfers"
                  count={transfers.length}
                />
                <TabButton 
                  active={activeTab === 'group-payments'} 
                  onClick={() => setActiveTab('group-payments')}
                  icon={<UsersIcon className="w-5 h-5" />}
                  text="Group Payments"
                  count={groupPayments.length}
                />
                <TabButton 
                  active={activeTab === 'savings-pots'} 
                  onClick={() => setActiveTab('savings-pots')}
                  icon={<BanknotesIcon className="w-5 h-5" />}
                  text="Savings Pots"
                  count={savingsPots.length}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Transfers Tab */}
                  {activeTab === 'transfers' && (
                    <>
                      {transfers.length === 0 ? (
                        <EmptyState
                          icon={<ArrowUpIcon className="w-12 h-12" />}
                          message="No transfers found"
                        />
                      ) : (
                        transfers.map((transfer, index) => (
                          <TransferCard
                            key={index}
                            transfer={transfer}
                            userAddress={address}
                          />
                        ))
                      )}
                    </>
                  )}

                  {/* Group Payments Tab */}
                  {activeTab === 'group-payments' && (
                    <>
                      {groupPayments.length === 0 ? (
                        <EmptyState
                          icon={<UsersIcon className="w-12 h-12" />}
                          message="No group payments found"
                        />
                      ) : (
                        groupPayments.map((payment, index) => (
                          <GroupPaymentCard
                            key={index}
                            payment={payment}
                            userAddress={address}
                          />
                        ))
                      )}
                    </>
                  )}

                  {/* Savings Pots Tab */}
                  {activeTab === 'savings-pots' && (
                    <>
                      {savingsPots.length === 0 ? (
                        <EmptyState
                          icon={<BanknotesIcon className="w-12 h-12" />}
                          message="No savings pots found"
                        />
                      ) : (
                        savingsPots.map((pot, index) => (
                          <SavingsPotCard
                            key={index}
                            pot={pot}
                          />
                        ))
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black/80 p-6 rounded-2xl border border-green-500/20 flex flex-col items-center space-y-4">
              <ArrowPathIcon className="w-8 h-8 text-green-400 animate-spin" />
              <p className="text-green-400 font-medium">Processing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}