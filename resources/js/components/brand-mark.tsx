import { logoIcon } from '@/lib/brand';

export function BrandMark({
    name,
    className = '',
}: {
    name: string;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-3 ${className}`.trim()}>
            <img src={logoIcon} alt="" className="size-8" />
            <span className="text-title-xsm font-semibold text-gray-800 dark:text-white/90">
                {name}
            </span>
        </div>
    );
}
