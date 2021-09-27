# Databases
As of 9/27, the plan is to use DocumentDB on AWS for production side code and mongoDB for local side code. DocumentDb supports most of MongoDB APIs, Operations, and Datatypes [here](https://docs.aws.amazon.com/documentdb/latest/developerguide/mongo-apis.html), therefore using MongoDB in a test environment will replicate production code as long as only mongo supported apis are used.

# Setting Up Your Test Environment
If you have any issues, please let us know so we can resolve it quickly.

## Installation
These walk through will go through installing and starting mongodb.
If your mongodb fails to install, please uninstall your mongodb and clear any files associated with it. These are within the provided links.
### MacOS
https://docs.mongodb.com/v4.0/tutorial/install-mongodb-on-os-x/

### Windows
https://docs.mongodb.com/v4.0/tutorial/install-mongodb-on-windows/

### Linux
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

### Windows Subsystem Linux (WSL)
Follow the microsoft guide for installation as the mongo guides likely will fail. Note that you have to go through each of these steps
1. Install MongoDB (Cannot just do this)
2. MongoDB init system differences
3. Add the init script to start MongoDB as a service
https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-mongodb

## Installing Compass MongoDb GUI (Useful for debugging)
https://www.mongodb.com/try/download/compass

