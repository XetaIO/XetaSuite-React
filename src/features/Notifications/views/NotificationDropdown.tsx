import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { FaBell, FaBroom, FaCubes } from "react-icons/fa6";
import { Dropdown } from "../../../shared/components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../shared/components/ui/dropdown/DropdownItem";
import { NotificationManager, type Notification, type NotificationIcon } from "@/features/Notifications";

export default function NotificationDropdown() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const hoverTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch unread count on mount
  const fetchUnreadCount = useCallback(async () => {
    const result = await NotificationManager.getUnreadCount();
    if (result.success) {
      setUnreadCount(result.data ?? 0);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const result = await NotificationManager.getUnread();
    if (result.success) {
      setNotifications(result.data ?? []);
    }
    setIsLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Handle notification hover - mark as read after a short delay
  const handleNotificationHover = useCallback((notification: Notification) => {
    if (notification.is_read) return;

    // Clear any existing timeout for this notification
    if (hoverTimeoutRef.current[notification.id]) {
      clearTimeout(hoverTimeoutRef.current[notification.id]);
    }

    // Set a timeout to mark as read after 500ms of hovering
    hoverTimeoutRef.current[notification.id] = setTimeout(async () => {
      const result = await NotificationManager.markAsRead(notification.id);
      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }, 500);
  }, []);

  // Cancel hover timeout when mouse leaves
  const handleNotificationLeave = useCallback((notificationId: string) => {
    if (hoverTimeoutRef.current[notificationId]) {
      clearTimeout(hoverTimeoutRef.current[notificationId]);
      delete hoverTimeoutRef.current[notificationId];
    }
  }, []);

  // Delete a notification
  const handleDelete = useCallback(async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const notification = notifications.find(n => n.id === notificationId);
    const result = await NotificationManager.delete(notificationId);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  }, [notifications]);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const result = await NotificationManager.markAllAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    }
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  // Get icon component based on notification icon type
  const getNotificationIcon = (notification: Notification) => {
    const iconType: NotificationIcon | null = notification.data?.icon || null;

    const iconMap: Record<NotificationIcon, React.ReactNode> = {
      broom: <FaBroom className="text-warning-500" />,
      cubes: <FaCubes className="text-error-500" />,
    };

    if (iconType && iconMap[iconType]) {
      return iconMap[iconType];
    }

    // Fallback to bell icon
    return <FaBell />;
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:bg-white/3 dark:border-white/5 dark:text-white/90 dark:hover:bg-neutral-900 dark:hover:text-gray-200"
        onClick={handleClick}
        aria-label={t("notifications.title")}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-60 mt-4.25 flex h-120 w-87.5 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:bg-neutral-900 dark:border-white/5 dark:text-white/90  sm:w-90.25 lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {t("notifications.title")}
            </h5>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium text-white bg-brand-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                title={t("notifications.markAllAsRead")}
              >
                {t("notifications.markAllAsRead")}
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title={t("common.close")}
              aria-label={t("common.close")}
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <li className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </li>
          ) : notifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-2">
                <FaBell className="text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {t("notifications.empty")}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t("notifications.emptyDescription")}
              </p>
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <DropdownItem
                  onItemClick={closeDropdown}
                  className={`relative flex gap-3 border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:hover:bg-white/5 dark:border-white/5 group ${!notification.is_read ? "bg-brand-50 dark:bg-white/3 " : ""
                    }`}
                  to={notification.data?.link || undefined}
                  onMouseEnter={() => handleNotificationHover(notification)}
                  onMouseLeave={() => handleNotificationLeave(notification.id)}
                >
                  <span className="flex items-center justify-center w-10 h-10 text-xl rounded-full bg-gray-100 dark:bg-neutral-800">
                    {getNotificationIcon(notification)}
                  </span>

                  <span className="flex-1 block">
                    <span className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 dark:text-white/90 text-theme-sm">
                        {notification.data?.title}
                      </span>
                      {!notification.is_read && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-brand-500 rounded uppercase">
                          {t("notifications.new")}
                        </span>
                      )}
                    </span>

                    <span className="block text-theme-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {notification.data?.message}
                    </span>

                    <span className="flex items-center gap-2 mt-1 text-gray-400 text-theme-xs dark:text-gray-500">
                      <span>{notification.time_ago}</span>
                    </span>
                  </span>

                  {/* Delete button - using div to avoid button inside button */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDelete(e, notification.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleDelete(e as unknown as React.MouseEvent, notification.id);
                      }
                    }}
                    className="absolute right-3 top-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-700/20 cursor-pointer"
                    title={t("notifications.delete")}
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.59048 2.5H11.4095C11.5765 2.5 11.7244 2.5 11.851 2.50234C12.0741 2.50619 12.2929 2.51935 12.5085 2.5609C13.4256 2.74071 14.1879 3.39393 14.4939 4.28163H5.50612C5.81209 3.39393 6.57445 2.74071 7.49148 2.5609C7.70707 2.51935 7.9259 2.50619 8.14897 2.50234C8.27564 2.5 8.4235 2.5 8.59048 2.5ZM4.16667 5.78163H15.8333V14.3333C15.8333 15.7141 15.8333 16.4045 15.5145 16.9184C15.3129 17.2423 15.0256 17.5296 14.7017 17.7313C14.1879 18.05 13.4974 18.05 12.1167 18.05H7.88333C6.50259 18.05 5.81222 18.05 5.29835 17.7313C4.97438 17.5296 4.68711 17.2423 4.4855 16.9184C4.16667 16.4045 4.16667 15.7141 4.16667 14.3333V5.78163ZM8.125 8.33329C8.125 7.98812 8.40483 7.70829 8.75 7.70829C9.09518 7.70829 9.375 7.98812 9.375 8.33329V14.1666C9.375 14.5118 9.09518 14.7916 8.75 14.7916C8.40483 14.7916 8.125 14.5118 8.125 14.1666V8.33329ZM11.25 7.70829C10.9048 7.70829 10.625 7.98812 10.625 8.33329V14.1666C10.625 14.5118 10.9048 14.7916 11.25 14.7916C11.5952 14.7916 11.875 14.5118 11.875 14.1666V8.33329C11.875 7.98812 11.5952 7.70829 11.25 7.70829Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        {notifications.length > 0 && (
          <button
            onClick={() => {
              closeDropdown();
              navigate("/account/notifications");
            }}
            className="block w-full px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-white/3 dark:border-white/5 dark:text-white/90 dark:hover:bg-neutral-900 dark:hover:text-gray-200"
          >
            {t("notifications.viewAll")}
          </button>
        )}
      </Dropdown>
    </div>
  );
}
