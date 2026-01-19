import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "@/features/Auth/hooks";
import { FaAngleDown, FaArrowRightFromBracket, FaBell, FaUserGear } from "react-icons/fa6";

export default function UserDropdown() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }
    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
            >
                <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
                    {/*TODO: Replace with Avatar component*/}
                    <img
                        src={user?.avatar || '/default-avatar.png'}
                        alt={user?.full_name || 'User Avatar'}
                    //className="h-11 w-11 object-cover"
                    />
                </span>

                <span className="block mr-1 font-medium text-theme-sm">{user?.full_name ?? t('common.user')}</span>
                <FaAngleDown className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="absolute right-0 mt-4.25 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:bg-neutral-900 dark:border-white/5 dark:text-white/90 dark:hover:bg-neutral-900 dark:hover:text-gray-200"
            >
                <div>
                    <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {user?.full_name ?? t('common.user')}
                    </span>
                    <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                        {user?.email ?? ''}
                    </span>
                </div>

                <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-white/5">
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            to="/account/password"
                            className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <FaUserGear className="w-5 h-5" />
                            {t('header.settings')}
                        </DropdownItem>
                    </li>
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            to="/account/notifications"
                            className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <FaBell className="w-5 h-5" />
                            {t('header.notifications')}
                        </DropdownItem>
                    </li>
                </ul>
                <button
                    onClick={() => {
                        closeDropdown();
                        logout();
                    }}
                    className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-500 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-red-500 dark:text-red-400 dark:hover:bg-white/5 dark:hover:text-red-300 w-full"
                >
                    <FaArrowRightFromBracket className="w-5 h-5" />
                    {t('header.signOut')}
                </button>
            </Dropdown>
        </div>
    );
}
