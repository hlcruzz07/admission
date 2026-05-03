type Props = {
    title: string | undefined;
    value: any;
};
export default function QueueCard({ title, value }: Props) {
    return (
        <div className="bg-muted rounded-lg border p-5 text-center shadow-sm">
            <p className="text-muted-foreground text-sm tracking-wide capitalize">{title}</p>

            <p className="mt-2 text-3xl font-extrabold text-[var(--main-color)]">{value}</p>
        </div>
    );
}
