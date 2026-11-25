import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyText } from './use-clipboard';

function stubDocument(execCommand: () => boolean) {
    const textarea = {
        value: '',
        style: {} as Record<string, string>,
        setAttribute: vi.fn(),
        select: vi.fn(),
        remove: vi.fn(),
    };
    const document = {
        createElement: vi.fn(() => textarea),
        body: { appendChild: vi.fn() },
        execCommand: vi.fn(execCommand),
    };
    vi.stubGlobal('document', document);

    return { document, textarea };
}

describe('copyText', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('uses the async Clipboard API when it is available', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', { clipboard: { writeText } });
        const { document } = stubDocument(() => false);

        await expect(copyText('https://example.test/a.png')).resolves.toBe(
            true,
        );

        expect(writeText).toHaveBeenCalledWith('https://example.test/a.png');
        expect(document.execCommand).not.toHaveBeenCalled();
    });

    it('falls back to execCommand when the Clipboard API is missing', async () => {
        vi.stubGlobal('navigator', {});
        const { document, textarea } = stubDocument(() => true);

        await expect(copyText('https://example.test/a.png')).resolves.toBe(
            true,
        );

        expect(textarea.value).toBe('https://example.test/a.png');
        expect(textarea.select).toHaveBeenCalled();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(textarea.remove).toHaveBeenCalled();
    });

    it('falls back to execCommand when writeText rejects', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('Denied'));
        vi.stubGlobal('navigator', { clipboard: { writeText } });
        const { document } = stubDocument(() => true);

        await expect(copyText('value')).resolves.toBe(true);

        expect(writeText).toHaveBeenCalledWith('value');
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('returns false and removes the textarea when every method fails', async () => {
        vi.stubGlobal('navigator', {});
        const { textarea } = stubDocument(() => false);

        await expect(copyText('value')).resolves.toBe(false);

        expect(textarea.remove).toHaveBeenCalled();
    });

    it('removes the textarea even when execCommand throws', async () => {
        vi.stubGlobal('navigator', {});
        const { textarea } = stubDocument(() => {
            throw new Error('Unsupported');
        });

        await expect(copyText('value')).rejects.toThrow('Unsupported');

        expect(textarea.remove).toHaveBeenCalled();
    });
});
