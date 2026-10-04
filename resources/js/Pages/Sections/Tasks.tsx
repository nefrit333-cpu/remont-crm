import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date } from '@/lib/format';
import { PageProps, Pagination as PaginationType, RenovationTask } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface TasksProps {
    readonly tasks: PaginationType<RenovationTask>;
}

export default function Tasks({ tasks }: PageProps<TasksProps>) {
    return (
        <AuthenticatedLayout title="Задачи" eyebrow="Контроль работ">
            <Head title="Задачи" />

            <Panel title="Все задачи">
                {tasks.data.length === 0 ? (
                    <EmptyState title="Задач пока нет" />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs font-semibold uppercase text-stone-500">
                                    <tr>
                                        <th className="py-2 pr-4">Задача</th>
                                        <th className="py-2 pr-4">Объект</th>
                                        <th className="py-2 pr-4">Исполнитель</th>
                                        <th className="py-2 pr-4">Срок</th>
                                        <th className="py-2 pr-4">Приоритет</th>
                                        <th className="py-2 pr-4">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {tasks.data.map((task) => (
                                        <tr key={task.id}>
                                            <td className="py-3 pr-4 font-semibold text-stone-950">
                                                {task.title}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {task.project ? (
                                                    <Link
                                                        href={route('projects.show', task.project.id)}
                                                        className="text-stone-700 hover:text-emerald-800"
                                                    >
                                                        {task.project.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-stone-500">Не указан</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-stone-600">
                                                {task.assignee?.name ?? 'Не назначен'}
                                            </td>
                                            <td className="py-3 pr-4 text-stone-600">{date(task.due_date)}</td>
                                            <td className="py-3 pr-4 text-stone-600">{task.priority}</td>
                                            <td className="py-3 pr-4"><StatusBadge status={task.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-5">
                            <Pagination links={tasks.links} />
                        </div>
                    </>
                )}
            </Panel>
        </AuthenticatedLayout>
    );
}
