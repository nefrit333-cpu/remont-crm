import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const accounts = [
    ['Администратор', 'admin@remont-crm.test', 'Полный обзор CRM, команда и настройки'],
    ['Менеджер', 'manager@remont-crm.test', 'Заявки, клиенты, объекты, платежи и договорный путь'],
    ['Прораб', 'foreman@remont-crm.test', 'Назначенные объекты, этапы, задачи и файлы'],
    ['Клиент', 'client@remont-crm.test', 'Свой объект, платежи, акты, файлы и комментарии'],
] as const;

export default function Welcome({ auth }: PageProps) {
    const [processing, setProcessing] = useState(false);

    const submit = (email: string) => {
        router.post(route('demo.login'), { email }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Remont CRM demo" />
            <main className="min-h-[100dvh] bg-[#f4f0e8] px-5 py-6 text-stone-950 sm:px-8">
                <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-6xl flex-col">
                    <header className="flex items-center justify-between border-b border-stone-300/70 pb-5">
                        <div>
                            <div className="text-lg font-semibold tracking-tight">
                                Remont CRM
                            </div>
                            <div className="text-sm text-stone-500">
                                Portfolio demo для CRM ремонтной компании
                            </div>
                        </div>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 focus-ring"
                            >
                                В CRM
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-500 focus-ring"
                            >
                                Войти вручную
                            </Link>
                        )}
                    </header>

                    <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
                        <div>
                            <div className="max-w-2xl">
                                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-stone-950 sm:text-5xl">
                                    CRM для ремонта квартир с ролями, объектами и клиентским кабинетом
                                </h1>
                                <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">
                                    Demo показывает путь от заявки до объекта ремонта:
                                    этапы, задачи, платежи, акты, файлы, календарь,
                                    комментарии и историю событий. Данные вымышлены.
                                </p>
                                <p className="mt-4 text-sm font-semibold text-emerald-900">
                                    Учебный fullstack-проект Laravel, Inertia и React
                                </p>
                            </div>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {accounts.map(([label, email, description]) => (
                                    <button
                                        key={email}
                                        type="button"
                                        onClick={() => submit(email)}
                                        disabled={processing}
                                        className="rounded-lg border border-stone-300 bg-white p-4 text-left shadow-[0_14px_45px_rgba(45,38,28,0.08)] transition hover:-translate-y-0.5 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
                                    >
                                        <span className="block text-sm font-semibold text-stone-950">
                                            Войти как {label.toLowerCase()}
                                        </span>
                                        <span className="mt-2 block text-xs text-stone-500">
                                            {description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-stone-300/80 bg-[#1b1814] p-5 text-stone-100 shadow-[0_30px_80px_rgba(45,38,28,0.24)]">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Сегодня в CRM
                                    </div>
                                    <div className="text-xs text-stone-400">
                                        Синтетические demo-данные
                                    </div>
                                </div>
                                <span className="rounded-md bg-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-950">
                                    Demo
                                </span>
                            </div>
                            <div className="mt-5 grid gap-3">
                                {[
                                    ['10', 'заявок в разных статусах'],
                                    ['4', 'объекта ремонта'],
                                    ['12', 'задач для команды'],
                                    ['8', 'платежей и актов'],
                                ].map(([value, label]) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between rounded-md bg-white/7 px-4 py-3"
                                    >
                                        <span className="text-sm text-stone-300">
                                            {label}
                                        </span>
                                        <span className="text-xl font-semibold tabular-nums text-white">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
