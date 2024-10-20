﻿# Expense Sharing Application - Backend

This is the backend server for the Expense Sharing Application built using Node.js and Express. The server allows users to manage expenses, track balances, and more.

## Features
- Add and track expenses.
- Split expenses equally, by exact amount, or by percentage.
- Retrieve individual or overall balance sheets.
- Export balance sheets to CSV.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/download/) (v12+)
- [npm](https://www.npmjs.com/get-npm) (v6+)
- [MongoDB](https://www.mongodb.com/try/download/community) (if you're using MongoDB locally)

## Getting Started

Follow these steps to run the backend server:

### 1. Clone the repository

    git clone https://github.com/Saru416/Expense-Sharing
    cd your-repository

### 2. Install dependencies
Run the following command to install all required dependencies:

    npm install
### 3. Set up environment variables
Create a .env file in the root directory and add the following environment variables. Update the values based on your setup.

    #### MongoDB connection URL
    DB_CONNECTION_STRING=mongodb://localhost:27017/your_database_name

    #### JWT secret for authentication
    JWT_SECRET=your_jwt_secret

##### Server port
    PORT=5000

You can refer to the provided .env.sample file for a list of required environment variables.

### 4. Run the server
You can run the server in development mode using nodemon, which automatically restarts the server when changes are detected:

    npm run dev
The server will now be running on http://localhost:5000 (or the port specified in your .env file).

### 5. Run the server in production
For running the server in production mode, use:


    npm start
Available Scripts
    npm run dev - Starts the server in development mode using nodemon.
    npm start - Starts the server in production mode.

API Endpoints

Here are some of the key API endpoints for the expense sharing application:

    POST /api/expenses - Add a new expense.
    GET /api/balance/:userId - Get the individual balance sheet for a user.
    GET /api/balance/overall - Get the overall balance sheet for all users.
    GET /api/balance/download/:userId - Download balance sheet for a user as CSV.
    For more detailed API documentation, refer to the API documentation file or Postman collection.
