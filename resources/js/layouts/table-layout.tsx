import { Card, CardContent } from '@/components/ui/card';

export default function TableLayout({ children }: { children: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="space-y-5 pt-5">{children}</CardContent>
        </Card>
    );
}
