import { TimeProps } from './campus';

export type Student = {
    id?: number;
    fname: string;
    mname: string | null;
    lname: string;
    suffix: string | null;
    birthdate: string | null;
    email: string;
    schedule_time_id?: number | null;
    schedule?: StudentSchedule;
    full_name?: string;
    created_at?: string;
    updated_at?: string;
};

export type PaginateStudents = {
    data: Student[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
};

export type StudentSchedule = {
    id?: number;
    student_id?: number;
    schedule_time_id?: number;
    email_sent_at: string | null;
    token: string | null;
    student?: Student;
    schedule_time?: TimeProps;
};
