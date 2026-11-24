import { Card, CardContent } from '@/components/tailgrids/core/card';
import { cn } from '@/utils/cn';
import { formatBytes, MEDIA_CATEGORIES } from '../lib/format';
import type { MediaCategory, MediaUsage } from '../types';

type Props = {
    usage: MediaUsage | null;
    active: MediaCategory | null;
    onSelect: (category: MediaCategory | null) => void;
};

/**
 * One card per category. A card is also the category filter: clicking it filters the list.
 */
export function MediaCategoryCards({ usage, active, onSelect }: Props) {
    const cards: {
        value: MediaCategory | null;
        label: string;
        files: number;
        bytes: number;
    }[] = [
        {
            value: null,
            label: 'All media',
            files: usage?.files ?? 0,
            bytes: usage?.bytes ?? 0,
        },
        ...MEDIA_CATEGORIES.map((category) => ({
            value: category.value,
            label: category.label,
            files: usage?.categories[category.value]?.files ?? 0,
            bytes: usage?.categories[category.value]?.bytes ?? 0,
        })),
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => (
                <button
                    key={card.label}
                    type="button"
                    aria-pressed={active === card.value}
                    onClick={() => onSelect(card.value)}
                    className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                    <Card
                        className={cn(
                            'h-full w-full transition-colors',
                            active === card.value &&
                                'border-primary-500 ring-1 ring-primary-500',
                        )}
                    >
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium text-text-50">
                                {card.label}
                            </p>
                            <p className="text-xs text-text-100">
                                {card.files}{' '}
                                {card.files === 1 ? 'file' : 'files'} ·{' '}
                                {formatBytes(card.bytes)}
                            </p>
                        </CardContent>
                    </Card>
                </button>
            ))}
        </div>
    );
}
