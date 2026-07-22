import { Users } from 'lucide-react';

export interface CampusStudentCount {
    id: number;
    name: string;
    students_count: number;
}

export interface CampusStudentCountsWidgetProps {
    counts: CampusStudentCount[];
}

type ColorClasses = {
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    text: string;
};

const campusColorMap: Record<string, ColorClasses> = {
    Talisay: {
        border: 'border-green-500/30 dark:border-green-400/30',
        bg: 'bg-green-500/10 dark:bg-green-400/10',
        badgeBg: 'bg-green-500 dark:bg-green-400',
        badgeText: 'text-white dark:text-green-950',
        text: 'text-green-700 dark:text-green-300',
    },
    Alijis: {
        border: 'border-blue-500/30 dark:border-blue-400/30',
        bg: 'bg-blue-500/10 dark:bg-blue-400/10',
        badgeBg: 'bg-blue-500 dark:bg-blue-400',
        badgeText: 'text-white dark:text-blue-950',
        text: 'text-blue-700 dark:text-blue-300',
    },
    'Fortune Towne': {
        border: 'border-purple-500/30 dark:border-purple-400/30',
        bg: 'bg-purple-500/10 dark:bg-purple-400/10',
        badgeBg: 'bg-purple-500 dark:bg-purple-400',
        badgeText: 'text-white dark:text-purple-950',
        text: 'text-purple-700 dark:text-purple-300',
    },
    Binalbagan: {
        border: 'border-red-500/30 dark:border-red-400/30',
        bg: 'bg-red-500/10 dark:bg-red-400/10',
        badgeBg: 'bg-red-500 dark:bg-red-400',
        badgeText: 'text-white dark:text-red-950',
        text: 'text-red-700 dark:text-red-300',
    },
};

const defaultColor: ColorClasses = {
    border: 'border-slate-500/30 dark:border-slate-400/30',
    bg: 'bg-slate-500/10 dark:bg-slate-400/10',
    badgeBg: 'bg-slate-500 dark:bg-slate-400',
    badgeText: 'text-white dark:text-slate-950',
    text: 'text-slate-700 dark:text-slate-300',
};

export default function CampusStudentCountsWidget({ counts }: CampusStudentCountsWidgetProps) {
    return (
        <>
            {counts.map((c) => {
                const colors = campusColorMap[c.name] ?? defaultColor;

                return (
                    <div key={c.id} className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm ${colors.border} ${colors.bg}`}>
                        <div className="flex items-center gap-2">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.badgeBg} ${colors.badgeText}`}>
                                <Users className="h-4 w-4" />
                            </span>
                            <span className={`text-xs font-medium tracking-wide uppercase ${colors.text}`}>{c.name} Campus</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl font-semibold ${colors.text}`}>{c.students_count.toLocaleString()}</span>
                            <span className={`text-xs opacity-70 ${colors.text}`}>Students Applied</span>
                        </div>
                    </div>
                );
            })}
        </>
    );
}
