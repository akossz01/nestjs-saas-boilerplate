# Nest.js SaaS Boilerplate

  

## Table of Contents

- [Overview](#overview)

- [Setup](#setup)

- [Prerequisites](#prerequisites)

- [Installation](#installation)

- [Configuration](#configuration)

- [General](#general)

- [Database](#database)

- [User Authentication](#user-authentication)

- [Email Configuration](#email-configuration)

- [Custom Mail Server](#custom-mail-server)

- [Mailgun](#mailgun)

- [Stripe](#stripe)

- [Swagger](#swagger)

- [Usage](#usage)

- [Running the Application](#running-the-application)

- [Accessing Swagger Docs](#accessing-swagger-docs)

- [Stripe Integration](#stripe-integration)

  

## Overview

This is a SaaS boilerplate built with NestJS, providing authentication, email services, Stripe integration, and Swagger documentation. It supports both OAuth and traditional email/password authentication, with user subscription management via Stripe.

  

## Setup

  

### Prerequisites

- Node.js (v14 or later)

- MongoDB

- Stripe account

- Mailgun account (optional, for email services)

  

### Installation

1. Clone the repository:

```sh
git clone https://github.com/yourusername/project123.git
```


2.  Install dependencies:
       
    `npm install` 
    
3.  Create a `.env` file based on the provided `.env.example` template and fill in the necessary values.
    

## Configuration

### General

`PROJECT_NAME=Project123` 

-   `PROJECT_NAME`: The name of your project, which will appear in emails sent to users.

### Database

`MONGO_URI=mongodb://localhost:27017/` 

-   `MONGO_URI`: The MongoDB connection string.

### User Authentication

`JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLIENT_ID=xxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx-xxxxxxxxxxxxxxxxxxxxxxxx-x
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback` 

-   `JWT_SECRET`: Secret key for JWT.
-   `GOOGLE_CLIENT_ID`: Google OAuth client ID.
-   `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
-   `GOOGLE_CALLBACK_URL`: Callback URL for Google OAuth.

### Email Configuration

#### Custom Mail Server

`USE_CUSTOM_MAIL_SERVER=true
MAIL_HOST=
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=
MAIL_PASS=
SENDER_EMAIL="Project123 <noreply@example.com>"` 

-   `USE_CUSTOM_MAIL_SERVER`: Set to `true` to use a custom mail server.
-   `MAIL_HOST`: The mail server host.
-   `MAIL_PORT`: The mail server port.
-   `MAIL_SECURE`: Whether to use a secure connection.
-   `MAIL_USER`: The mail server username.
-   `MAIL_PASS`: The mail server password.
-   `SENDER_EMAIL`: The email address from which emails are sent.

#### Mailgun

`MAILGUN_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx
MAILGUN_DOMAIN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org
SENDER_EMAIL="Project123 <noreply@example.com>"` 

-   `MAILGUN_API_KEY`: Mailgun API key.
-   `MAILGUN_DOMAIN`: Mailgun domain.
-   `SENDER_EMAIL`: The email address from which emails are sent.

### Stripe

`FREE_PLAN=true
STRIPE_SECRET_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BASIC_PLAN=price_xxx
PRO_PLAN=price_yyy
ENTERPRISE_PLAN=price_zzz
STRIPE_SUCCESS_URL=https://your-app.com/success
STRIPE_CANCEL_URL=https://your-app.com/cancel
STRIPE_RETURN_URL=https://your-app.com/dashboard` 

-   `FREE_PLAN`: Set to `true` to enable a free plan for users.
-   `STRIPE_SECRET_KEY`: Stripe secret key.
-   `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret.
-   `BASIC_PLAN`: Stripe price ID for the basic plan.
-   `PRO_PLAN`: Stripe price ID for the pro plan.
-   `ENTERPRISE_PLAN`: Stripe price ID for the enterprise plan.
-   `STRIPE_SUCCESS_URL`: URL to redirect to after a successful payment.
-   `STRIPE_CANCEL_URL`: URL to redirect to after a canceled payment.
-   `STRIPE_RETURN_URL`: URL to redirect to after managing subscription in the Stripe customer portal.

### Swagger

`SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=admin` 

-   `SWAGGER_USERNAME`: Username to access the Swagger docs.
-   `SWAGGER_PASSWORD`: Password to access the Swagger docs.

## Usage

### Running the Application

1.  Start the application:
    
    `npm run start` 
    
2.  The application will run on `http://localhost:3000`.
    

### Accessing Swagger Docs

1.  Navigate to `http://localhost:3000/docs`.
2.  Enter the credentials set in the `.env` file to access the documentation.

### Stripe Integration

1.  Ensure your Stripe credentials and price IDs are set in the `.env` file.
2.  Use the provided endpoints to handle subscriptions, payments, and customer portal sessions.

## Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature-branch`).
3.  Make your changes and commit them (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature-branch`).
5.  Open a pull request.

## License

This project is licensed under the MIT License.