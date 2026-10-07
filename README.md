# Laundry Pickup API

Laundry pickup and delivery application with a React frontend and an Express/MongoDB API. It provides customer authentication and orders, admin operations, delivery-agent workflows, service catalog management, Paystack payments, and notifications.

## API Documentation

Interactive Swagger UI: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

OpenAPI document: [`backend/saggwer.json`](backend/saggwer.json)

The Swagger instance uses the backend's default port, `5000`. The backend port is controlled by `PORT` in `backend/.env`; update the server URL in `backend/saggwer.json` if you change ports.

## Requirements

- Node.js 18 or newer
- MongoDB
- Cloudinary account for admin service-image uploads
- Paystack keys for payment initialization and verification

## Setup

From the `backend` directory, install dependencies and start the server:

```powershell
cd backend
npm install
npm run dev
```

For production mode, run `npm start` from `backend`.

Copy `backend/.env.example` to `backend/.env` and set the values:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/laundry_pickup
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_CALLBACK_URL=https://laundry-pickup-app-chi.vercel.app/payment/callback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Do not commit `.env` or real credentials. The example file is safe to commit.

## Frontend

In a separate terminal, install dependencies and start the Vite development server:

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:5000/api` by default. To use a different API URL, set `VITE_API_URL` in the frontend environment (for example, `VITE_API_URL=https://your-api.example.com/api`). The backend currently accepts browser requests from `https://laundry-pickup-app-chi.vercel.app`, `http://localhost:5173`, and `http://127.0.0.1:5173`; update the allowed origins in `backend/app.js` when deploying the frontend to another domain.

## Authentication

Register or log in at `/api/auth/register` or `/api/auth/login`. Use the returned JWT for protected endpoints:

```http
Authorization: Bearer <token>
```

Swagger UI has an **Authorize** control for setting this token. Role-protected operations additionally require the matching account role: `customer`, `admin`, or `delivery_agent`. Public endpoints and the Paystack webhook do not use a bearer token. The webhook validates Paystack's `x-paystack-signature` header.

## Main Endpoint Groups

- `/api/auth`: register, login, current-user profile
- `/api/orders`: customer order creation, tracking, cancellation, and dashboard
- `/api/admin`: admin dashboard, order management, and agent assignment
- `/api/delivery`: delivery-agent dashboard, assigned orders, availability, and status actions
- `/api/services`: public active catalog and admin service management
- `/api/payments`: Paystack initialize, verify, and webhook endpoints
- `/api/notifications`: list, count, and mark notifications read

The full request bodies, query parameters, authentication requirements, response examples, and error responses are documented in Swagger UI.

The dashboard sidebar includes links to the public storefront home page and service catalog.

## Service Images

Admin service create/update endpoints accept `multipart/form-data` with an `image` file field. Accepted image types are JPEG, PNG, and WebP, up to 5 MB. Cloudinary credentials must be configured in `backend/.env`.
