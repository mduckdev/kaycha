sudo apk update
sudo apk add nginx nodejs npm
sudo npm install pm2 -g
pm2 startup
echo -e "\e[43m"
echo "Make sure to enter command provided by pm2 to enable persistence on reboot!"
echo -e "\e[0m"