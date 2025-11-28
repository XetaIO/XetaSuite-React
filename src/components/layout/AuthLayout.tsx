import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-body-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
              <span className="text-2xl font-bold text-white">X</span>
            </div>
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
          XetaSuite
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Enterprise Resource Planning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-slate-200">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} XetaSuite. All rights reserved.
      </p>
    </div>
  );
}

export default AuthLayout;
