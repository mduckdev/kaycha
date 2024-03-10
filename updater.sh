cd ~/kaycha
git pull kaycha master --force
npm install
NODE_ENV=production pm2 restart kaycha