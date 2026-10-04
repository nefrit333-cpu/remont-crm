import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface AuthenticatedLayoutProps {
    readonly title?: string;
    readonly eyebrow?: string;
    readonly actions?: ReactNode;
}

interface NavigationItem {
    readonly label: string;
    readonly routeName: string;
    readonly visible: (role?: string | null) => boolean;
}

const navigation: NavigationItem[] = [
    { label: 'Обзор', routeName: 'dashboard', visible: () => true },
    { label: 'Заявки', routeName: 'leads.index', visible: (role) => role === 'Администратор' || role === 'Менеджер' },
    { label: 'Объекты', routeName: 'projects.index', visible: () => true },
    { label: 'Задачи', routeName: 'tasks.index', visible: () => true },
    { label: 'Календарь', routeName: 'calendar.index', visible: () => true },
    { label: 'Файлы', routeName: 'files.index', visible: () => true },
    { label: 'Платежи', routeName: 'payments.index', visible: (role) => role !== 'Прораб' },
    { label: 'Акты', routeName: 'acts.index', visible: (role) => role !== 'Прораб' },
    { label: 'Клиенты', routeName: 'customers.index', visible: (role) => role === 'Администратор' || role === 'Менеджер' },
    { label: 'Команда', routeName: 'team.index', visible: (role) => role === 'Администратор' },
    { label: 'Настройки', routeName: 'settings.index', visible: (role) => role === 'Администратор' },
];

export default function AuthenticatedLayout({
    title = 'Обзор',
    eyebrow,
    actions,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    const { auth, flash } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const visibleNavigation = navigation.filter((item) => item.visible(auth.role));

    return (
        <div className="min-h-[100dvh] bg-[#f4f0e8] text-stone-950">
            <aside className="hidden min-h-[100dvh] w-72 shrink-0 bg-[#181612] text-stone-100 lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
                <div className="border-b border-white/10 px-6 py-6">
                    <Link href={route('dashboard')} className="block focus-ring">
                        <div className="text-lg font-semibold tracking-tight">
                            Remont CRM
                        </div>
                        <div className="mt-1 text-xs text-stone-400">
                            Portfolio demo
                        </div>
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {visibleNavigation.map((item) => {
                        const activePattern = item.routeName.endsWith('.index')
                            ? item.routeName.replace('.index', '.*')
                            : item.routeName;
                        const active = route().current(item.routeName) || route().current(activePattern);

                        return (
                            <Link
                                key={item.routeName}
                                href={route(item.routeName)}
                                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition focus-ring ${
                                    active
                                        ? 'bg-white text-stone-950'
                                        : 'text-stone-300 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-white/10 p-4">
                    <div className="rounded-lg bg-white/6 p-4">
                        <div className="text-sm font-medium text-white">
                            {auth.user.name}
                        </div>
                        <div className="mt-1 text-xs text-stone-400">
                            {auth.role}
                        </div>
                        <Link
                            method="post"
                            as="button"
                            href={route('logout')}
                            className="mt-4 w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm text-stone-200 transition hover:bg-white/10 focus-ring"
                        >
                            Выйти
                        </Link>
                    </div>
                </div>
            </aside>

            <div className="min-w-0 lg:pl-72">
                <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f4f0e8]/95 backdrop-blur">
                    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-stone-950">
                                {title}
                            </h1>
                            {eyebrow && (
                                <div className="mt-1 text-sm text-stone-500">
                                    {eyebrow}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {actions}
                            <button
                                type="button"
                                onClick={() => setOpen((value) => !value)}
                                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-500 focus-ring lg:hidden"
                            >
                                Меню
                            </button>
                        </div>
                    </div>
                    {open && (
                        <nav className="grid gap-1 border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
                            {visibleNavigation.map((item) => (
                                <Link
                                    key={item.routeName}
                                    href={route(item.routeName)}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                method="post"
                                as="button"
                                href={route('logout')}
                                className="rounded-md px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-100"
                            >
                                Выйти
                            </Link>
                        </nav>
                    )}
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    {(flash.success || flash.error) && (
                        <div
                            className={`mb-5 rounded-md border px-4 py-3 text-sm ${
                                flash.error
                                    ? 'border-rose-200 bg-rose-50 text-rose-900'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            }`}
                        >
                            {flash.error ?? flash.success}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
