import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-[100dvh] flex-col bg-[#f4f0e8] px-5 py-6 text-stone-950 sm:justify-center">
            <div className="mx-auto w-full max-w-md">
                <Link href="/" className="block focus-ring">
                    <div className="text-lg font-semibold tracking-tight">Remont CRM</div>
                    <div className="mt-1 text-sm text-stone-500">
                        Demo CRM для ремонтной компании
                    </div>
                </Link>

                <div className="mt-6 overflow-hidden rounded-lg border border-stone-200/80 bg-white/90 px-6 py-6 shadow-[0_18px_60px_rgba(45,38,28,0.08)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
