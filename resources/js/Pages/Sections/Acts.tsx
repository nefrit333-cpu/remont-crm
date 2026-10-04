import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date, money } from '@/lib/format';
import { Act, PageProps, Pagination as PaginationType } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface ActsProps {
    readonly acts: PaginationType<Act>;
}

export default function Acts({ acts }: PageProps<ActsProps>) {
    return (
        <AuthenticatedLayout title="Акты" eyebrow="Приёмка этапов">
            <Head title="Акты" />

            <Panel title="Акты выполненных работ">
                {acts.data.length === 0 ? (
                    <EmptyState title="Актов пока нет" />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs font-semibold uppercase text-stone-500">
                                    <tr>
                                        <th className="py-2 pr-4">Номер</th>
                                        <th className="py-2 pr-4">Название</th>
                                        <th className="py-2 pr-4">Объект</th>
                                        <th className="py-2 pr-4">Дата</th>
                                        <th className="py-2 pr-4">Сумма</th>
                                        <th className="py-2 pr-4">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {acts.data.map((act) => (
                                        <tr key={act.id}>
                                            <td className="py-3 pr-4 font-semibold text-stone-950">{act.number}</td>
                                            <td className="py-3 pr-4 text-stone-700">{act.title}</td>
                                            <td className="py-3 pr-4">
                                                {act.project ? (
                                                    <Link
                                                        href={route('projects.show', act.project.id)}
                                                        className="text-stone-700 hover:text-emerald-800"
                                                    >
                                                        {act.project.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-stone-500">Не указан</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-stone-600">{date(act.issued_at)}</td>
                                            <td className="py-3 pr-4 tabular-nums text-stone-700">
                                                {money(act.amount)}
                                            </td>
                                            <td className="py-3 pr-4"><StatusBadge status={act.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-5">
                            <Pagination links={acts.links} />
                        </div>
                    </>
                )}
            </Panel>
        </AuthenticatedLayout>
    );
}
