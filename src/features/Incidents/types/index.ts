// Incident types for multi-tenancy

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
    id: number;
    description: string;
    status: IncidentStatus;
    status_label: string;
    severity: IncidentSeverity;
    severity_label: string;
    // Material info
    material_id: number | null;
    material_name: string | null;
    material?: IncidentMaterial;
    // Maintenance info (optional)
    maintenance_id: number | null;
    maintenance?: IncidentMaintenance;
    // Reporter info
    reported_by_id: number | null;
    reported_by_name: string | null;
    reporter?: IncidentReporter;
    // Dates
    started_at: string | null;
    resolved_at: string | null;
    // Timestamps
    created_at: string;
    updated_at?: string;
}

export interface IncidentDetail extends Incident {
    site_id: number;
    site?: IncidentSite;
    edited_by_id: number | null;
    editor?: IncidentEditor;
}

export interface IncidentMaterial {
    id: number;
    name: string;
    zone?: {
        id: number;
        name: string;
    };
}

export interface IncidentMaintenance {
    id: number;
    description: string;
    status?: string;
}

export interface IncidentReporter {
    id: number;
    full_name: string;
    email?: string;
}

export interface IncidentEditor {
    id: number;
    full_name: string;
}

export interface IncidentSite {
    id: number;
    name: string;
}

export interface IncidentFormData {
    material_id: number;
    maintenance_id?: number | null;
    description: string;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    started_at?: string | null;
    resolved_at?: string | null;
}

export interface IncidentFilters {
    page?: number;
    search?: string;
    material_id?: number;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    sort_by?: 'created_at' | 'started_at' | 'resolved_at' | 'severity' | 'status';
    sort_direction?: 'asc' | 'desc';
}

export interface AvailableMaterial {
    id: number;
    name: string;
}

export interface AvailableMaintenance {
    id: number;
    description: string;
    material_id: number;
    material_name?: string | null;
}

export interface SeverityOption {
    value: IncidentSeverity;
    label: string;
}

export interface StatusOption {
    value: IncidentStatus;
    label: string;
}
