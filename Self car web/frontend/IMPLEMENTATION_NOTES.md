# Implementation Notes (Repo-Aware)

## Architecture Stack

### Current Stack (Maintained)
- **React** - UI library
- **Tailwind CSS** - Styling
- **Zustand** - State management (with persist middleware)
- **React Query** - Data fetching and caching
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **MSW** - API mocking for tests

**Note**: We're building on this stack, not fighting it. All implementations follow these patterns.

## OAuth2 Integration

### Backend Integration
The backend has implemented:
- OAuth2 providers (Google, GitHub, Facebook)
- `/me` endpoint for user details
- Database columns: `oauth_provider`, `oauth_provider_id`
- OAuth2 success handler

### Frontend Requirements

#### OAuth2 Callback Flow
1. **User clicks OAuth button** → Redirects to backend OAuth2 endpoint
2. **Backend handles OAuth** → Redirects back to `/auth/oauth2/callback?token=...`
3. **Frontend callback page** → Extracts token from URL
4. **Calls `/api/auth/me`** → Gets user details (same as classic login)
5. **Stores in authStore** → Uses `setAuth(user, token)` (same as classic login)
6. **Redirects** → Based on role (same logic as classic login)

#### Key Principles
- **OAuth2 sign-in is treated exactly like classic login**
- **Same authStore** - No separate OAuth2 state
- **Same token plumbing** - OAuth2 tokens work identically to JWT tokens
- **Same user object** - OAuth2 users may have `oauth_provider` and `oauth_provider_id` fields, but are treated identically
- **Same API calls** - All authenticated requests use the same token

#### Implementation Details

**OAuth2Callback Component** (`frontend/src/pages/OAuth2Callback.jsx`)
```javascript
// 1. Extract token from URL params
const token = searchParams.get('token')

// 2. Call /me endpoint (same as classic login)
const response = await authAPI.getCurrentUser()

// 3. Store in authStore (same as classic login)
setAuth(userData, token)

// 4. Redirect (same logic as classic login)
if (userData.role === 'ADMIN') {
  navigate('/admin/dashboard')
} else {
  navigate('/')
}
```

**Auth Store** (`frontend/src/store/authStore.js`)
- Stores user and token identically for both classic and OAuth2 users
- OAuth2 users have additional fields but are treated the same:
  - `user.oauth_provider` - e.g., "GOOGLE", "GITHUB", "FACEBOOK"
  - `user.oauth_provider_id` - Provider's user ID
- No special handling needed - the store doesn't distinguish between auth methods

**API Interceptor** (`frontend/src/services/api.js`)
- Adds `Authorization: Bearer <token>` header to all requests
- Works identically for classic JWT tokens and OAuth2 tokens
- Token is retrieved from authStore (same for both)

## Existing Components (Modified, Not Rewritten)

### Pages
- ✅ **Cars** - Modified with pagination and filters
- ✅ **CarDetail** - Existing, works with new backend
- ✅ **Booking** - Existing, works with new backend
- ✅ **Messages** - Existing, works with new backend
- ✅ **Admin/*** - Enhanced with DataTable and analytics
- ✅ **ProtectedRoute** - Existing, works with OAuth2 users
- ✅ **OAuth2Callback** - Enhanced to match backend integration

### Components
- ✅ **CarCard** - Enhanced with lazy loading
- ✅ **Navbar** - Existing, works with OAuth2 users
- ✅ **Layout** - Existing structure maintained
- ✅ **ErrorBoundary** - New global error boundary
- ✅ **Modal** - New accessible modal component
- ✅ **DataTable** - New production-ready table component
- ✅ **AnalyticsCard** - New analytics widget component

## OAuth2 Provider URLs

### OAuth2 Authorization Endpoints
```
GET /oauth2/authorization/google
GET /oauth2/authorization/github
GET /oauth2/authorization/facebook
```

### OAuth2 Callback Route
```
/auth/oauth2/callback?token=<jwt-token>
```

### Frontend OAuth2 Buttons
Located in `Login.jsx` and `Register.jsx`:
- Google OAuth button
- GitHub OAuth button
- Facebook OAuth button

All buttons link to backend OAuth2 endpoints which handle the OAuth flow and redirect back to the frontend callback.

## User Object Structure

### Classic Login User
```javascript
{
  id: 1,
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  role: 'CUSTOMER',
  enabled: true,
  createdAt: '2024-01-01T00:00:00Z',
}
```

### OAuth2 User (Same Structure + OAuth Fields)
```javascript
{
  id: 1,
  email: 'user@gmail.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: null, // May be null if not provided
  role: 'CUSTOMER',
  enabled: true,
  oauth_provider: 'GOOGLE', // Additional OAuth field
  oauth_provider_id: '123456789', // Additional OAuth field
  createdAt: '2024-01-01T00:00:00Z',
}
```

**Note**: Both user types are stored identically in authStore and treated identically throughout the app.

## Authentication Flow

### Classic Login Flow
1. User enters email/password
2. Frontend calls `POST /api/auth/login`
3. Backend returns `{ user, token }`
4. Frontend calls `setAuth(user, token)`
5. Token stored in authStore
6. All subsequent requests include `Authorization: Bearer <token>`

### OAuth2 Login Flow
1. User clicks OAuth button
2. Frontend redirects to backend OAuth2 endpoint
3. Backend handles OAuth flow
4. Backend redirects to `/auth/oauth2/callback?token=<token>`
5. Frontend extracts token from URL
6. Frontend calls `GET /api/auth/me` with token
7. Backend returns `{ user }` (same format as classic login)
8. Frontend calls `setAuth(user, token)` (same as classic login)
9. Token stored in authStore (same as classic login)
10. All subsequent requests include `Authorization: Bearer <token>` (same as classic login)

**Result**: Both flows end at the same point - user and token in authStore, identical behavior.

## Token Management

### Token Storage
- **Location**: Zustand persist middleware → localStorage
- **Key**: `auth-storage`
- **Format**: `{ state: { user, token, isAuthenticated } }`

### Token Usage
- **API Requests**: Automatically added via axios interceptor
- **Retrieval**: `getAuthToken()` helper reads from localStorage
- **Validation**: `/api/auth/me` endpoint validates token
- **Expiration**: Handled by backend, frontend redirects on 401

### Token Refresh
- Currently, token refresh is handled by backend
- Frontend redirects to login on 401 (token expired/invalid)
- OAuth2 tokens are refreshed by backend if needed

## Protected Routes

### ProtectedRoute Component
- Checks `isAuthenticated` from authStore
- Works identically for classic and OAuth2 users
- No special handling needed for OAuth2

```javascript
<ProtectedRoute>
  <Component />
</ProtectedRoute>

<ProtectedRoute adminOnly>
  <AdminComponent />
</ProtectedRoute>
```

## Testing

### MSW Handlers
- `/api/auth/me` - Returns user data (supports both classic and OAuth2)
- `/api/auth/login` - Classic login
- `/api/auth/register` - Classic registration
- OAuth2 endpoints are handled by backend (not mocked in MSW)

### Test Coverage
- OAuth2 callback flow tested
- Classic login flow tested
- Both use same authStore methods
- Both use same token storage

## Best Practices

### Code Organization
1. **Keep current stack** - React + Tailwind + Zustand + React Query
2. **Modify existing components** - Don't rewrite, enhance
3. **Consistent patterns** - Follow existing code style
4. **Reusable components** - DRY principle

### OAuth2 Implementation
1. **Same store, same token** - OAuth2 uses identical authStore
2. **No special cases** - OAuth2 users are regular users
3. **Consistent API calls** - Same endpoints, same format
4. **Error handling** - Same error handling for all auth methods

### State Management
- **Zustand** for global state (auth, messages)
- **React Query** for server state (cars, bookings, users)
- **Local state** for component-specific state

### Styling
- **Tailwind CSS** for all styling
- **Framer Motion** for animations
- **Consistent design system** - Use existing components

---

**Last Updated**: 2024
**Stack**: React + Tailwind + Zustand + React Query (Maintained)

