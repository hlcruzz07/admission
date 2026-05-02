import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function FormPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleSubmit = () => {
        setIsSubmitting(true);
        try {
            const res = router.post('/form/submit');

            console.log(res);
        } catch (err) {
            console.error(err);
            alert('Error submitting form');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-[500px] rounded-2xl bg-white p-8 text-center shadow-lg">
                <h1 className="mb-6 text-2xl font-bold">Admission Form</h1>

                {!isCompleted ? (
                    <>
                        <p className="mb-6 text-gray-600">Fill in your admission details here...</p>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Form'}
                        </button>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="mb-4 text-lg font-semibold text-green-600">✓ Form submitted successfully!</p>
                        <p className="text-sm text-gray-500">Redirecting...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
