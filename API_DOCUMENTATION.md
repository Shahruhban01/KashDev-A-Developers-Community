# KashDev API Documentation

KashDev provides a RESTful backend for a full-stack developer community platform focused on Kashmiri software developers. The API supports authentication, public developer discovery, project showcase, opportunities, profile management, and extended communication capabilities such as chats and message requests.

This document is written as a practical integration reference for backend developers, frontend developers, and anyone maintaining or extending the KashDev platform.

## Base Information

### Base URL

#### Local development
```bash
http://localhost:5000/api
```

#### Example frontend proxy usage
If the Vite frontend proxies `/api` requests to the backend, the frontend can call:
```bash
/api/auth/login
```
Instead of the full backend origin.

## API Style

- Architecture style: REST
- Data format: JSON
- Auth method: JWT Bearer token
- Protected routes: require `Authorization: Bearer <token>` header
- Primary response pattern: JSON object with `success`, optional `message`, optional `data`, and sometimes `pagination`

## Global Conventions

### Request Headers

#### Public routes
```http
Content-Type: application/json
```

#### Protected routes
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Standard Success Response Shape

```json
{
  "success": true,
  "data": {}
}
```

### Standard Error Response Shape

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Successful GET, PUT, or other successful request |
| 201 | Resource created successfully |
| 400 | Validation error or malformed request |
| 401 | Authentication required or token invalid |
| 403 | Authenticated but not allowed |
| 404 | Route or resource not found |
| 500 | Internal server error |

## Authentication

KashDev uses JWT-based authentication. A token is returned after registration or login and should be stored on the client side.

### Auth Flow Summary

1. User registers or logs in.
2. Backend returns JWT token and user summary.
3. Frontend stores token, usually in localStorage.
4. Frontend sends token on protected requests.
5. Backend middleware validates token and attaches authenticated user to the request.

***

# Auth Endpoints

## `POST /auth/register`

Register a new user account and automatically create a linked developer profile.

### Authentication
- Public

### Request Body

```json
{
  "name": "Aqib Khan",
  "username": "aqibdev",
  "email": "aqib@example.com",
  "password": "secret123"
}
```

### Field Rules

| Field | Type | Required | Notes |
|------|------|----------|------|
| name | string | Yes | Display name |
| username | string | Yes | Must be unique |
| email | string | Yes | Must be unique and valid |
| password | string | Yes | Minimum 6 characters |

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "_id": "665d4f8d3d7a1a0012345678",
    "name": "Aqib Khan",
    "username": "aqibdev",
    "email": "aqib@example.com",
    "avatar": "",
    "role": "user",
    "isFeatured": false
  }
}
```

### Error Cases
- Duplicate email
- Duplicate username
- Missing required fields
- Invalid email format
- Password too short

***

## `POST /auth/login`

Authenticate an existing user.

### Authentication
- Public

### Request Body

```json
{
  "email": "aqib@example.com",
  "password": "secret123"
}
```

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "_id": "665d4f8d3d7a1a0012345678",
    "name": "Aqib Khan",
    "username": "aqibdev",
    "email": "aqib@example.com",
    "avatar": "",
    "role": "user",
    "isFeatured": false
  }
}
```

### Error Cases
- Missing email or password
- Invalid credentials

***

## `GET /auth/me`

Fetch the currently authenticated user and linked developer profile.

### Authentication
- Protected

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

### Success Response

```json
{
  "success": true,
  "user": {
    "_id": "665d4f8d3d7a1a0012345678",
    "name": "Aqib Khan",
    "username": "aqibdev",
    "email": "aqib@example.com",
    "bio": "Full-stack developer from Kashmir",
    "avatar": "",
    "location": "Srinagar, Kashmir",
    "role": "user",
    "isFeatured": false,
    "isVerified": false,
    "savedOpportunities": []
  },
  "profile": {
    "_id": "665d4fb93d7a1a0012345688",
    "user": "665d4f8d3d7a1a0012345678",
    "skills": ["React", "Node.js", "MongoDB"],
    "company": "",
    "jobTitle": "",
    "experience": "1-3 years",
    "github": "",
    "linkedin": "",
    "portfolio": "",
    "openToWork": true
  }
}
```

***

# User Endpoints

## `GET /users/stats`

Return platform-wide public community statistics.

### Authentication
- Public

### Success Response

```json
{
  "success": true,
  "data": {
    "users": 120,
    "projects": 58,
    "opportunities": 16
  }
}
```

### Notes
Used on the landing page and other high-level community overview sections.

***

## `PUT /users/me`

Update the current user's basic account information.

### Authentication
- Protected

### Request Body

```json
{
  "name": "Aqib Khan",
  "bio": "Building scalable products for web and mobile.",
  "avatar": "https://example.com/avatar.png",
  "location": "Srinagar, Kashmir"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "665d4f8d3d7a1a0012345678",
    "name": "Aqib Khan",
    "username": "aqibdev",
    "email": "aqib@example.com",
    "bio": "Building scalable products for web and mobile.",
    "avatar": "https://example.com/avatar.png",
    "location": "Srinagar, Kashmir"
  }
}
```

***

# Developer Endpoints

## `GET /developers`

Fetch a paginated list of developers with optional filters.

### Authentication
- Public

### Query Parameters

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| search | string | No | Search by name or username |
| skill | string | No | Filter by skill |
| company | string | No | Filter by company |
| experience | string | No | Filter by experience level |
| page | number | No | Pagination page number |
| limit | number | No | Number of items per page |

### Example Request
```http
GET /api/developers?search=aqib&skill=React&experience=1-3%20years&page=1&limit=12
```

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "665d4fb93d7a1a0012345688",
      "user": {
        "_id": "665d4f8d3d7a1a0012345678",
        "name": "Aqib Khan",
        "username": "aqibdev",
        "bio": "Full-stack developer from Kashmir",
        "avatar": "",
        "location": "Srinagar",
        "isFeatured": true,
        "isVerified": false
      },
      "skills": ["React", "Node.js", "MongoDB"],
      "company": "KashDev Labs",
      "jobTitle": "Software Engineer",
      "experience": "1-3 years",
      "github": "https://github.com/aqibdev",
      "linkedin": "https://linkedin.com/in/aqibdev",
      "portfolio": "https://aqib.dev",
      "openToWork": true,
      "profileViews": 32
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "pages": 1
  }
}
```

### Notes
- Search is typically applied against user name and username.
- Skill and company filters help power the public directory.
- Results are designed for grid-card rendering on the frontend.

***

## `GET /developers/:username`

Fetch a developer profile using the public username route.

### Authentication
- Public

### URL Params

| Param | Type | Description |
|------|------|-------------|
| username | string | Developer username |

### Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "665d4f8d3d7a1a0012345678",
      "name": "Aqib Khan",
      "username": "aqibdev",
      "email": "aqib@example.com",
      "bio": "Full-stack developer from Kashmir",
      "avatar": "",
      "location": "Srinagar",
      "isFeatured": true,
      "isVerified": false
    },
    "profile": {
      "skills": ["React", "Node.js", "MongoDB"],
      "company": "KashDev Labs",
      "jobTitle": "Software Engineer",
      "experience": "1-3 years",
      "github": "https://github.com/aqibdev",
      "linkedin": "https://linkedin.com/in/aqibdev",
      "portfolio": "https://aqib.dev",
      "openToWork": true,
      "achievements": ["Built 10+ production apps"],
      "hallOfFameCategory": "open-source",
      "profileViews": 33
    },
    "projects": [
      {
        "_id": "665d52d53d7a1a0012345699",
        "title": "KashDev",
        "description": "Developer community platform",
        "githubUrl": "https://github.com/example/kashdev",
        "demoUrl": "https://kashdev.app",
        "technologies": ["React", "Node.js", "MongoDB"],
        "likesCount": 14,
        "status": "active"
      }
    ]
  }
}
```

### Backend Behavior
- The profile view counter may be incremented on each fetch.
- Active projects for that user are returned with the profile payload.

***

## `PUT /developers/profile`

Update the authenticated user's extended developer profile.

### Authentication
- Protected

### Request Body

```json
{
  "name": "Aqib Khan",
  "bio": "Full-stack engineer focused on community products.",
  "avatar": "https://example.com/avatar.png",
  "location": "Srinagar, Kashmir",
  "skills": ["React", "Node.js", "MongoDB", "Flutter"],
  "company": "KashDev Labs",
  "jobTitle": "Full Stack Developer",
  "experience": "3-5 years",
  "github": "https://github.com/aqibdev",
  "linkedin": "https://linkedin.com/in/aqibdev",
  "portfolio": "https://aqib.dev",
  "twitter": "https://x.com/aqibdev",
  "openToWork": true,
  "openToFreelance": true,
  "achievements": [
    "Built a developer community product",
    "Contributed to open source"
  ]
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "665d4fb93d7a1a0012345688",
    "user": "665d4f8d3d7a1a0012345678",
    "skills": ["React", "Node.js", "MongoDB", "Flutter"],
    "company": "KashDev Labs",
    "jobTitle": "Full Stack Developer",
    "experience": "3-5 years",
    "github": "https://github.com/aqibdev",
    "linkedin": "https://linkedin.com/in/aqibdev",
    "portfolio": "https://aqib.dev",
    "twitter": "https://x.com/aqibdev",
    "openToWork": true,
    "openToFreelance": true,
    "achievements": [
      "Built a developer community product",
      "Contributed to open source"
    ]
  }
}
```

### Notes
This endpoint often updates both the base user document and the linked developer profile document.

***

## `GET /developers/hall-of-fame`

Fetch developers featured in Hall of Fame categories.

### Authentication
- Public

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "665d4fb93d7a1a0012345688",
      "hallOfFameCategory": "open-source",
      "achievements": ["Core maintainer of community tools"],
      "user": {
        "name": "Aqib Khan",
        "username": "aqibdev",
        "avatar": "",
        "bio": "Full-stack developer from Kashmir"
      }
    }
  ]
}
```

### Supported Categories
- `top-contributor`
- `startup-founder`
- `major-company`
- `open-source`

***

# Project Endpoints

## `GET /projects`

Fetch public project listings with optional filtering and pagination.

### Authentication
- Public

### Query Parameters

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| search | string | No | Search title or description |
| tech | string | No | Filter by technology |
| page | number | No | Pagination page |
| limit | number | No | Items per page |

### Example Request
```http
GET /api/projects?search=community&tech=React&page=1&limit=12
```

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "665d52d53d7a1a0012345699",
      "title": "KashDev",
      "description": "Developer community platform for Kashmiri engineers.",
      "githubUrl": "https://github.com/example/kashdev",
      "demoUrl": "https://kashdev.app",
      "technologies": ["React", "Node.js", "MongoDB"],
      "owner": {
        "_id": "665d4f8d3d7a1a0012345678",
        "name": "Aqib Khan",
        "username": "aqibdev",
        "avatar": ""
      },
      "likesCount": 14,
      "isFeatured": true,
      "status": "active",
      "createdAt": "2026-06-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "pages": 1
  }
}
```

***

## `POST /projects`

Create a new project owned by the authenticated user.

### Authentication
- Protected

### Request Body

```json
{
  "title": "KashDev",
  "description": "A platform for Kashmiri developers to connect and showcase work.",
  "githubUrl": "https://github.com/example/kashdev",
  "demoUrl": "https://kashdev.app",
  "technologies": ["React", "Node.js", "MongoDB"],
  "status": "active"
}
```

### Alternative Input Pattern
Some frontend forms may submit `technologies` as a comma-separated string. The backend can normalize it into an array.

```json
{
  "title": "KashDev",
  "description": "A platform for Kashmiri developers to connect and showcase work.",
  "technologies": "React, Node.js, MongoDB"
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "665d52d53d7a1a0012345699",
    "title": "KashDev",
    "description": "A platform for Kashmiri developers to connect and showcase work.",
    "githubUrl": "https://github.com/example/kashdev",
    "demoUrl": "https://kashdev.app",
    "technologies": ["React", "Node.js", "MongoDB"],
    "owner": {
      "_id": "665d4f8d3d7a1a0012345678",
      "name": "Aqib Khan",
      "username": "aqibdev",
      "avatar": ""
    },
    "likesCount": 0,
    "status": "active"
  }
}
```

***

## `PUT /projects/:id`

Update a project owned by the authenticated user.

### Authentication
- Protected

### URL Params

| Param | Type | Description |
|------|------|-------------|
| id | string | Project MongoDB ObjectId |

### Request Body

```json
{
  "title": "KashDev Platform",
  "description": "Updated description",
  "demoUrl": "https://app.kashdev.com",
  "status": "wip"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "665d52d53d7a1a0012345699",
    "title": "KashDev Platform",
    "description": "Updated description",
    "demoUrl": "https://app.kashdev.com",
    "status": "wip"
  }
}
```

### Error Cases
- Project not found
- Not owner of project
- Validation failure

***

## `DELETE /projects/:id`

Delete a project owned by the authenticated user.

### Authentication
- Protected

### Success Response

```json
{
  "success": true,
  "message": "Project deleted"
}
```

***

## `POST /projects/:id/like`

Toggle like status for a project.

### Authentication
- Protected

### Success Response

```json
{
  "success": true,
  "liked": true,
  "likesCount": 15
}
```

### Notes
- If the project was not liked before, this request likes it.
- If already liked, this request removes the like.

***

# Opportunity Endpoints

## `GET /opportunities`

Fetch public opportunity listings.

### Authentication
- Public

### Query Parameters

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | No | Filter by opportunity type |
| search | string | No | Search title, description, or company |
| page | number | No | Pagination page |
| limit | number | No | Items per page |

### Supported Types
- `job`
- `internship`
- `freelance`
- `cofounder`

### Example Request
```http
GET /api/opportunities?type=freelance&page=1&limit=10
```

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "665d55ef3d7a1a0012345701",
      "title": "Frontend React Developer",
      "type": "freelance",
      "description": "Looking for a React developer to build a dashboard.",
      "company": "Northern Systems",
      "location": "Remote",
      "salary": "Negotiable",
      "skills": ["React", "Tailwind CSS"],
      "postedBy": {
        "_id": "665d4f8d3d7a1a0012345678",
        "name": "Aqib Khan",
        "username": "aqibdev",
        "avatar": ""
      },
      "isActive": true,
      "createdAt": "2026-06-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

***

## `POST /opportunities`

Create a new opportunity.

### Authentication
- Protected

### Request Body

```json
{
  "title": "Frontend React Developer",
  "type": "freelance",
  "description": "Looking for a React developer to build a dashboard.",
  "company": "Northern Systems",
  "location": "Remote",
  "salary": "Negotiable",
  "skills": ["React", "Tailwind CSS"]
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "665d55ef3d7a1a0012345701",
    "title": "Frontend React Developer",
    "type": "freelance",
    "description": "Looking for a React developer to build a dashboard.",
    "company": "Northern Systems",
    "location": "Remote",
    "salary": "Negotiable",
    "skills": ["React", "Tailwind CSS"],
    "postedBy": {
      "_id": "665d4f8d3d7a1a0012345678",
      "name": "Aqib Khan",
      "username": "aqibdev",
      "avatar": ""
    }
  }
}
```

***

## `DELETE /opportunities/:id`

Delete an opportunity posted by the authenticated user.

### Authentication
- Protected

### Success Response

```json
{
  "success": true,
  "message": "Opportunity removed"
}
```

### Error Cases
- Opportunity not found
- Not owner of the opportunity

***

## `POST /opportunities/:id/save`

Toggle save status for an opportunity for the authenticated user.

### Authentication
- Protected

### Success Response

```json
{
  "success": true,
  "saved": true
}
```

### Notes
This endpoint updates the authenticated user's saved opportunities list.

***

# Chat and Messaging Endpoints

These routes were added later in the project discussion and represent the communication layer of KashDev.

## Route Mounting Requirement

The chats router must be mounted in the backend server:

```js
app.use('/api/chats', require('./src/routes/chats'))
```

If the router is not mounted, all chat endpoints will return `404 Not Found`.

## Router Shape

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

***

## `GET /chats`

Fetch the authenticated user's chat list.

### Authentication
- Protected

### Expected Response Shape

```json
{
  "success": true,
  "data": [
    {
      "_id": "666000001111222233334444",
      "participants": [
        {
          "_id": "665d4f8d3d7a1a0012345678",
          "name": "Aqib Khan",
          "username": "aqibdev",
          "avatar": ""
        },
        {
          "_id": "665d4f8d3d7a1a0012345679",
          "name": "Irfan Shah",
          "username": "irfanshah",
          "avatar": ""
        }
      ],
      "lastMessage": {
        "content": "Let's connect",
        "createdAt": "2026-06-04T00:00:00.000Z"
      },
      "unreadCount": 2,
      "archived": false
    }
  ]
}
```

***

## `GET /chats/requests`

Fetch incoming or outgoing message requests for the authenticated user.

### Authentication
- Protected

### Success Response Example

```json
{
  "success": true,
  "data": [
    {
      "_id": "666000001111222233339999",
      "fromUser": {
        "_id": "665d4f8d3d7a1a0012345679",
        "name": "Irfan Shah",
        "username": "irfanshah"
      },
      "toUser": {
        "_id": "665d4f8d3d7a1a0012345678",
        "name": "Aqib Khan",
        "username": "aqibdev"
      },
      "message": "Hi, would love to connect.",
      "status": "pending",
      "createdAt": "2026-06-04T00:00:00.000Z"
    }
  ]
}
```

***

## `POST /chats/requests`

Send a message request to another user.

### Authentication
- Protected

### Important Note
The correct route is plural:
```bash
/chats/requests
```
Not:
```bash
/chats/request
```

Using the singular form causes a `404 Not Found` because the route does not exist.

### Request Body

```json
{
  "toUserId": "665d4f8d3d7a1a0012345679",
  "message": "Hi Irfan, I'd love to connect!"
}
```

### Possible Success Responses

#### Request sent
```json
{
  "success": true,
  "type": "request_sent",
  "message": "Message request sent"
}
```

#### Existing chat already available
```json
{
  "success": true,
  "type": "chat_exists",
  "chatId": "666000001111222233334444"
}
```

### Client-Side Usage Pattern
A profile page can call this endpoint when the viewer clicks a `Message` button.

***

## `PUT /chats/requests/:requestId`

Accept or reject an existing message request.

### Authentication
- Protected

### URL Params

| Param | Type | Description |
|------|------|-------------|
| requestId | string | Message request id |

### Request Body Example

```json
{
  "action": "accept"
}
```

Or:

```json
{
  "action": "reject"
}
```

### Success Response Example

```json
{
  "success": true,
  "message": "Request accepted",
  "chatId": "666000001111222233334444"
}
```

***

## `GET /chats/with/:userId`

Get an existing chat with a user or create a new one.

### Authentication
- Protected

### URL Params

| Param | Type | Description |
|------|------|-------------|
| userId | string | Target user id |

### Success Response Example

```json
{
  "success": true,
  "data": {
    "_id": "666000001111222233334444",
    "participants": [
      "665d4f8d3d7a1a0012345678",
      "665d4f8d3d7a1a0012345679"
    ]
  }
}
```

***

## `GET /chats/:chatId/messages`

Fetch messages for a given chat.

### Authentication
- Protected

### URL Params

| Param | Type | Description |
|------|------|-------------|
| chatId | string | Chat id |

### Success Response Example

```json
{
  "success": true,
  "data": [
    {
      "_id": "666000001111222233335555",
      "chat": "666000001111222233334444",
      "sender": {
        "_id": "665d4f8d3d7a1a0012345678",
        "name": "Aqib Khan",
        "username": "aqibdev",
        "avatar": ""
      },
      "content": "Hi, would love to connect.",
      "isEdited": false,
      "isDeleted": false,
      "createdAt": "2026-06-04T00:00:00.000Z"
    }
  ]
}
```

***

## `PUT /chats/:chatId/archive`

Archive or unarchive a chat.

### Authentication
- Protected

### URL Params

| Param | Type | Description |
|------|------|-------------|
| chatId | string | Chat id |

### Request Body Example

```json
{
  "archived": true
}
```

### Success Response Example

```json
{
  "success": true,
  "message": "Chat archived"
}
```

***

# Suggested Validation Rules

Although not every rule may be fully implemented yet, the following validation policy is recommended for production readiness.

## User Validation
- Name required
- Username required, unique, trimmed, lowercase-safe
- Email required, unique, valid format
- Password minimum length 6

## Developer Profile Validation
- Skills should be an array of strings
- Experience should match allowed enum values
- Social links should be valid URLs when provided

## Project Validation
- Title required
- Description required
- At least one technology required
- Owner auto-derived from auth token

## Opportunity Validation
- Title required
- Type must be one of supported values
- Description required
- Poster auto-derived from auth token

## Message Request Validation
- `toUserId` required
- Cannot message self
- Duplicate pending requests should be prevented

## Common Integration Patterns

## Axios Auth Setup

```js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kashdev_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

## Example Protected Request

```js
const { data } = await api.post('/projects', {
  title: 'KashDev',
  description: 'Community platform',
  technologies: ['React', 'Node.js', 'MongoDB'],
})
```

## Example Message Request from Profile Page

```js
const handleMessage = async () => {
  if (!authUser) {
    navigate('/login')
    return
  }

  const { data } = await api.post('/chats/requests', {
    toUserId: profileUser._id,
    message: `Hi ${profileUser.name}, I'd love to connect!`,
  })

  if (data.type === 'chat_exists') {
    navigate('/messages')
  }
}
```

## Error Handling Recommendations

### Frontend
- Surface `message` from API errors in toast or inline form state
- Redirect to login on `401`
- Handle empty states gracefully for listing endpoints
- Detect `404` on profile pages and show not found state

### Backend
- Use centralized error middleware
- Normalize duplicate key and validation errors
- Return consistent JSON error structure
- Reject unauthorized resource mutation attempts with `403`

## Security Recommendations

For production readiness, the following practices are recommended:
- Use strong JWT secret
- Set proper CORS origin restrictions
- Add request validation with a schema library
- Sanitize user-generated content if rendering rich text later
- Use HTTPS in production
- Add rate limiting on auth and messaging endpoints
- Consider refresh tokens if long-lived sessions are needed

## Performance Recommendations

As KashDev grows, the following improvements will become important:
- Add pagination defaults across all list endpoints
- Add MongoDB indexes for username, email, skills, technologies, and opportunity type
- Cache community statistics
- Optimize search queries with text indexes
- Use cursor pagination for high-volume message lists

## Known Project-Specific Pitfalls

### 1. Route Mismatch
A frontend call to `/api/chats/request` fails because the backend defines `/api/chats/requests`.

### 2. Missing Router Mount
Having a route file is not enough. The router must be mounted in `server.js`.

### 3. Hook Misuse in React
Calling `useAuth()` outside the component body causes an invalid hook call.

### 4. Variable Collision in Developer Profile
Using `user` for both authenticated user and profile owner causes message-send bugs and logical confusion.

Recommended naming:
- `authUser` for logged-in user
- `profileUser` for viewed developer page owner

## API Testing Checklist

Use Postman, Insomnia, or a custom frontend to verify the following flows:

### Auth
- Register a new user
- Login with valid credentials
- Reject invalid credentials
- Fetch current user with token

### Developers
- List developers
- Search developers
- Filter by skill and experience
- Open developer profile by username
- Update developer profile with token

### Projects
- Create project
- Update own project
- Prevent update of another user's project
- Like and unlike project
- Delete own project

### Opportunities
- Create opportunity
- Filter opportunities by type
- Save and unsave opportunity
- Delete own opportunity

### Chats
- Fetch own chats
- Send message request
- Accept message request
- Fetch messages for chat
- Archive chat

## Conclusion

The KashDev API is structured to support both a polished public-facing developer community and authenticated user workflows behind the scenes. It already covers the main building blocks of identity, discovery, projects, and opportunities, and it also leaves room for platform expansion into messaging, groups, company profiles, and broader network functionality.

With consistent route naming, strong validation, secure middleware, and careful frontend integration, this API can serve as the backend foundation for a scalable community-driven developer ecosystem.