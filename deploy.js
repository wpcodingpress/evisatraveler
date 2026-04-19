const { Client } = require('ssh2');

const conn = new Client();

const commands = [
  'curl -s http://localhost:3000/api/admin/users | python3 -c "import sys,json; d=json.load(sys.stdin); print(\"Users:\", d.get(\"stats\",{}))"',
  'curl -s http://localhost:3000/api/admin/visa-rules | python3 -c "import sys,json; d=json.load(sys.stdin); print(\"Visa rules:\", len(d.get(\"visaRules\",[])))"',
  'curl -s http://localhost:3000/api/admin/countries | python3 -c "import sys,json; d=json.load(sys.stdin); print(\"Countries:\", len(d.get(\"countries\",[])))"'
];

conn.on('ready', () => {
  let i = 0;
  const runNext = () => {
    if (i >= commands.length) { conn.end(); return; }
    const cmd = commands[i++];
    conn.exec(cmd, (err, stream) => {
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

console.log('Verifying APIs...');