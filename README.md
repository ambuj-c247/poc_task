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
Then open http://localhost:3000 in your browser to view the app.

✨ Features
Upload and Validate: Upload employee hour and payment data.

Per-Hour Rate Support: Supports dynamic rate per employee.

Discrepancy Detection: Automatically flags underpaid and overpaid employees.

Visual Feedback:

🔴 Red = Overpaid

🟡 Yellow = Underpaid

Export Results: Download flagged results as Excel for further processing.

Reset and Retry: Quickly reset and validate new files.

🛠️ Development
Start editing the app from app/page.tsx. It supports hot reloading, so changes will reflect immediately.

This project uses:

next/font for optimized font loading (Geist by Vercel)

TypeScript for type-safe development

Tailwind CSS for styling

React under the hood

📘 Learn More
To learn more about Next.js, check out:

Next.js Docs

Interactive Next.js Tutorial

Next.js GitHub

☁️ Deploying on Vercel
To deploy this project:


See the Next.js deployment guide for more information.

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
📄 Example Use Case
Upload two files:

Hours File: includes Employee, Hours, and Rate

Payments File: includes Employee and Paid

The app will:

Calculate expected pay = Hours × Rate

Compare with actual Paid

Highlight mismatches with color-coded results

Allow download of flagged results
