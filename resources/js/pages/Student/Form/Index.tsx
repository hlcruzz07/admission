import LabelExample from '@/components/LabelExample';
import AppointmentCalendar from '@/components/Student/AppointmentCalendar';
import TwoColumnInput from '@/components/TwoColumnInput';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/layouts/student-layout';
import { capitalizeString, handleErrors } from '@/lib/utils';
import { CampusProps } from '@/types/entities/campus';
import { Student } from '@/types/entities/student';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Asterisk, CalendarIcon, SendIcon } from 'lucide-react';
import { useState } from 'react';

type PageProps = {
    schedules: CampusProps[];
};

export default function Index() {
    const { schedules } = usePage<PageProps>().props;

    const { data, setData, errors, post, processing } = useForm<Student>({
        fname: '',
        mname: null,
        lname: '',
        suffix: null,
        birthdate: null,
        email: '',
        schedule_time_id: null,
    });

    const [openBirthDate, setOpenBirthDate] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (processing) return;

        post(route('student.store'), {
            onError: (err) => {
                handleErrors(err);
                router.reload({ only: ['schedules'] });
            },
        });
    }

    console.log(data);

    return (
        <StudentLayout>
            <Head title="Student Form" />

            <Card className="relative z-10 my-0 w-full rounded-none border-0 shadow-none md:max-w-4xl md:rounded-2xl md:border md:shadow-xl lg:my-10">
                <CardHeader className="border-border border-b pb-6">
                    <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-start">
                        <div className="w-16 shrink-0 md:w-20">
                            <img src="/logo.webp" alt="CHMSU" className="h-full w-full rounded-lg object-cover" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold text-[var(--main-color)] md:text-2xl">Carlos Hidalgo Memorial State University</h1>
                            <p className="text-muted-foreground text-base md:text-lg">Admission Student Appointment Form</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative space-y-10 pt-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10">
                        <section className="space-y-5">
                            <div>
                                <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">Personal information</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Tell us who's booking the appointment.</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <LabelExample title="Email" required example="johndoe@gmail.com" />
                                <Input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value.toLowerCase())}
                                    placeholder="johndoe@gmail.com"
                                    maxLength={50}
                                />
                                <InputError message={errors['email']} />
                            </div>

                            <TwoColumnInput>
                                <div className="flex flex-col gap-3">
                                    <Label>
                                        First name <Asterisk color="red" size={12} />
                                    </Label>
                                    <Input
                                        value={data.fname}
                                        name="fname"
                                        onChange={(e) => setData('fname', capitalizeString(e.target.value))}
                                        maxLength={25}
                                        type="text"
                                        placeholder="Enter first name"
                                    />
                                    <InputError message={errors['fname']} />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Label>Middle name</Label>
                                    <Input
                                        type="text"
                                        name="mname"
                                        value={data.mname ?? ''}
                                        onChange={(e) => {
                                            if (e.target.value === '') {
                                                setData('mname', null);
                                                return;
                                            }
                                            setData('mname', capitalizeString(e.target.value));
                                        }}
                                        maxLength={25}
                                        placeholder="Enter middle name"
                                    />
                                    <InputError message={errors['mname']} />
                                </div>
                            </TwoColumnInput>

                            <TwoColumnInput>
                                <div className="flex flex-col gap-3">
                                    <Label>
                                        Last name <Asterisk color="red" size={12} />
                                    </Label>
                                    <Input
                                        type="text"
                                        name="lname"
                                        value={data.lname}
                                        onChange={(e) => setData('lname', capitalizeString(e.target.value))}
                                        maxLength={25}
                                        placeholder="Enter last name"
                                    />
                                    <InputError message={errors['lname']} />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Label>Suffix</Label>
                                    <Select
                                        value={data.suffix ?? ''}
                                        onValueChange={(value) => {
                                            if (value === 'None') {
                                                setData('suffix', null);
                                                return;
                                            }
                                            setData('suffix', value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="—" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {['Jr.', 'Sr.', 'III', 'IV', 'V'].map((item) => (
                                                    <SelectItem key={item} value={item}>
                                                        {item}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors['suffix']} />
                                </div>
                            </TwoColumnInput>
                            <div className="flex flex-col gap-3">
                                <Field>
                                    <FieldLabel>
                                        Birthdate <Asterisk size={12} color="red" />
                                    </FieldLabel>

                                    <Popover open={openBirthDate} onOpenChange={setOpenBirthDate}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start font-normal">
                                                <CalendarIcon className="h-4 w-4" />
                                                {data.birthdate ? format(new Date(data.birthdate), 'PPP') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={data.birthdate ? new Date(data.birthdate) : undefined}
                                                defaultMonth={data.birthdate ? new Date(data.birthdate) : undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    if (!date) {
                                                        setData('birthdate', null);
                                                        return;
                                                    }
                                                    setData('birthdate', format(date, 'yyyy-MM-dd'));
                                                    setOpenBirthDate(false);
                                                }}
                                                disabled={(date) => date > new Date()}
                                                classNames={{
                                                    today: 'border-none bg-transparent text-foreground',
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Field>
                                <InputError message={errors['birthdate']} />
                            </div>
                        </section>
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">Appointment schedule</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Pick a campus, venue, and time slot that works for you.</p>
                            </div>

                            <AppointmentCalendar
                                campuses={schedules}
                                value={data.schedule_time_id}
                                onChange={(id) => {
                                    setData('schedule_time_id', id);
                                }}
                            />
                            <InputError message={errors['schedule_time_id']} />
                        </section>

                        <Button type="button" className="w-full">
                            Submit <SendIcon />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </StudentLayout>
    );
}
