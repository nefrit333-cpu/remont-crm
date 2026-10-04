interface StatCardProps {
    readonly label: string;
    readonly value: string | number;
    readonly hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
    return (
        <div className="rounded-lg border border-stone-200 bg-white px-5 py-4 shadow-[0_12px_40px_rgba(45,38,28,0.06)]">
            <div className="text-sm font-medium text-stone-500">{label}</div>
            <div className="mt-3 text-2xl font-semibold tabular-nums text-stone-950">
                {value}
            </div>
            {hint && <div className="mt-2 text-xs text-stone-500">{hint}</div>}
        </div>
    );
}
