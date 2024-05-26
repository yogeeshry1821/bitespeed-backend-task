# Bitespeed Backend Task: Identity Reconciliation

This project implements an identity reconciliation service for Bitespeed. The service links customer identities based on email and phone number to provide a personalized customer experience.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [API Endpoint](#api-endpoint)
  - [POST /identify](#post-identify)
- [Deployment](#deployment)
- [Examples](#examples)

## Overview

Bitespeed needs a way to identify and keep track of a customer's identity across multiple purchases, even if they use different email addresses and phone numbers. This service consolidates these identities into a single customer profile.

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **Prisma**: ORM for database access
- **SQLite**: Database (can be easily switched to another SQL database)
- **Render.com**: Hosting service

## Setup and Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yogeeshry1821/bitespeed-backend-task.git
   cd bitespeed-backend-task

2. **Install Dependencies:**
    ```sh
    npm install

3. **Set up the database:**
    ```sh 
    npx prisma migrate dev --name init

4. **Run the Server:**
    ```sh
    npm start
## API Endpoint
# POST /identify

Identifies and consolidates customer information based on email and/or phone number.
## Deployment
The deployment can be found at : https://bitespeed-backend-task-sigma.vercel.app/identify/
## Examples:
1.
  ```sh
Request:
{
	"email": "asdasdasd@daknfas",
	"phoneNumber": "12132123"
}
Response:
{
    "contact": {
        "primaryContactId": 7,
        "emails": [
            "asdasdasd@daknfas"
        ],
        "phoneNumbers": [
            "12132123"
        ],
        "secondaryContactIds": []
    },
    "message": "Created a new primary contact."
}

2.
Request:
{
	"email": "asdasdasd@daknfas",
	"phoneNumber": "121321232222"
}
Response:
{
    "contact": {
        "primaryContactId": 7,
        "emails": [
            "asdasdasd@daknfas"
        ],
        "phoneNumbers": [
            "12132123",
            "121321232222"
        ],
        "secondaryContactIds": [
            8
        ]
    },
    "message": "Created a new secondary contact."
}
