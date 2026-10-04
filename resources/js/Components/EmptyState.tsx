interface EmptyStateProps {
    readonly title: string;
    readonly description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
            <div className="text-sm font-semibold text-stone-800">{title}</div>
            {description && (
                <div className="mx-auto mt-1 max-w-xl text-sm text-stone-500">
                    {description}
                </div>
            )}
        </div>
    );
}
