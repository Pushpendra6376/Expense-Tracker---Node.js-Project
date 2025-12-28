Install Nginx
First, update your package list and install Nginx:

sudo apt update sudo apt install nginx

Configure Nginx to Proxy Requests to Port 3000 Create a new configuration file for your application:

sudo nano /etc/nginx/sites-available/default

Update the Configuration to Proxy Requests to Your Server:

You can copy this:

server { 
listen         80;

server_name 		domain_name.com # Skip this line if you don't have it

location / {
     proxy_pass               http://localhost:3000;                       
     proxy_http_version       1.1;                                         
     proxy_set_header         Upgrade $http_upgrade;                       
     proxy_set_header         Connection 'upgrade';                        
     proxy_set_header         Host $host;                                  
     proxy_cache_bypass       $http_upgrade;                               
     proxy_set_header         X-Real-IP $remote_addr;                      
     proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;  
     proxy_set_header         X-Forwarded-Proto $scheme;                   
  }
}


 

Continue . . .








NOTE: 

# default port for nginx
server { 

listen         80;      

# Default server block to handle all requests when no other server_name matches
server_name your_domain_name.com

# Here "/" means it will handle all requests
location / { 

# Forward requests to the server running on localhost port 3000
proxy_pass http://localhost:3000;                       

# Use HTTP/1.1 for proxying (necessary for WebSockets)
proxy_http_version 1.1;                                         

# Set the Upgrade header to the value of $http_upgrade (used for WebSocket connections)
proxy_set_header  Upgrade $http_upgrade;                       

# Set the Connection header to 'upgrade' to indicate a connection upgrade (WebSockets)
proxy_set_header  Connection 'upgrade';                        

# Set the Host header to the value of the original request's Host header
proxy_set_header  Host $host;                                  

# Bypass the cache when $http_upgrade is set (important for WebSockets)
proxy_cache_bypass  $http_upgrade;                               

# Forward the client's real IP address to the backend server
proxy_set_header  X-Real-IP $remote_addr;                      

# Add the client's IP address to the X-Forwarded-For header
proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;  

# Forward the original request scheme (http or https) to the backend server
proxy_set_header  X-Forwarded-Proto $scheme;                   

  }
}



Basic Nginx Commands
Start Nginx: 
sudo systemctl start nginx

Stop Nginx: 
sudo systemctl stop nginx

Restart Nginx: This command stops and then starts Nginx again. 
sudo systemctl restart nginx

Reload Nginx Configuration: If you have made changes to the Nginx configuration files, you can reload the configuration without stopping the service. 
sudo systemctl reload nginx

Check Nginx Status: This command shows the current status of Nginx. 
sudo systemctl status nginx

Test Nginx Configuration: Before reloading or restarting Nginx after changes, you can test the configuration for any syntax errors.
sudo nginx -t

Enable Nginx to Start on Boot: To ensure Nginx starts automatically when the server boots up. 
sudo systemctl enable nginx

Disable Nginx from Starting on Boot: If you don't want Nginx to start automatically. 
sudo systemctl disable nginx

View Nginx Logs: Nginx logs can be found in the following directories:
Access logs: 
sudo tail -f /var/log/nginx/access.log

Error logs: 
sudo tail -f /var/log/nginx/error.log
	

End
