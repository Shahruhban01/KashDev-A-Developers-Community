# KashDev

KashDev is a full-stack web platform built to strengthen the Kashmiri developer ecosystem by helping software developers discover each other, showcase technical work, find career opportunities, and participate in a more connected professional community.

The project was designed as a community-first product rather than a generic startup landing page. Its structure combines a developer directory, public profiles, project discovery, opportunities, recognition systems, and account-level management features into a scalable platform architecture suitable for long-term growth.

## Vision

KashDev aims to become a dedicated digital home for Kashmiri developers. The platform focuses on visibility, credibility, connection, and opportunity by giving developers a place to present skills, publish projects, build reputation, and engage with peers.

The product direction emphasizes:
- Community-driven identity
- Professional presentation
- Developer-focused workflows
- Scalable full-stack architecture
- Dark, premium, modern interface design

## Core Features

### Public Platform Features
- Landing page with community-oriented storytelling and curated sections
- Community statistics overview
- Featured developers section
- Featured projects section
- Hall of Fame recognition system
- Opportunity listings for jobs, internships, freelance roles, and co-founder search
- Community testimonials and join CTA

### Developer Discovery
- Search developers by name or username
- Filter by skills
- Filter by company
- Filter by experience level
- Responsive developer directory grid

### Developer Profiles
- Public developer profile route using username-based URL
- Profile banner and avatar
- Bio and location
- Skills and experience
- GitHub, LinkedIn, and portfolio links
- Projects and achievements
- Featured and verified style indicators
- Open-to-work indicator
- Hall of Fame category support

### Projects
- Public projects listing page
- Add project
- Edit project
- Delete project
- Showcase technologies used
- GitHub and demo links
- Project likes
- Featured projects support

### Opportunities
- Public opportunities listing page
- Opportunity posting for authenticated users
- Opportunity types: jobs, internships, freelance, co-founder search
- Save opportunities
- Skill tags and company details

### Dashboard
- Edit user profile
- Edit developer profile details
- Manage projects
- Manage opportunities
- View personal profile information
- Authenticated experience for account management

### Messaging and Community Extensions
During the conversation, additional navigation and messaging-oriented enhancements were introduced, including messages, groups, companies, search, forum, and insights routes. These additions reflect an expanded product direction and should be treated as extension modules on top of the original core platform architecture.

## Design System

KashDev intentionally avoids the overused visual language of generic AI SaaS templates. The project uses a more grounded and product-driven visual style inspired by platforms such as GitHub, Indie Hackers, Product Hunt, and Linear.

### Design Principles
- Premium dark theme
- Strong typography
- Clean, structured cards
- Subtle motion and animation
- Excellent spacing and readability
- Authentic community feel instead of abstract marketing visuals
- Professional interface patterns over decorative landing-page effects

### UI Characteristics
- Card-heavy layout for content grouping
- Minimal but polished hover states
- Consistent tag and badge styling
- Lightweight interaction feedback
- Responsive layout for desktop and mobile
- Sticky top navigation with account actions

## Technology Stack

## Frontend
- React.js
- Vite
- JavaScript only (no TypeScript)
- React Router
- Tailwind CSS
- Axios for API communication
- React Hot Toast for notifications
- Lucide React for icons

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Helmet for security headers
- CORS configuration
- Morgan for request logging
- Express rate limiting

## Architecture

The application follows a separated frontend and backend structure to support cleaner deployment, maintainability, and scalability.

### Frontend Responsibilities
- Routing and page rendering
- UI components and layout system
- Auth state management
- Calling backend APIs
- Rendering dashboard and public pages
- Managing loading and error states

### Backend Responsibilities
- REST API delivery
- Authentication and authorization
- MongoDB data modeling
- Business logic for developers, projects, opportunities, and users
- Secure route protection using JWT middleware
- Error handling and validation

## Folder Structure

```bash
kashdev/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── layout/
│       │   ├── sections/
│       │   └── ui/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── utils/
│
└── backend/
    ├── package.json
    ├── .env.example
    ├── server.js
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        └── utils/
```

## Frontend Pages

### Landing Page
Primary marketing and onboarding surface for the community.

Sections include:
- Hero
- Community Stats
- Featured Developers
- Featured Projects
- Hall of Fame teaser
- Opportunities teaser or section
- Testimonials
- Join Community CTA

### `/developers`
Developer directory page with:
- Search
- Skill filter
- Experience filter
- Grid layout
- Empty state handling
- Responsive card rendering

### `/developers/:username`
Public developer profile page with:
- Banner
- Avatar
- Bio
- Links
- Skills
- Experience
- Achievements
- Hall of Fame label
- Project showcase
- Optional message action

### `/projects`
Projects showcase page with:
- Search projects
- Add project modal/form
- Project cards
- Like interaction
- Demo and GitHub links

### `/opportunities`
Opportunities discovery page with:
- Filter by opportunity type
- Create opportunity modal/form
- Save opportunity support
- Opportunity card display

### `/hall-of-fame`
Recognition page with categorized members such as:
- Top contributors
- Startup founders
- Engineers at major companies
- Open source contributors

### `/dashboard`
Authenticated dashboard for content and profile management.

Potential areas include:
- Profile settings
- Project management
- Opportunity management
- Account controls
- Personal stats

### Additional Routes Introduced Later
As the conversation evolved, more product modules were referenced:
- `/messages`
- `/groups`
- `/groups/:slug`
- `/companies`
- `/search`
- `/forum`
- `/insights`
- `/account`
- `/popular`

These routes indicate the platform can evolve beyond a directory into a broader professional network and community product.

## Backend Data Models

### User Model
Stores core account information.

Fields:
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

### DeveloperProfile Model
Stores developer-specific public and professional metadata.

Fields:
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

### Project Model
Stores user-submitted projects.

Fields:
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

### Opportunity Model
Stores published opportunities.

Fields:
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

### Messaging and Group Extensions
Additional route and page discussions imply supporting models such as:
- Chat
- Message
- MessageRequest
- Group
- GroupMembership

These are part of the expanded version of the platform but were not fully finalized in the original base scaffold.

## API Overview

The backend follows REST conventions.

### Auth Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### User Routes
- `GET /api/users/stats`
- `PUT /api/users/me`

### Developer Routes
- `GET /api/developers`
- `GET /api/developers/:username`
- `PUT /api/developers/profile`
- `GET /api/developers/hall-of-fame`

### Project Routes
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/like`

### Opportunity Routes
- `GET /api/opportunities`
- `POST /api/opportunities`
- `DELETE /api/opportunities/:id`
- `POST /api/opportunities/:id/save`

### Chat Routes Added Later
The following router structure was referenced later in the conversation:
- `GET /api/chats`
- `GET /api/chats/requests`
- `POST /api/chats/requests`
- `PUT /api/chats/requests/:requestId`
- `GET /api/chats/with/:userId`
- `GET /api/chats/:chatId/messages`
- `PUT /api/chats/:chatId/archive`

Important implementation note:
- The frontend originally called `/api/chats/request`, but the router actually defines `/api/chats/requests`. This mismatch causes a 404 and must be corrected.

## Authentication Flow

KashDev uses JWT-based authentication.

### Registration
- User submits name, username, email, and password
- Backend creates user
- Developer profile is auto-created
- JWT token is returned

### Login
- User submits email and password
- Backend verifies credentials
- JWT token is returned

### Authenticated Requests
- JWT is stored in localStorage on the frontend
- Axios attaches the token in the `Authorization` header
- Protected routes use backend middleware to validate the token

### Protected Areas
- Dashboard
- Project creation
- Project editing and deletion
- Opportunity posting
- Opportunity saving
- Profile editing
- Messaging and community actions in the extended version

## Frontend State and Data Flow

### AuthContext
Used to manage:
- Current authenticated user
- Profile state
- Login
- Register
- Logout
- Profile refresh
- Token persistence

### API Service
A shared Axios instance is used to:
- Set `/api` base URL
- Attach auth tokens automatically
- Handle global 401 states
- Surface server errors consistently

### Custom Hooks
The project uses reusable hooks such as `useApi` for loading public and protected resources with shared loading and error behavior.

## Security and Backend Middleware

The backend includes several production-oriented middleware layers.

### Included Protections
- Helmet for HTTP security headers
- CORS configuration for frontend/backend separation
- Express rate limiting for API requests
- JWT auth middleware for protected routes
- Password hashing with bcryptjs
- Error handler middleware for consistent JSON errors

## Installation Guide

## Prerequisites
- Node.js installed
- npm installed
- MongoDB running locally or available through a cloud connection

## 1. Clone the Repository
```bash
git clone <your-repository-url>
cd kashdev
```

## 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kashdev
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

## 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## 4. Vite Proxy Configuration
If the frontend uses relative `/api` calls, `vite.config.js` should proxy them to the backend server.

Example:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

## Common Development Issues Resolved During This Project

### 1. Missing Component File
A Vite import analysis error occurred when `GroupDetail` was imported in `App.jsx` but the file did not exist.

Fix:
- Create `src/pages/GroupDetail.jsx`
- Ensure the filename and import path match exactly

### 2. Missing Lucide Icon Import
An error occurred because `MessageSquare` was used in JSX but not imported.

Fix:
- Add `MessageSquare` to the `lucide-react` import list in every file where it is used

### 3. Invalid Hook Call
A React hook error occurred because `useAuth()` was called outside the component body.

Incorrect:
```js
const { user } = useAuth()

export default function DeveloperProfile() {
  ...
}
```

Correct:
```js
export default function DeveloperProfile() {
  const { user } = useAuth()
  ...
}
```

### 4. Variable Name Collision in Developer Profile
A conflict occurred between the authenticated user and the viewed profile user because both were referred to as `user`.

Fix:
- Use `authUser` for the logged-in account
- Use `profileUser` or `user` from API response for the viewed profile

### 5. Chat Request 404
The frontend called:
```js
/api/chats/request
```

But the backend route was:
```js
/api/chats/requests
```

Fix:
- Update the frontend endpoint to use the plural route

### 6. Missing Backend Route Mount
Even if a router file exists, it must be mounted in `server.js`.

Example:
```js
app.use('/api/chats', require('./src/routes/chats'))
```

## Deployment Notes

The project was structured with separate frontend and backend applications to support flexible deployment.

### Frontend Deployment Options
- Vercel
- Netlify
- Static hosting with custom build pipeline

### Backend Deployment Options
- Render
- Railway
- VPS or cloud VM
- Dockerized deployment

### Database Deployment
- MongoDB Atlas
- Self-hosted MongoDB server

### Environment Considerations
- Update CORS origin in production
- Use a strong JWT secret
- Use production MongoDB URI
- Set secure frontend API base handling
- Use HTTPS in production

## Scalability Considerations

KashDev was requested as a real community platform capable of growing beyond a basic CRUD demo.

### Scalability-Oriented Choices
- Separated frontend and backend
- Modular controller-route-model structure
- Mongoose schema organization
- Reusable UI components
- Context-based auth state
- REST-based API surface for future clients
- Dark theme design system with reusable tokens and components

### Recommended Next Upgrades
- Role-based admin panel
- Profile claim verification flow
- Moderation tools
- Notifications system backed by database and sockets
- Real-time messaging via Socket.io
- Group and forum architecture finalization
- Image upload handling via object storage
- Pagination and indexing refinement
- Search optimization with text indexes
- Analytics and growth dashboards

## Suggested Future Modules

To turn KashDev into a larger community network, these features fit naturally into the existing architecture:
- Company profiles
- Startup showcase
- Community groups
- Event listings
- Forums and discussions
- Mentorship matching
- Hiring pipelines
- Developer rankings and badges
- Newsletter and announcements
- Open source contribution leaderboards

## Scripts

### Backend
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Frontend
Typical Vite scripts:
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Recommended README Badges

You can add badges later for:
- React
- Vite
- Node.js
- Express
- MongoDB
- License
- PRs welcome

## Contribution Guide

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test frontend and backend locally
5. Submit a pull request

### Good Contribution Areas
- UI polish
- API validation improvement
- Better error handling
- Search improvements
- Messaging completion
- Notifications
- Accessibility improvements
- Mobile responsiveness
- Admin moderation features

## Summary

KashDev is not just a directory application. It is a professional community platform for Kashmiri developers, built with a modern React and Node.js stack, designed around identity, discovery, reputation, and opportunity.

The project currently includes the foundations for a scalable developer ecosystem product and also contains a clear path toward richer community features such as messaging, groups, companies, and deeper engagement systems.