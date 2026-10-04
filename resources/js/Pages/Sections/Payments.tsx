import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { date, money } from '@/lib/format';
import { PageProps, Pagination as PaginationType, Payment } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface PaymentsProps {
    readonly payments: PaginationType<Payment>;
}

export default function Payments({ payments }: PageProps<PaymentsProps>) {
    return (
        <AuthenticatedLayout title="Платежи" eyebrow="Финансовый график">
            <Head title="Платежи" />

            <Panel title="Платежи по объектам">
                {payments.data.length === 0 ? (
                    <EmptyState title="Платежей пока нет" />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs font-semibold uppercase text-stone-500">
                                    <tr>
                                        <th className="py-2 pr-4">Назначение</th>
                                        <th className="py-2 pr-4">Объект</th>
                                        <th className="py-2 pr-4">Срок</th>
                                        <th className="py-2 pr-4">Сумма</th>
                                        <th className="py-2 pr-4">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {payments.data.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="py-3 pr-4 font-semibold text-stone-950">{payment.purpose}</td>
                                            <td className="py-3 pr-4">
                                                {payment.project ? (
                                                    <Link
                                                        href={route('projects.show', payment.project.id)}
                                                        className="text-stone-700 hover:text-emerald-800"
                                                    >
                                                        {payment.project.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-stone-500">Не указан</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-stone-600">{date(payment.due_date)}</td>
                                            <td className="py-3 pr-4 font-semibold tabular-nums text-stone-900">
                                                {money(payment.amount)}
                                            </td>
                                            <td className="py-3 pr-4"><StatusBadge status={payment.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-5">
                            <Pagination links={payments.links} />
                        </div>
                    </>
                )}
            </Panel>
        </AuthenticatedLayout>
    );
}
