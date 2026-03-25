import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Confirmation() {
  const navigate = useNavigate()
  const [transactionHash] = useState('0x1234567890abcdef1234567890abcdef12345678')
  const [isCopied, setIsCopied] = useState(false)

  const explorerUrl = `https://testnet.explorer.nervos.org/transaction/${transactionHash}`

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(transactionHash)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleCreateNewInvoice = () => {
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your transaction has been broadcast to the CKB testnet</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Hash</h3>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-xs bg-white px-3 py-2 rounded border font-mono break-all">
                {transactionHash}
              </code>
              <button
                onClick={handleCopyHash}
                className="btn-secondary flex-shrink-0 px-3 py-2"
                title="Copy transaction hash"
              >
                {isCopied ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">View on Explorer</h3>
            <p className="text-sm text-blue-700 mb-3">
              Track your transaction status on the CKB explorer
            </p>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Explorer
            </a>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-xs font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Transaction is being processed by the network</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-xs font-medium">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Confirmation will be received in a few minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-xs font-medium">3</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Freelancer will receive the payment notification</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleCreateNewInvoice}
              className="btn-primary flex-1"
            >
              Create New Invoice
            </button>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 text-center"
            >
              Track Transaction
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
