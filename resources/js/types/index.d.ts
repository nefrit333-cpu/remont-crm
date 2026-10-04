export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    customer_id?: number | null;
    email_verified_at?: string;
    roles?: Array<{ id: number; name: string }>;
}

export interface Customer {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    projects_count?: number;
}

export interface Lead {
    id: number;
    client_name: string;
    phone: string;
    email?: string | null;
    renovation_type: string;
    address: string;
    area?: string | number | null;
    budget?: number | null;
    desired_start_date?: string | null;
    status: string;
    source?: string | null;
    comment?: string | null;
    converted_at?: string | null;
    manager?: User | null;
    projects?: Project[];
    comments?: Comment[];
    activities?: ActivityLog[];
}

export interface Project {
    id: number;
    name: string;
    address: string;
    area?: string | number | null;
    renovation_type: string;
    status: string;
    start_date?: string | null;
    planned_finish_date?: string | null;
    budget?: number | null;
    customer?: Customer;
    manager?: User | null;
    foreman?: User | null;
    lead?: Lead | null;
    stages?: ProjectStage[];
    tasks?: RenovationTask[];
    events?: CalendarEvent[];
    files?: ProjectFile[];
    payments?: Payment[];
    acts?: Act[];
    comments?: Comment[];
    activities?: ActivityLog[];
}

export interface ProjectStage {
    id: number;
    name: string;
    status: string;
    start_date?: string | null;
    finish_date?: string | null;
    progress: number;
    comment?: string | null;
}

export interface RenovationTask {
    id: number;
    title: string;
    description?: string | null;
    due_date?: string | null;
    priority: string;
    status: string;
    visible_to_client: boolean;
    project?: Project;
    assignee?: User | null;
}

export interface CalendarEvent {
    id: number;
    title: string;
    type: string;
    starts_at: string;
    ends_at?: string | null;
    description?: string | null;
    project?: Project | null;
    lead?: Lead | null;
    user?: User | null;
}

export interface ProjectFile {
    id: number;
    name: string;
    type: string;
    path?: string | null;
    visible_to_client: boolean;
    project?: Project;
    uploader?: User | null;
}

export interface Payment {
    id: number;
    amount: number;
    purpose: string;
    due_date?: string | null;
    status: string;
    paid_at?: string | null;
    project?: Project;
}

export interface Act {
    id: number;
    number: string;
    title: string;
    amount?: number | null;
    status: string;
    issued_at?: string | null;
    project?: Project;
}

export interface Comment {
    id: number;
    body: string;
    visible_to_client: boolean;
    created_at: string;
    author?: User | null;
}

export interface ActivityLog {
    id: number;
    event: string;
    description: string;
    created_at: string;
    user?: User | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Pagination<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

export type PageProps<T extends object = Record<string, unknown>> = T & {
    auth: {
        user: User;
        role?: string | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
};
