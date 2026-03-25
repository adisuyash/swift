# Swift

> Swift turns invoices into instant payments.

An AI agent validates the invoice, builds the transaction and generates a QR - the client scans, verifies and pays in one tap.

No addresses. No errors. Just scan and pay!

## Features

- **Invoice Creation**: Simple form to create freelancer invoices
- **AI Validation**: Smart validation of invoice data
- **QR Code Generation**: Instant QR code for payment
- **QR Scanning**: Camera-based, or manually paste link as a fallback
- **CKB Integration**: Built on CKB Pudge testnet
- **Transaction Tracking**: Live explorer integration

## Tech Stack

- **Frontend**: React 19 + Vite 6 + TailwindCSS 3
- **CCC Core & Connector**: @ckb-ccc/core + @ckb-ccc/connector-react
- **QR**: qrcode + html5-qrcode

## Installation & Usage

### Prerequisites

- Node.js 18+
- npm

### Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create your local env file:

```bash
cp .env.example .env
```

3. Set the environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173
```

4. Start the app:

```bash
npm run dev
```

6. Open:

```text
http://localhost:5173
```

## Project Structure

```text
swift/
├── index.html
├── package.json
├── vercel.json
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── lib/
│   │   └── supabase.js
│   ├── utils/
│   │   └── validateInvoice.js
│   ├── ckb/
│   │   └── transaction.js
│   └── components/
│       ├── Landing.jsx
│       ├── RoleSelection.jsx
│       ├── FreelancerDashboard.jsx
│       ├── InvoiceForm.jsx
│       ├── QRDisplay.jsx
│       ├── ClientDashboard.jsx
│       ├── QRScanner.jsx
│       ├── InvoiceApproval.jsx
│       └── Confirmation.jsx
└── .env.example
```

## How It Works

1. **Freelancer** creates invoice with name, work description, amount, and CKB address
2. **AI Agent** validates the invoice data
3. **CKB Integration** builds transaction and calculates fees
4. **QR Code** is generated with invoice and transaction data
5. **Client** scans QR and reviews invoice details
6. **Payment** is approved, signed, and broadcast to CKB testnet
7. **Confirmation** shows transaction hash and explorer link

## Payment Model

- The **invoice amount** is the amount sent to the freelancer.
- The **network fee** is paid separately by the client wallet.
- The app does **not** add network fee into the invoice total.

## Screenshots

- Landing Page
  <img width="1920" height="1080" alt="Landing Page" src="https://github.com/user-attachments/assets/f56b6c34-e394-4fa0-bc8f-900796f0efaa" />

- QR Generated
  <img width="1920" height="1080" alt="QR Generated" src="https://github.com/user-attachments/assets/6a4241fa-eb23-400f-83e1-6ccb8d5a660a" />

- How to use QR
  <img width="1920" height="1080" alt="How to use QR" src="https://github.com/user-attachments/assets/9976da23-a64d-488e-895d-56c2fc163a1d" />

## Useful Links

- Faucet: https://faucet.nervos.org
- Explorer: https://testnet.explorer.nervos.org

---

Note: This project is built on the CKB Pudge testnet, so all transactions are for testing purposes only.
