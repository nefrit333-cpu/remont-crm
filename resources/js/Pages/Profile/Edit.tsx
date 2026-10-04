import Panel from '@/Components/Panel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout title="Профиль" eyebrow="Настройки учётной записи">
            <Head title="Профиль" />

            <div className="max-w-4xl space-y-6">
                <Panel>
                    <div className="max-w-xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className=""
                        />
                    </div>
                </Panel>

                <Panel>
                    <UpdatePasswordForm className="max-w-xl" />
                </Panel>

                <Panel>
                    <DeleteUserForm className="max-w-xl" />
                </Panel>
            </div>
        </AuthenticatedLayout>
    );
}
