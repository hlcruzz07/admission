import { PropsWithChildren } from 'react';

export default function TwoColumnInput({ children }: PropsWithChildren) {
    return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
}
