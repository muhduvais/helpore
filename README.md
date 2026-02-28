HelpOre -- Welfare Management Platform
=====================================

A full-stack **community welfare management system** built for local charitable organizations to manage assistance requests, volunteers, donations, and community events efficiently.

Built using the **MERN Stack** with a scalable backend architecture following **SOLID principles and repository pattern**.

Overview
--------

HelpOre is a **location-based welfare coordination platform** that connects:

-   Community members requesting assistance
-   Volunteers offering support
-   Administrators managing operations

It digitizes daily activities like:
-   Accepting donations
-   Managing volunteer assignments
-   Verifying assistance requests
-   Organizing events & meetings
-   Managing medical asset requests

* * * * *

User Roles
-------------

### Admin

-   Manage users & volunteers
-   Verify requests
-   Monitor analytics dashboard
-   Create events & meetings
-   Manage donations & medical assets

* * * * *

### Volunteers

-   Receive location-based requests
-   Accept and complete tasks
-   Chat with users in real-time

* * * * *

### Community Members

-   Request volunteer assistance
-   Request ambulance services
-   Request medical equipment (wheelchair, airbed, walking stick etc.)
-   Upload medical certificates for verification
-   Make secure donations

* * * * *

Key Features
--------------

### Authentication & Security

-   JWT Authentication (Access + Refresh tokens)
-   Role-based authorization
-   Secure password hashing
-   OTP email verification
-   Password reset system

* * * * *

### Location-Based Volunteer Matching

-   Requests routed to nearest volunteers
-   Geo-based request distribution
-   Real-time volunteer response

* * * * *

### Real-Time Communication

-   Instant chat via **Socket.IO**
-   Real-time notifications
-   Live request status updates

* * * * *

### Assistance Management

-   Volunteer & ambulance request system
-   Medical equipment request workflow
-   Medical certificate upload & admin verification

* * * * *

### Donation & Payments

-   Stripe payment integration
-   Secure donation flow
-   Downloadable donation receipts

* * * * *

### Admin Dashboard

-   Analytics & activity monitoring
-   User & volunteer management
-   Request tracking

* * * * *

Architecture
----------------

Backend designed with:

-   Repository Pattern
-   SOLID Principles
-   Modular MVC Structure
-   Base repository abstraction

* * * * *

Tech Stack
--------------

### Frontend

-   React.js
-   Redux Toolkit
-   Tailwind CSS

### Backend

-   Node.js
-   Express.js
-   Socket.IO

### Database

-   MongoDB
-   Mongoose

### Cloud & Services

-   Stripe
-   Cloudinary
-   Redis

### DevOps

-   Dockerized application
-   Environment-based configuration

* * * * *

Docker Setup
---------------

The application is fully containerized.

### Run using Docker:
```
docker-compose up --build
```
This starts:

-   Backend service
-   Frontend service
-   MongoDB service
-   redis service

* * * * *

Environment Variables
------------------------

Create a `.env`

Backend:
```
PORT=\
CLIENT_PORT=\
CLIENT_URL=\
SERVER_URL=\
BASE_URL=

REDIS_URL=\
MONGODB_URI=

OTP_EMAIL=\
OTP_PASSWORD=

ACCESS_TOKEN_SECRET=\
REFRESH_TOKEN_SECRET=\
ACCESS_EXPIRES_IN=\
REFRESH_EXPIRES_IN=\
JWT_SECRET=\
RESET_LINK_SECRET=\
RESET_EXPIRES_IN=

GOOGLE_CLIENT_ID=\
GOOGLE_CLIENT_SECRET=\
GOOGLE_CREDENTIALS_JSON=

CLOUDINARY_CLOUD_NAME=\
CLOUDINARY_API_KEY=\
CLOUDINARY_API_SECRET=

ZEGO_APP_ID=\
ZEGO_APP_SIGN=\
ZEGO_SERVER_SECRET=

STRIPE_SECRET_KEY=\
STRIPE_PUBLISHABLE_KEY=\
STRIPE_WEBHOOK_SECRET=
```

Frontend:
```
VITE_GOOGLE_CLIENT_ID=

VITE_API_KEY=
VITE_AUTH_DOMAIN=
VITE_PROJECT_ID=
VITE_STORAGE_BUCKET=
VITE_MESSAGING_SENDER_ID=
VITE_APP_ID=

VITE_BASE_URL=

VITE_SERVER_URL=
VITE_API_BASE_URL=

VITE_ZEGO_APP_ID=
VITE_ZEGO_APP_SIGN=
VITE_ZEGO_SERVER_SECRET=
```

Project Structure
--------------------
```
helpore/\
│── client/\
│── server/\
│   ├── controllers/\
│   ├── repositories/\
│   ├── services/\
│   ├── models/\
│   ├── routes/\
│   └── middlewares/\
│── docker-compose.yml\
│── .env\
│── package.json
```
* * * * *

Future Enhancements
----------------------

-   Health predictions based on AI data analysis
-   Multi-organization support
-   Subscription-based model

* * * * *

Author
------------

**Muhammad Uvais**\
MERN Stack Developer
