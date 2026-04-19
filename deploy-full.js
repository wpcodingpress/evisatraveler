const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

const VPS_IP = '194.164.150.248';
const PASSWORD = 'Mahnoor@1234?';
const PUBLIC_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFRgWASr4FzbMm53PiYArgphuil3HtIb1vpuwwstdn5J evisatraveler@deploy';

const fullCommands = `
# Wait for SSH
while [ ! -f /var/run/reboot-required ]; do sleep 1; done 2>/dev/null || true

echo "=== Step 1: Install Node.js ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== Step 2: Setup directory ==="
mkdir -p /var/www/html
cd /var/www/html
rm -rf evisatraveler next.config.ts 2>/dev/null || true

echo "=== Step 3: Clone repo ==="
git clone https://github.com/wpcodingpress/evisatraveler.git

echo "=== Step 4: Install dependencies ==="
cd /var/www/html/evisatraveler
npm install

echo "=== Step 5: Setup environment ==="
echo 'DATABASE_URL="mysql://root:Evisa2024%21@194.164.150.248:3306/evisatraveler_db"
NODE_ENV="production"' > .env.local

echo "=== Step 6: Install PM2 ==="
npm install -g pm2

echo "=== Step 7: Build ==="
npm run build

echo "=== Step 8: Start with PM2 ==="
pm2 delete all || true
pm2 kill || true
pkill -9 -f "next" 2>/dev/null || true
sleep 1
pm2 start npm --name "evisa" -- start
pm2 save

echo "=== Step 9: Configure Nginx ==="
cat > /etc/nginx/sites-available/evisatraveler << 'NGINXEOF'
server {
    listen 80;
    server_name evisatraveler.com www.evisatraveler.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/evisatraveler /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx || nginx -t

echo "=== COMPLETE ==="
echo "Server running on port 3000"
pm2 list
`.replace(/\n/g, ' && ').replace(/\s&&/g, ' &&');

const commands = fullCommands.split(' && ');

let currentCommand = '';
for (let cmd of commands) {
  cmd = cmd.trim();
  if (cmd) currentCommand += cmd + '\n';
}

conn.on('ready', () => {
  console.log('✓ Connected to VPS');
  
  const cmd = `
cd /var/www/html && \
mkdir -p /var/www/html && \
cd /var/www/html && \
rm -rf evisatraveler && \
git clone https://github.com/wpcodingpress/evisatraveler.git && \
cd evisatraveler && \
npm install && \
echo 'DATABASE_URL="mysql://root:Evisa2024%21@194.164.150.248:3306/evisatraveler_db"
NODE_ENV="production"' > .env.local && \
npm install -g pm2 && \
npm run build && \
pm2 start npm --name "evisa" -- start && \
pm2 save && \
echo "=== COMPLETED ==="
pm2 list
`;
  
  console.log('Executing deployment commands...');
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error:', err);
      conn.end();
      return;
    }
    
    let output = '';
    stream.on('data', (data) => { 
      const text = data.toString();
      output += text;
      console.log(text);
    });
    stream.stderr.on('data', (data) => { console.error('ERR:', data.toString()); });
    stream.on('close', (code) => {
      console.log('\\nDone! Exit code:', code);
      conn.end();
    });
  });
  
}).on('error', (err) => {
  console.error('Connection error:', err.message);
}).connect({
  host: VPS_IP,
  port: 22,
  username: 'root',
  password: PASSWORD
});

console.log('Connecting to', VPS_IP + '...');