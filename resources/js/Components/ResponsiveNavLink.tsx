import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start rounded-md px-3 py-2 ${
                active
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            } text-base font-medium transition duration-150 ease-in-out focus-ring ${className}`}
        >
            {children}
        </Link>
    );
}
