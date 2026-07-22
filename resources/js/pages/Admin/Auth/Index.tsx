import ThemeButton from '@/components/ThemeButton';
import { FlashMessages } from '@/types/flash';
import { usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Index() {
    const handleGoogleLogin = () => {
        window.location.href = '/auth/google/redirect';
    };

    const flash: FlashMessages = usePage().props.flash || {};

    useEffect(() => {
        if (!flash) return;

        const timeoutId = setTimeout(() => {
            if (flash.success) toast.success(flash.success);
            if (flash.error) toast.error(flash.error);
            if (flash.info) toast.info(flash.info);
            if (flash.warning) toast.warning(flash.warning);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [flash]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-green-500/20 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            {/* Theme Button */}
            <div className="absolute top-5 right-5 z-100">
                <ThemeButton className="static" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl md:grid-cols-2">
                    {/* Left Side */}
                    <div className="hidden flex-col justify-between bg-gradient-to-br from-green-700 to-indigo-900 p-10 text-white md:flex">
                        <div>
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                                <img src="/logo.webp" className="h-8 w-8" />
                            </div>

                            <h1 className="text-4xl leading-tight font-bold">
                                CHMSU Admission
                                <br />
                                Authorize Access
                            </h1>

                            <p className="mt-5 text-sm leading-6 text-green-100">
                                Manage applicants and admission schedules securely through the administration portal.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-green-300" />
                                <div>
                                    <p className="text-sm font-medium">Secure Google Authentication</p>
                                    <p className="text-xs text-green-100">Only authorized CHMSU accounts can access this system.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center justify-center bg-white p-8 md:p-12 dark:bg-neutral-950">
                        <div className="w-full max-w-sm">
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
                                    <img src="/logo.webp" className="h-8 w-8 text-green-700 dark:text-green-400" />
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h2>

                                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">Sign in with your CHMSU Google account</p>
                            </div>

                            {/* Login Card */}
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98] dark:bg-white dark:text-black"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 48 48">
                                        <path
                                            fill="#FFC107"
                                            d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.2-.4-3.5z"
                                        />
                                        <path
                                            fill="#FF3D00"
                                            d="M6.3 14.7l6.6 4.8C14.5 16.2 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.6 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
                                        />
                                        <path
                                            fill="#4CAF50"
                                            d="M24 44c5.2 0 10-1.9 13.7-5.1l-6.3-5.2C29.5 35.8 26.9 36.8 24 36.8c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.4 39.8 16.3 44 24 44z"
                                        />
                                        <path
                                            fill="#1976D2"
                                            d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.6 5.8-6.7 7.2l6.3 5.2C39.3 37.8 44 31.7 44 24c0-1.3-.1-2.2-.4-3.5z"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="mt-4 rounded-xl bg-green-50 p-3 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-300">
                                    Access is restricted to authorized admission personnel only.
                                </div>
                            </div>

                            {/* Footer */}
                            <p className="mt-6 text-center text-xs text-gray-400">CHMSU Admission System • Secure Administrative Access</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
