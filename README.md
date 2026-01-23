<p align="center">
  <img src=".github/logos/logo.svg#gh-light-mode-only" width="400" alt="XetaSuite Logo">
    <img src=".github/logos/logo-dark.svg#gh-dark-mode-only" width="400" alt="XetaSuite Logo">
</p>

<p align="center">
  <strong>React Interface for XetaSuite - Multi-Tenant Facility Management ERP</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/React-19.2+-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="#"><img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="#"><img src="https://img.shields.io/github/actions/workflow/status/XetaIO/XetaSuite-React/lint.yml?style=flat-square" alt="Linter"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT"></a>
</p>

---

## 📋 About

**XetaSuite-React** is the modern and responsive user interface for [XetaSuite](https://github.com/XetaIO/XetaSuite-core), a multi-tenant ERP dedicated to facility, equipment, and inventory management.

This SPA (Single Page Application) communicates with the Laravel backend via **Sanctum stateful authentication** (secure cookies).

---

## ✨ Interface Features

### 🔐 Authentication & Security

- **Secure login**: Authentication via Laravel Sanctum (cookies)
- **Forgot password**: Email-based password reset
- **Profile management**: Personal information editing
- **Password change**: With current password validation

### 🏢 Multi-Site Dashboard

- **Overview**: Key statistics and indicators per site
- **Site selector**: Quick switching between locations
- **Custom widgets**: Real-time charts and metrics

### 🗺️ Zone Management

- **Visual tree**: Navigate through zone hierarchy
- **Nested creation**: Add sub-zones in cascade

### 🔧 Material Management

- **Paginated list**: Advanced search and filters
- **Detailed records**: Complete equipment information
- **QR Codes**: Display and download for identification
- **History**: View past interventions

### 📦 Stock Management

- **Item catalog**: List view with search
- **Stock movements**: Entry/exit transfers with full traceability
- **QR Codes**: Display and download for identification
- **Price history**: Track purchase cost evolution

### 🏢 Company Management

- **Unified company model**: Companies can be item providers, maintenance contractors, or both
- **Type-based display**: Visual badges showing company roles (Item Provider, Maintenance Provider)
- **Tabbed detail view**: Items tab and Maintenances tab based on company type
- **Headquarters management**: Centralized database managed from HQ site
- **Full traceability**: Track all items and maintenances linked to each company

### 🛠️ Interventions

#### Maintenances
- **Forms**: Create and edit interventions
- **Statuses**: Workflow tracking (scheduled → completed)

#### Incidents
- **Quick reporting**: Simplified form
- **Visual priorities**: Color-coded urgency levels
- **Resolution**: Processing workflow

#### Cleanings
- **Scheduling**: Frequency management
- **Validation**: Session confirmation

### 👥 Administration

- **Users**: Create, edit, deactivate
- **Roles**: Define access profiles
- **Permissions**: Granular per-site attribution

### 🔔 Notifications

- **Notification center**: Complete history
- **Real-time badge**: Unread indicator in header
- **Bulk actions**: Mark all as read

### 📅 Calendar & Event Categories

- **Interactive calendar**: FullCalendar-based view with month, week, day, and list modes
- **Unified display**: Calendar events, maintenances, and incidents in one view
- **Toggle visibility**: Show/hide maintenances and incidents independently
- **Event categories**: Color-coded categories for organizing events
- **Drag & drop**: Move events by dragging, resize for duration changes
- **Quick creation**: Click on calendar to create event at that time
- **Event modal**: Rich form with searchable category dropdown
- **Today's banner**: Dashboard widget showing current day's events
- **Category management**: Full CRUD interface for event categories

### 🌐 Internationalization

- **Multi-language**: French and English
- **Auto-detection**: Browser language
- **User preference**: Saved choice

### 🎨 Modern Interface

- **Design System**: Based on TailAdmin
- **Dark mode**: Light/dark theme toggle
- **Responsive**: Mobile and tablet optimized
- **Collapsible sidebar**: Workspace efficiency

### 🔍 Global Search

- **Quick access**: `Ctrl+K` / `Cmd+K` keyboard shortcut or header search icon
- **Unified search**: Search across materials, zones, items, incidents, maintenances, companies, sites
- **Keyboard navigation**: Navigate results with arrow keys, select with Enter
- **Type indicators**: Visual icons and colors for each result type
- **Permission-aware**: Only shows results the user is allowed to see
- **Mobile support**: Accessible via search button in header on mobile devices

---

## 🏗️ Technical Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **UI Library** | React | 19.2+ |
| **Language** | TypeScript | 5.9+ |
| **Build Tool** | Vite | 7.2+ |
| **Styling** | Tailwind CSS | 4.1+ |
| **Routing** | React Router | 7.9+ |
| **HTTP Client** | Axios | 1.13+ |
| **i18n** | i18next + react-i18next | 25.x / 16.x |
| **Calendar** | FullCalendar | 6.x |
| **Charts** | ApexCharts | 4.x |
| **Notifications** | React Toastify | 11.x |

### Code Architecture

```
src/
├── app/                         # Application entry point
│   ├── routes/                  # Route configuration
│   ├── i18n/                    # Internationalization
│   │   └── locales/             # Translation files
│   ├── styles/                  # Global styles
│   ├── App.tsx                  # Main component
│   └── AppRoutes.tsx            # Route generator
│
├── features/                    # Business modules
│   ├── Auth/                    # Authentication
│   │   ├── services/            # Repository + Manager
│   │   ├── store/               # React Context
│   │   ├── hooks/               # useAuth, useRequireAuth
│   │   └── views/               # Login, reset pages, etc.
│   ├── Sites/                   # Site management
│   ├── Zones/                   # Zone management
│   ├── Materials/               # Material management
│   ├── Items/                   # Stock management
│   ├── Maintenances/            # Interventions
│   ├── Incidents/               # Reports
│   ├── Cleanings/               # Cleanings
│   ├── Companies/               # Company management (item providers & contractors)
│   ├── Users/                   # Users
│   ├── Roles/                   # Roles
│   ├── Permissions/             # Permissions
│   └── Notifications/           # Notifications
│
└── shared/                      # Shared code
    ├── api/                     # httpClient, urlBuilder
    ├── components/              # Reusable UI components
    │   ├── ui/                  # Button, Modal, Alert, Table
    │   ├── form/                # Input, Select, Checkbox
    │   └── common/              # Pagination, DeleteConfirmModal
    ├── hooks/                   # Utility hooks
    └── types/                   # Global TypeScript types
```

### Repository + Manager Pattern

```typescript
// Repository: Raw API calls
export const CompanyRepository = {
    getAll: async (params?) => {
        const response = await httpClient.get('/api/v1/companies', { params });
        return response.data;
    },
};

// Manager: Error handling + transformation
export const CompanyManager = {
    getAll: async (params?) => {
        try {
            const data = await CompanyRepository.getAll(params);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleApiError(error) };
        }
    },
};
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- [XetaSuite-core](https://github.com/XetaIO/XetaSuite-core) backend configured

### Setup

```bash
# Clone the repository
git clone https://github.com/XetaIO/XetaSuite-React.git
cd XetaSuite-React

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```env
# API URL (empty to use Vite proxy)
VITE_API_URL=

# In production
VITE_API_URL=https://api.xetasuite.com
```

---

## 📝 Available Scripts

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build (with TypeScript check)
npm run build

# Preview production build
npm run preview

# ESLint linter
npm run lint
```

---

## 🔐 Sanctum Authentication

### Authentication Flow

```
1. GET /sanctum/csrf-cookie  → Retrieves CSRF token
2. POST /api/v1/auth/login   → Authentication
3. Session cookie created    → Used for all requests
```

### Axios Configuration

```typescript
const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,   // Required for Sanctum
    withXSRFToken: true,     // Auto-include XSRF token
});
```

---

## 🛡️ Permission Management

### Checking in Components

```tsx
import { useAuth } from '@/features/Auth/hooks';

function MyComponent() {
    const { hasPermission, hasRole, hasAnyPermission } = useAuth();

    return (
        <div>
            {hasPermission('company.create') && (
                <Button>Create Company</Button>
            )}
            {hasRole('admin') && <AdminPanel />}
        </div>
    );
}
```

### Protected Routes

```tsx
<Route element={
    <RequireAuth permissions={['material.viewAny']}>
        <AppLayout />
    </RequireAuth>
}>
    <Route path="/materials" element={<MaterialListPage />} />
</Route>
```

---

## 🎨 Styling with Tailwind CSS 4

### Custom Theme

Colors are defined in `src/app/styles/index.css`:

```css
@theme {
  --color-brand-500: #465fff;
  --color-success-500: #22c55e;
  --color-error-500: #ef4444;
  --color-warning-500: #f97316;
}
```

### Dark Mode

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
  Theme-adaptive content
</div>
```

---

## 🌐 Internationalization

### Configuration

```typescript
i18n.init({
    resources: {
        en: { translation: en },
        fr: { translation: fr },
    },
    fallbackLng: 'en',
    detection: {
        order: ['cookie', 'localStorage', 'navigator'],
    },
});
```

### Usage

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t } = useTranslation();
    return <h1>{t('common.welcome')}</h1>;
}
```

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Run linter before committing
npm run lint
```

---

## 📄 License

XetaSuite-React is open-source software licensed under the [MIT](LICENSE) license.

---

## 🔗 Links

- **Laravel Backend**: [XetaSuite-core](https://github.com/XetaIO/XetaSuite-core)
- **Issues**: [GitHub Issues](https://github.com/XetaIO/XetaSuite-React/issues)
