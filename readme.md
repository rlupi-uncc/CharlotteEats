Sprint 0 – Project Environment Setup (Node.js + MongoDB)

This repository contains the Sprint 0 environment setup for our project, including:

Node.js HTTP server

Unit testing with Jest

MongoDB Atlas connection

Git-based workflow

Follow the steps below to run the application locally.

--PREREQUISITES--

Ensure the following are installed:

Node.js (LTS recommended)

npm (comes with Node.js)

Verify:

node -v
npm -v

--DEPENDENCIES--

From the project root directory:

npm install


This installs:

Jest (unit testing)

MongoDB Node.js driver

dotenv

--MONGODB USER SETUP--

Create a file named:

.env


Add the MongoDB Atlas connection string:

navigate to https://cloud.mongodb.com/v2/698122ecf48b4f92e4eb6f4e#/security/database/users

create a user for yourself and copy the connection string into your .env file

MONGO_URI=your_atlas_connection_string_here


Example format:

mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority


Do not commit this file to GitHub.

--RUN THE NODE SERVER--

Start the HTTP server:

npm start


Open a browser and navigate to:

http://localhost:8000


You should see:

My first server!

--UNIT TESTS--

Execute Jest tests:

npm test


All tests should pass.

--DATABASE CONNECTIVITY--

Run the MongoDB connectivity check:

node mongoTest.js


If successful, the terminal will print an inserted document ID.

Project Structure Overview
hello.js          - Node.js HTTP server
package.json     - Project configuration and scripts
utils.js         - Sample utility function
utils.test.js    - Jest unit test
db.js             - MongoDB connection helper
mongoTest.js      - MongoDB connection test script
.env              - Environment variables (not committed)
.gitignore        - Git ignore rules

Common Issues
MongoDB connection fails

Confirm your IP is allowed in Atlas Network Access

Confirm username/password are correct

Ensure .env file exists and contains MONGO_URI

Port already in use

If port 8000 is busy, stop the other process or modify the port in hello.js.