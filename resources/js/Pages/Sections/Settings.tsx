import Panel from '@/Components/Panel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface SettingsProps {
    readonly roles: string[];
    readonly note: string;
}

export default function Settings({ roles, note }: PageProps<SettingsProps>) {
    return (
        <AuthenticatedLayout title="Настройки" eyebrow="Демо-конфигурация">
            <Head title="Настройки" />

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <Panel title="Роли доступа">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {roles.map((role) => (
                            <div key={role} className="rounded-md border border-stone-200 bg-stone-50 p-4">
                                <div className="text-sm font-semibold text-stone-950">{role}</div>
                                <div className="mt-1 text-sm text-stone-600">
                                    Права задаются через Spatie Permission и middleware маршрутов.
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="Ограничение демо">
                    <p className="text-sm leading-6 text-stone-600">{note}</p>
                    <div className="mt-4 rounded-md bg-stone-950 px-4 py-3 text-sm text-white">
                        Внешние сервисы и реальные загрузки файлов отключены, чтобы demo оставалось безопасным.
                    </div>
                </Panel>
            </div>
        </AuthenticatedLayout>
    );
}
