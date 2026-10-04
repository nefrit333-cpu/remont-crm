interface StatusBadgeProps {
    readonly status: string;
}

const palette: Record<string, string> = {
    Новая: 'bg-stone-100 text-stone-700 ring-stone-200',
    Связаться: 'bg-sky-50 text-sky-800 ring-sky-100',
    'Замер назначен': 'bg-indigo-50 text-indigo-800 ring-indigo-100',
    'Смета готовится': 'bg-amber-50 text-amber-900 ring-amber-100',
    Договор: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    'В работе': 'bg-blue-50 text-blue-900 ring-blue-100',
    Завершена: 'bg-green-50 text-green-900 ring-green-100',
    Отказ: 'bg-rose-50 text-rose-900 ring-rose-100',
    Ожидается: 'bg-amber-50 text-amber-900 ring-amber-100',
    Оплачено: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    Просрочено: 'bg-rose-50 text-rose-900 ring-rose-100',
    Отменено: 'bg-stone-100 text-stone-700 ring-stone-200',
    Подписан: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    'На согласовании': 'bg-sky-50 text-sky-900 ring-sky-100',
    Черновик: 'bg-stone-100 text-stone-700 ring-stone-200',
    Отклонён: 'bg-rose-50 text-rose-900 ring-rose-100',
    Готово: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    'На проверке': 'bg-violet-50 text-violet-900 ring-violet-100',
    Ожидает: 'bg-stone-100 text-stone-700 ring-stone-200',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${palette[status] ?? 'bg-stone-100 text-stone-700 ring-stone-200'}`}
        >
            {status}
        </span>
    );
}
