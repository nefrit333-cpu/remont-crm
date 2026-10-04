import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Customer, PageProps, Pagination as PaginationType } from '@/types';
import { Head } from '@inertiajs/react';

interface CustomersProps {
    readonly customers: PaginationType<Customer>;
}

export default function Customers({ customers }: PageProps<CustomersProps>) {
    return (
        <AuthenticatedLayout title="Клиенты" eyebrow="Клиентская база">
            <Head title="Клиенты" />

            <Panel title="Клиенты">
                {customers.data.length === 0 ? (
                    <EmptyState title="Клиенты пока не добавлены" />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs font-semibold uppercase text-stone-500">
                                    <tr>
                                        <th className="py-2 pr-4">Клиент</th>
                                        <th className="py-2 pr-4">Телефон</th>
                                        <th className="py-2 pr-4">Email</th>
                                        <th className="py-2 pr-4">Адрес</th>
                                        <th className="py-2 pr-4">Объекты</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id}>
                                            <td className="py-3 pr-4 font-semibold text-stone-950">{customer.name}</td>
                                            <td className="py-3 pr-4 text-stone-600">{customer.phone ?? 'Не указан'}</td>
                                            <td className="py-3 pr-4 text-stone-600">{customer.email ?? 'Не указан'}</td>
                                            <td className="py-3 pr-4 text-stone-600">{customer.address ?? 'Не указан'}</td>
                                            <td className="py-3 pr-4 tabular-nums text-stone-700">
                                                {customer.projects_count ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-5">
                            <Pagination links={customers.links} />
                        </div>
                    </>
                )}
            </Panel>
        </AuthenticatedLayout>
    );
}
