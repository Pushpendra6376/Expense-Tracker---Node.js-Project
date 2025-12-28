PM2
Install PM2 Globally: With Node.js and npm installed, 
you can install PM2 globally like this:

sudo npm install -g pm2
Basic Commands:
Start an Application:

pm2 start app.js

List Running Processes: 

pm2 list

Stop a Process: 

pm2 stop < app_name > or < id >

		OR

pm2 stop all

Restart a Process: 

pm2 restart < app_name > or < id >

OR

pm2 restart all

Delete a Process: 

pm2 delete < app_name > or < id >

pm2 delete all

View Logs: 

pm2 logs < app_name > or < id >
END

