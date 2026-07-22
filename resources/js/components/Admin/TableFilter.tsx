import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CampusProps } from '@/types/entities/campus';
import { defaultValue, FilterData } from '@/types/entities/table';
import { format } from 'date-fns';
import { isEqual } from 'lodash';
import {
    ArrowDownNarrowWide,
    ArrowUpDownIcon,
    ArrowUpNarrowWide,
    CalendarIcon,
    ChevronDownIcon,
    ChevronsLeftRight,
    FileIcon,
    RefreshCwIcon,
    School2Icon,
    SearchIcon,
    SheetIcon,
    Trash2Icon,
    UploadCloudIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
type FilterProps = {
    data: FilterData;
    setFilter: (key: string, value: any) => void;
    campus: CampusProps[];
    total: number | null;
    onRefresh: () => void;
};

export default function TableFilter({ data, setFilter, campus, total, onRefresh }: FilterProps) {
    const [searchVal, setSearchVal] = useState('');
    const [range, setRange] = useState<DateRange | undefined>(undefined);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilter('search', searchVal || null);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchVal]);

    const resetFilter = () => {
        Object.entries(defaultValue).forEach(([key, value]) => {
            setFilter(key as any, value);
        });
        setRange(undefined);
    };

    return (
        <>
            <div className="flex flex-col items-start justify-between gap-3 lg:flex-row">
                <div className="relative flex w-full items-center gap-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={onRefresh} variant="outline">
                                <RefreshCwIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>

                    <Input
                        type="text"
                        placeholder="Search id, email, name..."
                        className="rounded-md bg-white dark:bg-black"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                    />

                    <div className="text-accent-foreground absolute end-3">
                        <SearchIcon size={15} />
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:grow md:flex-nowrap">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Show {data.show} <ChevronsLeftRight className="trasform rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-max" align="end">
                            {[10, 25, 50, 100, 150, 200].map((option) => (
                                <DropdownMenuItem
                                    key={option}
                                    onClick={() => setFilter('show', option)}
                                    className={data.show === option ? 'text-primary font-medium' : ''}
                                >
                                    {option}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <ArrowUpDownIcon /> Sort
                                <ChevronDownIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto" align="end">
                            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <div className="flex items-center gap-3">
                                    <Select value={data.sort} onValueChange={(value) => setFilter('sort', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="id">#</SelectItem>
                                                <SelectItem value="created_at">Date Submitted</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Select value={data.order} onValueChange={(value) => setFilter('order', value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Choose an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="asc">
                                                    Asc <ArrowDownNarrowWide />
                                                </SelectItem>
                                                <SelectItem value="desc">
                                                    Desc
                                                    <ArrowUpNarrowWide />
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    variant="destructive"
                                    className="mt-3 w-full"
                                    type="button"
                                    onClick={() => {
                                        setFilter('sort', 'id');
                                        setFilter('order', 'desc');
                                    }}
                                >
                                    Reset <Trash2Icon />
                                </Button>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button disabled={total === 0}>
                                        <UploadCloudIcon />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem disabled={total === 0}>
                                            <FileIcon /> PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled={total === 0}>
                                            <SheetIcon /> Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled={total === 0}>
                                            <SheetIcon /> CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TooltipTrigger>

                        <TooltipContent>
                            <p>Export Students</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <div className="mt-3 flex flex-col items-start justify-between gap-5 md:flex-row md:items-start">
                <div className="flex w-full grow flex-wrap gap-3 xl:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <School2Icon />
                                Campus
                                {campus.find((item) => item.id === data.campus)?.name && (
                                    <Badge>{campus.find((item) => item.id === data.campus)?.name}</Badge>
                                )}
                                <ChevronDownIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {campus.map((item, index) => (
                                <DropdownMenuCheckboxItem
                                    key={index}
                                    checked={data.campus === item.id}
                                    onSelect={() => {
                                        if (data.campus === item.id) {
                                            setFilter('campus', null);
                                            return;
                                        }

                                        setFilter('campus', item.id);
                                    }}
                                >
                                    {item.name}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-max justify-between ${range?.from && range?.to ? 'rounded-e-none border-e-0' : ''}`}
                                >
                                    <CalendarIcon />

                                    {range?.from && range?.to
                                        ? `${range.from.toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })} – ${range.to.toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })}`
                                        : 'Date Submitted'}

                                    <ChevronDownIcon />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-auto p-0">
                                <Calendar
                                    mode="range"
                                    selected={range}
                                    buttonVariant="secondary"
                                    captionLayout="dropdown"
                                    onSelect={(newRange) => {
                                        if (!newRange) return;

                                        setRange(newRange);

                                        setFilter('created_at_from', format(newRange.from!, 'yyyy-MM-dd'));
                                        setFilter('created_at_to', format(newRange.to!, 'yyyy-MM-dd'));
                                    }}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {range && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    setRange(undefined);
                                    setFilter('created_at_from', null);
                                    setFilter('created_at_to', null);
                                }}
                                className="rounded-s-none"
                            >
                                <XIcon />
                            </Button>
                        )}
                    </div>

                    {!isEqual(defaultValue, data) && (
                        <Button type="button" onClick={resetFilter} variant="destructive">
                            <Trash2Icon /> Reset
                        </Button>
                    )}
                </div>

                <p className="text-sm whitespace-nowrap">
                    Total Entries:{' '}
                    <Badge variant="secondary" className="bg-green-600 text-white">
                        {Number(total).toLocaleString()}
                    </Badge>
                </p>
            </div>
        </>
    );
}
