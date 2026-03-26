<div align="center">

# Swift

**Swift turns invoices into instant payments.**

<p>
  <img src="https://img.shields.io/badge/Nervos%20CKB-Testnet-purple?style=flat" />
  <img src="https://img.shields.io/badge/Status-Live-darkgreen?style=flat" />
  <img src="https://img.shields.io/badge/QR-Payments-darkorange?style=flat" />
  <a href="https://swift-ckb.vercel.app/">
    <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel" />
  </a>
</p>

An AI agent validates the invoice, builds the transaction, and generates a QR code; the client scans, verifies, and pays instantly with one tap.

**No addresses. No errors. Just scan and pay!**

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/85d3e66b-40a6-45fd-a061-b56b47827906" />

**Live at**: https://swift-ckb.vercel.app

</div>

## Features

- **Invoice Creation**: Simple form to create freelancer invoices
- **AI Validation**: Smart validation of invoice data
- **QR Code Generation**: Instant QR code for payment
- **QR Scanning**: Camera-based, or manually paste link as a fallback
- **CKB Integration**: Built on CKB Pudge testnet
- **Transaction Tracking**: Live explorer integration

## How It Works

1. **Freelancer** creates an invoice with name, work description, amount, and CKB address
2. **AI Agent** validates the invoice data
3. **CKB Integration** builds the transaction and calculates fees
4. A **QR code** is generated with the invoice and transaction details
5. **Client** scans the QR code and reviews the invoice
6. **Payment** is approved, signed, and broadcast to the CKB testnet
7. **Confirmation** displays the transaction hash and explorer link

## Payment Model

- The **invoice amount** is sent entirely to the freelancer
- The **network fee** is paid separately by the client’s wallet
- The app does **not** include the network fee in the invoice total

## Screenshots

#### 1. User Onboarding (Wallet Connection & Role Selection)

<img width="1920" height="1080" alt="User onboarding - wallet connection and role selection" src="https://github.com/user-attachments/assets/9c77614e-42ae-4111-a9ab-3dbcc8bd233a" />

#### 2. Freelancer Dashboard (Recent Invoices)

<img width="1920" height="1080" alt="Freelancer dashboard showing recent invoices" src="https://github.com/user-attachments/assets/ee4bcbf0-1f36-4f44-8199-ddb538787adb" />

#### 3. Invoice Creation Interface

<img width="1920" height="1080" alt="Freelancer creating a new invoice" src="https://github.com/user-attachments/assets/8f246278-8ca4-49e3-8b4c-4c4b24f59843" />

#### 4. QR Code & Payment Link Generation

<img width="1920" height="1080" alt="Generated QR code and payment link" src="https://github.com/user-attachments/assets/0f2a8fbb-16de-4f41-bee5-c8ae092e7f00" />

#### 5. Invoice Access via Shared Link

<img width="1920" height="1080" alt="Client opening invoice link" src="https://github.com/user-attachments/assets/e8d0bc91-07df-45ea-b280-7c25293a42d7" />

#### 6. Transaction Approval (Client Side)

<img width="1920" height="1080" alt="Client approving and signing transaction" src="https://github.com/user-attachments/assets/4ed9dd0a-5555-4af3-b56e-d62873ab5844" />

#### 7. Client Dashboard Overview

<img width="1920" height="1080" alt="Client dashboard overview" src="https://github.com/user-attachments/assets/a7496a79-18a0-4ed9-a292-e8a0e8bbf19f" />

#### 8. Alternative Payment Method (Fallback)

<img width="1920" height="1080" alt="Fallback payment method on client side" src="https://github.com/user-attachments/assets/1d16249b-19ac-46dd-b3a7-9292d568d377" />

#### 9. Fallback Payment via Direct Link

<img width="1920" height="1080" alt="Fallback payment using pasted link" src="https://github.com/user-attachments/assets/5a176809-0775-4133-ab1c-22b1e55194e2" />

<details>
<summary>Screenshots (Previous Version)</summary>

#### Landing Page (Legacy UI)

<img width="1920" height="1080" alt="Old landing page" src="https://github.com/user-attachments/assets/f56b6c34-e394-4fa0-bc8f-900796f0efaa" />

#### QR Code Generation (Legacy)

<img width="1920" height="1080" alt="Old QR generation screen" src="https://github.com/user-attachments/assets/6a4241fa-eb23-400f-83e1-6ccb8d5a660a" />

#### QR Usage Instructions (Legacy)

<img width="1920" height="1080" alt="Old QR usage instructions" src="https://github.com/user-attachments/assets/9976da23-a64d-488e-895d-56c2fc163a1d" />

</details>

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

## Useful Links

- Faucet: https://faucet.nervos.org
- Explorer: https://testnet.explorer.nervos.org
