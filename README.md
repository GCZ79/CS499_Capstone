# Grazioso Salvare Dashboard (MEAN Stack)

The Grazioso Salvare Dashboard is a full-stack MEAN application developed as the Software Design and Engineering enhancement for the Southern New Hampshire University (SNHU) CS 499 Computer Science Capstone.

This project is an enhancement of the original **Dashboard-for-MongoDB** artifact developed in **CS 340 Client/Server Development**, which implemented an animal rescue dashboard using Python, JupyterDash, and MongoDB. The capstone redesign migrated the application to a modern client-server architecture using Angular, Express.js, Node.js, and MongoDB while incorporating authentication, security, administrative functionality, automated testing, and improved software engineering practices.

---

## Project Evolution

This repository documents the progression of the project throughout the capstone.

| Branch | Description |
|---------|-------------|
| **main** | Baseline MEAN implementation migrated from the original CS340 artifact |
| **feature/mean_stack_migration** | Improved architecture, documentation, and testing following the code review |
| **feature/enh_sw_design-engineering** | Software Design and Engineering enhancement including authentication, authorization, administration, security, and additional testing |

The original CS340 artifact is available at:

**Dashboard-for-MongoDB**  
https://github.com/GCZ79/Dashboard-for-MongoDB

---

## Features

### Animal Management

- Create, edit, delete, and view animal records
- Multi-field search
- Rescue-type filtering
- Dynamic pagination
- Breed distribution chart
- Interactive map integration
- Automatic age calculation
- Form validation

### Authentication & Security

- JWT authentication
- Role-based authorization (Employee/Admin)
- Angular route guards
- HTTP interceptor
- Protected REST API endpoints
- Audit logging
- Helmet security middleware
- Rate limiting

### Administration

- Database backup
- Database restore
- Backup download
- Backup history
- Audit log viewer
- Administrative pagination

### Software Engineering Enhancements

- Angular standalone components
- RESTful Express API
- Modular service architecture
- Server-side pagination
- MongoDB aggregation pipelines
- Automated frontend and backend testing

---

## Technology Stack

### Frontend

- Angular 21
- TypeScript
- SCSS
- Leaflet
- Chart.js

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)

### Testing

- Vitest
- Jest
- Supertest

---

## Project Structure

```
project-root/
│
├── client/      Angular frontend
├── server/      Express REST API
└── README.md
```

Additional documentation is available in:

- **client/README.md** – Angular frontend
- **server/README.md** – Express backend

---

## Installation

Clone this repository:

```bash
git clone https://github.com/GCZ79/CS499_Capstone.git
```

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

---

## Running the Application

Start the backend:

```bash
cd server
npm start
```

Start the Angular frontend:

```bash
cd client
ng serve
```

The application will be available at:

```
http://localhost:4200
```

---

## Running Tests

### Backend

```bash
cd server
npm test
```

### Frontend

```bash
cd client
ng test
```

---

## Project Purpose

This project demonstrates software design and engineering principles by transforming an academic prototype into a secure, maintainable, and scalable full-stack web application. The enhancement emphasizes modular architecture, RESTful API design, authentication and authorization, administrative tools, automated testing, and improved user experience while preserving the core functionality of the original animal rescue dashboard.

---

## Author

**Giuseppe Claudio Zema**

Bachelor of Science in Software Engineering

Southern New Hampshire University

CS 499 Computer Science Capstone