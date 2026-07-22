import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import CampusStudentCountsWidget from '@/components/Admin/CampusStudentCountWidget';
import StudentDetailsModal from '@/components/Admin/Modal/StudentDetailsModal';
import TableFilter from '@/components/Admin/TableFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import TableLayout from '@/layouts/table-layout';
import apiService from '@/lib/api-service';
import { CampusProps } from '@/types/entities/campus';
import { PaginateStudents, Student } from '@/types/entities/student';
import { defaultValue, FilterData } from '@/types/entities/table';
import dayjs from 'dayjs';
import { Send, UserSearchIcon } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/admin/students',
    },
];

type PageProps = {
    campus: CampusProps[];
    student_counts: {
        id: number;
        name: string;
        students_count: number;
    }[];
};

export default function Index() {
    const [students, setStudents] = useState<PaginateStudents | null>(null);
    const { campus, student_counts } = usePage<PageProps>().props;

    const [filter, setFilter] = useState<FilterData>(defaultValue);

    const updateFilter = (key: string, value: any) => {
        setFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchStudentsData = async () => {
        try {
            const { data } = await apiService.get(route('api.paginate.students'), {
                params: filter,
            });

            setStudents(data);
        } catch (error) {
            console.error('Error fetching students', error);
            setStudents(null);
            toast.error('Something went wrong fetching students.');
        }
    };

    useEffect(() => {
        fetchStudentsData();
    }, [filter]);

    const tableColumns = ['ID', 'Email', 'Name', 'Age', 'Birthdate', 'Campus', 'Email Sent Date', 'Date Submitted', 'Action'];

    const refresh = async () => {
        const toastId = 'refresh';

        toast.loading('Refreshing...', { id: toastId });

        try {
            await fetchStudentsData();

            toast.success('Refreshed!', {
                id: toastId,
            });
        } catch (error) {
            toast.error('Failed to refresh', {
                id: toastId,
            });
        }
    };
    const [openStudentModal, setOpenStudentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <StudentDetailsModal open={openStudentModal} setOpen={setOpenStudentModal} student={selectedStudent} />
            <div className="m-5 mt-0 flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    <CampusStudentCountsWidget counts={student_counts} />
                </div>
                <TableLayout>
                    <TableFilter
                        data={filter}
                        setFilter={updateFilter}
                        total={students?.total ?? null}
                        onRefresh={() => {
                            refresh();
                        }}
                        campus={campus}
                    />

                    <div className="relative overflow-x-auto rounded-md lg:border">
                        <table className="text-foreground table w-full text-left text-base">
                            <thead className="lg:border-b">
                                <tr>
                                    {tableColumns.map((header) => (
                                        <th key={header} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="lg:border-b">
                                {students?.data.map((row, index) => (
                                    // Keep the key as the row index, but change data-labels below
                                    <tr key={index} className="hover:bg-muted/50">
                                        <td data-label={tableColumns[0]}>{row.id}</td>
                                        <td data-label={tableColumns[1]}>{row.email}</td>
                                        <td data-label={tableColumns[2]}>{row.full_name}</td>
                                        <td data-label={tableColumns[3]}>
                                            <Badge variant={'secondary'}>{dayjs().diff(dayjs(row.birthdate), 'year')} yrs</Badge>
                                        </td>
                                        <td data-label={tableColumns[4]}>{dayjs(row.birthdate).format(`MMM D, YYYY`)}</td>
                                        <td data-label={tableColumns[5]}>{row.schedule?.schedule_time?.schedule?.venue?.campus?.name}</td>
                                        <td data-label={tableColumns[6]}>
                                            {row.schedule?.email_sent_at ? dayjs(row.schedule?.email_sent_at).format(`MMM D, YYYY h:mm A`) : '-'}
                                        </td>
                                        <td data-label={tableColumns[7]}>{dayjs(row.created_at).format(`MMM D, YYYY h:mm A`)}</td>
                                        <td data-label={tableColumns[8]}>
                                            <div className="flex items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedStudent(row);
                                                                setOpenStudentModal(true);
                                                            }}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <UserSearchIcon />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View Student</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedStudent(row);
                                                                setOpenStudentModal(true);
                                                            }}
                                                            disabled={!row.schedule?.email_sent_at}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Send />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Send Email</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {students?.data.length === 0 || !students ? (
                                    <>
                                        <tr>
                                            <td colSpan={tableColumns.length} className="force-center p-3 text-center">
                                                No students found.
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    ''
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={tableColumns.length} className="px-6 py-4">
                                        <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
                                            <p className="text-muted-foreground text-sm">
                                                Showing <span className="font-medium">{students?.from}</span>–
                                                <span className="font-medium">{students?.to}</span> of{' '}
                                                <span className="font-medium">{students?.total}</span>
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {students?.links?.map((link, idx) => {
                                                    let page: string | null = null;
                                                    if (link.url) {
                                                        const url = new URL(link.url);
                                                        page = url.searchParams.get('page');
                                                    }

                                                    return (
                                                        <button
                                                            key={idx}
                                                            disabled={!link.url}
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                if (!page) return;

                                                                try {
                                                                    const { data } = await apiService.get(route('api.paginate.students'), {
                                                                        params: {
                                                                            ...filter,
                                                                            page,
                                                                        },
                                                                    });

                                                                    setStudents(data);
                                                                } catch (error) {
                                                                    console.error('Failed to fetch page:', error);
                                                                }
                                                            }}
                                                            className={`rounded px-3 py-1 ${
                                                                link.active
                                                                    ? 'bg-primary text-white dark:text-black'
                                                                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                                            }`}
                                                            type="button"
                                                        >
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </TableLayout>
            </div>
        </AppLayout>
    );
}
