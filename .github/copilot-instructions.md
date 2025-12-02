# XetaSuite-React - Copilot Instructions

## Project Overview
React SPA frontend for XetaSuite multi-tenant ERP application. Communicates with Laravel backend via Sanctum stateful API authentication.

## Tech Stack
- **React** 19.2 with TypeScript 5.9
- **Vite** 7.2 (build tool & dev server)
- **Tailwind CSS** 4.1 with `@tailwindcss/vite` plugin
- **React Router DOM** 7.9 for routing
- **Axios** for API requests
- **TailAdmin** design system (custom theme)

## Project Structure

```
src/
├── app/                                 # Point d'entrée application
│   ├── routes/
│   │   ├── types.ts               # RouteConfig interface
│   │   ├── config.ts              # Configuration des routes
│   │   └── index.ts
│   ├── App.tsx                     # App principale avec providers
│   ├── AppRoutes.tsx       # Générateur de routes
│   └── index.ts
├── shared/                          # Code partagé
│   ├── api/
│   │   ├── httpClient.ts     # Axios instance
│   │   └── urlBuilder.ts      # Construction d'URLs
│   ├── types/
│   │   ├── pagination.ts    # PaginationMeta, PaginatedResponse
│   │   ├── api.ts                   # SingleResponse, ManagerResult
│   │   └── user.ts                 # User, Role, Permission
│   ├── components/
│   │   ├── ui/                        # Button, Modal, Alert, Table
│   │   ├── form/                  # Input, Label, Checkbox
│   │   └── common/           # Pagination, DeleteConfirmModal
│   └── hooks/
│       ├── useModal.ts
│       └── useGoBack.ts
└── features/
    ├── Auth/                         # Feature authentification
    │   ├── types/
    │   ├── services/             # AuthRepository + AuthManager
    │   ├── store/                   # AuthContext
    │   ├── hooks/                 # useAuth, useRequireAuth
    │   └── views/                  # SignIn, ForgotPassword, ResetPassword
    └── Suppliers/                # Feature fournisseurs
        ├── types/
        ├── services/             # SupplierRepository + SupplierManager
        └── views/                 # SupplierListPage, SupplierDetailPage, SupplierModal
```

## Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `DashboardPage.tsx`, `Sidebar.tsx`)
- Hooks: `useCamelCase.ts` or `useCamelCase.tsx`
- Contexts: `PascalCaseContext.tsx`
- Types: `camelCase.ts` or grouped in `index.ts`

### Imports
- Use `@/` alias for absolute imports from `src/`:
  ```tsx
  import { useAuth } from '@/contexts';
  import { Button } from '@/components/ui';
  import type { User } from '@/types';
  ```

### Exports
- Use named exports, not default exports (except for pages)
- Group exports in `index.ts` files:
  ```tsx
  // components/ui/index.ts
  export { Button } from './Button';
  export { Input } from './Input';
  export { Alert } from './Alert';
  ```

### Component Structure
```tsx
import { useState } from 'react';
import { useAuth } from '@/contexts';
import type { SomeType } from '@/types';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState(false);
  const { user } = useAuth();

  return (
    <div className="...">
      {/* Content */}
    </div>
  );
}
```

## Styling

### Tailwind CSS 4 Theme
The project uses Tailwind CSS 4 with a custom TailAdmin-based theme defined in `index.css`.

### Color Palette
- **Brand** (blue): `brand-50` to `brand-950` (primary: `brand-500` #465fff)
- **Gray**: `gray-50` to `gray-950`
- **Success** (green): `success-50` to `success-950`
- **Error** (red): `error-50` to `error-950`
- **Warning** (orange): `warning-50` to `warning-950`

### Dark Mode
- Use `dark:` variant for dark mode styles
- Theme toggle available via `useTheme()` context
- Dark mode is class-based (`.dark` on `<html>`)

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
```

### Custom Utilities (defined in index.css)
- `menu-item`, `menu-item-active`, `menu-item-inactive`
- `menu-dropdown-item`, `menu-dropdown-item-active`
- `shadow-theme-xs`, `shadow-theme-sm`, `shadow-theme-md`, `shadow-theme-lg`
- `no-scrollbar`, `custom-scrollbar`

### Icons
Use custom SVG icons from `@/components/icons`:
```tsx
import { GridIcon, BuildingIcon, PackageIcon } from '@/components/icons';
```

Available icons: `GridIcon`, `ChevronDownIcon`, `HorizontalDotsIcon`, `PackageIcon`, `BuildingIcon`, `WrenchIcon`, `AlertIcon`, `CleaningIcon`, `MenuIcon`, `XIcon`, `SunIcon`, `MoonIcon`, `BellIcon`, `SearchIcon`, `LogoutIcon`, `UserCircleIcon`, `CogIcon`

## Authentication

### Sanctum Setup
- Backend: Laravel Sanctum stateful SPA authentication
- Vite proxy forwards `/api` and `/sanctum` to `https://xetasuite.test`
- CSRF cookie obtained before login/logout via `/sanctum/csrf-cookie`

### Auth Context
```tsx
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;

  return <div>Hello, {user?.name}</div>;
}
```

### Protected Routes
```tsx
import { RequireAuth, RequireGuest } from '@/hooks';

// Protected route
<Route element={<RequireAuth><AppLayout /></RequireAuth>}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

// Guest-only route
<Route element={<RequireGuest><AuthLayout /></RequireGuest>}>
  <Route path="/auth/login" element={<LoginPage />} />
</Route>
```

## API Calls

### Using the API Service
```tsx
import { api, authApi } from '@/services/api';

// Auth functions
await authApi.login({ email, password });
await authApi.logout();
const user = await authApi.getUser();

// Custom API calls
const response = await api.get('/api/v1/items');
await api.post('/api/v1/items', { name: 'New Item' });
```

### Error Handling
```tsx
try {
  await api.post('/api/v1/items', data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    // Handle validation errors (422), auth errors (401/403), etc.
  }
}
```

## Sidebar & Layout

### Sidebar Context
```tsx
import { useSidebar } from '@/contexts';

function MyComponent() {
  const {
    isExpanded,      // Desktop sidebar expanded state
    isMobileOpen,    // Mobile sidebar open state
    isHovered,       // Hover state (for collapsed sidebar)
    toggleSidebar,   // Toggle desktop expanded state
    toggleMobileSidebar,
    setIsHovered
  } = useSidebar();
}
```

### Adding Navigation Items
Edit `Sidebar.tsx` and add to `navItems` or `othersItems`:
```tsx
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: <BuildingIcon />,
    name: 'Sites',
    subItems: [
      { name: 'All Sites', path: '/sites' },
      { name: 'Zones', path: '/zones' },
    ],
  },
];
```

## TypeScript Types

### Core Types
```tsx
// src/types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

export interface Site {
  id: number;
  name: string;
  is_headquarters: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}
```

### Adding New Types
Add to `src/types/index.ts` or create domain-specific files:
```tsx
// src/types/items.ts
export interface Item {
  id: number;
  name: string;
  sku: string;
  quantity: number;
}
```

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Variables

Create `.env` file:
```env
# Empty to use Vite proxy (recommended for development)
VITE_API_URL=

# Or specify backend URL directly (for production)
VITE_API_URL=https://api.xetasuite.com
```

## Best Practices

### Component Creation
1. Create component file in appropriate directory
2. Add export to `index.ts`
3. Use TypeScript interfaces for props
4. Follow existing component patterns

### Adding New Pages
1. Create page in `src/pages/{domain}/`
2. Add route in `App.tsx`
3. Add navigation item in `Sidebar.tsx` if needed

### State Management
- Use React Context for global state (auth, theme, sidebar)
- Use `useState` for local component state
- Use `useReducer` for complex state logic

### Performance
- Use `React.memo()` for expensive components
- Use `useMemo()` and `useCallback()` appropriately
- Lazy load pages with `React.lazy()` and `Suspense`

## XetaSuite Domain Concepts

This frontend manages:
- **Sites**: Locations (headquarters or regular sites)
- **Zones**: Areas within sites (can have child zones)
- **Materials**: Equipment in zones
- **Items**: Inventory items with stock tracking
- **Maintenances**: Scheduled/completed maintenance tasks
- **Incidents**: Issue reports
- **Cleanings**: Cleaning schedules and records
- **Companies**: External maintenance providers
- **Suppliers**: Item suppliers
- **Users**: With role-based permissions per site

## Roles & Permissions
- Roles define sets of permissions (e.g., Admin, Technician, Viewer)
- Permissions control access to features (e.g., site.view, site.create, site.update, site.delete)
- Users can have multiple roles across different sites
- Check permissions in components/pages to conditionally render features
```tsx
{hasPermission('site.create') && <Button>Create Site</Button>}
```
API Laravel use spatie/laravel-permission package for roles and permissions management.
