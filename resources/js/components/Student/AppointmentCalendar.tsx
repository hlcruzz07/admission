import { CampusProps, ScheduleProps, TimeProps, VenueProps } from '@/types/entities/campus';
import { Building2, Check, CheckCheckIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// ---------------------------------------------------------------------------
// Types — mirrors the Laravel payload shape
// (campuses -> venues -> schedules -> times)
// ---------------------------------------------------------------------------

export interface SelectedSchedule {
    campus: CampusProps;
    venue: VenueProps;
    schedule: ScheduleProps;
    time: TimeProps;
}

export interface AppointmentCalendarProps {
    campuses: CampusProps[];
    /** Currently selected schedule_time_id — pass data.schedule_time_id from useForm here. */
    value?: number | null;
    /** Fires whenever the student picks (or clears) a time slot. */
    onChange?: (scheduleTimeId: number | null, selection: SelectedSchedule | null) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toDateKey(year: number, month: number, day: number): string {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(year: number, month: number): Date[] {
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        days.push(d);
    }
    return days;
}

function formatTime(time24: string): string {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Find which campus/venue/schedule a given schedule_time_id belongs to,
// so a controlled `value` can hydrate the picker on mount (e.g. student
// goes "back" in a multi-step form and their prior pick should still show).
function locateByTimeId(campuses: CampusProps[], timeId: number | null | undefined): SelectedSchedule | null {
    if (!timeId) return null;
    for (const campus of campuses) {
        for (const venue of campus.venues || []) {
            for (const schedule of venue.schedules || []) {
                const time = schedule.times?.find((t) => t.id === timeId);
                if (time) return { campus, venue, schedule, time };
            }
        }
    }
    return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AppointmentCalendar({ campuses, value, onChange }: AppointmentCalendarProps) {
    const today = useMemo(() => new Date(), []);
    const hydrated = useMemo(() => locateByTimeId(campuses, value), [campuses, value]);

    const [campusId, setCampusId] = useState<number | null>(hydrated?.campus.id ?? campuses[0]?.id ?? null);
    const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];

    const venuesWithSchedules: VenueProps[] = campus?.venues ?? [];
    const [venueId, setVenueId] = useState<number | null>(hydrated?.venue.id ?? venuesWithSchedules[0]?.id ?? null);
    const venue = venuesWithSchedules.find((v) => v.id === venueId) ?? venuesWithSchedules[0];

    const initialCursor = hydrated ? new Date(hydrated.schedule.schedule_date) : new Date(today.getFullYear(), today.getMonth(), 1);
    const [cursor, setCursor] = useState(new Date(initialCursor.getFullYear(), initialCursor.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(hydrated ? new Date(hydrated.schedule.schedule_date) : null);

    function handleCampusChange(id: number) {
        setCampusId(id);
        const newCampus = campuses.find((c) => c.id === id);
        setVenueId(newCampus?.venues?.[0]?.id ?? null);
        setSelectedDate(null);
        onChange?.(null, null);
    }

    function handleVenueChange(id: number) {
        setVenueId(id);
        setSelectedDate(null);
        onChange?.(null, null);
    }

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

    function prevMonth() {
        setCursor(new Date(year, month - 1, 1));
    }
    function nextMonth() {
        setCursor(new Date(year, month + 1, 1));
    }

    // Map schedule_date -> schedule, for the selected venue only
    const scheduleByDate = useMemo(() => {
        const map: Record<string, ScheduleProps> = {};
        (venue?.schedules ?? []).forEach((s) => {
            map[s.schedule_date] = s;
        });
        return map;
    }, [venue]);

    // The date (YYYY-MM-DD) that owns the currently chosen schedule_time_id,
    // within the selected venue — used to highlight that day on the grid
    // even if the student has since scrolled to a different month.
    const chosenDateKey = useMemo(() => {
        if (!value || !venue) return null;
        for (const s of venue.schedules ?? []) {
            if (s.times?.some((t) => t.id === value)) return s.schedule_date;
        }
        return null;
    }, [value, venue]);

    const selectedKey = selectedDate ? toDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : null;
    const selectedSchedule = selectedKey ? scheduleByDate[selectedKey] : null;

    function selectDay(date: Date) {
        const key = toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
        if (!scheduleByDate[key]) return; // no schedule that day, not clickable
        setSelectedDate(date);
    }

    function selectTime(time: TimeProps) {
        if (!campus || !venue || !selectedSchedule) return;
        const isDeselecting = value === time.id;
        onChange?.(isDeselecting ? null : time.id, isDeselecting ? null : { campus, venue, schedule: selectedSchedule, time });
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:flex-row">
                <div className="flex-1">
                    <Label className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-medium">
                        <Building2 className="h-3.5 w-3.5" />
                        Campus
                    </Label>
                    <Select value={campusId != null ? String(campusId) : undefined} onValueChange={(val) => handleCampusChange(Number(val))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a campus" />
                        </SelectTrigger>
                        <SelectContent>
                            {campuses.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1">
                    <Label className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        Venue
                    </Label>
                    <Select value={venueId != null ? String(venueId) : undefined} onValueChange={(val) => handleVenueChange(Number(val))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a venue" />
                        </SelectTrigger>
                        <SelectContent>
                            {venuesWithSchedules.map((v) => (
                                <SelectItem key={v.id} value={String(v.id)}>
                                    {v.name}
                                    {v.schedules?.length === 0 ? ' (no open schedules)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
                <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
                    <div className="border-border flex items-center justify-between border-b px-5 py-4">
                        <h2 className="text-foreground text-lg font-semibold">
                            {MONTH_LABELS[month]} {year}
                        </h2>
                        <div className="border-input flex items-center overflow-hidden rounded-md border">
                            <button
                                type="button"
                                onClick={prevMonth}
                                aria-label="Previous month"
                                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground p-1.5 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="bg-border h-5 w-px" />
                            <button
                                type="button"
                                onClick={nextMonth}
                                aria-label="Next month"
                                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground p-1.5 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="border-border bg-muted/50 grid grid-cols-7 border-b">
                        {DAY_LABELS.map((d) => (
                            <div key={d} className="text-muted-foreground py-2 text-center text-xs font-medium tracking-wide uppercase">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {grid.map((date, idx) => {
                            const inMonth = date.getMonth() === month;
                            const isToday = isSameDay(date, today);
                            const isSelected = selectedDate && isSameDay(date, selectedDate);
                            const key = toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
                            const schedule = scheduleByDate[key];
                            const hasSchedule = Boolean(schedule);
                            const isChosen = chosenDateKey !== null && key === chosenDateKey;
                            const totalOpenSlots = schedule ? schedule.times?.reduce((sum, t) => sum + t.slots, 0) : 0;
                            const isFull = hasSchedule && totalOpenSlots === 0;
                            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            const clickable = hasSchedule && !isFull && !isPast;

                            return (
                                <Button
                                    type="button"
                                    key={idx}
                                    disabled={!clickable}
                                    onClick={() => selectDay(date)}
                                    className={[
                                        'border-border/60 relative flex min-h-[84px] flex-col gap-1 rounded-none! border-r border-b p-1 text-left transition-colors md:p-2',
                                        idx % 7 === 6 ? 'border-r-0' : '',
                                        idx >= 35 ? 'border-b-0' : '',
                                        isChosen ? 'bg-primary/10' : !inMonth ? 'bg-muted/40' : 'bg-card',
                                        clickable
                                            ? 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
                                            : 'cursor-not-allowed hover:cursor-not-allowed!',
                                        isChosen ? 'ring-primary ring-2 ring-inset' : isSelected ? 'ring-ring ring-2 ring-inset' : '',
                                    ].join(' ')}
                                >
                                    <span
                                        className={[
                                            'mb-1 inline-flex size-5 items-center justify-center rounded-full text-xs md:size-6 lg:text-sm',
                                            isChosen
                                                ? 'bg-primary text-primary-foreground font-semibold'
                                                : isToday
                                                  ? 'border-primary text-primary border font-semibold'
                                                  : inMonth
                                                    ? isPast
                                                        ? 'text-muted-foreground/50'
                                                        : 'text-foreground'
                                                    : 'text-muted-foreground/50',
                                        ].join(' ')}
                                    >
                                        {date.getDate()}
                                    </span>

                                    {hasSchedule && inMonth && !isChosen && (
                                        <span
                                            className={[
                                                'w-fit rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase',
                                                isPast
                                                    ? 'bg-muted text-muted-foreground'
                                                    : isFull
                                                      ? 'bg-destructive/10 text-destructive'
                                                      : 'bg-primary/10 text-primary',
                                            ].join(' ')}
                                        >
                                            {isPast ? 'closed' : isFull ? 'full' : 'open'}
                                        </span>
                                    )}

                                    {isChosen && (
                                        <span className="bg-primary/15 text-primary w-fit rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase">
                                            <CheckCheckIcon />
                                        </span>
                                    )}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="border-border text-muted-foreground flex flex-wrap items-center gap-4 border-t px-5 py-3 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="bg-primary/60 h-2 w-2 rounded-full" /> Slots Open
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="bg-destructive h-2 w-2 rounded-full" /> Fully Booked
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="bg-muted-foreground/40 h-2 w-2 rounded-full" /> No schedule
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="bg-primary text-primary-foreground flex h-3.5 w-3.5 items-center justify-center rounded-full">
                                <Check className="h-2 w-2" strokeWidth={4} />
                            </span>
                            Your Appointment
                        </span>
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* Time slot panel */}
                {/* ---------------------------------------------------- */}
                <div className="border-border bg-card h-fit rounded-xl border p-5 shadow-sm">
                    {!venue ? (
                        <p className="text-muted-foreground text-sm">Select a campus and venue.</p>
                    ) : !selectedDate ? (
                        <div className="border-border text-muted-foreground rounded-lg border border-dashed px-3 py-10 text-center text-sm">
                            Click a highlighted date to see available appointment times at{' '}
                            <span className="text-foreground font-medium">{venue.name}</span>.
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    {selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}
                                </p>
                                <h3 className="text-foreground text-xl font-semibold">
                                    {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </h3>
                                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                                    <MapPin className="h-3 w-3" />
                                    {venue.name}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                {selectedSchedule?.times
                                    ?.slice()
                                    .sort((a, b) => a.time.localeCompare(b.time))
                                    .map((t) => {
                                        const full = t.slots <= 0;
                                        const active = value === t.id;

                                        return (
                                            <button
                                                type="button"
                                                key={t.id}
                                                disabled={full}
                                                onClick={() => selectTime(t)}
                                                className={[
                                                    'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors',
                                                    full
                                                        ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                                                        : active
                                                          ? 'border-primary bg-accent! text-accent-foreground!'
                                                          : 'border-border hover:border-ring hover:bg-accent hover:text-accent-foreground',
                                                ].join(' ')}
                                            >
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    {active ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                                    {formatTime(t.time)}
                                                </span>
                                                <span
                                                    className={[
                                                        'flex items-center gap-1 text-xs',
                                                        active ? 'text-accent-foreground/80' : 'text-muted-foreground',
                                                    ].join(' ')}
                                                >
                                                    {full ? (
                                                        'Full'
                                                    ) : (
                                                        <>
                                                            <Users className="h-3 w-3" />
                                                            {t.slots} slots left
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
