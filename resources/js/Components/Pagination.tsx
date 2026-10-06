import { PaginationLink } from '@/types';
import { Link } from '@inertiajs/react';

interface PaginationProps {
    readonly links: PaginationLink[];
}

const formatPaginationLabel = (label: string) =>
    label
        .replaceAll('&laquo;', '‹')
        .replaceAll('&raquo;', '›')
        .replaceAll('&amp;', '&');

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex flex-wrap gap-2">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        className={`rounded-md border px-3 py-1.5 text-sm transition focus-ring ${
                            link.active
                                ? 'border-stone-950 bg-stone-950 text-white'
                                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                    >
                        {formatPaginationLabel(link.label)}
                    </Link>
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded-md border border-stone-100 bg-stone-50 px-3 py-1.5 text-sm text-stone-400"
                    >
                        {formatPaginationLabel(link.label)}
                    </span>
                ),
            )}
        </nav>
    );
}
