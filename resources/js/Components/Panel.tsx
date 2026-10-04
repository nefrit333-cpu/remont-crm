import { PropsWithChildren, ReactNode } from 'react';

interface PanelProps {
    readonly title?: string;
    readonly action?: ReactNode;
    readonly className?: string;
}

export default function Panel({
    title,
    action,
    className = '',
    children,
}: PropsWithChildren<PanelProps>) {
    return (
        <section
            className={`min-w-0 rounded-lg border border-stone-200/80 bg-white/90 shadow-[0_18px_60px_rgba(45,38,28,0.08)] ${className}`}
        >
            {(title || action) && (
                <div className="flex min-w-0 flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    {title && (
                        <h2 className="text-base font-semibold text-stone-950">
                            {title}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            <div className="min-w-0 p-5">{children}</div>
        </section>
    );
}
