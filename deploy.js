const { Client } = require('ssh2');

const conn = new Client();

const commands = [
  'mysql -u root -pEvisa2024! evisatraveler_db -e "SELECT COUNT(*) as users FROM User;" 2>/dev/null',
  'mysql -u root -pEvisa2024! evisatraveler_db -e "SELECT COUNT(*) as visaRules FROM VisaRule;" 2>/dev/null',
  'mysql -u root -pEvisa2024! evisatraveler_db -e "SELECT COUNT(*) as countries FROM Country;" 2>/dev/null',
  'mysql -u root -pEvisa2024! evisatraveler_db -e "SELECT COUNT(*) as applications FROM Application;" 2>/dev/null',
  'curl -s "http://localhost:3000/api/countries" | python3 -c "import sys,json; d=json.load(sys.stdin); print(\"Countries API:\", len(d.get(\"countries\",[])))" 2>/dev/null'
];

conn.on('ready', () => {
  console.log('Connected to SSH');
  
  let i = 0;
  const runNext = () => {
    if (i >= commands.length) {
      conn.end();
      return;
    }
    const cmd = commands[i++];
    console.log('Running:', cmd);
    
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error('Error:', err); runNext(); return; }
      let output = '';
      stream.on('data', (data) => { output += data.toString(); });
      stream.on('close', () => { console.log('Result:', output.trim()); runNext(); });
    });
  };
  
  runNext();
}).connect({
  host: '194.164.150.248',
  port: 22,
  username: 'root',
  password: 'Mahnoor@1234?'
});

console.log('Checking database...');