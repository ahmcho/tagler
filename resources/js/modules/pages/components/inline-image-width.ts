export const IMAGE_WIDTHS: readonly number[] = [25, 50, 75, 100];

/** Keeps a width between 1 and 100 percent, rounded. Anything not a number becomes 100. */
export function normalizeImageWidth(value: number): number {
    if (!Number.isFinite(value)) {
        return 100;
    }

    return Math.min(100, Math.max(1, Math.round(value)));
}

/** Reads a stored width. A missing or blank value (content saved before widths) becomes 100. */
export function readImageWidth(value: string | null): number {
    if (value === null || value.trim() === '') {
        return 100;
    }

    return normalizeImageWidth(Number(value));
}

/** Floated images keep the 50 % cap from their CSS class, so a drag stops there too. */
export function maxWidthForPosition(
    position: 'left' | 'right' | 'full',
): number {
    return position === 'full' ? 100 : 50;
}

/** The width after a drag. `deltaPx` is positive when the box grows. */
export function widthFromDrag(
    startPercent: number,
    deltaPx: number,
    parentPx: number,
    maxWidth: number,
): number {
    const next = startPercent + (deltaPx / parentPx) * 100;

    return Math.min(maxWidth, Math.max(1, Math.round(next)));
}
