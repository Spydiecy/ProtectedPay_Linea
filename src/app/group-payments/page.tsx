'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UsersIcon, 
  PlusCircleIcon, 
  ArrowPathIcon,
  UserPlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '@/context/WalletContext'
import { 
  createGroupPayment,
  contributeToGroupPayment,
  getGroupPaymentDetails,
  getUserProfile
} from '@/utils/contract'
import type { GroupPayment, RawContractPayment } from '@/types/interfaces'
import { LoadingSpinner } from '@/components/Loading'
import { 
  formatAmount,
  truncateAddress,
  handleError
} from '@/utils/helpers'

const toastAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const containerAnimation = {
  initial: "initial",
  animate: "animate",
  exit: "exit",
  variants: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.15 }
    },
    exit: {
      opacity: 0,
      transition: { when: "afterChildren", staggerChildren: 0.1 }
    }
  }
}

const itemAnimation = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

const formatPayment = (payment: RawContractPayment, id: string): GroupPayment => ({
  id,
  paymentId: id,
  creator: payment.creator,
  recipient: payment.recipient,
  totalAmount: payment.totalAmount,
  amountPerPerson: payment.amountPerPerson,
  numParticipants: Number(payment.numParticipants),
  amountCollected: payment.amountCollected,
  timestamp: Math.floor(Number(payment.timestamp)),
  status: Number(payment.status),
  remarks: payment.remarks
});

export default function GroupPaymentsPage() {
  const { address, signer } = useWallet()
  const [activeTab, setActiveTab] = useState('create')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [participants, setParticipants] = useState('')
  const [remarks, setRemarks] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [myGroupPayments, setMyGroupPayments] = useState<GroupPayment[]>([])
  const [availablePayments, setAvailablePayments] = useState<GroupPayment[]>([])
  const [paymentId, setPaymentId] = useState('')

  const fetchGroupPayments = useCallback(async () => {
    if (!signer || !address) return;
    setIsFetching(true);
    try {
      const profile = await getUserProfile(signer, address);
      
      // Fetch created group payments
      const paymentPromises = profile.groupPaymentIds.map(async (id) => {
        const payment = await getGroupPaymentDetails(signer, id);
        return formatPayment(payment as RawContractPayment, id);
      });
      const payments = await Promise.all(paymentPromises);
      setMyGroupPayments(payments);

      // Fetch participating payments
      const participatingPromises = profile.participatedGroupPayments.map(async (id) => {
        const payment = await getGroupPaymentDetails(signer, id);
        return formatPayment(payment as RawContractPayment, id);
      });
      const participatingPayments = await Promise.all(participatingPromises);
      setAvailablePayments(participatingPayments);
    } catch (err) {
      console.error('Failed to fetch group payments:', err);
      setError(handleError(err));
    } finally {
      setIsFetching(false);
    }
  }, [signer, address]);

  useEffect(() => {
      fetchGroupPayments();
  }, [fetchGroupPayments]);
  
  const resetForm = () => {
    setRecipient('')
    setAmount('')
    setParticipants('')
    setRemarks('')
    setError('')
    setSuccess('')
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signer) {
      setError('Please connect your wallet first')
      return
    }

    if (!recipient || !amount || !participants || !remarks) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const numParticipants = parseInt(participants)
      await createGroupPayment(
        signer,
        recipient,
        numParticipants,
        amount,
        remarks
      )
      setSuccess('Group payment created successfully!')
      resetForm()
      fetchGroupPayments()
    } catch (err) {
      setError(handleError(err))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContribute = async (paymentId: string, amount: string) => {
    if (!signer) return
    setIsLoading(true)
    try {
      await contributeToGroupPayment(signer, paymentId, amount)
      setSuccess('Contribution successful!')
      fetchGroupPayments()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-black to-green-950">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
      
      <motion.div 
        className="container mx-auto px-4 py-20 relative z-10"
        {...containerAnimation}
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16 relative"
          variants={itemAnimation}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(16, 185, 129, 0.2)",
                "0 0 60px rgba(16, 185, 129, 0.4)",
                "0 0 20px rgba(16, 185, 129, 0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6 bg-black/30 p-6 rounded-2xl backdrop-blur-xl border border-green-500/10"
          >
            <UsersIcon className="w-16 h-16 mx-auto text-green-400" />
          </motion.div>
          <h1 className="text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 text-transparent bg-clip-text">
              Group Payments
            </span>
            <motion.span
              className="absolute -top-2 -right-2 text-2xl"
              animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Simplify shared expenses with secure group payments on the blockchain
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="flex justify-center space-x-6 mb-12"
          variants={itemAnimation}
        >
          <TabButton
            isActive={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
            icon={<PlusCircleIcon className="w-5 h-5" />}
            text="Create New Payment"
          />
          <TabButton
            isActive={activeTab === 'contribute'}
            onClick={() => setActiveTab('contribute')}
            icon={<UserPlusIcon className="w-5 h-5" />}
            text="Contribute to Payment"
            count={availablePayments.length}
          />
          <TabButton
            isActive={activeTab === 'my-payments'}
            onClick={() => setActiveTab('my-payments')}
            icon={<UsersIcon className="w-5 h-5" />}
            text="My Payments"
            count={myGroupPayments.length}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div 
            className="container mx-auto px-4 py-20 relative z-10"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { when: "beforeChildren", staggerChildren: 0.15 }
              }
            }}
          >
              <div className="max-w-xl mx-auto bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20">
                <h2 className="text-2xl font-bold mb-6 text-green-400">Create Group Payment</h2>
                <form onSubmit={handleCreatePayment} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-green-400">Recipient Address</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-green-400">Total Amount (KAIA)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="0.0"
                      step="0.000000000000000001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-green-400">Number of Participants</label>
                    <input
                      type="number"
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="2"
                      min="2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-green-400">Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="What's this payment for?"
                      rows={3}
                      required
                    />
                  </div>

                  {error && (
                    <motion.div 
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div 
                      className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {success}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all duration-200"
                    disabled={isLoading || !signer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Creating Payment...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Create Group Payment</span>
                      </>
                    )}
                  </motion.button>

                  {!signer && (
                    <p className="text-center text-gray-400 text-sm">
                      Connect your wallet to create group payments
                    </p>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'contribute' && (
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { when: "beforeChildren", staggerChildren: 0.15 }
                }
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="max-w-xl mx-auto">
                {/* Contribute Form */}
                <motion.div 
                  className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20 mb-12"
                  variants={itemAnimation}
                >
                  <h2 className="text-2xl font-bold mb-6 text-green-400">Contribute to Group Payment</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (paymentId) handleContribute(paymentId, amount);
                  }} className="space-y-6">
                    <div>
                      <label className="block mb-2 text-green-400">Payment ID</label>
                      <input
                        type="text"
                        value={paymentId}
                        onChange={(e) => setPaymentId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                        placeholder="Enter group payment ID"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-green-400">Amount (KAIA)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                        placeholder="0.0"
                        step="0.000000000000000001"
                        required
                      />
                    </div>

                    {error && (
                      <motion.div 
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div 
                        className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {success}
                      </motion.div>
                    )}

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
                          <span>Contributing...</span>
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-5 h-5" />
                          <span>Contribute to Payment</span>
                        </>
                      )}
                    </motion.button>

                    {!signer && (
                      <p className="text-center text-gray-400 text-sm">
                        Connect your wallet to contribute to group payments
                      </p>
                    )}
                  </form>
                </motion.div>

                {/* Available Payments Section */}
                <motion.div variants={itemAnimation}>
                  <h3 className="text-xl font-semibold text-green-400 mb-4">Payments Contributed To</h3>
                  {isFetching ? (
                    <LoadingSpinner />
                  ) : availablePayments.length === 0 ? (
                    <motion.div 
                      className="text-center bg-black/40 backdrop-blur-xl p-12 rounded-2xl border border-green-500/20"
                      variants={itemAnimation}
                    >
                      <UserPlusIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No Available Payments</h3>
                      <p className="text-gray-500">You haven&apos;t been invited to any group payments yet.</p>
                    </motion.div>
                  ) : (
                    <div className="grid gap-6">
                      {availablePayments.map((payment) => (
                        <PaymentCard
                          key={payment.id}
                          payment={payment}
                          onContribute={handleContribute}
                          isLoading={isLoading}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'my-payments' && (
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { when: "beforeChildren", staggerChildren: 0.15 }
                }
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {isFetching ? (
                <LoadingSpinner />
              ) : myGroupPayments.length === 0 ? (
                <motion.div 
                  className="text-center bg-black/40 backdrop-blur-xl p-12 rounded-2xl border border-green-500/20"
                  variants={itemAnimation}
                >
                  <UsersIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Created Payments</h3>
                  <p className="text-gray-500">You haven&apos;t created any group payments yet.</p>
                </motion.div>
              ) : (
                <div className="grid gap-6">
                  {myGroupPayments.map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      isCreator
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, icon, text, count }) => (
  <motion.button
    onClick={onClick}
    className={`
      relative px-6 py-3 rounded-xl font-medium
      transition-all duration-300 ease-out
      ${isActive 
        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/25' 
        : 'bg-black/40 backdrop-blur-xl border border-green-500/20 text-white hover:border-green-500/40'
      }
    `}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center space-x-2">
      {icon}
      <span>{text}</span>
      {count !== undefined && (
        <motion.span 
          className={`
            px-2 py-0.5 rounded-full text-xs
            ${isActive ? 'bg-black/20' : 'bg-green-500/20'}
          `}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {count}
        </motion.span>
      )}
    </div>
    {isActive && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl -z-10"
        layoutId="activeTab"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </motion.button>
);

interface PaymentCardProps {
  payment: GroupPayment;
  onContribute?: (id: string, amount: string) => void;
  isCreator?: boolean;
  isLoading: boolean;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ 
  payment, 
  onContribute, 
  isCreator = false, 
  isLoading 
}) => {
  const [showCopyToast, setShowCopyToast] = useState(false);
  const progress = (Number(payment.amountCollected) / Number(payment.totalAmount)) * 100;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(payment.id);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000); // Hide after 2 seconds
    } catch (err) {
      console.error('Failed to copy ID:', err);
    }
  };

  return (
    <motion.div 
      className="relative group"
      variants={itemAnimation}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20 group-hover:border-green-500/40 transition-all duration-300">
        {/* Payment ID Section */}
        <div className="mb-6 p-4 rounded-xl bg-black/30 border border-green-500/20 relative">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">Payment ID</div>
            <motion.button
              onClick={handleCopyId}
              className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Copy ID</span>
            </motion.button>
          </div>
          <div className="mt-1 font-mono text-green-400 break-all">{payment.id}</div>
          {isCreator && (
            <div className="mt-2 text-xs text-gray-400">
              Share this ID with participants to let them contribute
            </div>
          )}

          {/* Copy Success Toast */}
          <AnimatePresence>
            {showCopyToast && (
              <motion.div
                className="absolute top-0 right-0 transform -translate-y-full -translate-x-1/2 mt-4"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={toastAnimation}
              >
                <div className="bg-green-500 text-black px-4 py-2 rounded-xl shadow-xl flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">ID Copied!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-1">{isCreator ? 'Created Payment' : 'Available Payment'}</h3>
            <p className="text-gray-400 text-sm flex items-center space-x-2">
              <span>For: {truncateAddress(payment.recipient)}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-gray-500" />
              <span>{new Date(payment.timestamp * 1000).toLocaleString()}</span>
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            payment.status === 0 
              ? 'bg-yellow-500/20 text-yellow-400' 
              : payment.status === 1
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {payment.status === 0 ? 'Pending' : payment.status === 1 ? 'Completed' : 'Cancelled'}
          </span>
        </div>

        <div className="mb-6">
          <div className="h-3 bg-black/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-400">{Math.round(progress)}% funded</span>
            <span className="text-green-400 font-medium">
              {formatAmount(payment.amountCollected)} / {formatAmount(payment.totalAmount)} KAIA
            </span>
          </div>
        </div>

        {payment.remarks && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
            <p className="text-gray-400 text-sm">{payment.remarks}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          {!isCreator && onContribute && payment.status === 0 && (
            <motion.button
              onClick={() => onContribute(payment.id, payment.amountPerPerson)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Contribute {formatAmount(payment.amountPerPerson)} KAIA</span>
                </>
              )}
            </motion.button>
          )}
          <div className="text-sm text-gray-400">
            {payment.numParticipants} participants
          </div>
        </div>
      </div>
    </motion.div>
  );
};