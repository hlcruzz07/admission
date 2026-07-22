import { Armchair, Building2, CalendarCheck2, TicketCheck } from 'lucide-react';

export interface SlotStatsWidgetProps {
    venueCount: number;
    totalSlots: number;
    totalBookedSlots: number;
    totalAvailableSlots: number;
}

function percentage(part: number, total: number): number {
    if (total <= 0) return 0;
    return Math.min(Math.round((part / total) * 100), 100);
}

function getCapacityColor(pct: number): { label: string; bar: string } {
    if (pct >= 100) {
        return { label: 'text-red-600 dark:text-red-400', bar: 'bg-red-500 dark:bg-red-400' };
    }
    if (pct >= 80) {
        return { label: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-500 dark:bg-orange-400' };
    }
    if (pct >= 50) {
        return { label: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500 dark:bg-amber-400' };
    }
    return { label: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500 dark:bg-emerald-400' };
}

export default function SlotStatsWidget({ venueCount, totalSlots, totalBookedSlots, totalAvailableSlots }: SlotStatsWidgetProps) {
    const bookedPct = percentage(totalBookedSlots, totalSlots);
    const availablePct = 100 - bookedPct;
    const capacityColor = getCapacityColor(bookedPct);

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Available — emerald */}
                <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-400/10">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-950">
                            <CalendarCheck2 className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-300">Available</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{totalAvailableSlots.toLocaleString()}</span>
                        <span className="text-xs text-emerald-700/60 dark:text-emerald-300/60">({availablePct}%)</span>
                    </div>
                </div>
                {/* Booked — amber */}
                <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950">
                            <TicketCheck className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium tracking-wide text-amber-700 uppercase dark:text-amber-300">Booked</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{totalBookedSlots.toLocaleString()}</span>
                        <span className="text-xs text-amber-700/60 dark:text-amber-300/60">({bookedPct}%)</span>
                    </div>
                </div>
                {/* Total Slots — violet */}
                <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 shadow-sm dark:border-violet-400/30 dark:bg-violet-400/10">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white dark:bg-violet-400 dark:text-violet-950">
                            <Armchair className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium tracking-wide text-violet-700 uppercase dark:text-violet-300">Total Slots</span>
                    </div>
                    <span className="text-2xl font-semibold text-violet-700 dark:text-violet-300">{totalSlots.toLocaleString()}</span>
                </div>
                {/* Venues — blue */}
                <div className="flex flex-col gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-sm dark:border-blue-400/30 dark:bg-blue-400/10">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white dark:bg-blue-400 dark:text-blue-950">
                            <Building2 className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium tracking-wide text-blue-700 uppercase dark:text-blue-300">Venues</span>
                    </div>
                    <span className="text-2xl font-semibold text-blue-700 dark:text-blue-300">{venueCount.toLocaleString()}</span>
                </div>
            </div>

            {/* Combined progress bar */}
            <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Capacity used</span>
                    <span className={`font-semibold ${capacityColor.label}`}>{bookedPct}%</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div className={`h-full rounded-full transition-all ${capacityColor.bar}`} style={{ width: `${bookedPct}%` }} />
                </div>
            </div>
        </div>
    );
}
