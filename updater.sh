cp ~/kaycha/database.db ~/
rm -rf ~/kaycha/
mkdir ~/kaycha
cd ~/kaycha

wget https://github.com/mduckdev/kaycha/releases/download/Releases/dist.tar.gz
tar -xvzf dist.tar.gz

wget https://github.com/mduckdev/kaycha/releases/download/Releases/kaczortransport.pl.tar.gz 
tar -xvzf kaczortransport.pl.tar.gz 

wget https://github.com/mduckdev/kaycha/releases/download/Releases/kaczormaszyny.pl.tar.gz 
tar -xvzf kaczormaszyny.pl.tar.gz 

cp ~/.env ./


cp ./dist/package.json ./

cp ~/node_modules.tar.gz ./

tar -xvzf node_modules.tar.gz 

npm install --omit=dev

cp ~/database.db ~/kaycha/

export NODE_ENV=production && pm2 restart kaycha --update-env