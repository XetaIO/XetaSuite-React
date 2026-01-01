import { useState, useEffect, useCallback, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { FaBroom, FaCubes, FaTrash, FaCheck, FaCheckDouble, FaBell } from "react-icons/fa6";
import { PageMeta } from "@/shared/components/common";
import { Button, Alert, Badge } from "@/shared/components/ui";
import { Pagination } from "@/shared/components/common";
import { NotificationManager } from "../services";
import type { Notification, NotificationIcon } from "../types";
import type { PaginationMeta } from "@/shared/types";

const NotificationsPage: FC = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);
        const result = await NotificationManager.getAll(page, 15);
        if (result.success && result.data) {
            setNotifications(result.data.data);
            setPagination(result.data.meta);
        } else {
            setError(result.error || t("errors.generic"));
        }
        setIsLoading(false);
    }, [t]);

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [fetchNotifications, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.is_read) return;

        const result = await NotificationManager.markAsRead(notification.id);
        if (result.success) {
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id
                        ? { ...n, is_read: true, read_at: new Date().toISOString() }
                        : n
                )
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        const result = await NotificationManager.markAllAsRead();
        if (result.success) {
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );
        }
    };

    const handleDelete = async (notificationId: string) => {
        const result = await NotificationManager.delete(notificationId);
        if (result.success) {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm(t("notifications.confirmDeleteAll"))) return;

        const result = await NotificationManager.deleteAll();
        if (result.success) {
            setNotifications([]);
        }
    };

    const getNotificationIcon = (notification: Notification): React.ReactNode => {
        const iconType: NotificationIcon | null = notification.data?.icon || null;

        const iconMap: Record<NotificationIcon, React.ReactNode> = {
            broom: <FaBroom className="w-5 h-5 text-warning-500" />,
            cubes: <FaCubes className="w-5 h-5 text-error-500" />,
        };

        if (iconType && iconMap[iconType]) {
            return iconMap[iconType];
        }

        return <span className="text-xl">🔔</span>;
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <>
            <PageMeta title={t("notifications.pageTitle")} description={t("notifications.pageDescription")} />

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {t("notifications.pageTitle")}
                        </h1>
                        {unreadCount > 0 && (
                            <Badge color="brand" size="sm">
                                {unreadCount} {t("notifications.unread")}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                            >
                                <FaCheckDouble className="w-4 h-4 mr-2" />
                                {t("notifications.markAllAsRead")}
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleDeleteAll}
                            >
                                <FaTrash className="w-4 h-4 mr-2" />
                                {t("notifications.deleteAll")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <Alert variant="error" title={t("common.error")} message={error} />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="text-6xl mb-4">
                                <FaBell />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                                {t("notifications.empty")}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {t("notifications.emptyDescription")}
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-4 p-4 sm:p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!notification.is_read ? "bg-brand-50/50 dark:bg-brand-900/10" : ""
                                    }`}
                            >
                                {/* Icon */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0">
                                    {getNotificationIcon(notification)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2 mb-1">
                                        {notification.data?.link ? (
                                            <Link
                                                to={notification.data.link}
                                                className="font-medium text-gray-800 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                                            >
                                                {notification.data?.title}
                                            </Link>
                                        ) : (
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {notification.data?.title}
                                            </span>
                                        )}
                                        {!notification.is_read && (
                                            <Badge color="brand" size="sm">
                                                {t("notifications.new")}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        {notification.data?.message}
                                    </p>
                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                        {notification.time_ago}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification)}
                                            className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                            title={t("notifications.markAsRead")}
                                        >
                                            <FaCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                                        title={t("notifications.delete")}
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
                        <Pagination
                            meta={pagination}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationsPage;
