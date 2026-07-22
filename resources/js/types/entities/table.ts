export type FilterData = {
    search: string | null;
    campus: number | null;
    created_at_from: string | null;
    created_at_to: string | null;
    show: number;
    sort: string;
    order: 'asc' | 'desc';
};

export const defaultValue: FilterData = {
    search: null,
    campus: null,
    created_at_from: null,
    created_at_to: null,
    show: 10,
    sort: 'id',
    order: 'desc',
};
