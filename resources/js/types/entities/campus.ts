export type CampusProps = {
    id: number;
    name: string;
    venues?: VenueProps[];
    created_at: string;
    updated_at: string;
};

export type VenueProps = {
    id: number;
    campus_id: number;
    name: string;
    schedules?: ScheduleProps[];
    created_at: string;
    updated_at: string;
    campus?: CampusProps;
};

export type ScheduleProps = {
    id: number;
    venue_id: number;
    schedule_date: string;
    times?: TimeProps[];
    created_at: string;
    updated_at: string;
    venue?: VenueProps;
};

export type TimeProps = {
    id: number;
    schedule_id: number;
    slots: number;
    time: string;
    booked_slots: number;
    created_at: string;
    updated_at: string;
    schedule?: ScheduleProps;
};
