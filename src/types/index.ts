export interface Invoice {
  id: string
  freelancerName: string
  workDescription: string
  amount: number
  ckbAddress: string
  createdAt: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  data?: Partial<Invoice>
}

export interface QRData {
  invoice: Invoice
  unsignedTransaction: string
  fee: number
}

export interface TransactionResult {
  hash: string
  explorerUrl: string
  status: 'pending' | 'confirmed' | 'failed'
}
