rm -rf ~/kaycha/
mkdir ~/kaycha
cd ~/kaycha

git init
git remote add kaycha https://github.com/mduckdev/kaycha.git
git pull kaycha master
npm install

if [ -f ~/.env ]
then
    cp ~/.env ./
else
    cp -r ./env.example ./.env
    nano .env
fi
pm2 delete all
NODE_ENV=production pm2 start dist/index.js --name kaycha -f --update-env
pm2 save