cd ~/kaycha
git pull kaycha master --force
npm install
npm run build
NODE_ENV=production pm2 restart kaycha