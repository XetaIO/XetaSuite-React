import { NavLink, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { FaBell, FaKey, FaShieldHalved } from "react-icons/fa6";

interface AccountMenuItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

export const AccountLayout: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const menuItems: AccountMenuItem[] = [
        {
            path: "/account/notifications",
            label: t("account.menu.notifications"),
            icon: <FaBell className="w-5 h-5" />,
        },
        {
            path: "/account/password",
            label: t("account.menu.password"),
            icon: <FaKey className="w-5 h-5" />,
        },
        {
            path: "/account/security",
            label: t("account.menu.security"),
            icon: <FaShieldHalved className="w-5 h-5" />,
        },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Menu */}
            <aside className="w-full lg:w-64 shrink-0">
                <nav className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t("account.title")}
                        </h2>
                    </div>
                    <ul className="p-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <span className={isActive ? "text-brand-500" : "text-gray-400"}>
                                            {item.icon}
                                        </span>
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <Outlet />
            </main>
        </div>
    );
};
