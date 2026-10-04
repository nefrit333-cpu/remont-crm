import Panel from '@/Components/Panel';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date, dateTime, money } from '@/lib/format';
import { Lead, PageProps, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface LeadShowProps {
    readonly lead: Lead;
    readonly statuses: string[];
    readonly managers: Pick<User, 'id' | 'name'>[];
}

type LeadEditForm = {
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

export default function Show({ lead, statuses, managers }: PageProps<LeadShowProps>) {
    const form = useForm<LeadEditForm>({
        client_name: lead.client_name,
        phone: lead.phone,
        email: lead.email ?? '',
        renovation_type: lead.renovation_type,
        address: lead.address,
        area: lead.area?.toString() ?? '',
        budget: lead.budget?.toString() ?? '',
        desired_start_date: lead.desired_start_date?.slice(0, 10) ?? '',
        status: lead.status,
        source: lead.source ?? '',
        manager_id: lead.manager?.id.toString() ?? '',
        comment: lead.comment ?? '',
    });
    const comment = useForm({ body: '', visible_to_client: false });

    const update = (event: FormEvent) => {
        event.preventDefault();
        form.put(route('leads.update', lead.id), { preserveScroll: true });
    };

    const addComment = (event: FormEvent) => {
        event.preventDefault();
        comment.post(route('leads.comments.store', lead.id), {
            preserveScroll: true,
            onSuccess: () => comment.reset(),
        });
    };

    return (
        <AuthenticatedLayout
            title={lead.client_name}
            eyebrow="Карточка заявки"
            actions={
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => router.post(route('leads.convert', lead.id))}
                        disabled={Boolean(lead.converted_at)}
                        className="rounded-md bg-emerald-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50 focus-ring"
                    >
                        Создать объект
                    </button>
                    <Link
                        href={route('leads.index')}
                        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-500 focus-ring"
                    >
                        К списку
                    </Link>
                </div>
            }
        >
            <Head title={lead.client_name} />

            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                <Panel title="Данные заявки">
                    <form onSubmit={update} className="grid gap-4 md:grid-cols-2">
                        {[
                            ['client_name', 'Имя клиента'],
                            ['phone', 'Телефон'],
                            ['email', 'Email'],
                            ['renovation_type', 'Тип ремонта'],
                            ['address', 'Адрес'],
                            ['area', 'Площадь'],
                            ['budget', 'Бюджет'],
                            ['desired_start_date', 'Желаемый старт'],
                            ['source', 'Источник'],
                        ].map(([field, label]) => (
                            <label key={field} className="grid gap-1 text-sm">
                                <span className="font-medium text-stone-700">
                                    {label}
                                </span>
                                <input
                                    type={field === 'desired_start_date' ? 'date' : 'text'}
                                    value={form.data[field as keyof LeadEditForm]}
                                    onChange={(event) =>
                                        form.setData(field as keyof LeadEditForm, event.target.value)
                                    }
                                    className="rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                                />
                            </label>
                        ))}
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
                        <label className="grid gap-1 text-sm md:col-span-2">
                            <span className="font-medium text-stone-700">Комментарий</span>
                            <textarea
                                value={form.data.comment}
                                onChange={(event) => form.setData('comment', event.target.value)}
                                className="min-h-24 rounded-md border-stone-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                            />
                        </label>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 focus-ring"
                            >
                                Сохранить
                            </button>
                        </div>
                    </form>
                </Panel>

                <div className="grid gap-6">
                    <Panel title="Сводка">
                        <dl className="grid gap-3 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-stone-500">Статус</dt>
                                <dd><StatusBadge status={lead.status} /></dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-stone-500">Бюджет</dt>
                                <dd className="font-medium tabular-nums">{money(lead.budget)}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-stone-500">Старт</dt>
                                <dd>{date(lead.desired_start_date)}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-stone-500">Менеджер</dt>
                                <dd>{lead.manager?.name ?? 'Не назначен'}</dd>
                            </div>
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
                <Panel title="Комментарии">
                    <div className="space-y-3">
                        {lead.comments?.map((item) => (
                            <div key={item.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                <div className="text-sm text-stone-800">{item.body}</div>
                                <div className="mt-1 text-xs text-stone-500">
                                    {item.author?.name ?? 'Система'} · {dateTime(item.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
                <Panel title="История">
                    <div className="space-y-3">
                        {lead.activities?.map((item) => (
                            <div key={item.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
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
