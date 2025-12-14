# XetaSuite-React - Copilot Instructions

## Project Overview

XetaSuite-React is the **React SPA frontend** for XetaSuite multi-tenant ERP application. Communicates with Laravel backend via **Sanctum stateful API authentication** (cookies, not tokens).

## Tech Stack
- **React** 19.2 with TypeScript 5.9
- **Vite** 7.2 (build tool & dev server)
- **Tailwind CSS** 4.1 with `@tailwindcss/vite` plugin
- **React Router** 7.9 for routing
- **Axios** for API requests
- **react-i18next** for internationalization
- **TailAdmin** design system (custom theme)

## Sanctum SPA Authentication (Critical)

### How It Works
XetaSuite uses **Sanctum stateful authentication** with cookies (not API tokens). The Vite proxy forwards requests to the Laravel backend.

### Vite Proxy Configuration (`vite.config.ts`)
```typescript
server: {
  proxy: {
    '/sanctum': {
      target: 'https://xetasuite.test',
      changeOrigin: true,
      secure: false,
    },
    '/api': {
      target: 'https://xetasuite.test',
      changeOrigin: true,
      secure: false,
    }
  },
}
```

### Authentication Flow
1. **CSRF Cookie**: Call `GET /sanctum/csrf-cookie` before login/logout
2. **Login**: `POST /api/v1/auth/login` with credentials
3. **Session**: Laravel creates session cookie, browser stores it
4. **API Calls**: All subsequent requests include session cookie automatically

### HTTP Client Configuration (`shared/api/httpClient.ts`)
```typescript
const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,   // Required for Sanctum cookies
    withXSRFToken: true,     // Auto-include XSRF-TOKEN header
});
```

### Login Implementation (`AuthRepository.ts`)
```typescript
login: async (credentials: LoginCredentials): Promise<void> => {
    await getCsrfCookie();  // CRITICAL: Must call before login
    await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
},
```

## Architecture: Repository + Manager Pattern

### Data Layer Structure
```
features/{Feature}/
├── services/
│   ├── {Feature}Repository.ts  # Raw API calls (no error handling)
│   └── {Feature}Manager.ts     # Business logic + error handling
├── store/
│   └── {Feature}Context.tsx    # React context with state
├── hooks/
│   └── use{Feature}.ts         # Hook to access context
├── types/
│   └── index.ts                # TypeScript interfaces
└── views/
    └── {Feature}Page.tsx       # UI components
```

### Repository Pattern (Boundary Layer)
```typescript
// Repository: Raw API calls, no error handling
export const SupplierRepository = {
    getAll: async (params?: QueryParams): Promise<PaginatedResponse<Supplier>> => {
        const response = await httpClient.get<PaginatedResponse<Supplier>>(
            buildUrl(API_ENDPOINTS.SUPPLIERS.BASE, params)
        );
        return response.data;
    },
};
```

### Manager Pattern (Business Layer)
```typescript
// Manager: Error handling + data transformation
export const SupplierManager = {
    getAll: async (params?: QueryParams): Promise<ManagerResult<PaginatedResponse<Supplier>>> => {
        try {
            const data = await SupplierRepository.getAll(params);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
```

## Site-Scoped Permissions (Multi-Tenancy)

### How Permissions Work
- Users have roles/permissions **per site** (team-based via `spatie/laravel-permission`)
- Backend returns flat `roles: string[]` and `permissions: string[]` for current site
- `current_site_id` determines which site's permissions are active

### User Type with Permissions
```typescript
export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    locale: 'fr' | 'en';
    current_site_id?: number;
    roles: string[];           // Roles for current site
    permissions: string[];     // Permissions for current site
    sites: UserSite[];         // All sites user has access to
}
```

### Checking Permissions in Components
```tsx
import { useAuth } from '@/features/Auth/hooks';

function MyComponent() {
    const { hasPermission, hasRole, hasAnyPermission } = useAuth();

    return (
        <div>
            {hasPermission('supplier.create') && <Button>Create Supplier</Button>}
            {hasRole('admin') && <AdminPanel />}
            {hasAnyPermission(['supplier.update', 'supplier.delete']) && <EditMenu />}
        </div>
    );
}
```

### Protected Routes with Permissions
```tsx
<Route element={
    <RequireAuth permissions={['supplier.viewAny']}>
        <AppLayout />
    </RequireAuth>
}>
    <Route path="/suppliers" element={<SupplierListPage />} />
</Route>
```

## Site Switching (current_site_id)

### How It Works
1. User selects a site from `SiteSwitcher` dropdown
2. `switchSite(siteId)` calls `PATCH /api/v1/user/site`
3. Backend updates `current_site_id`, returns updated user with new permissions
4. **Page reloads** to refresh all UI with new site context

### SiteSwitcher Component Flow
```tsx
const handleSiteChange = async (site: UserSite) => {
    await switchSite(site.id);
    window.location.reload();  // Refresh permissions & UI
};
```

### AuthContext Integration
```typescript
const switchSite = useCallback(async (siteId: number) => {
    const updatedUser = await AuthManager.updateSite(siteId);
    setUser(updatedUser);  // Permissions now reflect new site
}, []);
```

## Internationalization (i18n)

### Configuration (`app/i18n/index.ts`)
```typescript
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
        },
        fallbackLng: 'en',
        detection: {
            order: ['cookie', 'localStorage', 'navigator'],
            caches: ['cookie'],
        }
    });
```

### Translation Files
- `src/app/i18n/locales/en.json` - English translations
- `src/app/i18n/locales/fr.json` - French translations

### Using Translations
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t } = useTranslation();

    return <h1>{t('common.welcome')}</h1>;
}
```

### Language Sync with Backend
```typescript
// On login, sync i18next with user's locale preference
const syncLocale = useCallback((userLocale: string | undefined) => {
    if (userLocale && ['fr', 'en'].includes(userLocale) && i18n.language !== userLocale) {
        i18n.changeLanguage(userLocale);
    }
}, [i18n]);

// On language change, persist to backend
const handleLanguageChange = async (lang: Language) => {
    await i18n.changeLanguage(lang.code);
    await httpClient.patch(API_ENDPOINTS.USER.LOCALE, { locale: lang.code });
};
```

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

## Auth Context Usage

### Basic Auth Hook
```tsx
import { useAuth } from '@/features/Auth/hooks';

function MyComponent() {
  const {
    user,               // Current user or null
    isAuthenticated,    // Boolean
    isLoading,          // Auth check in progress
    login,              // (credentials) => Promise
    logout,             // () => Promise
    switchSite,         // (siteId) => Promise
    hasPermission,      // (permission) => boolean
    hasRole,            // (role) => boolean
    hasAnyPermission,   // (permissions[]) => boolean
    hasAnyRole,         // (roles[]) => boolean
  } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  return <div>Hello, {user?.full_name}</div>;
}
```

### Protected Routes
```tsx
// Protected route - requires authentication
<Route element={<RequireAuth><AppLayout /></RequireAuth>}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

// Protected route - requires specific permissions
<Route element={<RequireAuth permissions={['supplier.viewAny']}><AppLayout /></RequireAuth>}>
  <Route path="/suppliers" element={<SupplierListPage />} />
</Route>

// Guest-only route (login page)
<Route element={<RequireGuest><AuthLayout /></RequireGuest>}>
  <Route path="/auth/login" element={<SignInPage />} />
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
  reference: string;
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
- **Suppliers**: Item suppliers (HQ-only)
- **Users**: With role-based permissions per site

## Roles & Permissions (Summary)

Permissions are **scoped to the current site** (team-based multi-tenancy):

```tsx
// In components - use useAuth hook
const { hasPermission, hasRole, hasAnyPermission, hasAnyRole } = useAuth();

// Conditional rendering based on permissions
{hasPermission('supplier.create') && <Button>Create Supplier</Button>}
{hasRole('admin') && <AdminPanel />}

// In routes - use RequireAuth with permissions/roles
<Route element={<RequireAuth permissions={['material.viewAny']} />}>
  <Route path="/materials" element={<MaterialsPage />} />
</Route>
```

**Important**: When user switches site via `SiteSwitcher`, the page reloads to refresh permissions.
