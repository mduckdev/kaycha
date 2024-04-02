# Kaycha heavy machinery dealership
Website for dealership and dashboard with messages from the customers, allowing easier contact with the customers.
Website administators have ability to export messages in .eml and .csv format or send them straight to their e-mail address.

# Environment variables
Edit env.example file to match your needs.
```yaml
DB_FILE= #optional, path to the sqlite database file, example: database.db, defaults to: database.db
PORT= #optional, port the application will be listening on, example: 5000, defaults to: 3000
HCAPTCHA_PRIVATE_KEY= #required, private key provided by hcatpcha to validate data from contact form
DEFAULT_USER= #required, default username to log into the dashboard
DEFAULT_PASSWORD= #required, default password to log into the dashboard
PASSWORD_HASH_ROUND= #optional, amount of bcrypt hash rounds that will be performed before saving password to database, defaults to: 10
SESSION_SECRET= #required, random string used as seed to generate sessions
EMAIL_HOST= #required, email host address
EMAIL_PORT= #required, email port address, defaults to 465
EMAIL_SECURE= #optional, whether email transporter should use secure connection, enabled only when set to TRUE
EMAIL_TLS= #optional, whether email transporter should use tls, enabled only when set to TRUE
EMAIL_USER= #required, mail username used to authenticate to mail server
EMAIL_USER_ADDRESS= #required, email address of user authenticating to mail server
EMAIL_PASSWORD= #required, mail password used to authenticate to mail server
OTOMOTO_CLIENT_SECRET= #required, otomoto client secret used to authenticate to api
OTOMOTO_CLIENT_ID= #required, otomoto client id used to authenticate to api
OTOMOTO_USERNAME= #required, otomoto username(email) of user to check their listings
OTOMOTO_PASSWORD= #required, otomoto password of user to check their listings
OTOMOTO_ACCESS_TOKEN= #optional, access token to authenticate to otomoto api
OTOMOTO_REFRESH_TOKEN= #optional, refres token to authenticate to otomoto api
EMAIL_DESTINATION= #optional but recommended, default email address used to send notifications to

```

# Deployment
## 1. Installing system dependencies (linux alpine)
Run this in console and replace ```username``` with name of the user that will run the application:
```sh
wget -O setup-alpine.sh https://raw.githubusercontent.com/mduckdev/kaycha/master/setup-alpine.sh && chmod +x ./setup-alpine.sh && ./setup-alpine.sh username
```
After script is done working, additional setup is needed to configure pm2 to allow automatic startup. Make sure to paste the command visible in the output of the script.
![obraz](https://github.com/mduckdev/kaycha/assets/101923131/861ec848-9895-496e-9e5b-7253d575af78)

## 2. Setting up project and its dependencies

Run this script as the user specified in previous step. This script will create project directory inside users home directory (```~/kaycha/```) and download source code as well as all dependencies needed.
Before you proceed make sure you have .env file inside currents user home directory (```~/.env```) with all secrets needed (check env.example for what informations are needed). If the file does not exist, a new .env file based on the example will be created and opened in nano text editor.
```sh
curl -s https://raw.githubusercontent.com/mduckdev/kaycha/master/setup-project.sh | sh
```

## 3. Updating the app

This script will download latest changes and restart the app.
```sh
curl -s https://raw.githubusercontent.com/mduckdev/kaycha/master/updater.sh | sh
```

## 4. Nginx setup

Sample nginx config with ssl support:
```yaml
server {
        listen 443 ssl default_server;
        listen [::]:443 ssl default_server;
        server_name www.domain.com domain.com; # replace with your own domain
        ssl_certificate /directory/to/cert.pem; # replace with your own certificates
        ssl_certificate_key /directory/to/priv.key; # replace with your own certificates

        location / {
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_pass http://localhost:PORT; # Make sure that the PORT is replaced with port number specified inside the .env file!
        }

}
```
To apply changes (linux alpine):
```sh
sudo rc-service nginx restart
```
To make nginx starts on reboot (linux alpine):
```sh
sudo rc-update add nginx default
```
