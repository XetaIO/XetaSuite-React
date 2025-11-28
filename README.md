# XetaSuite-React

A React-based frontend for XetaSuite ERP, designed to work with Laravel 12 (Sanctum + Fortify) as the backend.

## Features

- 🔐 **Authentication** - Login, Logout, Forgot Password, Reset Password
- 🛡️ **Role & Permission Management** - Integration with spatie/laravel-permission
- 👥 **Team Support** - Multi-tenancy with team switching
- 🎨 **Modern UI** - TailwindCSS with a clean admin dashboard design
- ⚡ **Fast Development** - Vite for instant HMR and fast builds
- 📱 **Responsive** - Mobile-friendly layout with collapsible sidebar

## Tech Stack

- **React 19** - Latest React with TypeScript
- **Vite** - Next generation frontend tooling
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router 7** - Declarative routing
- **Axios** - HTTP client for API requests
- **Heroicons** - Beautiful hand-crafted SVG icons

## Prerequisites

- Node.js 18+
- npm or yarn
- Laravel 12 backend with Sanctum and Fortify configured

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/XetaIO/XetaSuite-React.git
cd XetaSuite-React

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Backend Requirements

Your Laravel 12 backend should have:

1. **Laravel Sanctum** configured for SPA authentication
2. **Laravel Fortify** for authentication features
3. **spatie/laravel-permission** with Team support enabled

### Sanctum Configuration

Ensure your Laravel `config/cors.php` allows credentials:

```php
'supports_credentials' => true,
```

And configure Sanctum stateful domains in `.env`:

```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
```

### Required API Endpoints

The frontend expects these endpoints:

- `GET /sanctum/csrf-cookie` - Get CSRF token
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /api/user` - Get authenticated user with roles/permissions

### User API Response Format

The `/api/user` endpoint should return:

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified_at": "2024-01-01T00:00:00.000000Z",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z",
  "roles": [
    {
      "id": 1,
      "name": "admin",
      "guard_name": "web",
      "team_id": 1,
      "permissions": [...]
    }
  ],
  "permissions": [...],
  "current_team_id": 1,
  "current_team": {
    "id": 1,
    "name": "Default Team",
    "slug": "default-team"
  }
}
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (AppLayout, AuthLayout, Sidebar, Header)
│   └── ui/              # Reusable UI components (Button, Input, Alert)
├── contexts/
│   └── AuthContext.tsx  # Authentication context and provider
├── hooks/
│   └── useRequireAuth.tsx  # Route protection hooks
├── pages/
│   ├── auth/            # Authentication pages (Login, ForgotPassword, ResetPassword)
│   └── dashboard/       # Dashboard page
├── services/
│   └── api.ts           # API service with Axios configuration
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main app component with routing
├── main.tsx             # App entry point
└── index.css            # Global styles with Tailwind
```

## Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`

## Role & Permission Checking

Use the `useAuth` hook to check roles and permissions:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { hasRole, hasPermission, hasAnyRole, hasAnyPermission } = useAuth();

  if (hasRole('admin')) {
    // Show admin content
  }

  if (hasPermission('users.create')) {
    // Show create user button
  }
}
```

Or use route-level protection:

```tsx
<Route
  element={
    <RequireAuth roles={['admin']} permissions={['users.view']}>
      <UsersPage />
    </RequireAuth>
  }
/>
```

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).
