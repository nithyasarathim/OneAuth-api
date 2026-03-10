# OneAuth Documentation

<div align="center">

<img src="../assets/logo.png" width="600"/>

### **Secure • Scalable • User-Centric**<br>

User Authentication & Account Management Microservice for the **OneAuth Ecosystem**

Version **1.0.0**  
Last Updated — **March 10, 2026**

</div>

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [Architecture & Integration](#architecture--integration)
3. [Tech Stack](#tech-stack)
4. [Responsibilities & Boundaries](#responsibilities--boundaries)
5. [API Reference](#api-reference)
6. [Security & Authentication](#security--authentication)
7. [Environment Variables](#environment-variables)
8. [Setup & Deployment](#setup--deployment)
9. [Configuration & Modes](#configuration--modes)
10. [Logging & Observability](#logging--observability)
11. [Error Handling](#error-handling)
12. [Best Practices & Recommendations](#best-practices--recommendations)

---

## Service Overview

> **Purpose**

**OneAuth** is a comprehensive microservice responsible for user authentication, account management, and single sign-on (SSO) capabilities.

It is used primarily for:

- User registration and email verification
- Secure login with session management
- Password reset functionality
- SSO integration for third-party applications
- User profile and avatar management

Separating authentication into its own microservice improves:

- Security through isolation
- Scalability for user growth
- Maintainability and modularity
- Reusability across applications

### Key Goals

| Goal        | Description                                  |
| ----------- | -------------------------------------------- |
| Security    | Implement robust authentication mechanisms   |
| Scalability | Handle growing user base efficiently         |
| Usability   | Provide seamless user experience             |
| Integration | Support SSO for multiple client applications |

---

## Architecture & Integration

> **High Level Request Flow**

```
Client Application
       │
       │ 1. User initiates auth action (register/login/reset)
       │ 2. Client sends request to OneAuth
       ▼
    OneAuth Microservice
       │
       │ 3. Validate request & rate limit
       │ 4. Generate OTP/session tokens
       │ 5. Store in Redis/MongoDB
       │ 6. Send OTP via OneMail (if needed)
       │ 7. Return response with tokens/cookies
       ▼
Client Application
       │
       │ 8. Store session cookies
       │ 9. User authenticated for future requests
```

### Detailed Architecture Overview

OneAuth is designed as a **stateful microservice** following the **microservices architecture pattern**. It manages user accounts, sessions, and provides SSO functionality.

#### Core Components

| Component       | Technology | Responsibility                     |
| --------------- | ---------- | ---------------------------------- |
| **Express App** | Express.js | HTTP server, routing, middleware   |
| **Controllers** | TypeScript | Business logic for auth operations |
| **Models**      | Mongoose   | User data persistence              |
| **Cache**       | Redis      | Session and OTP storage            |
| **ImageKit**    | ImageKit   | Avatar upload and management       |
| **Middlewares** | Express    | Security, logging, rate limiting   |
| **Utils**       | TypeScript | Client secret validation, helpers  |

#### Request Processing Pipeline

1. **HTTP Request Reception**
   - Express server receives requests
   - JSON parsing and cookie handling

2. **Middleware Execution** (in order)
   - `requestLogger`: Logs all incoming requests
   - `rateLimiter`: Prevents abuse (varies by endpoint)
   - `authenticator`: Validates session tokens for protected routes
   - `sessionValidator`: Checks session validity

3. **Route Handling**
   - Routes to appropriate controller based on endpoint
   - Authentication endpoints: `/auth/*`
   - User management: `/users/*`
   - SSO endpoints: `/sso/*`

4. **Controller Logic**
   - User registration: Email verification → OTP → Account creation
   - Login: Credential validation → Session creation
   - SSO: Auth code generation → Token exchange
   - Password reset: Similar to registration flow

5. **Data Persistence**
   - User accounts stored in MongoDB
   - Sessions and OTPs cached in Redis
   - Avatars managed via ImageKit CDN

6. **Response**
   - JSON responses with success/error status
   - HTTP-only cookies for session management
   - JWT tokens for SSO clients

#### Stateful Design Benefits

- **Session Management**: Persistent user sessions across requests
- **OTP Storage**: Temporary secure storage for verification codes
- **Performance**: Fast access to frequently used data via Redis
- **Scalability**: Horizontal scaling with shared Redis/MongoDB

### Integration Points

| Direction      | Service        | Protocol    | Purpose                     | Data Flow          |
| -------------- | -------------- | ----------- | --------------------------- | ------------------ |
| **Upstream**   | Client Apps    | REST + HTTP | Authentication requests     | POST /auth/\*      |
| **Downstream** | OneMail        | REST + HMAC | OTP email delivery          | POST /otp/mail/\*  |
| **Downstream** | MongoDB        | Mongo Wire  | User data persistence       | CRUD operations    |
| **Downstream** | Redis          | RESP        | Session/OTP caching         | SET/GET operations |
| **Downstream** | ImageKit       | REST        | Avatar storage/management   | Upload/delete      |
| **Monitoring** | Logging system | JSON logs   | Debugging and observability | Structured logs    |

#### Downstream Integration (OneMail)

OneAuth integrates with OneMail for secure OTP delivery:

1. **OTP Generation**: Creates random 4-digit OTP
2. **Payload Signing**: Uses shared secret for HMAC
3. **HTTP Request**: Sends signed payload to OneMail
4. **Response Handling**: Processes delivery confirmation

#### Database Integration (MongoDB)

- **User Accounts**: Stores user profiles, credentials
- **Indexing**: Email indexed for fast lookups
- **Validation**: Schema validation for data integrity

#### Cache Integration (Redis)

- **Sessions**: Stores session tokens with user IDs
- **OTP Storage**: Temporary storage with TTL
- **Performance**: Reduces database load for auth checks

### Data Flow & Security Boundaries

```
┌─────────────────┐    Auth Request    ┌─────────────────┐    OTP Email    ┌─────────────────┐
│   Client App    │ ─────────────────► │     OneAuth     │ ──────────────► │     OneMail     │
│                 │                    │                 │                 │                 │
│ • Register/Login│                    │ • Validate user │                 │ • Send email    │
│ • SSO requests  │                    │ • Generate OTP  │                 │ • Deliver OTP   │
│ • User actions  │                    │ • Manage session│                 │ • Stateless     │
└─────────────────┘                    └─────────────────┘                 └─────────────────┘
```

**Security Boundaries:**

- OneAuth manages user credentials and sessions
- OneMail handles email delivery only
- Shared secrets for inter-service communication
- No sensitive data exposure in logs

### Error Handling & Resilience

- **Fail-Fast**: Invalid requests rejected immediately
- **Graceful Degradation**: Service continues with partial failures
- **Retry Logic**: Client applications should implement retries
- **Circuit Breaker**: Recommended for high-traffic scenarios

---

## Tech Stack

| Layer       | Technology         | Version | Purpose            |
| ----------- | ------------------ | ------- | ------------------ |
| Runtime     | Node.js            | 18+     | Server runtime     |
| Framework   | Express.js         | 5.x     | API routing        |
| Language    | TypeScript         | 5.x     | Type safety        |
| Database    | MongoDB            | 7.x     | User data storage  |
| Cache       | Redis              | 7.x     | Session/OTP cache  |
| ODM         | Mongoose           | 8.x     | MongoDB modeling   |
| Auth        | bcrypt             | 5.x     | Password hashing   |
| Tokens      | jsonwebtoken       | 9.x     | JWT for SSO        |
| Image       | ImageKit           | 5.x     | Avatar management  |
| Security    | express-rate-limit | 7.x     | Rate limiting      |
| Logging     | Winston            | 3.x     | Structured logs    |
| Environment | dotenv             | 16+     | Environment config |

---

## Responsibilities & Boundaries

### What OneAuth Handles

| Feature             | Description                   |
| ------------------- | ----------------------------- |
| User registration   | Email verification flow       |
| Authentication      | Login with session management |
| Password management | Reset and change passwords    |
| SSO implementation  | OAuth-like auth code flow     |
| User profiles       | Profile data management       |
| Avatar management   | Upload/delete via ImageKit    |
| Session management  | Cookie-based sessions         |
| Rate limiting       | Abuse prevention              |

### What OneAuth Does NOT Handle

| Feature           | Reason                     |
| ----------------- | -------------------------- |
| Email delivery    | Handled by OneMail         |
| UI rendering      | Client-side responsibility |
| Social login      | Out of scope               |
| Multi-factor auth | Future enhancement         |
| User analytics    | Not required               |

---

## API Reference

> **Base URL**

Development

```
http://localhost:5001/auth
```

Production

```
https://oneauth.yourdomain.com/auth
```

### Endpoints

#### Authentication Endpoints

| Method | Endpoint                   | Description           | Rate Limit |
| ------ | -------------------------- | --------------------- | ---------- |
| POST   | `/register/verify-email`   | Send registration OTP | 3/min      |
| POST   | `/register/verify-otp`     | Verify OTP            | 3/min      |
| POST   | `/register/create-account` | Create user account   | 3/min      |
| POST   | `/session/login`           | User login            | 5/min      |
| POST   | `/session/logout`          | User logout           | 10/min     |
| POST   | `/password/forget`         | Send reset OTP        | 3/min      |
| POST   | `/password/verify-otp`     | Verify reset OTP      | 3/min      |
| POST   | `/password/reset`          | Reset password        | 3/min      |

#### User Management Endpoints

| Method | Endpoint         | Description         | Auth Required |
| ------ | ---------------- | ------------------- | ------------- |
| GET    | `/users/profile` | Get user profile    | Yes           |
| PUT    | `/users/profile` | Update user profile | Yes           |
| POST   | `/avatar/upload` | Upload avatar       | Yes           |
| DELETE | `/avatar/delete` | Delete avatar       | Yes           |

#### SSO Endpoints

| Method | Endpoint         | Description             | Auth Required |
| ------ | ---------------- | ----------------------- | ------------- |
| GET    | `/sso/authorize` | Generate auth code      | Yes           |
| POST   | `/sso/token`     | Exchange code for token | No            |
| GET    | `/sso/userinfo`  | Get user info           | Yes (Bearer)  |

### Request/Response Formats

#### Registration Flow

**1. Verify Email**

Endpoint: `POST /auth/register/verify-email`

Request Body:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**2. Verify OTP**

Endpoint: `POST /auth/register/verify-otp`

Request Body:

```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**3. Create Account**

Endpoint: `POST /auth/register/create-account`

Request Body:

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "johndoe"
}
```

Response:

```json
{
  "success": true,
  "message": "Account created successfully"
}
```

#### Login

Endpoint: `POST /auth/session/login`

Request Body:

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:

```json
{
  "success": true,
  "message": "Login Successful"
}
```

_Sets HTTP-only cookie: `session_token`_

#### SSO Flow

**1. Authorize**

Endpoint: `GET /auth/sso/authorize?client_id=xxx&redirect_uri=yyy&state=zzz`

Response: Redirect to `redirect_uri` with `code` and `state`

**2. Token Exchange**

Endpoint: `POST /auth/sso/token`

Request Body:

```json
{
  "client_id": "xxx",
  "client_secret": "yyy",
  "code": "auth_code",
  "grant_type": "authorization_code"
}
```

Response:

```json
{
  "access_token": "jwt_token",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Status Codes

| Code | Meaning               | Description              |
| ---- | --------------------- | ------------------------ |
| 200  | Success               | Operation completed      |
| 201  | Created               | Resource created         |
| 400  | Bad Request           | Validation error         |
| 401  | Unauthorized          | Invalid credentials      |
| 403  | Forbidden             | Insufficient permissions |
| 404  | Not Found             | Resource not found       |
| 409  | Conflict              | Resource already exists  |
| 429  | Too Many Requests     | Rate limit exceeded      |
| 500  | Internal Server Error | Server error             |

---

## Security & Authentication

OneAuth implements multiple layers of security including password hashing, session management, JWT tokens, and rate limiting.

### Password Security

- **bcrypt Hashing**: Passwords hashed with salt rounds
- **Minimum Length**: 6 characters enforced
- **No Plain Text**: Never stored or logged in plain text

### Session Management

- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS only in production
- **SameSite**: Lax policy for CSRF protection
- **TTL**: Configurable session expiration

### JWT for SSO

- **RS256 Algorithm**: Asymmetric signing
- **Short Expiration**: 1 hour access tokens
- **Payload**: User ID, client ID, scopes
- **Verification**: Public key validation

### Rate Limiting

| Endpoint Type | Limit  | Window |
| ------------- | ------ | ------ |
| Registration  | 3/min  | 60s    |
| Login         | 5/min  | 60s    |
| General       | 10/min | 60s    |

### Input Validation

- **Email Normalization**: Trim and lowercase
- **Password Requirements**: Minimum length
- **OTP Format**: 4-digit numeric
- **Client Validation**: Allowed client IDs and redirect URIs

### Threat Mitigation

| Threat                | Mitigation                      |
| --------------------- | ------------------------------- |
| **Brute Force**       | Rate limiting, bcrypt           |
| **Session Hijacking** | HTTP-only cookies, secure flags |
| **CSRF**              | SameSite cookies                |
| **XSS**               | Input sanitization              |
| **Replay Attacks**    | OTP TTL, session expiration     |

---

## Environment Variables

| Variable                  | Example                           | Required | Description                |
| ------------------------- | --------------------------------- | -------- | -------------------------- |
| PORT                      | 5001                              | No       | Server port                |
| DATABASE_URL              | mongodb://localhost:27017/oneauth | Yes      | MongoDB connection         |
| CACHE_SERVER_URL          | redis://localhost:6379            | Yes      | Redis connection           |
| EMAIL_SERVER_URL          | http://localhost:5002             | Yes      | OneMail service URL        |
| EMAIL_SERVER_SECRET       | super-secret                      | Yes      | HMAC secret for OneMail    |
| CLIENT_DOMAIN_URL         | http://localhost:3000             | Yes      | CORS origin                |
| SESSION_COOKIE_TTL        | 86400                             | No       | Session duration (seconds) |
| OTP_TTL                   | 300                               | No       | OTP validity (seconds)     |
| VERIFIED_TOKEN_TTL        | 600                               | No       | Verified token TTL         |
| CDN_PRIVATE_KEY           | xxx                               | Yes      | ImageKit private key       |
| CDN_PUBLIC_KEY            | xxx                               | Yes      | ImageKit public key        |
| CDN_PUBLIC_URL            | https://ik.imagekit.io/xxx        | Yes      | ImageKit URL               |
| JWT_SECRET                | jwt-secret                        | Yes      | JWT signing secret         |
| AUTH_TOKEN_TTL            | 3600                              | No       | Auth code TTL              |
| ACCESS_TOKEN_TTL          | 3600                              | No       | Access token TTL           |
| ALLOWED_CLIENT_ID         | client1,client2                   | Yes      | Comma-separated client IDs |
| ALLOWED_REDIRECT_URL      | http://app1.com,http://app2.com   | Yes      | Allowed redirect URIs      |
| ONE_AUTH_CLIENT_ID_SECRET | client1:secret1,client2:secret2   | Yes      | Client ID:secret pairs     |

---

## Setup & Deployment

### Local Development

```bash
git clone <repo>
cd OneAuth/OneAuth-api

npm install

cp .env.example .env
# edit env variables

# Start MongoDB and Redis
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t oneauth:latest .

docker run \
--env-file .env \
-p 8080:8080 \
oneauth:latest
```

---

## Configuration & Modes

| Setting       | Development | Production |
| ------------- | ----------- | ---------- |
| Session TTL   | 24 hours    | 24 hours   |
| OTP TTL       | 5 min       | 5 min      |
| Rate limits   | Lower       | Higher     |
| CORS          | Permissive  | Strict     |
| Logging level | Debug       | Info       |

---

## Logging & Observability

> Logging uses **Winston structured JSON logs**

Example log entry:

```json
{
  "timestamp": "2026-03-10T11:52:34.123Z",
  "level": "info",
  "message": "User login successful",
  "email": "user@example.com",
  "ip": "192.168.1.100",
  "durationMs": 245
}
```

### Recommended Monitoring Tools

| Tool          | Purpose             |
| ------------- | ------------------- |
| ELK Stack     | Centralized logs    |
| Grafana       | Visualization       |
| Prometheus    | Metrics             |
| MongoDB Atlas | Database monitoring |

---

## Error Handling

> OneAuth follows **comprehensive error handling**

| Scenario                 | Status | Retry Safe | Action              |
| ------------------------ | ------ | ---------- | ------------------- |
| Invalid credentials      | 401    | No         | Check input         |
| Rate limit exceeded      | 429    | Yes        | Retry later         |
| Email already exists     | 409    | No         | Use different email |
| Database connection fail | 500    | Yes        | Retry               |
| Invalid OTP              | 400    | No         | Request new OTP     |

---

## Best Practices & Recommendations

- Use strong, unique passwords for all accounts
- Implement proper session management
- Regularly rotate JWT secrets
- Monitor rate limiting and failed login attempts
- Keep dependencies updated
- Use HTTPS in production
- Implement proper backup strategies for MongoDB

---

## Support

If problems occur:

1. Check service logs
2. Validate environment variables
3. Verify database and cache connections
4. Confirm OneMail integration
5. Check client configurations

---

## License

MIT License</content>
<parameter name="filePath">
