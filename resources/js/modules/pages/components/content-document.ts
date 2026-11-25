/** Shapes of the page content document, as the server stores and sends them. */

/**
 * Element data holds scalar values only. A flat type keeps Inertia's form
 * types finite. Recursive JSON types make them too deep to compile.
 */
export type JsonValue = string | number | boolean | null;

export type JsonObject = { [key: string]: JsonValue };

export type ContentElementField = {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'rich' | 'select' | 'url';
    required: boolean;
    options?: { value: string | number; label: string }[];
};

export type ContentElementType = {
    type: string;
    label: string;
    requiresPermission: string | null;
    schema: {
        defaults: JsonObject;
        fields: ContentElementField[];
    };
};

export type ContentElement = {
    id: string;
    type: string;
    version: number;
    data: JsonObject;
};

export type ContentSection = {
    id: string;
    layout: string;
    enabled?: boolean;
    settings?: JsonObject;
    elements: ContentElement[];
};

/**
 * Unknown keys are kept as they are, because the editor spreads the document
 * when it changes it. The type lists only the keys the editor reads.
 */
export type ContentDocument = {
    version: number;
    sections: ContentSection[];
};

export type ContentLayout = {
    key: string;
    label: string;
};

export type ContentBackground = {
    key: string;
    label: string;
};

export type ContentEditorConfig = {
    layouts: ContentLayout[];
    backgrounds: ContentBackground[];
    elementTypes: ContentElementType[];
    canUseHtml: boolean;
};

/** A UUID v4. Falls back to random bytes where `crypto.randomUUID` needs a secure context. */
export function newId(): string {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0'),
    ).join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
