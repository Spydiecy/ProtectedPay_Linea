'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRightIcon, 
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
  WalletIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '@/context/WalletContext'
import { sendToAddress, sendToUsername } from '@/utils/contract'

const pageTransition = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
}

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
}

export default function TransferPage() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signer, address } = useWallet()

  const validateForm = () => {
    if (!recipient) return 'Recipient is required'
    if (!amount || parseFloat(amount) <= 0) return 'Valid amount is required'
    if (!remarks) return 'Please add a remark for the transfer'
    if (parseFloat(amount) > 1000000) return 'Amount exceeds maximum limit'
    return null
  }

  const resetForm = () => {
    setRecipient('')
    setAmount('')
    setRemarks('')
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signer || !address) {
      setError('Please connect your wallet first')
      return
    }

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (recipient.startsWith('0x')) {
        await sendToAddress(signer, recipient, amount, remarks)
      } else {
        await sendToUsername(signer, recipient, amount, remarks)
      }
      
      setSuccess('Transfer initiated successfully!')
      resetForm()
    } catch (err: unknown) {
      console.error('Transfer error:', err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to initiate transfer. Please try again.')
      } else {
        setError('Failed to initiate transfer. Please try again.')
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
            className="inline-block mb-6"
            variants={iconFloat}
            initial="initial"
            animate="animate"
          >
            <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-xl border border-green-500/10">
              <ArrowRightIcon className="w-16 h-16 text-green-400" />
            </div>
          </motion.div>

          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Transfer Funds
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Send funds securely to any address or username on the Taiko network
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-xl mx-auto">
          {/* Tips Card */}
          <motion.div 
            className="mb-8"
            variants={pageTransition}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20">
                <div className="flex items-start space-x-4">
                  <InformationCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      You can send funds to:
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <WalletIcon className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">Address (0x...)</span>
                      </div>
                      <span className="text-gray-600">or</span>
                      <div className="flex items-center space-x-2">
                        <UserCircleIcon className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">Username</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div variants={pageTransition}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl" />
              <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-green-400 font-medium">Recipient</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="0x... or username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-green-400 font-medium">Amount (KAIA)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="0.0"
                      required
                      min="0"
                      step="0.000000000000000001"
                    />
                  </div>

                  <div>
                    <label className="mb-2 text-green-400 font-medium flex items-center space-x-2">
                      <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                      <span>Remarks</span>
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-green-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all duration-200"
                      placeholder="Add a note about this transfer"
                      required
                      rows={3}
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
                    disabled={isLoading || !signer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightIcon className="w-5 h-5" />
                        <span>Transfer</span>
                      </>
                    )}
                  </motion.button>

                  {!signer && (
                    <p className="text-center text-gray-400 text-sm">
                      Connect your wallet to make transfers
                    </p>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}