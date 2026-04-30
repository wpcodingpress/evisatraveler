#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing super admin role...');
  
  // Update super admin
  const superAdmin = await prisma.user.updateMany({
    where: { email: 'rahman.ceo@wpcodingpress.com' },
    data: { 
      role: 'super_admin',
      password: await bcrypt.hash('S0pnahenayf', 12),
    },
  });
  
  console.log(`✅ Updated ${superAdmin.count} super admin user(s)`);
  
  // Create/update admin
  const admin = await prisma.user.upsert({
    where: { email: 'Sheikhshoaibahmed81@gmail.com' },
    update: { 
      role: 'admin',
      password: await bcrypt.hash('Mahnoor@1234', 12),
    },
    create: {
      email: 'Sheikhshoaibahmed81@gmail.com',
      password: await bcrypt.hash('Mahnoor@1234', 12),
      firstName: 'Sheikh',
      lastName: 'Shoaib',
      role: 'admin',
    },
  });
  
  console.log('✅ Admin user:', admin.email, 'Role:', admin.role);

  // List all users
  const users = await prisma.user.findMany({
    select: { email: true, role: true },
  });
  
  console.log('\n📋 All users:');
  users.forEach(u => console.log(`  - ${u.email}: ${u.role}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
