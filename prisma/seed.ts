import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('S0pnahenayf', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'rahman.ceo@wpcodingpress.com' },
    update: {},
    create: {
      email: 'rahman.ceo@wpcodingpress.com',
      password: hashedPassword,
      firstName: 'Rahman',
      lastName: 'CEO',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create Countries
  const countries = [
    { name: 'United States', code: 'US', flag: '🇺🇸', region: 'North America', continent: 'Americas' },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe', continent: 'Europe' },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'North America', continent: 'Americas' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania', continent: 'Oceania' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe', continent: 'Europe' },
    { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe', continent: 'Europe' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia', continent: 'Asia' },
    { name: 'China', code: 'CN', flag: '🇨🇳', region: 'Asia', continent: 'Asia' },
    { name: 'India', code: 'IN', flag: '🇮🇳', region: 'Asia', continent: 'Asia' },
    { name: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'Asia', continent: 'Asia' },
    { name: 'Vietnam', code: 'VN', flag: '🇻🇳', region: 'Asia', continent: 'Asia' },
    { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Middle East', continent: 'Asia' },
    { name: 'UAE', code: 'AE', flag: '🇦🇪', region: 'Middle East', continent: 'Asia' },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'Asia', continent: 'Asia' },
    { name: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'Asia', continent: 'Asia' },
    { name: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Asia', continent: 'Asia' },
    { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', region: 'Asia', continent: 'Asia' },
    { name: 'Cambodia', code: 'KH', flag: '🇰🇭', region: 'Asia', continent: 'Asia' },
    { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East', continent: 'Asia' },
    { name: 'Egypt', code: 'EG', flag: '🇪🇬', region: 'Africa', continent: 'Africa' },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
  console.log('✅ Countries created');

  // Get countries for visa rules
  const us = await prisma.country.findUnique({ where: { code: 'US' } });
  const gb = await prisma.country.findUnique({ where: { code: 'GB' } });
  const ca = await prisma.country.findUnique({ where: { code: 'CA' } });
  const au = await prisma.country.findUnique({ where: { code: 'AU' } });
  const th = await prisma.country.findUnique({ where: { code: 'TH' } });
  const vn = await prisma.country.findUnique({ where: { code: 'VN' } });
  const my = await prisma.country.findUnique({ where: { code: 'MY' } });
  const tr = await prisma.country.findUnique({ where: { code: 'TR' } });
  const ae = await prisma.country.findUnique({ where: { code: 'AE' } });
  const in_ = await prisma.country.findUnique({ where: { code: 'IN' } });
  const lk = await prisma.country.findUnique({ where: { code: 'LK' } });
  const jp = await prisma.country.findUnique({ where: { code: 'JP' } });

  // Create Visa Rules
  const visaRules = [
    {
      fromCountryId: us!.id,
      toCountryId: th!.id,
      visaType: 'Tourist',
      processingTime: '24-72 Hours',
      processingDays: 3,
      price: 49,
      maxStayDays: 30,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport with at least 6 months validity', required: true },
        { id: '2', text: 'Recent passport-sized photo', required: true },
        { id: '3', text: 'Proof of accommodation', required: true },
      ],
      documents: [
        { id: 'passport', name: 'Passport Scan', description: 'Clear copy of passport', required: true, allowedTypes: ['application/pdf', 'image/jpeg'], maxSize: 10485760 },
      ],
      additionalInfo: 'Tourist visa allows single entry into Thailand for stays up to 30 days.',
    },
    {
      fromCountryId: us!.id,
      toCountryId: vn!.id,
      visaType: 'Tourist',
      processingTime: '3-5 Days',
      processingDays: 5,
      price: 59,
      maxStayDays: 90,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'Passport photo', required: true },
      ],
      documents: [
        { id: 'passport', name: 'Passport Copy', required: true },
      ],
    },
    {
      fromCountryId: us!.id,
      toCountryId: my!.id,
      visaType: 'Tourist',
      processingTime: '24-48 Hours',
      processingDays: 2,
      price: 39,
      maxStayDays: 30,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: us!.id,
      toCountryId: tr!.id,
      visaType: 'Tourist',
      processingTime: '24-48 Hours',
      processingDays: 2,
      price: 60,
      maxStayDays: 90,
      validityDays: 180,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'E-visa application', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: us!.id,
      toCountryId: ae!.id,
      visaType: 'Tourist',
      processingTime: '3-5 Days',
      processingDays: 5,
      price: 115,
      maxStayDays: 30,
      validityDays: 60,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'Hotel booking', required: true },
        { id: '3', text: 'Flight ticket', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: us!.id,
      toCountryId: in_!.id,
      visaType: 'Tourist',
      processingTime: '2-4 Days',
      processingDays: 4,
      price: 50,
      maxStayDays: 30,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'Photo', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: us!.id,
      toCountryId: lk!.id,
      visaType: 'Tourist',
      processingTime: '24 Hours',
      processingDays: 1,
      price: 35,
      maxStayDays: 30,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: gb!.id,
      toCountryId: th!.id,
      visaType: 'Tourist',
      processingTime: '24-72 Hours',
      processingDays: 3,
      price: 49,
      maxStayDays: 30,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: ca!.id,
      toCountryId: th!.id,
      visaType: 'Tourist',
      processingTime: '24-72 Hours',
      processingDays: 3,
      price: 49,
      maxStayDays: 30,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: au!.id,
      toCountryId: th!.id,
      visaType: 'Tourist',
      processingTime: '24-72 Hours',
      processingDays: 3,
      price: 39,
      maxStayDays: 30,
      validityDays: 90,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
      ],
      documents: [],
    },
    {
      fromCountryId: us!.id,
      toCountryId: jp!.id,
      visaType: 'Tourist',
      processingTime: '5-7 Days',
      processingDays: 7,
      price: 79,
      maxStayDays: 90,
      validityDays: 90,
      entryType: 'Multiple',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'Application form', required: true },
      ],
      documents: [],
    },
  ];

  for (const rule of visaRules) {
    await prisma.visaRule.upsert({
      where: {
        fromCountryId_toCountryId_visaType: {
          fromCountryId: rule.fromCountryId,
          toCountryId: rule.toCountryId,
          visaType: rule.visaType,
        },
      },
      update: {},
      create: rule,
    });
  }
  console.log('✅ Visa rules created');

  // Create Insurance Packages
  const insurances = [
    {
      name: 'Basic Protection',
      description: 'Essential travel insurance covering medical emergencies up to $25,000. Perfect for short trips.',
      price: 3,
      coverage: '$25,000',
      duration: 'Per Trip',
      benefits: JSON.stringify([
        'Medical emergency coverage up to $25,000',
        'Trip cancellation protection',
        '24/7 emergency assistance',
        'Lost baggage coverage',
      ]),
      sortOrder: 1,
    },
    {
      name: 'Standard Plus',
      description: 'Comprehensive coverage with higher limits. Ideal for family travelers and longer trips.',
      price: 5,
      coverage: '$50,000',
      duration: 'Per Trip',
      benefits: JSON.stringify([
        'Medical emergency coverage up to $50,000',
        'Trip cancellation & interruption',
        '24/7 emergency assistance',
        'Lost baggage coverage',
        'Flight delay reimbursement',
        'Travel accident coverage',
      ]),
      sortOrder: 2,
    },
    {
      name: 'Premium Shield',
      description: 'Maximum protection for worry-free travel. Includes adventure sports coverage.',
      price: 10,
      coverage: '$100,000',
      duration: 'Per Trip',
      benefits: JSON.stringify([
        'Medical emergency coverage up to $100,000',
        'Full trip cancellation',
        '24/7 emergency assistance',
        'Lost baggage coverage',
        'Flight delay reimbursement',
        'Adventure sports coverage',
        'Personal liability protection',
        'Home burglary protection',
      ]),
      sortOrder: 3,
    },
  ];

  for (const insurance of insurances) {
    await prisma.insurance.upsert({
      where: { name: insurance.name },
      update: {},
      create: insurance,
    });
  }
  console.log('✅ Insurance packages created');

  console.log('🌸 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
