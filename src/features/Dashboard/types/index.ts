/**
 * Dashboard Types
 */

import { StockStatus } from "@/features/Items/types";
import { BadgeColor } from "@/shared/components/ui/badge/Badge";

export interface DashboardStats {
    maintenances_this_month: number;
    maintenances_trend: number;
    open_incidents: number;
    incidents_trend: number;
    items_in_stock: number;
    cleanings_this_month: number;
    cleanings_trend: number;
}

export interface IncidentsSummary {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    by_severity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

export interface LowStockItem {
    id: number;
    name: string;
    reference: string;
    current_stock: number;
    min_stock: number;
    stock_status: StockStatus;
    stock_status_color: BadgeColor;
}

export interface UpcomingMaintenance {
    id: number;
    title: string;
    location: string;
    date: string;
    priority: 'low' | 'medium' | 'high';
    type: 'preventive' | 'corrective';
}

export interface RecentActivity {
    id: string;
    type: 'maintenance' | 'incident' | 'cleaning' | 'item_movement';
    title: string;
    description: string;
    time: string;
    status: 'completed' | 'in_progress' | 'pending' | 'entry' | 'exit';
}

export interface DashboardData {
    stats: DashboardStats;
    incidents_summary: IncidentsSummary;
    low_stock_items: LowStockItem[];
    upcoming_maintenances: UpcomingMaintenance[];
    recent_activities: RecentActivity[];
    is_headquarters: boolean;
}

export interface ChartsData {
    maintenances_evolution: MaintenancesEvolution;
    incidents_evolution: IncidentsEvolution;
}

export interface MaintenancesEvolution {
    months: string[];
    corrective: number[];
    preventive: number[];
    inspection: number[];
    improvement: number[];
}

export interface IncidentsEvolution {
    months: string[];
    low: number[];
    medium: number[];
    high: number[];
    critical: number[];
}
