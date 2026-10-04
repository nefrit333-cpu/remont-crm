import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import Panel from '@/Components/Panel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ProjectFile, PageProps, Pagination as PaginationType } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface FilesProps {
    readonly files: PaginationType<ProjectFile>;
}

export default function Files({ files }: PageProps<FilesProps>) {
    return (
        <AuthenticatedLayout title="Файлы" eyebrow="Документы по объектам">
            <Head title="Файлы" />

            <Panel title="Файловый архив">
                {files.data.length === 0 ? (
                    <EmptyState title="Файлы пока не добавлены" />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs font-semibold uppercase text-stone-500">
                                    <tr>
                                        <th className="py-2 pr-4">Файл</th>
                                        <th className="py-2 pr-4">Тип</th>
                                        <th className="py-2 pr-4">Объект</th>
                                        <th className="py-2 pr-4">Загрузил</th>
                                        <th className="py-2 pr-4">Доступ клиенту</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {files.data.map((file) => (
                                        <tr key={file.id}>
                                            <td className="py-3 pr-4 font-semibold text-stone-950">{file.name}</td>
                                            <td className="py-3 pr-4 text-stone-600">{file.type}</td>
                                            <td className="py-3 pr-4">
                                                {file.project ? (
                                                    <Link
                                                        href={route('projects.show', file.project.id)}
                                                        className="text-stone-700 hover:text-emerald-800"
                                                    >
                                                        {file.project.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-stone-500">Не указан</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-stone-600">{file.uploader?.name ?? 'Система'}</td>
                                            <td className="py-3 pr-4 text-stone-600">
                                                {file.visible_to_client ? 'Да' : 'Нет'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-5">
                            <Pagination links={files.links} />
                        </div>
                    </>
                )}
            </Panel>
        </AuthenticatedLayout>
    );
}
