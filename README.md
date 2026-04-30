# eVisa Traveler - Visa Application Platform

A Next.js application for visa application management with Prisma ORM and MySQL database integration.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 🗄️ Database Setup

### Generate Prisma Client
```bash
npx prisma generate
```

### Seed Database (Creates admin users)
```bash
npx prisma db seed
```

## 🔧 VPS Deployment Fix Commands

When deploying to VPS (fix-admin-roles, seed, etc.):

```bash
cd /var/www/evisatraveler
git pull origin main
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npx tsx scripts/fix-admin-roles.ts
pm2 restart evisatraveler
```

## 📋 Admin Roles

- **super_admin** - Full system access
- **admin** - Admin panel access  
- **user** - Regular user access

## ⚠️ Critical: Payment Gateway Integration

**DO NOT MODIFY** payment gateway codes:
- `/src/app/api/payment/` - Payment API endpoints
- `.env` Bank Alfalah APG credentials
- All payment processing logic

The payment system is fully integrated with live transactions. Any changes may break financial operations.

## 🔐 Admin Credentials (Bypass)

Set in `.env`:
```
ADMIN_EMAIL=rahman.ceo@wpcodingpress.com
ADMIN_PASSWORD=S0pnahenayf
```

This creates super admin access bypassing database authentication.

## 📄 License

MIT