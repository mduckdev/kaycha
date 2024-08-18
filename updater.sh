cd ~/kaycha
git pull kaycha master --force
npm install --omit=dev
NODE_ENV=production pm2 restart kaycha