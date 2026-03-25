# Swift - Invoice to Instant Payments

Swift turns invoices into instant crypto payments on the CKB blockchain. Create an invoice, generate a QR code, and get paid in one tap.

## Features

- **Invoice Creation**: Simple form to create freelancer invoices
- **AI Validation**: Smart validation of invoice data
- **QR Code Generation**: Instant QR code for payment
- **QR Scanning**: Camera-based or manual QR input
- **CKB Integration**: Built on CKB Pudge testnet
- **Transaction Tracking**: Live explorer integration

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Vercel Serverless Functions
- **Blockchain**: CKB with @ckb-ccc/core
- **QR**: qrcode generation + html5-qrcode scanning

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone and navigate to the project:
```bash
cd swift
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file:

```env
CKB_RPC_URL=https://testnet.ckb.dev
CKB_EXPLORER_URL=https://testnet.explorer.nervos.org
```

## Project Structure

```
swift/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and blockchain services
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Helper functions
│   └── stores/            # Zustand stores
├── api/                   # Vercel serverless functions
├── public/                # Static assets
└── docs/                  # Documentation
```

## How It Works

1. **Freelancer** creates invoice with name, work description, amount, and CKB address
2. **AI Agent** validates the invoice data
3. **CKB Integration** builds transaction and calculates fees
4. **QR Code** is generated with invoice and transaction data
5. **Client** scans QR and reviews invoice details
6. **Payment** is approved, signed, and broadcast to CKB testnet
7. **Confirmation** shows transaction hash and explorer link

## CKB Testnet

- **RPC**: `https://testnet.ckb.dev`
- **Explorer**: [https://testnet.explorer.nervos.org](https://testnet.explorer.nervos.org)
- **Faucet**: [https://faucet.nervos.org](https://faucet.nervos.org)

## Deployment

Deploy to Vercel:

```bash
npm run build
vercel
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
