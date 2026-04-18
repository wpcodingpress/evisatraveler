const mysql = require('mysql2/promise');

const visaRules = [
  // Pakistan to Thailand
  ['pk-th-tourist', 'cmo46w7ud0041ey4mw34c4opq', 'cmo1epnfc000aw9xrie2njvds', 'Tourist Visa', '24-72 hours', 3, 49, 30, 90, 'Single Entry'],
  // Pakistan to Vietnam
  ['pk-vn-tourist', 'cmo46w7ud0041ey4mw34c4opq', 'cmo1epnqf000bw9xr2e4kdy9p', 'Tourist Visa', '3-5 days', 5, 59, 30, 90, 'Single Entry'],
  // Pakistan to Turkey
  ['pk-tr-tourist', 'cmo46w7ud0041ey4mw34c4opq', 'cmo1epnwa000cw9xrpa8vhfyn', 'Tourist Visa', '24-48 hours', 2, 60, 30, 90, 'Single Entry'],
  // Pakistan to India
  ['pk-in-tourist', 'cmo46w7ud0041ey4mw34c4opq', 'cmo1epn6d0009w9xrq1oq80e2', 'Tourist Visa', '2-4 days', 4, 50, 30, 90, 'Single Entry'],
  // Pakistan to Sri Lanka
  ['pk-lk-tourist', 'cmo46w7ud0041ey4mw34c4opq', 'cmo1epovk000hw9xrwk52dfa3', 'Tourist Visa', '24 hours', 1, 35, 30, 90, 'Single Entry'],
  // US to Vietnam
  ['us-vn-tourist', 'cmo1eplga0001w9xrlgaco2ga', 'cmo1epnqf000bw9xr2e4kdy9p', 'Tourist Visa', '3-5 days', 5, 59, 30, 90, 'Single Entry'],
  // US to Turkey
  ['us-tr-tourist', 'cmo1eplga0001w9xrlgaco2ga', 'cmo1epnwa000cw9xrpa8vhfyn', 'Tourist Visa', '3-5 days', 5, 60, 30, 90, 'Single Entry'],
  // US to Sri Lanka
  ['us-lk-tourist', 'cmo1eplga0001w9xrlgaco2ga', 'cmo1epovk000hw9xrwk52dfa3', 'Tourist Visa', '24 hours', 1, 35, 30, 90, 'Single Entry'],
  // UK to Vietnam
  ['gb-vn-tourist', 'cmo1eplpj0002w9xrvjcm2khj', 'cmo1epnqf000bw9xr2e4kdy9p', 'Tourist Visa', '3-5 days', 5, 59, 30, 90, 'Single Entry'],
  // UK to Turkey
  ['gb-tr-tourist', 'cmo1eplpj0002w9xrvjcm2khj', 'cmo1epnwa000cw9xrpa8vhfyn', 'Tourist Visa', '24-48 hours', 2, 60, 30, 90, 'Single Entry'],
  // Australia to Vietnam
  ['au-vn-tourist', 'cmo1epm150004w9xrcelcrngf', 'cmo1epnqf000bw9xr2e4kdy9p', 'Tourist Visa', '3-5 days', 5, 59, 30, 90, 'Single Entry'],
  // Canada to Vietnam
  ['ca-vn-tourist', 'cmo1eplv90003w9xr2dqb6b34', 'cmo1epnqf000bw9xr2e4kdy9p', 'Tourist Visa', '3-5 days', 5, 59, 30, 90, 'Single Entry']
];

const requirements = [
  '[{"id":"1","text":"Valid passport (6+ months validity)","required":true},{"id":"2","text":"Passport-size photos","required":true},{"id":"3","text":"Proof of accommodation","required":true},{"id":"4","text":"Return flight ticket","required":true}]',
  '[{"id":"1","text":"Valid passport (6+ months validity)","required":true},{"id":"2","text":"Passport-size photos","required":true},{"id":"3","text":"Hotel booking","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true},{"id":"3","text":"Hotel booking","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]',
  '[{"id":"1","text":"Valid passport","required":true},{"id":"2","text":"Photo","required":true}]'
];

const documents = [
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo (3.5x4.5cm)"},{"id":"3","text":"Flight itinerary"},{"id":"4","text":"Hotel booking"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]',
  '[{"id":"1","text":"Passport copy"},{"id":"2","text":"Photo"}]'
];

async function main() {
  const connection = await mysql.createConnection({
    host: '194.164.150.248',
    user: 'root',
    password: 'Evisa2024!',
    database: 'evisatraveler_db'
  });

  console.log('Adding popular visa routes...');

  for (let i = 0; i < visaRules.length; i++) {
    const [id, fromId, toId, visaType, processingTime, processingDays, price, maxStay, validity, entryType] = visaRules[i];
    const req = requirements[i];
    const doc = documents[i];
    const sql = `
      INSERT INTO VisaRule (id, fromCountryId, toCountryId, visaType, processingTime, processingDays, price, currency, maxStayDays, validityDays, entryType, requirements, documents, isActive, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, 1, ?)
      ON DUPLICATE KEY UPDATE price = VALUES(price), processingDays = VALUES(processingDays), processingTime = VALUES(processingTime)
    `;
    await connection.execute(sql, [id, fromId, toId, visaType, processingTime, processingDays, price, maxStay, validity, entryType, req, doc, i + 1]);
    console.log(`Created/Updated: ${id}`);
  }

  await connection.end();
  console.log('Done!');
}

main().catch(console.error);