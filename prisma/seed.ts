import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const countries = [
    { name: 'United States', code: 'US', flag: '🇺🇸', region: 'North America', continent: 'Americas' },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe', continent: 'Europe' },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'North America', continent: 'Americas' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania', continent: 'Oceania' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe', continent: 'Europe' },
    { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe', continent: 'Europe' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia', continent: 'Asia' },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷', region: 'Asia', continent: 'Asia' },
    { name: 'China', code: 'CN', flag: '🇨🇳', region: 'Asia', continent: 'Asia' },
    { name: 'India', code: 'IN', flag: '🇮🇳', region: 'Asia', continent: 'Asia' },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷', region: 'South America', continent: 'Americas' },
    { name: 'Mexico', code: 'MX', flag: '🇲🇽', region: 'North America', continent: 'Americas' },
    { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe', continent: 'Europe' },
    { name: 'Italy', code: 'IT', flag: '🇮🇹', region: 'Europe', continent: 'Europe' },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱', region: 'Europe', continent: 'Europe' },
    { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Middle East', continent: 'Asia' },
    { name: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'Asia', continent: 'Asia' },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'Asia', continent: 'Asia' },
    { name: 'UAE', code: 'AE', flag: '🇦🇪', region: 'Middle East', continent: 'Asia' },
    { name: 'Egypt', code: 'EG', flag: '🇪🇬', region: 'Africa', continent: 'Africa' },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    });
  }

  const us = await prisma.country.findUnique({ where: { code: 'US' } });
  const gb = await prisma.country.findUnique({ where: { code: 'GB' } });
  const ca = await prisma.country.findUnique({ where: { code: 'CA' } });
  const au = await prisma.country.findUnique({ where: { code: 'AU' } });
  const jp = await prisma.country.findUnique({ where: { code: 'JP' } });
  const th = await prisma.country.findUnique({ where: { code: 'TH' } });
  const es = await prisma.country.findUnique({ where: { code: 'ES' } });
  const tr = await prisma.country.findUnique({ where: { code: 'TR' } });
  const ae = await prisma.country.findUnique({ where: { code: 'AE' } });

  const visaTypes = [
    {
      fromCountryId: us!.id,
      toCountryId: th!.id,
      visaType: 'Tourist',
      processingTime: '3-5 Business Days',
      processingTimeDays: 5,
      price: 49.99,
      maxStayDays: 30,
      validityDays: 30,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport with at least 6 months validity', required: true },
        { id: '2', text: 'Recent passport-sized photo', required: true },
        { id: '3', text: 'Proof of accommodation', required: true },
        { id: '4', text: 'Travel itinerary', required: false },
      ],
      documentsRequired: [
        { id: 'passport', name: 'Passport Scan', description: 'Clear copy of passport information page', required: true, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 10485760 },
        { id: 'photo', name: 'Passport Photo', description: 'Recent passport-sized photograph', required: true, allowedTypes: ['image/jpeg', 'image/png'], maxSize: 5242880 },
        { id: 'hotel', name: 'Hotel Reservation', description: 'Hotel booking confirmation', required: true, allowedTypes: ['application/pdf', 'image/jpeg'], maxSize: 10485760 },
      ],
      additionalInfo: 'Tourist visa allows single entry into Thailand for stays up to 30 days.',
    },
    {
      fromCountryId: us!.id,
      toCountryId: jp!.id,
      visaType: 'Tourist',
      processingTime: '5-7 Business Days',
      processingTimeDays: 7,
      price: 79.99,
      maxStayDays: 90,
      validityDays: 90,
      entryType: 'Multiple',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'Completed application form', required: true },
        { id: '3', text: 'Photo', required: true },
        { id: '4', text: 'Itinerary', required: false },
      ],
      documentsRequired: [
        { id: 'passport', name: 'Passport', description: 'Passport information page', required: true, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 10485760 },
        { id: 'photo', name: 'Photo', required: true, allowedTypes: ['image/jpeg', 'image/png'], maxSize: 5242880 },
      ],
      additionalInfo: 'Japan tourist visa allows multiple entries within 90 days.',
    },
    {
      fromCountryId: gb!.id,
      toCountryId: tr!.id,
      visaType: 'Tourist',
      processingTime: '24-48 Hours',
      processingTimeDays: 2,
      price: 59.99,
      maxStayDays: 90,
      validityDays: 180,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport (min 6 months)', required: true },
        { id: '2', text: 'Online application form', required: true },
        { id: '3', text: 'Flight confirmation', required: true },
        { id: '4', text: 'Hotel booking', required: true },
      ],
      documentsRequired: [
        { id: 'passport', name: 'Passport', required: true, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 10485760 },
        { id: 'flight', name: 'Flight Ticket', required: true, allowedTypes: ['application/pdf'], maxSize: 10485760 },
        { id: 'hotel', name: 'Hotel Booking', required: true, allowedTypes: ['application/pdf'], maxSize: 10485760 },
      ],
      additionalInfo: 'Turkey e-visa allows single entry for up to 90 days.',
    },
    {
      fromCountryId: ca!.id,
      toCountryId: ae!.id,
      visaType: 'Tourist',
      processingTime: '3-5 Business Days',
      processingTimeDays: 5,
      price: 89.99,
      maxStayDays: 30,
      validityDays: 30,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'Passport photo', required: true },
        { id: '3', text: 'Travel insurance', required: false },
      ],
      documentsRequired: [
        { id: 'passport', name: 'Passport', required: true, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 10485760 },
        { id: 'photo', name: 'Photo', required: true, allowedTypes: ['image/jpeg', 'image/png'], maxSize: 5242880 },
      ],
      additionalInfo: 'UAE tourist visa for Canadian citizens.',
    },
    {
      fromCountryId: us!.id,
      toCountryId: es!.id,
      visaType: 'Schengen',
      processingTime: '15-30 Business Days',
      processingTimeDays: 30,
      price: 119.99,
      maxStayDays: 90,
      validityDays: 180,
      entryType: 'Multiple',
      requirements: [
        { id: '1', text: 'Valid passport (min 3 months beyond trip)', required: true },
        { id: '2', text: 'Travel insurance (min €30,000)', required: true },
        { id: '3', text: 'Flight itinerary', required: true },
        { id: '4', text: 'Accommodation proof', required: true },
        { id: '5', text: 'Bank statements', required: true },
        { id: '6', text: 'Employment letter', required: true },
      ],
      documentsRequired: [
        { id: 'passport', name: 'Passport', required: true, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 10485760 },
        { id: 'photo', name: 'Photo', required: true, allowedTypes: ['image/jpeg', 'image/png'], maxSize: 5242880 },
        { id: 'insurance', name: 'Travel Insurance', required: true, allowedTypes: ['application/pdf'], maxSize: 10485760 },
        { id: 'flight', name: 'Flight Itinerary', required: true, allowedTypes: ['application/pdf'], maxSize: 10485760 },
        { id: 'hotel', name: 'Hotel Booking', required: true, allowedTypes: ['application/pdf'], maxSize: 10485760 },
        { id: 'bank', name: 'Bank Statement', required: true, allowedTypes: ['application/pdf'], maxSize: 10485760 },
      ],
      additionalInfo: 'Schengen visa allows travel to all Schengen countries.',
    },
    {
      fromCountryId: au!.id,
      toCountryId: th!.id,
      visaType: 'Tourist',
      processingTime: '24-72 Hours',
      processingTimeDays: 3,
      price: 39.99,
      maxStayDays: 30,
      validityDays: 30,
      entryType: 'Single',
      requirements: [
        { id: '1', text: 'Valid passport', required: true },
        { id: '2', text: 'Photo', required: true },
      ],
      documentsRequired: [
        { id: 'passport', name: 'Passport', required: true, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 10485760 },
        { id: 'photo', name: 'Photo', required: true, allowedTypes: ['image/jpeg', 'image/png'], maxSize: 5242880 },
      ],
      additionalInfo: 'Thailand tourist visa for Australian citizens.',
    },
  ];

  for (const visa of visaTypes) {
    await prisma.visaRule.upsert({
      where: {
        fromCountryId_toCountryId_visaType: {
          fromCountryId: visa.fromCountryId,
          toCountryId: visa.toCountryId,
          visaType: visa.visaType,
        },
      },
      update: visa,
      create: visa,
    });
  }

  console.log('✅ Seed completed: 20 countries, 6 visa rules created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });