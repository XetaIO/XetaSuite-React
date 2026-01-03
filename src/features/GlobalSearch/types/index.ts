/**
 * Global Search Types
 */

export type SearchableType =
    | 'materials'
    | 'zones'
    | 'items'
    | 'incidents'
    | 'maintenances'
    | 'companies'
    | 'sites';

export interface SearchResultMeta {
    site?: string;
    [key: string]: unknown;
}

export interface SearchResult {
    id: number;
    type: SearchableType;
    title: string;
    subtitle: string | null;
    description: string | null;
    url: string;
    meta: SearchResultMeta;
}

export interface SearchTypeResults {
    count: number;
    items: SearchResult[];
}

export interface GlobalSearchResults {
    query: string;
    total: number;
    is_on_headquarters: boolean;
    results: {
        [K in SearchableType]?: SearchTypeResults;
    };
}

export interface SearchTypesResponse {
    types: SearchableType[];
}

export interface SearchParams {
    q: string;
    per_type?: number;
}
