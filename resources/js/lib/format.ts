export function money(value?: number | null): string {
    if (value === null || value === undefined) {
        return 'Не указано';
    }

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value);
}

export function date(value?: string | null): string {
    if (!value) {
        return 'Не указано';
    }

    return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

export function dateTime(value?: string | null): string {
    if (!value) {
        return 'Не указано';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}
