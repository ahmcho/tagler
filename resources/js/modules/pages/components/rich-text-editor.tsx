import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Strikethrough,
    Undo2,
} from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { Input } from '@/components/tailgrids/core/input';
import { cn } from '@/utils/cn';

type Props = {
    value: string;
    onChange: (html: string) => void;
    invalid?: boolean;
};

/** Link targets the editor accepts. The server applies the same rules again on save. */
function isAllowedLink(url: string): boolean {
    const trimmed = url.trim();

    if (trimmed === '' || /\s/.test(trimmed) || trimmed.startsWith('//')) {
        return false;
    }

    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
        return true;
    }

    return /^(https?:\/\/|mailto:)/i.test(trimmed);
}

/**
 * Rich text for paragraph elements, built on TipTap (MIT). It stores HTML.
 * The server sanitises that HTML on save and on output.
 */
export function RichTextEditor({ value, onChange, invalid = false }: Props) {
    // The editor keeps the first callback it was given. A ref lets it reach the latest one.
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkError, setLinkError] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: {
                    openOnClick: false,
                    autolink: false,
                    HTMLAttributes: {
                        rel: 'noopener noreferrer',
                        target: '_blank',
                    },
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor: current }) =>
            onChangeRef.current(current.getHTML()),
        editorProps: {
            attributes: {
                class: 'min-h-32 px-4 py-3 outline-none leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary-500 [&_blockquote]:pl-4 [&_a]:text-primary-500 [&_a]:underline',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const openLinkForm = () => {
        setLinkUrl(editor.getAttributes('link').href ?? '');
        setLinkError(null);
        setLinkOpen(true);
    };

    // The editor sits inside the page form, so this is not a <form>. Nested forms are invalid HTML.
    const applyLink = () => {
        if (!isAllowedLink(linkUrl)) {
            setLinkError(
                'Use an http, https or mailto link, or a path that starts with /.',
            );

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: linkUrl.trim() })
            .run();
        setLinkOpen(false);
    };

    const tool = (
        label: string,
        active: boolean,
        onPress: () => void,
        icon: ReactNode,
        disabled = false,
    ) => (
        <Button
            key={label}
            type="button"
            variant={active ? 'primary' : 'ghost'}
            appearance={active ? 'fill' : 'outline'}
            iconOnly
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onPress={onPress}
        >
            {icon}
        </Button>
    );

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg border bg-input-background',
                invalid ? 'border-input-error-focus-border' : 'border-base-300',
            )}
        >
            <div
                role="toolbar"
                aria-label="Text formatting"
                className="flex flex-wrap items-center gap-1 border-b border-base-300 p-2"
            >
                {tool(
                    'Bold',
                    editor.isActive('bold'),
                    () => editor.chain().focus().toggleBold().run(),
                    <Bold className="size-4" />,
                )}
                {tool(
                    'Italic',
                    editor.isActive('italic'),
                    () => editor.chain().focus().toggleItalic().run(),
                    <Italic className="size-4" />,
                )}
                {tool(
                    'Strikethrough',
                    editor.isActive('strike'),
                    () => editor.chain().focus().toggleStrike().run(),
                    <Strikethrough className="size-4" />,
                )}
                {tool(
                    'Bullet list',
                    editor.isActive('bulletList'),
                    () => editor.chain().focus().toggleBulletList().run(),
                    <List className="size-4" />,
                )}
                {tool(
                    'Numbered list',
                    editor.isActive('orderedList'),
                    () => editor.chain().focus().toggleOrderedList().run(),
                    <ListOrdered className="size-4" />,
                )}
                {tool(
                    'Quote',
                    editor.isActive('blockquote'),
                    () => editor.chain().focus().toggleBlockquote().run(),
                    <Quote className="size-4" />,
                )}
                {tool(
                    'Link',
                    editor.isActive('link') || linkOpen,
                    openLinkForm,
                    <Link2 className="size-4" />,
                )}
                {editor.isActive('link') &&
                    tool(
                        'Remove link',
                        false,
                        () =>
                            editor
                                .chain()
                                .focus()
                                .extendMarkRange('link')
                                .unsetLink()
                                .run(),
                        <Link2Off className="size-4" />,
                    )}
                {tool(
                    'Undo',
                    false,
                    () => editor.chain().focus().undo().run(),
                    <Undo2 className="size-4" />,
                    !editor.can().undo(),
                )}
                {tool(
                    'Redo',
                    false,
                    () => editor.chain().focus().redo().run(),
                    <Redo2 className="size-4" />,
                    !editor.can().redo(),
                )}
            </div>

            {linkOpen && (
                <div
                    onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            applyLink();
                        }
                    }}
                    className="flex flex-wrap items-start gap-2 border-b border-base-300 p-2"
                >
                    <div className="min-w-64 flex-1">
                        <Input
                            aria-label="Link address"
                            placeholder="https://example.com or /contact"
                            value={linkUrl}
                            onChange={(event) => setLinkUrl(event.target.value)}
                            className="w-full"
                            autoFocus
                        />
                        {linkError && (
                            <p className="mt-1 text-sm text-input-error">
                                {linkError}
                            </p>
                        )}
                    </div>
                    <Button type="button" variant="primary" onPress={applyLink}>
                        Apply link
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onPress={() => setLinkOpen(false)}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}
