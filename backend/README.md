# KashDev Backend Documentation

KashDev Backend is the server-side application that powers authentication, developer discovery, project publishing, opportunities, profile management, and extended messaging capabilities for the KashDev platform.

It is built with Node.js, Express.js, MongoDB, and Mongoose, and follows a modular structure based on routes, controllers, models, middleware, and utilities.

## Backend Overview

The backend is responsible for secure data access, business logic, persistence, authentication, and standardized API responses. It serves the frontend through REST endpoints and is designed for a separated deployment setup.

### Core Responsibilities
- User authentication and token generation
- User and developer profile persistence
- Project CRUD operations
- Opportunity CRUD operations
- Developer discovery queries
- Public profile delivery
- Community statistics delivery
- Chat and message request support in the extended version
- Request validation and error handling

## Technology Stack

| Layer | Technology | Purpose |
|------|------------|---------|
| Runtime | Node.js | Server runtime |
| Framework | Express.js | HTTP server and routing |
| Database | MongoDB | Primary data store |
| ODM | Mongoose | Schema modeling and query layer |
| Auth | JWT | Stateless authentication |
| Password security | bcryptjs | Password hashing |
| Security headers | Helmet | Security middleware |
| CORS | cors | Frontend/backend origin control |
| Logging | Morgan | Dev request logging |
| Rate limiting | express-rate-limit | Basic abuse prevention |

## Backend Folder Structure

```bash
backend/
├── package.json
├── .env.example
├── server.js
└── src/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── developerController.js
    │   ├── projectController.js
    │   ├── opportunityController.js
    │   └── chatController.js
    ├── middleware/
    │   ├── auth.js
    │   └── errorHandler.js
    ├── models/
    │   ├── User.js
    │   ├── DeveloperProfile.js
    │   ├── Project.js
    │   ├── Opportunity.js
    │   └── additional chat-related models
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   ├── developers.js
    │   ├── projects.js
    │   ├── opportunities.js
    │   └── chats.js
    └── utils/
        └── generateToken.js
```

## Server Entry Point

## `server.js`
This file boots the Express server and mounts the route system.

### Typical Responsibilities
- Load environment variables
- Connect to MongoDB
- Register middleware
- Register API routes
- Define health check route
- Define fallback 404 route
- Register error middleware
- Start HTTP server

### Common Mounted Routes
```js
app.use('/api/auth', require('./src/routes/auth'))
app.use('/api/users', require('./src/routes/users'))
app.use('/api/developers', require('./src/routes/developers'))
app.use('/api/projects', require('./src/routes/projects'))
app.use('/api/opportunities', require('./src/routes/opportunities'))
app.use('/api/chats', require('./src/routes/chats'))
```

### Important Note
If a router is not mounted here, the corresponding endpoints return `404 Not Found` even if the route file exists.

## Environment Variables

Create a `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kashdev
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Database Configuration

## `config/db.js`
Responsible for MongoDB connection.

### Responsibilities
- Connect Mongoose to MongoDB
- Log successful connection
- Exit process on unrecoverable DB failure

## Data Models

The backend is model-driven through Mongoose schemas.

## User Model

Represents the account identity of a platform member.

### Main Fields
- `name`
- `username`
- `email`
- `password`
- `bio`
- `avatar`
- `location`
- `role`
- `isFeatured`
- `isVerified`
- `savedOpportunities`
- `createdAt`
- `updatedAt`

### Behavior
- Password is hashed before save
- Password can be compared through an instance method

### Common Constraints
- Unique username
- Unique email
- Minimum password length
- Username format restrictions

## DeveloperProfile Model

Stores professional and public metadata separate from the base account.

### Main Fields
- `user`
- `skills`
- `company`
- `jobTitle`
- `experience`
- `github`
- `linkedin`
- `portfolio`
- `twitter`
- `openToWork`
- `openToFreelance`
- `achievements`
- `hallOfFameCategory`
- `profileViews`

### Design Reasoning
Keeping developer-specific fields in a dedicated profile model makes the system easier to extend without overloading the base user schema.

## Project Model

Represents user-created projects shown publicly on the platform.

### Main Fields
- `title`
- `description`
- `githubUrl`
- `demoUrl`
- `technologies`
- `owner`
- `likes`
- `likesCount`
- `isFeatured`
- `status`

### Suggested Indexes
- `owner`
- `technologies`
- `isFeatured`

## Opportunity Model

Represents job or collaboration opportunities.

### Main Fields
- `title`
- `type`
- `description`
- `company`
- `location`
- `salary`
- `skills`
- `postedBy`
- `savedBy`
- `isActive`
- `expiresAt`

### Supported Types
- `job`
- `internship`
- `freelance`
- `cofounder`

## Messaging Extension Models

Later conversation steps introduced an extended messaging layer.

Possible models include:
- Chat
- Message
- MessageRequest
- Group
- GroupMembership

These models support communication features beyond the base platform.

## Route Layer

Routes define the public API surface and delegate logic to controllers.

## Auth Routes

Typical endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## User Routes

Typical endpoints:
- `GET /api/users/stats`
- `PUT /api/users/me`

## Developer Routes

Typical endpoints:
- `GET /api/developers`
- `GET /api/developers/:username`
- `PUT /api/developers/profile`
- `GET /api/developers/hall-of-fame`

## Project Routes

Typical endpoints:
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/like`

## Opportunity Routes

Typical endpoints:
- `GET /api/opportunities`
- `POST /api/opportunities`
- `DELETE /api/opportunities/:id`
- `POST /api/opportunities/:id/save`

## Chat Routes

Later-added routing shape:

```js
router.use(protect)
router.get('/', getMyChats)
router.get('/requests', getMessageRequests)
router.post('/requests', sendMessageRequest)
router.put('/requests/:requestId', respondToRequest)
router.get('/with/:userId', getOrCreateChat)
router.get('/:chatId/messages', getChatMessages)
router.put('/:chatId/archive', archiveChat)
```

### Critical Note
The correct send-request route is:
```bash
POST /api/chats/requests
```
Not:
```bash
POST /api/chats/request
```

The singular form causes a route mismatch and `404 Not Found`.

## Controller Layer

Controllers contain business logic for each route group.

## `authController.js`

### Responsibilities
- Register users
- Validate login credentials
- Return JWT tokens
- Return current authenticated user profile bundle

### Typical Methods
- `register`
- `login`
- `getMe`

## `developerController.js`

### Responsibilities
- List developers
- Apply search and filter logic
- Fetch developer by username
- Update developer profile
- Fetch Hall of Fame data

### Typical Methods
- `getDevelopers`
- `getDeveloperByUsername`
- `updateProfile`
- `getHallOfFame`

## `projectController.js`

### Responsibilities
- Return project listings
- Create projects
- Update projects
- Delete projects
- Toggle project likes

### Typical Methods
- `getProjects`
- `createProject`
- `updateProject`
- `deleteProject`
- `toggleLike`

## `opportunityController.js`

### Responsibilities
- Return opportunity listings
- Create opportunity posts
- Delete opportunities
- Toggle opportunity saves

### Typical Methods
- `getOpportunities`
- `createOpportunity`
- `deleteOpportunity`
- `toggleSave`

## `chatController.js`

### Responsibilities
- Return authenticated user's chats
- Return message requests
- Send message requests
- Accept or reject requests
- Get or create chat by user id
- Return chat messages
- Archive chat

### Typical Methods
- `getMyChats`
- `getMessageRequests`
- `sendMessageRequest`
- `respondToRequest`
- `getOrCreateChat`
- `getChatMessages`
- `archiveChat`

## Middleware Layer

## `middleware/auth.js`

This middleware secures protected routes.

### Responsibilities
- Read Bearer token from request header
- Verify JWT
- Load authenticated user from database
- Attach user to `req.user`
- Reject unauthorized requests

### Common Exports
- `protect`
- `optionalAuth`

## `middleware/errorHandler.js`

Centralized error formatting layer.

### Responsibilities
- Convert thrown errors into JSON responses
- Normalize Mongoose validation errors
- Normalize duplicate key errors
- Handle invalid ObjectId errors
- Include stack traces in development if desired

## Utility Layer

## `utils/generateToken.js`

### Responsibilities
- Generate JWT for a user id
- Respect configured expiry from environment variables

## Request Lifecycle Example

Example for `POST /api/projects`:

1. Request hits Express server.
2. `protect` middleware validates token.
3. Route delegates to `createProject` controller.
4. Controller validates incoming data.
5. Project is created with `owner` derived from authenticated user.
6. Response returns created resource.

## Authentication and Authorization Strategy

### Authentication
Handled with JWT tokens.

### Authorization
Resource ownership checks are used in mutation endpoints.

Examples:
- Only a project owner can update or delete a project.
- Only an opportunity creator can remove an opportunity.
- Only authenticated users can send message requests.

## Query and Filtering Behavior

## Developer Queries
Supported filters can include:
- Search
- Skill
- Company
- Experience
- Page
- Limit

## Project Queries
Supported filters can include:
- Search
- Technology
- Page
- Limit

## Opportunity Queries
Supported filters can include:
- Type
- Search
- Page
- Limit

## Security Middleware

The backend includes production-oriented middleware.

## Helmet
Adds security-related HTTP headers.

## CORS
Allows frontend/backend communication in separated deployment.

## Rate Limiting
Helps prevent API abuse.

## Morgan
Useful for development logging.

## Express JSON Parsing
Parses request bodies for JSON APIs.

## Validation and Error Patterns

Common backend response style:

### Success
```json
{
  "success": true,
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Not authorized"
}
```

### Recommended Validation Additions
Although the base scaffold already includes schema-level validation, production readiness can improve further through:
- Request schema validation library
- Sanitization for text fields
- Stronger URL validation
- Duplicate pending request prevention in chat flow
- Self-message prevention in message requests

## Backend Development Setup

### Install dependencies
```bash
cd backend
npm install
```

### Start development server
```bash
npm run dev
```

### Production start
```bash
npm start
```

## Example `package.json` Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

## Example Health Check

A simple health route can be exposed:

```js
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KashDev API is running' })
})
```

## Common Backend Issues Encountered During Development

## 1. Missing Router Mount
A route file existed but returned 404 because it was not mounted in `server.js`.

### Fix
Mount the router explicitly:
```js
app.use('/api/chats', require('./src/routes/chats'))
```

## 2. Route Mismatch
Frontend used `/api/chats/request`, but backend defined `/api/chats/requests`.

### Fix
Use the exact registered route path.

## 3. Ownership Validation
Mutation routes must ensure authenticated users can only modify their own data.

### Examples
- Updating only own project
- Deleting only own opportunity
- Managing only own profile

## 4. ObjectId Errors
Invalid MongoDB ids can throw cast errors.

### Fix
Catch and normalize through centralized error middleware.

## Deployment Guidance

## Recommended Deployment Split
- Frontend on Vercel or Netlify
- Backend on Render, Railway, VPS, or Docker host
- MongoDB on Atlas or managed database server

## Production Considerations
- Replace development Mongo URI
- Use strong JWT secret
- Restrict CORS to trusted frontend origins
- Enable HTTPS
- Tune rate limits
- Add monitoring and logging

## Scalability Recommendations

To support growth toward thousands of users, the backend can evolve in these ways:
- Add text indexes for search
- Add cursor pagination for messages
- Add notification model and service
- Add job queue for email and async work
- Add media upload service
- Add admin moderation tooling
- Add caching for high-traffic public pages
- Add audit logging for important actions

## Suggested Future Backend Modules

- Notifications service
- Company profiles service
- Forum discussions service
- Groups and membership service
- Events service
- Admin analytics service
- Recommendation engine for developers and opportunities

## Backend Summary

The KashDev backend is designed as a modular Node.js and Express API with MongoDB persistence and JWT authentication. It provides a strong base for a community-focused developer platform and is structured to support both the original discovery and showcase use cases and the later-added messaging and social features.