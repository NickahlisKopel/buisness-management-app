This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Password reset

The app supports a secure forgot/reset password flow:

1. User visits `/auth/forgot-password`, enters their email.
2. Backend generates a one-time token (stored hashed), valid for 1 hour, and emails a link to `/auth/reset-password?token=...`.
3. User opens the link and sets a new password on `/auth/reset-password`.

Requirements:
- Set `EMAIL_FROM` and SMTP credentials (`EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`) or `RESEND_API_KEY`.
- Set `NEXTAUTH_URL` (or Vercel will provide `VERCEL_URL`).

Database migration:
- Prisma model `PasswordResetToken` was added. Run migrations:

```powershell
# From the project root
npx prisma migrate dev -n add_password_reset_tokens
```

Security notes:
- Tokens are stored as SHA-256 hashes; emails include the raw token.
- Previous tokens for a user are invalidated when a new one is issued.
- Responses from forgot-password endpoint are generic to prevent email enumeration.
