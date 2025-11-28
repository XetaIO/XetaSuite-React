import { useAuth } from '@/contexts';
import {
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string;
  icon: typeof UsersIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          {trend && (
            <p
              className={`mt-2 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%{' '}
              <span className="text-slate-500 font-normal">from last month</span>
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      icon: UsersIcon,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: 'Documents',
      value: '1,234',
      icon: DocumentTextIcon,
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: 'Revenue',
      value: '$45,231',
      icon: CurrencyDollarIcon,
      trend: { value: 3.1, isPositive: false },
    },
    {
      title: 'Active Projects',
      value: '89',
      icon: ChartBarIcon,
      trend: { value: 15.3, isPositive: true },
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back, {user?.name}! Here's what's happening with your business.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { action: 'New user registered', time: '2 minutes ago' },
                { action: 'Invoice #1234 was paid', time: '15 minutes ago' },
                { action: 'Project "Website Redesign" updated', time: '1 hour ago' },
                { action: 'New document uploaded', time: '2 hours ago' },
                { action: 'Team meeting scheduled', time: '3 hours ago' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-600">{item.action}</span>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Create Invoice', icon: DocumentTextIcon },
                { label: 'Add User', icon: UsersIcon },
                { label: 'New Project', icon: ChartBarIcon },
                { label: 'Generate Report', icon: CurrencyDollarIcon },
              ].map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-primary-300 transition-colors"
                >
                  <action.icon className="h-6 w-6 text-slate-600 mb-2" />
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="font-medium text-slate-900">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Roles</p>
            <p className="font-medium text-slate-900">
              {user?.roles?.map(r => r.name).join(', ') || 'No roles assigned'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
