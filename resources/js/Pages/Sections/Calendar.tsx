import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { dateTime } from '@/lib/format';
import { CalendarEvent, PageProps, Pagination as PaginationType } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface CalendarProps {
    readonly events: PaginationType<CalendarEvent>;
}

export default function Calendar({ events }: PageProps<CalendarProps>) {
    return (
        <AuthenticatedLayout title="Календарь" eyebrow="Встречи и контрольные точки">
            <Head title="Календарь" />

            <Panel title="Ближайшие события">
                {events.data.length === 0 ? (
                    <EmptyState title="Событий пока нет" />
                ) : (
                    <>
                        <div className="grid gap-3">
                            {events.data.map((event) => (
                                <div key={event.id} className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 md:grid-cols-[220px_1fr_180px]">
                                    <div className="text-sm font-semibold tabular-nums text-stone-950">
                                        {dateTime(event.starts_at)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-stone-900">{event.title}</div>
                                        {event.description && (
                                            <div className="mt-1 text-sm text-stone-600">{event.description}</div>
                                        )}
                                    </div>
                                    <div className="text-sm text-stone-600">
                                        {event.project ? (
                                            <Link
                                                href={route('projects.show', event.project.id)}
                                                className="hover:text-emerald-800"
                                            >
                                                {event.project.name}
                                            </Link>
                                        ) : (
                                            event.lead?.client_name ?? event.user?.name ?? event.type
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5">
                            <Pagination links={events.links} />
                        </div>
                    </>
                )}
            </Panel>
        </AuthenticatedLayout>
    );
}
