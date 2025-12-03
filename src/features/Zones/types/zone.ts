// Zone types for multi-tenancy
export interface Zone {
    id: number;
    name: string;
    allow_material: boolean;
    parent_id: number | null;
    site_id: number;
    site?: ZoneSite;
    parent?: ZoneParent;
    children?: ZoneChild[];
    materials?: ZoneMaterial[];
    children_count: number;
    materials_count: number;
    created_at: string;
    updated_at?: string;
}

export interface ZoneSite {
    id: number;
    name: string;
}

export interface ZoneParent {
    id: number;
    name: string;
}

export interface ZoneChild {
    id: number;
    name: string;
    allow_material: boolean;
    children_count: number;
    materials_count: number;
}

export interface ZoneMaterial {
    id: number;
    name: string;
    description?: string;
}

export interface ZoneFormData {
    name: string;
    parent_id?: number | null;
    allow_material: boolean;
}

export interface ZoneFilters {
    page?: number;
    search?: string;
    parent_id?: number | null;
    sort_by?: 'name' | 'children_count' | 'materials_count' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}

export interface ParentZoneOption {
    id: number;
    name: string;
}
