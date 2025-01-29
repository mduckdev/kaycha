rm -rf ~/kaycha/
mkdir ~/kaycha
cd ~/kaycha

wget https://github.com/mduckdev/kaycha/releases/download/Releases/dist.tar.gz
tar -xvzf dist.tar.gz

wget https://github.com/mduckdev/kaycha/releases/download/Releases/kaczortransport.pl.tar.gz 
tar -xvzf kaczortransport.pl.tar.gz 

wget https://github.com/mduckdev/kaycha/releases/download/Releases/kaczormaszyny.pl.tar.gz 
tar -xvzf kaczormaszyny.pl.tar.gz 


if [ -f ~/.env ]
then
    cp ~/.env ./
else
    cp -r ./env.example ./.env
    nano .env
fi

cp ./dist/package.json ./

cp ~/node_modules.tar.gz ./

tar -xvzf node_modules.tar.gz 

npm install

pm2 delete all
export NODE_ENV=production && pm2 start dist/index.js --name kaycha -f --update-env
pm2 save