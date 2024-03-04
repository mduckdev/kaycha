# Kaycha heavy machinery dealership
Website for dealership and dashboard with messages from the customers, allowing easier contact with the customers.
Website administators have ability to export messages in .eml and .csv format or send them straight to their e-mail address.

# Deployment
## 1. Installing system dependencies (linux alpine)
Run this in console and replace ```username``` with name of the user that will run the application:
```sh
wget https://raw.githubusercontent.com/mduckdev/kaycha/master/setup-alpine.sh && chmod +x ./setup-alpine && ./setup-alpine username
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
