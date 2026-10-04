import Panel from '@/Components/Panel';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date, dateTime, money } from '@/lib/format';
import {
    ActivityLog,
    CalendarEvent,
    PageProps,
    Project,
    RenovationTask,
} from '@/types';
import { Head, Link } from '@inertiajs/react';

interface DashboardProps {
    readonly role: string;
    readonly stats: {
        readonly newLeads: number;
        readonly activeLeads: number;
        readonly activeProjects: number;
        readonly todayTasks: number;
        readonly pendingPayments: number | null;
    };
    readonly projects: Project[];
    readonly tasks: RenovationTask[];
    readonly events: CalendarEvent[];
    readonly activity: ActivityLog[];
}

export default function Dashboard({
    role,
    stats,
    projects,
    tasks,
    events,
    activity,
}: PageProps<DashboardProps>) {
    const canViewFinance = stats.pendingPayments !== null;

    return (
        <AuthenticatedLayout
            title="Обзор"
            eyebrow={role === 'Клиент' ? 'Клиентский кабинет' : 'Рабочая панель'}
        >
            <Head title="Обзор" />

            <div className={`grid gap-4 md:grid-cols-2 ${canViewFinance ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
                <StatCard label="Новые заявки" value={stats.newLeads} />
                <StatCard label="Заявки в работе" value={stats.activeLeads} />
                <StatCard label="Активные объекты" value={stats.activeProjects} />
                <StatCard label="Задачи сегодня" value={stats.todayTasks} />
                {canViewFinance && (
                    <StatCard
                        label="Ожидаемые платежи"
                        value={money(stats.pendingPayments)}
                    />
                )}
            </div>

            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <Panel title={role === 'Клиент' ? 'Мой объект' : 'Активные объекты'}>
                    <div className="grid gap-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={route('projects.show', project.id)}
                                className="rounded-lg border border-stone-200 bg-stone-50/80 p-4 transition hover:border-stone-400 focus-ring"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="font-semibold text-stone-950">
                                            {project.name}
                                        </div>
                                        <div className="mt-1 text-sm text-stone-500">
                                            {project.address}
                                        </div>
                                    </div>
                                    <StatusBadge status={project.status} />
                                </div>
                                <div className="mt-3 grid gap-2 text-sm text-stone-600 sm:grid-cols-3">
                                    <span>{project.customer?.name}</span>
                                    <span>{project.foreman?.name ?? 'Прораб не назначен'}</span>
                                    {canViewFinance && <span>{money(project.budget)}</span>}
                                </div>
                            </Link>
                        ))}
                        {projects.length === 0 && (
                            <div className="rounded-lg border border-dashed border-stone-300 p-6 text-sm text-stone-500">
                                Пока нет объектов, доступных для вашей роли.
                            </div>
                        )}
                    </div>
                </Panel>

                <Panel title="Ближайшие события">
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="rounded-md border border-stone-200 bg-white p-3"
                            >
                                <div className="text-sm font-semibold text-stone-950">
                                    {event.title}
                                </div>
                                <div className="mt-1 text-xs text-stone-500">
                                    {dateTime(event.starts_at)} · {event.type}
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && (
                            <div className="text-sm text-stone-500">
                                На ближайшие дни событий нет.
                            </div>
                        )}
                    </div>
                </Panel>
            </div>

            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
                <Panel title="Задачи">
                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-[520px] text-left text-sm">
                            <thead className="text-xs font-semibold uppercase text-stone-500">
                                <tr>
                                    <th className="py-2 pr-4">Задача</th>
                                    <th className="py-2 pr-4">Срок</th>
                                    <th className="py-2 pr-4">Статус</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td className="py-3 pr-4">
                                            <div className="font-medium text-stone-950">
                                                {task.title}
                                            </div>
                                            <div className="text-xs text-stone-500">
                                                {task.project?.name}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-stone-600">
                                            {date(task.due_date)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge status={task.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>

                <Panel title="Последние события">
                    <div className="space-y-3">
                        {activity.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-md border border-stone-200 bg-stone-50 px-4 py-3"
                            >
                                <div className="text-sm text-stone-800">
                                    {item.description}
                                </div>
                                <div className="mt-1 text-xs text-stone-500">
                                    {item.user?.name ?? 'Система'} ·{' '}
                                    {dateTime(item.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </AuthenticatedLayout>
    );
}
