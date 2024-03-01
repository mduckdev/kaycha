rm -rf ~/kaycha/
mkdir ~/kaycha
cd ~/kaycha
if ! grep -q "export NODE_ENV=production" ~/.bashrc
then
    echo 'export NODE_ENV=production' >> ~/.bashrc
fi
source ~/.bashrc

git init
git remote add kaycha https://github.com/mduckdev/kaycha.git
git pull kaycha master
npm install

if [ -f "~/.env" ]
then
    cp "~/.env" "./"
else
    cp -r "./env.example" "./.env"
    nano ".env"
fi


pm2 start index.js
pm2 save