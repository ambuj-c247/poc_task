# Employee Payment Validator — Next.js App

This project is a [Next.js](https://nextjs.org) application designed to help teams validate employee payments based on recorded hours and per-hour rates. It flags discrepancies like overpayment and underpayment, with an easy-to-use interface for uploading data, reviewing results, and exporting them.

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```
```bash
✨ Features
Upload and Validate: Upload employee hour and payment data.

Per-Hour Rate Support: Supports dynamic rate per employee.

Discrepancy Detection: Automatically flags underpaid and overpaid employees.

Visual Feedback:

🔴 Red = Overpaid

🟡 Yellow = Underpaid

Export Results: Download flagged results as Excel for further processing.

Reset and Retry: Quickly reset and validate new files.
```
```bash
🛠️ Development
Start editing the app from app/page.tsx. It supports hot reloading, so changes will reflect immediately.

This project uses:

next/font for optimized font loading (Geist by Vercel)

TypeScript for type-safe development

Tailwind CSS for styling

React under the hood
```
```bash
📂 Project Structure (key files)
bash
Copy
Edit
/app
  └── page.tsx               # Main upload & validation page
/components
 common
  ├── FileInput.tsx 
  ├── FlaggedResults.tsx     # Displays validation results with color-coded rows
  └── Button.tsx
 PaymentValidator.tsx
         # Reusable button component
/utils
  └── validateEmployeePayments.ts # Logic to compute payment mismatches
```
