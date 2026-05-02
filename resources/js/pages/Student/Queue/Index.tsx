import { useEffect, useState } from 'react';

export default function Index() {
    const [status, setStatus] = useState('loading');
    const [position, setPosition] = useState(null);

    // Step 2: polling system
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/queue/enter', {
                    credentials: 'include',
                });
                const data = await res.json();

                console.log('Queue response:', data);

                if (data.error) {
                    window.location.href = '/';
                    return;
                }

                if (data.status === 'allowed') {
                    setStatus('allowed');

                    // redirect to form
                    window.location.href = '/form';
                    return;
                }

                setStatus('waiting');
                setPosition(data.position);
            } catch (err) {
                console.error(err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-[400px] rounded-2xl bg-white p-8 text-center shadow-lg">
                <h1 className="mb-4 text-2xl font-bold">Admission Queue</h1>

                {status === 'loading' && <p className="text-gray-600">Connecting to queue...</p>}

                {status === 'waiting' && (
                    <>
                        <p className="text-lg text-gray-700">You are in queue</p>

                        <p className="mt-3 text-3xl font-bold text-blue-600">#{position ?? '...'}</p>

                        <p className="mt-2 text-sm text-gray-500">Please do not close this page</p>
                    </>
                )}

                {status === 'allowed' && <p className="font-semibold text-green-600">Redirecting to form...</p>}
            </div>
        </div>
    );
}
