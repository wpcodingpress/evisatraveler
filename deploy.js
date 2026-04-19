const { Client } = require('ssh2');

const conn = new Client();

const commands = [
  'cd /var/www/html/evisatraveler && git pull origin main',
  'cd /var/www/html/evisatraveler && npm run build',
  'pm2 restart evisa',
  'sleep 3',
  'pm2 status'
];

conn.on('ready', () => {
  console.log('Connected to SSH');
  
  let i = 0;
  const runNext = () => {
    if (i >= commands.length) {
      console.log('All done!');
      conn.end();
      return;
    }
    const cmd = commands[i++];
    console.log('Running:', cmd);
    
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error('Error:', err); conn.end(); return; }
      let output = '';
      stream.on('data', (data) => { output += data.toString(); });
      stream.on('close', () => { console.log('Output:', output); runNext(); });
    });
  };
  
  runNext();
}).connect({
  host: '194.164.150.248',
  port: 22,
  username: 'root',
  password: 'Mahnoor@1234?'
});

console.log('Deploying to server...');