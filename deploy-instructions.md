# eVisaTraveler Deploy Commands

Run these commands on your Hostinger VPS via SSH terminal:

## 1. Navigate to web directory
```bash
cd /var/www/html
```

## 2. Remove old files (if exists)
```bash
rm -rf evisatraveler next evisa 2>/dev/null
```

## 3. Clone repository
```bash
git clone https://github.com/wpcodingpress/evisatraveler.git
```

## 4. Install dependencies
```bash
cd evisatraveler
npm install
```

## 5. Create environment file
```bash
echo 'DATABASE_URL="mysql://root:Evisa2024!@194.164.150.248:3306/evisatraveler_db"
NODE_ENV="production"' > .env.local
```

## 6. Build the project
```bash
npm run build
```

## 7. Start the server (using PM2)
```bash
npm install -g pm2
pm2 start npm --name "evisa" -- start
pm2 save
```

## 8. Configure Nginx
```bash
curl -sSL https://get.docker.com | sh
docker run -d --name nginx-proxy -v /var/run/docker.sock:/var/run/docker.sock -p 80:80 -p 443:443 jwilder/nginx-proxy
docker run -d --name nginx-proxy-letsencrypt -e LETSENCRYPT_HOST=yourdomain.com -e LETSENCRYPT_EMAIL=your@email.com --link nginx-proxy jwilder/nginx-proxy-letsencrypt
```

---

**Alternatively, for simple Nginx setup:**
```bash
# Install nginx
apt update && apt install nginx -y

# Create nginx config
cat > /etc/nginx/sites-available/evisatraveler << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site and restart nginx
ln -s /etc/nginx/sites-available/evisatraveler /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Setup autostart pm2
pm2 startup
pm2 save
```