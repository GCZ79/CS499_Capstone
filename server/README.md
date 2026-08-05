# Grazioso Salvare Dashboard - Server

## Overview

This project is the Express and MongoDB backend for the Grazioso Salvare Animal Rescue Dashboard. Originally developed from the CS340 Dashboard for MongoDB artifact, it was enhanced during the CS499 Capstone into a secure RESTful API supporting authentication, role-based authorization, administrative tools, and improved database functionality for the Angular frontend.

## Technologies

* Node.js
* Express
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)
* bcrypt
* Helmet
* Express Rate Limit
* Jest
* Supertest

## Features

* RESTful API for animal records
* JWT authentication
* Role-based authorization (Employee and Administrator)
* CRUD operations
* Multi-field animal search
* MongoDB aggregation for breed distribution
* Server-side pagination
* Compound database indexes
* Database backup and restore
* Audit logging
* Administrative API endpoints
* Automated backend testing

## Development Server

Install project dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

By default, the server runs on:

```text
http://localhost:3000
```

Configuration values such as the MongoDB connection string and JWT secret are stored in the `.env` file.

## Running Tests

To execute the backend test suite, run:

```bash
npm run test -- --runInBand
```

The project uses Jest, Supertest, and MongoDB Memory Server to perform isolated integration testing of API endpoints, authentication, authorization, and middleware.

## API Overview

The backend exposes REST endpoints for:

* User authentication
* Animal CRUD operations
* Animal search and filtering
* Breed distribution analytics
* Database backup and restore
* Audit log retrieval
* Administrative functions

## Security

Security enhancements implemented during the CS499 Capstone include:

* JWT-based authentication
* Role-based access control (RBAC)
* Protected administrative endpoints
* Protected create, update, and delete operations
* Password hashing with bcrypt
* HTTP security headers using Helmet
* Rate limiting for API requests
* Audit logging of privileged operations

## Additional Resources

For more information about Express and Node.js, visit:

* https://expressjs.com/
* https://nodejs.org/
