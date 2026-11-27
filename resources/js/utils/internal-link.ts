/**
 * The path to visit with Inertia when a click on an anchor should stay in the app. Returns null when the
 * browser should handle the click: a modified or non-primary click, an external origin, a download, a new
 * tab, or a same-page hash link.
 */
export function internalVisitPath(
    anchor: HTMLAnchorElement,
    event: MouseEvent,
    currentLocation: Location = window.location,
): string | null {
    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return null;
    }

    if (
        anchor.hasAttribute('download') ||
        (anchor.target !== '' && anchor.target !== '_self')
    ) {
        return null;
    }

    const target = new URL(
        anchor.getAttribute('href') ?? '',
        currentLocation.href,
    );

    if (target.origin !== currentLocation.origin) {
        return null;
    }

    if (
        target.hash !== '' &&
        target.pathname === currentLocation.pathname &&
        target.search === currentLocation.search
    ) {
        return null;
    }

    return `${target.pathname}${target.search}${target.hash}`;
}
