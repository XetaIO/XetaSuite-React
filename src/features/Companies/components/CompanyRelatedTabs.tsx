import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FaCubes,
    FaMagnifyingGlass,
    FaScrewdriverWrench,
} from 'react-icons/fa6';
import { CompanyManager } from '../services';
import type {
    Company,
    CompanyItem,
    CompanyMaintenance,
    ItemFilters,
    MaintenanceFilters,
} from '../types';
import type { PaginationMeta } from '@/shared/types';
import { useAuth } from '@/features/Auth/hooks';
import { formatDate, formatCurrency } from '@/shared/utils';
import { Pagination } from '@/shared/components/common';
import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, LinkedName } from '@/shared/components/ui';
import type { BadgeColor } from '@/shared/components/ui/badge/Badge';
import { Input } from '@/shared/components/form';

type TabType = 'items' | 'maintenances';

interface CompanyRelatedTabsProps {
    company: Company;
}

export function CompanyRelatedTabs({ company }: CompanyRelatedTabsProps) {
    const { t } = useTranslation();
    const { hasPermission, isOnHeadquarters } = useAuth();

    // Active tab - default to items if item provider, otherwise maintenances
    const [activeTab, setActiveTab] = useState<TabType>(
        company.is_item_provider ? 'items' : 'maintenances'
    );

    // Permissions
    const canViewItem = hasPermission('item.view');
    const canViewMaintenance = hasPermission('maintenance.view');
    const canViewMaterial = hasPermission('material.view');
    const canViewSite = isOnHeadquarters && hasPermission('site.view');

    // Items state
    const [items, setItems] = useState<CompanyItem[]>([]);
    const [itemsMeta, setItemsMeta] = useState<PaginationMeta | null>(null);
    const [itemsPage, setItemsPage] = useState(1);
    const [itemsSearch, setItemsSearch] = useState('');
    const [isItemsLoading, setIsItemsLoading] = useState(false);

    // Maintenances state
    const [maintenances, setMaintenances] = useState<CompanyMaintenance[]>([]);
    const [maintenancesMeta, setMaintenancesMeta] = useState<PaginationMeta | null>(null);
    const [maintenancesPage, setMaintenancesPage] = useState(1);
    const [maintenancesSearch, setMaintenancesSearch] = useState('');
    const [isMaintenancesLoading, setIsMaintenancesLoading] = useState(false);

    // Fetch items
    const fetchItems = useCallback(async (page: number, search: string) => {
        setIsItemsLoading(true);
        const filters: ItemFilters = { page, search: search || undefined };
        const result = await CompanyManager.getItems(company.id, filters);
        if (result.success && result.data) {
            setItems(result.data.data);
            setItemsMeta(result.data.meta);
        }
        setIsItemsLoading(false);
    }, [company.id]);

    // Fetch maintenances
    const fetchMaintenances = useCallback(async (page: number, search: string) => {
        setIsMaintenancesLoading(true);
        const filters: MaintenanceFilters = { page, search: search || undefined };
        const result = await CompanyManager.getMaintenances(company.id, filters);
        if (result.success && result.data) {
            setMaintenances(result.data.data);
            setMaintenancesMeta(result.data.meta);
        }
        setIsMaintenancesLoading(false);
    }, [company.id]);

    // Load data when tab or page/search changes
    useEffect(() => {
        if (activeTab === 'items' && company.is_item_provider) {
            fetchItems(itemsPage, itemsSearch);
        } else if (activeTab === 'maintenances' && company.is_maintenance_provider) {
            fetchMaintenances(maintenancesPage, maintenancesSearch);
        }
    }, [
        activeTab,
        company.is_item_provider,
        company.is_maintenance_provider,
        itemsPage, itemsSearch, fetchItems,
        maintenancesPage, maintenancesSearch, fetchMaintenances,
    ]);

    // Handle search with debounce (reset page)
    const handleItemsSearch = (value: string) => {
        setItemsSearch(value);
        setItemsPage(1);
    };

    const handleMaintenancesSearch = (value: string) => {
        setMaintenancesSearch(value);
        setMaintenancesPage(1);
    };

    // Status color helper
    const getStatusColor = (status: string): BadgeColor => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'planned': return 'brand';
            case 'canceled': return 'error';
            default: return 'light';
        }
    };

    // Tab configuration - only show tabs for which company has the type
    const tabs = useMemo(() => {
        const availableTabs = [];

        if (company.is_item_provider) {
            availableTabs.push({
                key: 'items' as TabType,
                label: t('companies.tabs.items'),
                icon: <FaCubes className="h-4 w-4" />,
                count: company.item_count
            });
        }

        if (company.is_maintenance_provider) {
            availableTabs.push({
                key: 'maintenances' as TabType,
                label: t('companies.tabs.maintenances'),
                icon: <FaScrewdriverWrench className="h-4 w-4" />,
                count: company.maintenance_count
            });
        }

        return availableTabs;
    }, [t, company]);

    // If company has no types (shouldn't happen), don't render tabs
    if (tabs.length === 0) {
        return null;
    }

    // Render loading spinner
    const renderLoading = () => (
        <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        </div>
    );

    // Render search input
    const renderSearchInput = (
        value: string,
        onChange: (value: string) => void,
        placeholder: string
    ) => (
        <div className="mb-4 relative max-w-md">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                className="pl-10"
            />
        </div>
    );

    // Render empty state
    const renderEmpty = (icon: React.ReactNode, message: string) => (
        <div className="p-8 text-center">
            <div className="mx-auto mb-3 text-gray-400">{icon}</div>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );

    return (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
            {/* Tab Headers */}
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors sm:px-6 ${isActive
                                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                            {typeof tab.count === 'number' && (
                                <Badge variant="light" color={isActive ? 'brand' : 'light'} size="sm">
                                    {tab.count}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {/* Items Tab */}
                {activeTab === 'items' && company.is_item_provider && (
                    <div>
                        {renderSearchInput(itemsSearch, handleItemsSearch, t('companies.tabs.searchItems'))}
                        {isItemsLoading ? renderLoading() : items.length === 0 ? (
                            renderEmpty(<FaCubes className="h-10 w-10" />, t('companies.tabs.noItems'))
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('items.name')}
                                                </TableCell>
                                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('items.reference')}
                                                </TableCell>
                                                <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('items.currentPrice')}
                                                </TableCell>
                                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('items.stock')}
                                                </TableCell>
                                                {isOnHeadquarters && (
                                                    <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {t('items.site')}
                                                    </TableCell>
                                                )}
                                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('common.createdAt')}
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item) => (
                                                <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                                                    <TableCell className="px-4 py-3">
                                                        <LinkedName
                                                            canView={canViewItem}
                                                            id={item.id}
                                                            name={item.name}
                                                            basePath="items"
                                                        />
                                                        {item.description && (
                                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                                        {item.reference || '—'}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(item.current_price)}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-3 text-center">
                                                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                                            {item.item_entry_total - item.item_exit_total}
                                                        </span>
                                                    </TableCell>
                                                    {isOnHeadquarters && (
                                                        <TableCell className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                                            <LinkedName
                                                                canView={canViewSite}
                                                                id={item.site?.id}
                                                                name={item.site?.name}
                                                                basePath="sites"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                                        {formatDate(item.created_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {itemsMeta && <Pagination meta={itemsMeta} onPageChange={setItemsPage} />}
                            </>
                        )}
                    </div>
                )}

                {/* Maintenances Tab */}
                {activeTab === 'maintenances' && company.is_maintenance_provider && (
                    <div>
                        {renderSearchInput(maintenancesSearch, handleMaintenancesSearch, t('companies.tabs.searchMaintenances'))}
                        {isMaintenancesLoading ? renderLoading() : maintenances.length === 0 ? (
                            renderEmpty(<FaScrewdriverWrench className="h-10 w-10" />, t('companies.tabs.noMaintenances'))
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('companies.detail.maintenance')}
                                                </TableCell>
                                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('companies.detail.material')}
                                                </TableCell>
                                                {isOnHeadquarters && (
                                                    <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {t('companies.detail.site')}
                                                    </TableCell>
                                                )}
                                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('companies.detail.type')}
                                                </TableCell>
                                                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('companies.detail.status')}
                                                </TableCell>
                                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {t('companies.detail.startedAt')}
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {maintenances.map((maintenance) => (
                                                <TableRow key={maintenance.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                                                    <TableCell className="px-4 py-3">
                                                        <LinkedName
                                                            canView={canViewMaintenance}
                                                            id={maintenance.id}
                                                            name={`#${maintenance.id} - ${maintenance.description || t('common.noDescription')}`}
                                                            basePath="maintenances"
                                                            className="line-clamp-2"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-6 py-3">
                                                        <LinkedName
                                                            canView={canViewMaterial}
                                                            id={maintenance.material?.id}
                                                            name={maintenance.material?.name || maintenance.material_name}
                                                            basePath="materials"
                                                        />
                                                    </TableCell>
                                                    {isOnHeadquarters && (
                                                        <TableCell className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                                            <LinkedName
                                                                canView={canViewSite}
                                                                id={maintenance.site?.id}
                                                                name={maintenance.site?.name}
                                                                basePath="sites"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="px-6 py-3">
                                                        <Badge color="light" size="sm">
                                                            {maintenance.type_label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-3 text-center">
                                                        <Badge color={getStatusColor(maintenance.status)} size="sm">
                                                            {maintenance.status_label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                                        {maintenance.started_at ? formatDate(maintenance.started_at) : '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {maintenancesMeta && <Pagination meta={maintenancesMeta} onPageChange={setMaintenancesPage} />}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompanyRelatedTabs;
