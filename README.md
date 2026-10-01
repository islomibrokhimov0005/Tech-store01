# TechStore - E-Commerce Assignment

## Project Overview

TechStore is a simple e-commerce web application created for a university assignment.

The project demonstrates:
- Frontend development
- REST API development
- SQLite database usage
- Shopping cart functionality
- Order creation
- Docker containerization

## Technologies

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- SQLite
- Docker
- Docker Compose

## Features

1. Product catalogue
2. Product categories
3. Product search
4. Shopping cart
5. Checkout form
6. Order storage in SQLite
7. Responsive design
8. Docker support

## Run with Docker

Make sure Docker Desktop is installed.

Open a terminal in the project folder and run:

```bash
docker compose up --build
```

Then open:

http://localhost:3000

To stop the application:

```bash
docker compose down
```

## Run without Docker

Install Node.js 20+ and run:

```bash
npm install
npm start
```

Then open:

http://localhost:3000

## API Endpoints

GET `/api/products` - returns all products

GET `/api/products?category=Phones` - filters products by category

GET `/api/products?search=laptop` - searches products

GET `/api/categories` - returns available categories

POST `/api/orders` - creates an order

GET `/api/orders` - returns stored orders

## Docker Architecture

The application runs inside a Node.js Docker container.

The SQLite database is persisted through a Docker named volume.

```text
Browser
   |
   | HTTP :3000
   v
Docker Container
   |
   +-- Express Server
   +-- Frontend
   +-- SQLite
   |
   v
Docker Volume
   |
   +-- Database data
```

## Assignment Notes

This project is intentionally simple enough to explain during a presentation while demonstrating the main concepts of a modern web application and containerization.
