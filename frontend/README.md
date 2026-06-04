# KashDev Frontend Documentation

KashDev Frontend is the client-side application for the KashDev platform. It is built with React, Vite, JavaScript, React Router, and Tailwind CSS, and it provides the full user-facing experience for developer discovery, project showcase, opportunities, profiles, and account-level interactions.

This document explains the frontend architecture, structure, page system, shared components, routing, state handling, API integration, styling approach, and extension paths.

## Frontend Overview

The frontend is designed as a modern single-page application with a premium dark theme and a product-oriented interface. It prioritizes clear navigation, responsive layouts, reusable UI primitives, and modular page composition.

### Core Goals
- Present a strong community-first identity
- Make developer discovery fast and intuitive
- Provide a polished, professional user interface
- Support scalable page and component growth
- Integrate cleanly with the backend REST API

## Technology Stack

| Layer | Technology | Purpose |
|------|------------|---------|
| Build tool | Vite | Fast local development and optimized builds |
| UI library | React.js | Component-based frontend architecture |
| Language | JavaScript | Mandatory project language |
| Routing | React Router | Client-side navigation |
| Styling | Tailwind CSS | Utility-first styling system |
| HTTP | Axios | API requests to backend |
| Notifications | React Hot Toast | Success and error toasts |
| Icons | Lucide React | Consistent icon set |

## Frontend Folder Structure

```bash
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── layout/
    │   ├── notifications/
    │   ├── sections/
    │   └── ui/
    ├── context/
    ├── hooks/
    ├── pages/
    ├── services/
    └── utils/
```

## Application Entry Points

### `main.jsx`
Responsible for bootstrapping the React app.

Typical responsibilities:
- Create React root
- Wrap app in `BrowserRouter`
- Import global CSS
- Render `App`

### `App.jsx`
Main route composition layer.

Typical responsibilities:
- Wrap application in `AuthProvider`
- Render layout shell such as `Navbar` and `Footer`
- Declare all page routes
- Mount global toaster for notifications

## Routing Structure

The frontend uses React Router to map pages to URL routes.

### Core Routes

| Route | Page | Purpose |
|------|------|---------|
| `/` | Landing | Main platform introduction |
| `/developers` | Developers | Developer directory |
| `/developers/:username` | DeveloperProfile | Public developer profile |
| `/projects` | Projects | Project showcase |
| `/opportunities` | Opportunities | Opportunity listings |
| `/hall-of-fame` | HallOfFame | Recognition and notable members |
| `/dashboard` | Dashboard | Authenticated user management |
| `/login` | Login | User login |
| `/register` | Register | User registration |

### Extended Routes Introduced Later

| Route | Purpose |
|------|---------|
| `/messages` | Messaging UI |
| `/groups` | Community groups listing |
| `/groups/:slug` | Group detail page |
| `/companies` | Company profiles or directory |
| `/search` | Unified discovery surface |
| `/forum` | Discussion area |
| `/insights` | Analytics or insights page |
| `/account` | Personal account management |
| `/popular` | Trending content |

These additional routes reflect future-facing platform expansion.

## Page Documentation

## Landing Page

The landing page is not treated like a generic AI SaaS homepage. It is built to feel authentic, structured, and community-driven.

### Main Sections
- Hero
- Community statistics
- Featured developers
- Featured projects
- Hall of Fame teaser
- Testimonials
- Join CTA

### Purpose
- Introduce the platform identity
- Show proof of activity through stats and featured content
- Encourage sign-up and exploration

## Developers Page

Route: `/developers`

### Responsibilities
- Show developer directory
- Support searching by name or username
- Filter by skills
- Filter by experience
- Render developers in a responsive grid

### UX Features
- Search bar
- Filter panel toggle
- Empty state handling
- Loading skeletons

## Developer Profile Page

Route: `/developers/:username`

### Responsibilities
- Fetch developer data by username
- Show banner, avatar, and profile summary
- Display links such as GitHub, LinkedIn, and portfolio
- Show skills, achievements, Hall of Fame tag, and projects
- Optionally provide messaging action in the extended version

### Important Engineering Note
This page had a hook misuse issue during development when `useAuth()` was called outside the component body. The correct implementation requires hooks to be called only inside the component function.

## Projects Page

Route: `/projects`

### Responsibilities
- Show public project list
- Search projects
- Display project technologies and owner info
- Allow authenticated users to add projects
- Support project likes

### UI Patterns
- Grid layout
- Project cards
- Add project modal or form
- Search field

## Opportunities Page

Route: `/opportunities`

### Responsibilities
- Display job, internship, freelance, and co-founder opportunities
- Filter by type
- Allow authenticated users to post opportunities
- Allow save and unsave interaction

### UI Patterns
- Type filter buttons
- Opportunity cards
- Posting modal or form

## Hall of Fame Page

Route: `/hall-of-fame`

### Responsibilities
- Group and display notable community members
- Show profile links and recognition categories

### Categories
- Top contributor
- Startup founder
- Major company
- Open source contributor

## Dashboard Page

Route: `/dashboard`

### Responsibilities
- Manage profile data
- Manage projects
- Manage opportunities
- Present account-level controls
- Show authenticated user context

### Typical Dashboard Areas
- Basic profile editing
- Extended developer profile editing
- Content management sections
- Stats and summary cards

## Authentication Pages

### Login
Route: `/login`

### Register
Route: `/register`

### Responsibilities
- Collect auth credentials
- Submit to backend auth endpoints
- Store returned JWT token
- Redirect after success
- Show validation and server errors

## Component Architecture

The frontend is designed around reusable component layers.

## Layout Components

### `Navbar`
Provides primary navigation, auth actions, notifications, and account menu.

Typical responsibilities:
- Show logo
- Show primary navigation links
- Show login/register actions for guests
- Show messages, notifications, and user menu for authenticated users
- Provide mobile menu experience

### `Footer`
Provides closing navigation and platform identity.

## UI Components

UI components are reusable across pages.

### Examples
- `Avatar`
- `SkillTag`
- `DeveloperCard`
- `ProjectCard`
- `OpportunityCard`
- `StatCard`
- `Skeleton` components

### Benefits
- Reuse visual patterns consistently
- Reduce duplication
- Improve maintainability
- Support future design refinements from one place

## Section Components

Landing page sections can be split into reusable modules such as:
- Hero
- Community stats
- Featured developers
- Featured projects
- Hall of Fame teaser
- Testimonials
- Join CTA

This makes the landing page easier to maintain and reorder.

## Global State Management

The frontend uses React context for auth-related state.

## `AuthContext`

This is a central part of the client architecture.

### Responsibilities
- Hold authenticated user state
- Hold developer profile state
- Persist token between refreshes
- Expose login and register methods
- Expose logout behavior
- Expose profile refresh method
- Load current user from `/auth/me`

### Typical Exposed Values
- `user`
- `profile`
- `loading`
- `token`
- `login()`
- `register()`
- `logout()`
- `refreshProfile()`

## Custom Hooks

### `useApi`
Reusable data-fetching hook.

### Responsibilities
- Load data from a given API endpoint
- Track loading state
- Track error state
- Expose `refetch()` function

### Benefits
- Reduces repetitive request boilerplate
- Standardizes loading and error handling
- Speeds up page construction

### `useAuth`
Wrapper hook around auth context.

### Important Rule
It must be called only inside React components or custom hooks.

Incorrect usage causes an invalid hook call error.

## API Integration Layer

## `services/api.js`
A shared Axios instance is used for frontend-backend communication.

### Responsibilities
- Set base API URL
- Attach JWT token automatically from localStorage
- Handle unauthorized responses globally
- Normalize API request behavior

### Example Pattern
```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kashdev_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

## Styling System

KashDev uses Tailwind CSS with a dark, premium design language.

## Design Priorities
- Strong typography
- Clean spacing
- Minimal but polished interaction states
- Card-first composition
- Subtle animation
- Responsive adaptability
- No giant gradients or generic floating blob visuals

## Common Styling Concepts
- Surface layers
- Border-based card separation
- Accent color for actions and highlights
- Semantic muted and secondary text colors
- Small, reusable badge and tag styles

## Global CSS

### `index.css`
Usually contains:
- Tailwind base, components, and utilities
- CSS variables or custom utility classes
- Reusable component class patterns such as `.btn`, `.card`, `.tag`, `.badge`, `.input`
- Animation helpers

## Authenticated Frontend Flow

### Registration Flow
1. User fills form
2. Form submits to `/api/auth/register`
3. Token is returned
4. Token is stored in localStorage
5. Auth state updates
6. Redirect to dashboard or onboarding route

### Login Flow
1. User fills credentials
2. Form submits to `/api/auth/login`
3. Token is returned
4. Token is stored
5. Current session becomes authenticated

### Protected Usage
Frontend pages or actions such as project creation and opportunity posting rely on auth state and backend token verification.

## Error Handling Patterns

The frontend uses toasts and route fallbacks to make errors more visible and non-blocking.

### Common Cases
- 401 redirects to login
- 404 profile shows not found state
- Mutation errors show toast message
- Loading states show skeletons

## Known Frontend Issues Encountered During Development

## 1. Missing Icon Import
`MessageSquare` was used in JSX without being imported from `lucide-react`.

### Fix
Add it to the icon import list in each affected file.

## 2. Broken Conditional Rendering in Navbar
A malformed ternary expression caused logical issues in authenticated navbar rendering.

### Fix
Use a single clean ternary:
```jsx
{user ? (...) : (...)}
```

## 3. Invalid Hook Call in DeveloperProfile
`useAuth()` was called outside the component function.

### Fix
Move it inside `DeveloperProfile()`.

## 4. Variable Name Collision
Using `user` both for the authenticated user and the viewed profile user created logic bugs.

### Recommended Pattern
```js
const { user: authUser } = useAuth()
const { user: profileUser, profile, projects } = data.data
```

## 5. Chat Route Mismatch on Frontend
The frontend called `/api/chats/request`, but the backend defined `/api/chats/requests`.

### Fix
Use the plural route.

## Example Frontend Data Patterns

## Example Protected Action
```js
const handleLike = async (id) => {
  await api.post(`/projects/${id}/like`)
}
```

## Example Data Fetch
```js
const { data, loading, error } = useApi('/developers', {
  params: { skill: 'React' }
})
```

## Example Message Request
```js
const handleMessage = async () => {
  if (!authUser) {
    navigate('/login')
    return
  }

  await api.post('/chats/requests', {
    toUserId: profileUser._id,
    message: `Hi ${profileUser.name}, I'd love to connect!`,
  })
}
```

## Development Setup

### Install dependencies
```bash
cd frontend
npm install
```

### Run development server
```bash
npm run dev
```

### Recommended Vite Proxy
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://kashdev-a-developers-community.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
```

## Build and Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Deployment Targets
- Vercel
- Netlify
- Static hosting with reverse proxy to backend

## Suggested Future Frontend Improvements

- Route guards for protected pages
- Better form validation layer
- Reusable modal system
- Search debounce and URL-synced filters
- Theme token centralization
- Accessibility audit
- Better mobile dashboard layout
- Realtime notifications and messaging UI polish
- Lazy-loaded route chunks
- Error boundaries

## Frontend Summary

The KashDev frontend is structured as a scalable React application that balances public discovery, authenticated workflows, and premium UI presentation. Its architecture supports both the original developer community platform and future expansion into messaging, groups, company profiles, and broader social-professional network features.