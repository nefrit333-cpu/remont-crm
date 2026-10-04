import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date, money } from '@/lib/format';
import { Customer, PageProps, Pagination as PaginationType, Project, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface ProjectsIndexProps {
    readonly projects: PaginationType<Project>;
    readonly filters: {
        readonly status?: string;
    };
    readonly foremen: Pick<User, 'id' | 'name'>[];
    readonly customers: Pick<Customer, 'id' | 'name'>[];
}

type ProjectForm = {
    name: string;
    address: string;
    customer_id: string;
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

export default function Index({
    projects,
    filters,
    foremen,
    customers,
    auth,
}: PageProps<ProjectsIndexProps>) {
    const canManage = auth.role === 'Администратор' || auth.role === 'Менеджер';
    const canViewFinance = auth.role !== 'Прораб';
    const form = useForm<ProjectForm>({
        name: '',
        address: '',
        customer_id: customers[0]?.id.toString() ?? '',
        foreman_id: foremen[0]?.id.toString() ?? '',
        manager_id: auth.user.id.toString(),
        area: '',
        renovation_type: 'Капитальный ремонт',
        status: 'Подготовка',
        start_date: '',
        planned_finish_date: '',
        budget: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route('projects.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AuthenticatedLayout title="Объекты" eyebrow="Проекты ремонта">
            <Head title="Объекты" />

            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <Panel
                    title="Реестр объектов"
                    action={
                        <select
                            defaultValue={filters.status ?? ''}
                            className="w-full rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700 sm:w-auto"
                            onChange={(event) =>
                                router.get(
                                    route('projects.index'),
                                    { status: event.currentTarget.value },
                                    { preserveState: true },
                                )
                            }
                        >
                            <option value="">Все статусы</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    }
                >
                    {projects.data.length === 0 ? (
                        <EmptyState
                            title="Объекты не найдены"
                            description="Измените фильтр или создайте новый объект ремонта."
                        />
                    ) : (
                        <>
                            <div className="max-w-full overflow-x-auto">
                                <table className="min-w-[760px] text-left text-sm">
                                    <thead className="text-xs font-semibold uppercase text-stone-500">
                                        <tr>
                                            <th className="py-2 pr-4">Объект</th>
                                            <th className="py-2 pr-4">Клиент</th>
                                            <th className="py-2 pr-4">Команда</th>
                                            {canViewFinance && <th className="py-2 pr-4">Бюджет</th>}
                                            <th className="py-2 pr-4">Статус</th>
                                            <th className="py-2 pr-4">Финиш</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200">
                                        {projects.data.map((project) => (
                                            <tr key={project.id}>
                                                <td className="py-3 pr-4">
                                                    <Link
                                                        href={route('projects.show', project.id)}
                                                        className="font-semibold text-stone-950 hover:text-emerald-800"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                    <div className="mt-1 text-xs text-stone-500">
                                                        {project.address}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-stone-700">
                                                    {project.customer?.name ?? 'Не указан'}
                                                </td>
                                                <td className="py-3 pr-4 text-stone-600">
                                                    <div>{project.manager?.name ?? 'Без менеджера'}</div>
                                                    <div className="mt-1 text-xs text-stone-500">
                                                        {project.foreman?.name ?? 'Без прораба'}
                                                    </div>
                                                </td>
                                                {canViewFinance && (
                                                    <td className="py-3 pr-4 tabular-nums text-stone-700">
                                                        {money(project.budget)}
                                                    </td>
                                                )}
                                                <td className="py-3 pr-4">
                                                    <StatusBadge status={project.status} />
                                                </td>
                                                <td className="py-3 pr-4 text-stone-600">
                                                    {date(project.planned_finish_date)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-5">
                                <Pagination links={projects.links} />
                            </div>
                        </>
                    )}
                </Panel>

                {canManage && (
                    <Panel title="Новый объект">
                        <form onSubmit={submit} className="grid gap-4">
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
                                        value={form.data[field as keyof ProjectForm]}
                                        onChange={(event) =>
                                            form.setData(field as keyof ProjectForm, event.target.value)
                                        }
                                        className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                    />
                                </label>
                            ))}
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-stone-700">Клиент</span>
                                <select
                                    value={form.data.customer_id}
                                    onChange={(event) => form.setData('customer_id', event.target.value)}
                                    className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                >
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-stone-700">Прораб</span>
                                <select
                                    value={form.data.foreman_id}
                                    onChange={(event) => form.setData('foreman_id', event.target.value)}
                                    className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
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
                                    className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="submit"
                                disabled={form.processing || customers.length === 0}
                                className="rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 focus-ring"
                            >
                                Создать объект
                            </button>
                        </form>
                    </Panel>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
