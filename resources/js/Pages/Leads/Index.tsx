import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import StatusBadge from '@/Components/StatusBadge';
import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date, money } from '@/lib/format';
import { Lead, PageProps, Pagination as PaginationType, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface LeadsIndexProps {
    readonly leads: PaginationType<Lead>;
    readonly filters: {
        readonly status?: string;
        readonly search?: string;
    };
    readonly statuses: string[];
    readonly managers: Pick<User, 'id' | 'name'>[];
}

type LeadForm = {
    client_name: string;
    phone: string;
    email: string;
    renovation_type: string;
    address: string;
    area: string;
    budget: string;
    desired_start_date: string;
    status: string;
    source: string;
    manager_id: string;
    comment: string;
};

type LeadField = keyof LeadForm;

const leadFields: Array<{
    readonly field: LeadField;
    readonly label: string;
    readonly type?: string;
    readonly required?: boolean;
}> = [
    { field: 'client_name', label: 'Имя клиента', required: true },
    { field: 'phone', label: 'Телефон', required: true },
    { field: 'email', label: 'Email' },
    { field: 'renovation_type', label: 'Тип ремонта', required: true },
    { field: 'address', label: 'Адрес или район', required: true },
    { field: 'area', label: 'Площадь' },
    { field: 'budget', label: 'Бюджет' },
    { field: 'desired_start_date', label: 'Желаемый старт', type: 'date' },
    { field: 'source', label: 'Источник' },
];

export default function Index({
    leads,
    filters,
    statuses,
    managers,
}: PageProps<LeadsIndexProps>) {
    const form = useForm<LeadForm>({
        client_name: '',
        phone: '',
        email: '',
        renovation_type: 'Капитальный ремонт',
        address: '',
        area: '',
        budget: '',
        desired_start_date: '',
        status: 'Новая',
        source: 'Сайт',
        manager_id: managers[0]?.id.toString() ?? '',
        comment: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route('leads.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AuthenticatedLayout title="Заявки" eyebrow="Воронка продаж">
            <Head title="Заявки" />

            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <Panel
                    title="Список заявок"
                    action={
                        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
                            <input
                                defaultValue={filters.search ?? ''}
                                placeholder="Поиск"
                                className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700 sm:w-auto"
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        router.get(route('leads.index'), {
                                            ...filters,
                                            search: event.currentTarget.value,
                                        }, { preserveState: true });
                                    }
                                }}
                            />
                            <select
                                defaultValue={filters.status ?? ''}
                                className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700 sm:w-auto"
                                onChange={(event) =>
                                    router.get(route('leads.index'), {
                                        ...filters,
                                        status: event.currentTarget.value,
                                    }, { preserveState: true })
                                }
                            >
                                <option value="">Все статусы</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    }
                >
                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-[700px] text-left text-sm">
                            <thead className="text-xs font-semibold uppercase text-stone-500">
                                <tr>
                                    <th className="py-2 pr-4">Клиент</th>
                                    <th className="py-2 pr-4">Ремонт</th>
                                    <th className="py-2 pr-4">Бюджет</th>
                                    <th className="py-2 pr-4">Статус</th>
                                    <th className="py-2 pr-4">Старт</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                                {leads.data.map((lead) => (
                                    <tr key={lead.id}>
                                        <td className="py-3 pr-4">
                                            <Link
                                                href={route('leads.show', lead.id)}
                                                className="font-semibold text-stone-950 hover:text-emerald-800"
                                            >
                                                {lead.client_name}
                                            </Link>
                                            <div className="mt-1 text-xs text-stone-500">
                                                {lead.phone}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-stone-600">
                                            {lead.renovation_type}
                                            <div className="mt-1 text-xs text-stone-500">
                                                {lead.address}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 tabular-nums text-stone-700">
                                            {money(lead.budget)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="py-3 pr-4 text-stone-600">
                                            {date(lead.desired_start_date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-5">
                        <Pagination links={leads.links} />
                    </div>
                </Panel>

                <Panel title="Новая заявка">
                    <form onSubmit={submit} className="grid gap-4">
                        {leadFields.map(({ field, label, type = 'text', required }) => {
                            const inputId = `lead-${field}`;
                            const errorId = `${inputId}-error`;
                            const error = form.errors[field];

                            return (
                                <label key={field} htmlFor={inputId} className="grid gap-1 text-sm">
                                    <span className="font-medium text-stone-700">
                                    {label}
                                        {required && <span className="text-rose-700"> *</span>}
                                    </span>
                                    <input
                                        id={inputId}
                                        type={type}
                                        value={form.data[field]}
                                        onChange={(event) =>
                                            form.setData(field, event.target.value)
                                        }
                                        aria-invalid={error ? 'true' : undefined}
                                        aria-describedby={error ? errorId : undefined}
                                        aria-required={required ? 'true' : undefined}
                                        className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                    />
                                    <InputError id={errorId} message={error} className="mt-1" />
                                </label>
                            );
                        })}
                        <label htmlFor="lead-status" className="grid gap-1 text-sm">
                            <span className="font-medium text-stone-700">
                                Статус
                            </span>
                            <select
                                id="lead-status"
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value)}
                                aria-invalid={form.errors.status ? 'true' : undefined}
                                aria-describedby={form.errors.status ? 'lead-status-error' : undefined}
                                aria-required="true"
                                className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <InputError id="lead-status-error" message={form.errors.status} className="mt-1" />
                        </label>
                        <label htmlFor="lead-manager_id" className="grid gap-1 text-sm">
                            <span className="font-medium text-stone-700">
                                Менеджер
                            </span>
                            <select
                                id="lead-manager_id"
                                value={form.data.manager_id}
                                onChange={(event) => form.setData('manager_id', event.target.value)}
                                aria-invalid={form.errors.manager_id ? 'true' : undefined}
                                aria-describedby={form.errors.manager_id ? 'lead-manager_id-error' : undefined}
                                className="w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                            >
                                <option value="">Не назначен</option>
                                {managers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.name}
                                    </option>
                                ))}
                            </select>
                            <InputError id="lead-manager_id-error" message={form.errors.manager_id} className="mt-1" />
                        </label>
                        <label htmlFor="lead-comment" className="grid gap-1 text-sm">
                            <span className="font-medium text-stone-700">
                                Комментарий
                            </span>
                            <textarea
                                id="lead-comment"
                                value={form.data.comment}
                                onChange={(event) => form.setData('comment', event.target.value)}
                                aria-invalid={form.errors.comment ? 'true' : undefined}
                                aria-describedby={form.errors.comment ? 'lead-comment-error' : undefined}
                                className="min-h-24 w-full min-w-0 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                            />
                            <InputError id="lead-comment-error" message={form.errors.comment} className="mt-1" />
                        </label>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 focus-ring"
                        >
                            Создать заявку
                        </button>
                    </form>
                </Panel>
            </div>
        </AuthenticatedLayout>
    );
}
