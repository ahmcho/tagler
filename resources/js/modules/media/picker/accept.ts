/** Splits an `accept` value such as "image/*,application/pdf" into MIME patterns. */
export function parseAccept(accept: string | undefined): string[] {
    return (accept ?? '')
        .split(',')
        .map((pattern) => pattern.trim())
        .filter((pattern) => pattern !== '');
}

/** True when the MIME type matches one pattern. An empty list accepts every type. */
export function matchesAccept(mimeType: string, patterns: string[]): boolean {
    if (patterns.length === 0) {
        return true;
    }

    return patterns.some((pattern) =>
        pattern.endsWith('/*')
            ? mimeType.startsWith(pattern.slice(0, -1))
            : mimeType === pattern,
    );
}
