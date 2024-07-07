# Nest.js SaaS Boilerplate

  

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Stripe Integration](#setup-stripe-plans)

  

## Overview

This is a SaaS boilerplate built with NestJS, providing authentication, email services, Stripe integration, and Swagger documentation. It supports both OAuth and traditional email/password authentication, with user subscription management via Stripe.

There are pre-configured email templates set up for various events, such as when a user subscribes, when an invoice fails, when an invoice succeeds, and when a user unsubscribes.

This repository is a great starting point for a SaaS app and it can save you a few days of work.

## Setup

  

### Prerequisites

- Node.js

- MongoDB

- Stripe account

- Mailgun account (optional, for email services)

  

### Installation

1. Clone the repository:

```sh
git clone https://github.com/akossz01/nestjs-saas-boilerplate.git
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

-   `JWT_SECRET`: Secret key for JWT.
-   `GOOGLE_CLIENT_ID`: Google OAuth client ID.
-   `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
-   `GOOGLE_CALLBACK_URL`: Callback URL for Google OAuth.

### Email Configuration

#### Custom Mail Server

-   `USE_CUSTOM_MAIL_SERVER`: Set to `true` to use a custom mail server.
-   `MAIL_HOST`: The mail server host.
-   `MAIL_PORT`: The mail server port.
-   `MAIL_SECURE`: Whether to use a secure connection.
-   `MAIL_USER`: The mail server username.
-   `MAIL_PASS`: The mail server password.
-   `SENDER_EMAIL`: The email address from which emails are sent.

#### Mailgun

-   `MAILGUN_API_KEY`: Mailgun API key.
-   `MAILGUN_DOMAIN`: Mailgun domain.
-   `SENDER_EMAIL`: The email address from which emails are sent.

### Stripe


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
### Setup Stripe plans
To set up 1-3 plans and optionally enable a free plan, follow these steps:

1.  **Free Plan**:
    
    -   If you want to provide a free plan, set `FREE_PLAN` to `true` in your `.env` file.
    -   The `enableFreePrivileges` method will be triggered for new users and users who downgrade to the free plan.
2.  **Paid Plans**:
    
    -   Define up to three Stripe price IDs for your plans: `BASIC_PLAN`, `PRO_PLAN`, and `ENTERPRISE_PLAN` in your `.env` file.
    -   These plans will be associated with Stripe price IDs and can have different privileges.
   
### Example Implementation of Privileges

-   **enableBasicPrivileges**: Enables basic plan privileges for the user.
-   **enableProPrivileges**: Enables pro plan privileges for the user.
-   **enableEnterprisePrivileges**: Enables enterprise plan privileges for the user.
-   **removePrivileges**: Removes all paid privileges, useful for downgrading or deleting a user.
-   **enableFreePrivileges**: Enables free plan privileges if the free plan is active.
    
### Handling the Stripe Webhooks

-   **checkout.session.completed**: Upgrades the user's account and sends a thank you email.
-   **invoice.payment_succeeded**: Sends an email with the invoice link.
-   **invoice.payment_failed**: Downgrades the user's account and sends a payment failed email.
-   **customer.subscription.deleted**: Downgrades the user's account.
-   **customer.deleted**: Deletes the user's Stripe customer data and potentially removes privileges.

These methods will be triggered based on the event types received from Stripe webhooks.

### Running the Application

1.  Start the application:
    
    `npm run start` 
    
2.  The application will run on `http://localhost:3000`.
    

### Accessing Swagger Docs

1.  Navigate to `http://localhost:3000/docs`.
2.  Enter the credentials set in the `.env` file to access the documentation.

## Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature-branch`).
3.  Make your changes and commit them (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature-branch`).
5.  Open a pull request.

## License

This project is licensed under the MIT License.