if [ -z "$1" ]
then
  echo "No username supplied."
  exit 1
fi

if id -u "$1" >/dev/null 2>&1; then
  echo "OK"
else
  echo "User $1 does not exist."
  exit 1
fi

sudo apk update
sudo apk add nginx nodejs npm
sudo npm install pm2 -g
echo "Please enter password for user $1"
sudo -u $1 -H sh -c "pm2 startup -u $1"
echo -e "\e[43m"
echo "Make sure to enter command provided by pm2 to enable persistence on reboot!"
echo -e "\e[0m"