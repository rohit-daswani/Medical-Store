This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js v16 or later (currently using v20.12.1)
- npm, yarn, pnpm, or bun package manager

## Getting Started

### 1. Install Dependencies

First, install the project dependencies:

```bash
npm install
```

### 2. Environment Setup

The project uses environment variables for configuration. A `.env` file is included with default settings:

```
PORT=8000
NODE_ENV=development
```

### 3. Start the Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The server will start on [http://localhost:8000](http://localhost:8000) (configured via environment variable).

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file thanks to Turbopack.

### 4. Production Build

To create a production build:

```bash
npm run build
npm run start
```

## Troubleshooting

### Port Conflict Error
If you encounter "Port 8000 is already in use" error:

1. Check which process is using the port:
   ```bash
   fuser -k 8000/tcp
   ```

2. Or change the port in `.env` file:
   ```
   PORT=8080
   ```

### Dependency Issues
If you encounter module or configuration errors:

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and configurations
- `src/types/` - TypeScript type definitions

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load fonts, and includes Tailwind CSS for styling.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
