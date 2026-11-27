import { cn } from '@/utils/cn';

type Props = {
    className?: string;
};

/**
 * A loading placeholder bar for the dashboard skeletons. It uses the theme tokens directly, because the core Skeleton's tokens are not defined.
 */
export function MediaSkeletonBar({ className }: Props) {
    return (
        <div
            className={cn(
                'h-3 animate-pulse rounded-full bg-background-soft-400',
                className,
            )}
        />
    );
}
