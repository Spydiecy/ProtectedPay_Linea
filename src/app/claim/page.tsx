'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon, 
  InformationCircleIcon, 
  ArrowPathIcon,
  UserCircleIcon,
  ClockIcon,
  WalletIcon,
  HashtagIcon,
  ArrowDownIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '@/context/WalletContext'
import { 
  claimTransferByAddress, 
  claimTransferByUsername, 
  claimTransferById, 
  getPendingTransfers, 
  getTransferDetails 
} from '@/utils/contract'

const pageTransition = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
}

interface PendingTransfer {
  sender: string;
  amount: string;
  timestamp: Date;
  remarks: string;
  id: string;
}

export default function ClaimPage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([])
  const { signer, address } = useWallet()

  const fetchPendingTransfers = useCallback(async () => {
    if (!signer || !address) return;
    try {
      const transferIds = await getPendingTransfers(signer, address);
      const transfers = await Promise.all(
        transferIds.map(async (id: string) => {
          const details = await getTransferDetails(signer, id);
          return {
            ...details,
            id
          };
        })
      );
      setPendingTransfers(transfers);
    } catch (err) {
      console.error('Error fetching pending transfers:', err);
    }
  }, [signer, address]);

  useEffect(() => {
    fetchPendingTransfers();
  }, [fetchPendingTransfers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signer) {
      setError('Please connect your wallet first')
      return
    }
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (input.startsWith('0x') && input.length === 66) {
        await claimTransferById(signer, input)
      } else if (input.startsWith('0x')) {
        await claimTransferByAddress(signer, input)
      } else {
        await claimTransferByUsername(signer, input)
      }
      setSuccess('Transfer claimed successfully!')
      setInput('')
      fetchPendingTransfers() // Refresh the list after claiming
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to claim transfer. Please try again.')
      } else {
        setError('Failed to claim transfer. Please try again.')
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickClaim = async (transferId: string) => {
    if (!signer) return;
    setIsLoading(true)
    try {
      await claimTransferById(signer, transferId)
      setSuccess('Transfer claimed successfully!')
      fetchPendingTransfers()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to claim transfer')
      } else {
        setError('Failed to claim transfer')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-black to-green-950">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
      
      <motion.div 
        className="container mx-auto px-4 py-20 relative z-10"
        initial="initial"
        animate="animate"
        variants={pageTransition}
      >
        {/* Header Section */}
        <motion.div className="text-center mb-12">
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
            <ArrowDownIcon className="w-16 h-16 mx-auto text-green-400" />
          </motion.div>

          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Claim Your Funds
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Easily claim incoming transfers using address, username, or transfer ID
          </p>

          <div className="mt-8 flex justify-center gap-6 flex-wrap">
            <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 px-4 py-2 rounded-xl flex items-center space-x-2">
              <UserCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Use Username</span>
            </div>
            <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 px-4 py-2 rounded-xl flex items-center space-x-2">
              <WalletIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Use Address</span>
            </div>
            <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 px-4 py-2 rounded-xl flex items-center space-x-2">
              <HashtagIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Use Transfer ID</span>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Claim Form */}
            <motion.div variants={pageTransition}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl" />
                <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20">
                  <h2 className="text-xl font-semibold mb-6 text-green-400 flex items-center space-x-2">
                    <ArrowDownIcon className="w-5 h-5" />
                    <span>Claim by Identifier</span>
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block mb-2 text-green-400 font-medium">
                        Sender Identifier
                      </label>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                        placeholder="Address, username, or transfer ID"
                        required
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
                          {error}
                        </motion.div>
                      )}

                      {success && (
                        <motion.div
                          className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-5 h-5" />
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
                          <CheckCircleIcon className="w-5 h-5" />
                          <span>Claim Transfer</span>
                        </>
                      )}
                    </motion.button>

                    {!signer && (
                      <p className="text-center text-gray-400 text-sm">
                        Connect your wallet to claim transfers
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Pending Transfers */}
            <motion.div variants={pageTransition}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl" />
                <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-green-400 flex items-center space-x-2">
                      <ClockIcon className="w-5 h-5" />
                      <span>Pending Claims</span>
                    </h2>
                    <motion.button
                      onClick={fetchPendingTransfers}
                      className="bg-black/30 p-2 rounded-lg text-green-400 hover:text-green-300 backdrop-blur-xl border border-green-500/20"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {!signer ? (
                    <div className="text-center py-8 text-gray-400">
                      Connect wallet to view pending claims
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 styled-scrollbar">
                      <AnimatePresence mode="wait">
                        {pendingTransfers.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-8 text-gray-400"
                          >
                            No pending transfers found
                          </motion.div>
                        ) : (
                          pendingTransfers.map((transfer) => (
                            <motion.div
                              key={transfer.id}
                              className="relative group"
                              variants={fadeIn}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="relative bg-black/30 backdrop-blur-xl p-4 rounded-xl border border-green-500/10 group-hover:border-green-500/20 transition-colors duration-300">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="text-sm text-gray-400 mb-1">From: {transfer.sender}</div>
                                    <div className="text-green-400 font-semibold">{transfer.amount} KAIA</div>
                                  </div>
                                  <motion.button
                                    onClick={() => handleQuickClaim(transfer.id)}
                                    className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg font-medium hover:bg-green-500/20 transition-colors duration-200 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isLoading}
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>Quick Claim</span>
                                  </motion.button>
                                </div>
                                {transfer.remarks && (
                                  <div className="bg-black/20 p-2 rounded-lg text-sm text-gray-400 mb-2">
                                    {transfer.remarks}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 flex items-center space-x-2">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>{new Date(transfer.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Help Section */}
          <motion.div 
            className="mt-8"
            variants={pageTransition}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/5 rounded-2xl blur-xl" />
              <div className="relative bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20">
                <div className="flex items-start space-x-4">
                  <InformationCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-green-400 mb-2">How to Claim</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <li className="bg-black/20 p-3 rounded-xl text-gray-400 text-sm flex items-center space-x-2">
                          <UserCircleIcon className="w-5 h-5 text-green-400" />
                          <span>Enter sender&apos;s username</span>
                        </li>
                        <li className="bg-black/20 p-3 rounded-xl text-gray-400 text-sm flex items-center space-x-2">
                          <WalletIcon className="w-5 h-5 text-green-400" />
                          <span>Use wallet address</span>
                        </li>
                        <li className="bg-black/20 p-3 rounded-xl text-gray-400 text-sm flex items-center space-x-2">
                          <HashtagIcon className="w-5 h-5 text-green-400" />
                          <span>Input transfer ID</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Custom Scrollbar Styles */}
          <style jsx global>{`
            .styled-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .styled-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 3px;
            }
            .styled-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(16, 185, 129, 0.2);
              border-radius: 3px;
            }
            .styled-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(16, 185, 129, 0.4);
            }
          `}</style>

          {/* Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-green-500/10 via-transparent to-transparent blur-3xl transform rotate-12 animate-pulse" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-green-500/10 via-transparent to-transparent blur-3xl transform -rotate-12 animate-pulse delay-1000" />
          </div>

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
                  <p className="text-green-400 font-medium">Processing Claim...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success/Error Toast */}
          <AnimatePresence>
            {(success || error) && (
              <motion.div
                className="fixed bottom-8 right-8 max-w-md z-50"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`p-4 rounded-xl backdrop-blur-xl border ${
                    success
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {success ? (
                      <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p>{success || error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3 } 
  }
}
