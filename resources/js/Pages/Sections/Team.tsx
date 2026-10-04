import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Pagination as PaginationType, User } from '@/types';
import { Head } from '@inertiajs/react';

interface TeamProps {
    readonly users: PaginationType<User>;
}

export default function Team({ users }: PageProps<TeamProps>) {
    return (
        <AuthenticatedLayout title="Команда" eyebrow="Роли и доступы">
            <Head title="Команда" />

            <Panel title="Пользователи">
                {users.data.length === 0 ? (
                    <EmptyState title="Пользователи пока не добавлены" />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs font-semibold uppercase text-stone-500">
                                    <tr>
                                        <th className="py-2 pr-4">Имя</th>
                                        <th className="py-2 pr-4">Email</th>
                                        <th className="py-2 pr-4">Телефон</th>
                                        <th className="py-2 pr-4">Роли</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {users.data.map((user) => (
                                        <tr key={user.id}>
                                            <td className="py-3 pr-4 font-semibold text-stone-950">{user.name}</td>
                                            <td className="py-3 pr-4 text-stone-600">{user.email}</td>
                                            <td className="py-3 pr-4 text-stone-600">{user.phone ?? 'Не указан'}</td>
                                            <td className="py-3 pr-4 text-stone-600">
                                                {user.roles?.map((role) => role.name).join(', ') ?? 'Без роли'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-5">
                            <Pagination links={users.links} />
                        </div>
                    </>
                )}
            </Panel>
        </AuthenticatedLayout>
    );
}
