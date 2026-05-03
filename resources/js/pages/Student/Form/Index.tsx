import InputError from '@/components/input-error';
import LabelExample from '@/components/LabelExample';
import TwoColumnInput from '@/components/TwoColumnInput';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/layouts/student-layout';
import { capitalizeString } from '@/lib/utils';
import { Student } from '@/types/entities/student';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Asterisk, AsteriskIcon, CalendarIcon, MailIcon, SendIcon } from 'lucide-react';
import { useState } from 'react';

export default function Index() {
    const { data, setData, errors, clearErrors, reset, post, processing } = useForm<Student>({
        fname: '',
        mname: null,
        lname: '',
        suffix: null,
        birthdate: null,
        email: '',
        appointment_date: '',
    });

    const [openBirthDate, setOpenBirthDate] = useState(false);
    const [openAppointmentDate, setOpenAppointment] = useState(false);
    return (
        <StudentLayout>
            <Head title="Student Form" />
            <Card className="relative z-10 min-h-screen w-full rounded-none md:min-h-auto md:w-auto md:rounded-md md:p-5">
                <CardHeader>
                    <div className="flex flex-col items-center gap-5 md:flex-row">
                        <div className="w-20">
                            <img src="/logo.webp" alt="CHMSU" className="h-full w-full rounded-lg object-cover" />
                        </div>
                        <div className="space-y-1 text-center md:text-start">
                            <h1 className="text-2xl font-bold text-[var(--main-color)]">Carlos Hidalo Memorial State University</h1>

                            <p className="text-muted-foreground text-lg">Admission Student Appointment Form</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative space-y-5">
                    <div className="flex flex-col gap-3">
                        <LabelExample title="Email" required example="johndoe@gmail.com" />
                        <div className="relative flex items-center">
                            <MailIcon size={15} className="absolute start-3" />
                            <Input
                                type="text"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value.toLowerCase())}
                                className="py-2 ps-9"
                                placeholder="Enter Email Address"
                                maxLength={25}
                            />
                        </div>
                        <InputError message={errors['fname']} />
                    </div>
                    <TwoColumnInput>
                        <div className="flex flex-col gap-3">
                            <Label>
                                First Name
                                <Asterisk color="red" size={12} />
                            </Label>
                            <Input
                                value={data.fname}
                                name="fname"
                                onChange={(e) => setData('fname', capitalizeString(e.target.value))}
                                maxLength={25}
                                type="text"
                                placeholder="Enter First Name"
                            />
                            <InputError message={errors['fname']} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label>Middle Name</Label>
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
                                placeholder="Enter Middle Name"
                            />
                            <InputError message={errors['mname']} />
                        </div>
                    </TwoColumnInput>

                    <TwoColumnInput>
                        <div className="flex flex-col gap-3">
                            <Label>
                                Last Name
                                <Asterisk color="red" size={12} />
                            </Label>
                            <Input
                                type="text"
                                name="lname"
                                value={data.lname}
                                onChange={(e) => setData('lname', capitalizeString(e.target.value))}
                                maxLength={25}
                                placeholder="Enter Last Name"
                            />
                            <InputError message={errors['lname']} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label>Suffix</Label>
                            <Select
                                value={data.suffix ?? ''}
                                name="suffix"
                                onValueChange={(value) => {
                                    if (value === 'None') {
                                        setData('suffix', null);
                                        return;
                                    }
                                    setData('suffix', value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {['Jr.', 'Sr.', 'III', 'IV', 'V'].map((item, index) => (
                                            <SelectItem key={index} value={item}>
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
                                Birthdate <AsteriskIcon size={12} color="red" />
                            </FieldLabel>

                            <Popover open={openBirthDate} onOpenChange={setOpenBirthDate}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start font-normal">
                                        <CalendarIcon /> {data.birthdate ? format(new Date(data.birthdate), 'PPP') : 'Select date'}
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
                                        disabled={(date) => date > new Date()} // prevent future birthdates
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>
                        <InputError message={errors['birthdate']} />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Field>
                            <FieldLabel>
                                Appointment Date <AsteriskIcon size={12} color="red" />
                            </FieldLabel>

                            <Popover open={openAppointmentDate} onOpenChange={setOpenAppointment}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start font-normal">
                                        <CalendarIcon /> {data.appointment_date ? format(new Date(data.appointment_date), 'PPP') : 'Select date'}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={data.appointment_date ? new Date(data.appointment_date) : undefined}
                                        defaultMonth={data.appointment_date ? new Date(data.appointment_date) : undefined}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            if (!date) {
                                                setData('appointment_date', null);
                                                return;
                                            }

                                            setData('appointment_date', format(date, 'yyyy-MM-dd'));
                                            setOpenBirthDate(false);
                                        }}
                                        disabled={(date) => date > new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>
                        <InputError message={errors['appointment_date']} />
                    </div>

                    <Button className="w-full">
                        Submit <SendIcon />
                    </Button>
                </CardContent>
            </Card>
        </StudentLayout>
    );
}
