import EmptyState from '@/Components/EmptyState';
import Panel from '@/Components/Panel';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date, dateTime, money } from '@/lib/format';
import { PageProps, Project, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface ProjectShowProps {
    readonly project: Project;
    readonly foremen: Pick<User, 'id' | 'name'>[];
    readonly managers: Pick<User, 'id' | 'name'>[];
}

type ProjectEditForm = {
    name: string;
    address: string;
    foreman_id: string;
    manager_id: string;
    area: string;
    renovation_type: string;
    status: string;
    start_date: string;
    planned_finish_date: string;
    budget: string;
};

const statuses = ['Подготовка', 'В работе', 'На проверке', 'Завершена', 'Отменено'];

export default function Show({
    project,
    foremen,
    managers,
    auth,
}: PageProps<ProjectShowProps>) {
    const canManage = auth.role === 'Администратор' || auth.role === 'Менеджер';
    const form = useForm<ProjectEditForm>({
        name: project.name,
        address: project.address,
        foreman_id: project.foreman?.id.toString() ?? '',
        manager_id: project.manager?.id.toString() ?? '',
        area: project.area?.toString() ?? '',
        renovation_type: project.renovation_type,
        status: project.status,
        start_date: project.start_date?.slice(0, 10) ?? '',
        planned_finish_date: project.planned_finish_date?.slice(0, 10) ?? '',
        budget: project.budget?.toString() ?? '',
    });
    const comment = useForm({ body: '', visible_to_client: false });

    const update = (event: FormEvent) => {
        event.preventDefault();
        form.put(route('projects.update', project.id), { preserveScroll: true });
    };

    const addComment = (event: FormEvent) => {
        event.preventDefault();
        comment.post(route('projects.comments.store', project.id), {
            preserveScroll: true,
            onSuccess: () => comment.reset(),
        });
    };

    return (
        <AuthenticatedLayout
            title={project.name}
            eyebrow="Карточка объекта"
            actions={
                <Link
                    href={route('projects.index')}
                    className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-500 focus-ring"
                >
                    К списку
                </Link>
            }
        >
            <Head title={project.name} />

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <Panel title="Параметры объекта">
                    {canManage ? (
                        <form onSubmit={update} className="grid gap-4 md:grid-cols-2">
                            {[
                                ['name', 'Название'],
                                ['address', 'Адрес'],
                                ['renovation_type', 'Тип ремонта'],
                                ['area', 'Площадь'],
                                ['budget', 'Бюджет'],
                                ['start_date', 'Старт'],
                                ['planned_finish_date', 'Плановый финиш'],
                            ].map(([field, label]) => (
                                <label key={field} className="grid gap-1 text-sm">
                                    <span className="font-medium text-stone-700">{label}</span>
                                    <input
                                        type={field.includes('date') || field === 'start_date' ? 'date' : 'text'}
                                        value={form.data[field as keyof ProjectEditForm]}
                                        onChange={(event) =>
                                            form.setData(field as keyof ProjectEditForm, event.target.value)
                                        }
                                        className="rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                    />
                                </label>
                            ))}
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-stone-700">Менеджер</span>
                                <select
                                    value={form.data.manager_id}
                                    onChange={(event) => form.setData('manager_id', event.target.value)}
                                    className="rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                >
                                    <option value="">Не назначен</option>
                                    {managers.map((manager) => (
                                        <option key={manager.id} value={manager.id}>
                                            {manager.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-stone-700">Прораб</span>
                                <select
                                    value={form.data.foreman_id}
                                    onChange={(event) => form.setData('foreman_id', event.target.value)}
                                    className="rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                >
                                    <option value="">Не назначен</option>
                                    {foremen.map((foreman) => (
                                        <option key={foreman.id} value={foreman.id}>
                                            {foreman.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-stone-700">Статус</span>
                                <select
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.target.value)}
                                    className="rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 focus-ring"
                                >
                                    Сохранить изменения
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl className="grid gap-3 text-sm md:grid-cols-2">
                            <Info label="Адрес" value={project.address} />
                            <Info label="Тип ремонта" value={project.renovation_type} />
                            <Info label="Площадь" value={project.area ? `${project.area} м2` : 'Не указана'} />
                            <Info label="Бюджет" value={money(project.budget)} />
                            <Info label="Старт" value={date(project.start_date)} />
                            <Info label="Финиш" value={date(project.planned_finish_date)} />
                        </dl>
                    )}
                </Panel>

                <div className="grid gap-6">
                    <Panel title="Сводка">
                        <dl className="grid gap-3 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-stone-500">Статус</dt>
                                <dd><StatusBadge status={project.status} /></dd>
                            </div>
                            <Info label="Клиент" value={project.customer?.name ?? 'Не указан'} />
                            <Info label="Менеджер" value={project.manager?.name ?? 'Не назначен'} />
                            <Info label="Прораб" value={project.foreman?.name ?? 'Не назначен'} />
                            <Info label="Бюджет" value={money(project.budget)} />
                        </dl>
                    </Panel>

                    <Panel title="Комментарий">
                        <form onSubmit={addComment} className="grid gap-3">
                            <textarea
                                value={comment.data.body}
                                onChange={(event) => comment.setData('body', event.target.value)}
                                className="min-h-24 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                placeholder="Добавить заметку"
                            />
                            <label className="flex items-center gap-2 text-sm text-stone-700">
                                <input
                                    type="checkbox"
                                    checked={comment.data.visible_to_client}
                                    onChange={(event) =>
                                        comment.setData('visible_to_client', event.target.checked)
                                    }
                                    className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
                                />
                                Видно клиенту
                            </label>
                            <button
                                type="submit"
                                className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white focus-ring"
                            >
                                Добавить
                            </button>
                        </form>
                    </Panel>
                </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <Panel title="Этапы">
                    <div className="space-y-3">
                        {project.stages?.map((stage) => (
                            <div key={stage.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-stone-900">{stage.name}</div>
                                        <div className="mt-1 text-xs text-stone-500">
                                            {date(stage.start_date)} - {date(stage.finish_date)}
                                        </div>
                                    </div>
                                    <StatusBadge status={stage.status} />
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-stone-200">
                                    <div
                                        className="h-2 rounded-full bg-emerald-800"
                                        style={{ width: `${stage.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {project.stages?.length === 0 && <EmptyState title="Этапы ещё не добавлены" />}
                    </div>
                </Panel>

                <Panel title="Задачи">
                    <div className="space-y-3">
                        {project.tasks?.map((task) => (
                            <div key={task.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-stone-900">{task.title}</div>
                                        <div className="mt-1 text-xs text-stone-500">
                                            {task.assignee?.name ?? 'Без исполнителя'} · до {date(task.due_date)}
                                        </div>
                                    </div>
                                    <StatusBadge status={task.status} />
                                </div>
                            </div>
                        ))}
                        {project.tasks?.length === 0 && <EmptyState title="Задачи ещё не добавлены" />}
                    </div>
                </Panel>

                <Panel title="Финансы">
                    <div className="space-y-3">
                        {project.payments?.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between gap-4 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm">
                                <div>
                                    <div className="font-semibold text-stone-900">{payment.purpose}</div>
                                    <div className="mt-1 text-xs text-stone-500">до {date(payment.due_date)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold tabular-nums">{money(payment.amount)}</div>
                                    <div className="mt-1"><StatusBadge status={payment.status} /></div>
                                </div>
                            </div>
                        ))}
                        {project.payments?.length === 0 && <EmptyState title="Платежи ещё не добавлены" />}
                    </div>
                </Panel>

                <Panel title="Комментарии и история">
                    <div className="space-y-3">
                        {project.comments?.map((item) => (
                            <div key={item.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                <div className="text-sm text-stone-800">{item.body}</div>
                                <div className="mt-1 text-xs text-stone-500">
                                    {item.author?.name ?? 'Система'} · {dateTime(item.created_at)}
                                </div>
                            </div>
                        ))}
                        {project.activities?.slice(0, 4).map((item) => (
                            <div key={`activity-${item.id}`} className="rounded-md border border-stone-200 bg-white p-3">
                                <div className="text-sm text-stone-800">{item.description}</div>
                                <div className="mt-1 text-xs text-stone-500">
                                    {item.user?.name ?? 'Система'} · {dateTime(item.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </AuthenticatedLayout>
    );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
    return (
        <div className="flex justify-between gap-3">
            <dt className="text-stone-500">{label}</dt>
            <dd className="text-right font-medium text-stone-900">{value}</dd>
        </div>
    );
}
