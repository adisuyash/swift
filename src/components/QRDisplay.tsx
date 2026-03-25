import { QRData } from '../types'

interface QRDisplayProps {
  qrData: QRData
  qrImageUrl: string
}

export function QRDisplay({ qrData, qrImageUrl }: QRDisplayProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: Show success feedback
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="text-center">
        <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
          <img 
            src={qrImageUrl} 
            alt="Invoice QR Code" 
            className="w-64 h-64"
          />
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Scan this QR code to pay the invoice
        </p>
      </div>

      {/* Invoice Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Freelancer:</span>
            <span className="font-medium">{qrData.invoice.freelancerName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Work:</span>
            <span className="font-medium text-right max-w-xs">{qrData.invoice.workDescription}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">{qrData.invoice.amount} CKB</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Network Fee:</span>
            <span className="font-medium">{qrData.fee} CKB</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-gray-900 font-semibold">Total:</span>
              <span className="font-bold text-primary-600">
                {(qrData.invoice.amount + qrData.fee).toFixed(8)} CKB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Recipient Address:</label>
            <div className="flex items-center space-x-2 mt-1">
              <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded border font-mono break-all">
                {qrData.invoice.ckbAddress}
              </code>
              <button
                onClick={() => copyToClipboard(qrData.invoice.ckbAddress)}
                className="btn-secondary px-3 py-2"
                title="Copy address"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">How to Pay:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Scan the QR code with your CKB wallet</li>
          <li>Review the invoice details</li>
          <li>Confirm and sign the transaction</li>
          <li>Wait for network confirmation</li>
        </ol>
      </div>
    </div>
  )
}
