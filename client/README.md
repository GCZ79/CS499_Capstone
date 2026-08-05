# Grazioso Salvare Dashboard - Client

## Overview

This project is the Angular frontend for the Grazioso Salvare Animal Rescue Dashboard. Originally developed from the CS340 Dashboard for MongoDB artifact, it was enhanced during the CS499 Capstone into a modern Angular application that communicates with a RESTful Express API. The application provides animal search, CRUD operations, authentication, administrative tools, and interactive data visualization.

## Technologies

* Angular 21
* TypeScript
* RxJS
* SCSS
* Chart.js
* Leaflet
* JWT Authentication

## Features

* Animal search and filtering
* Rescue type filtering
* Interactive map visualization
* Breed distribution chart
* Create, edit, and delete animal records
* User authentication and role-based authorization
* Administrative dashboard
* Database backup and restore
* Audit log viewer
* Dynamic pagination

## Development Server

Install project dependencies:

```bash
npm install
```

Start the Angular development server:

```bash
ng serve
```

Once the server is running, open your browser and navigate to:

```text
http://localhost:4200
```

The application will automatically reload whenever source files are modified.

## Building

To build the project for production, run:

```bash
ng build
```

The compiled application will be generated in the `dist/` directory.

## Running Unit Tests

To execute the unit tests with the Vitest test runner, run:

```bash
ng test
```

## Additional Resources

For more information about Angular CLI, including available commands and features, visit the Angular CLI documentation:

https://angular.dev/tools/cli
