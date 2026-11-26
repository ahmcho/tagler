import {
    AriaLiveRegionExtension,
    EditorModeAnnounceExtension,
    FocusManagerExtension,
    FocusTrapExtension,
    HistoryAnnounceExtension,
    RovingTabIndexExtension,
} from '@lexical/a11y';
import { ClipboardImportExtension } from '@lexical/clipboard';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { CodePrismExtension } from '@lexical/code-prism';
import { DragonExtension } from '@lexical/dragon';
import { TabIndentationExtension } from '@lexical/extension';
import { exportFile, importFile } from '@lexical/file';
import { HashtagExtension } from '@lexical/hashtag';
import { HistoryExtension } from '@lexical/history';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
    $isLinkNode,
    AutoLinkAnnounceExtension,
    AutoLinkExtension,
    LinkExtension,
    TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import {
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListExtension,
    REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { MarkExtension } from '@lexical/mark';
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    CHECK_LIST,
    TRANSFORMERS,
} from '@lexical/markdown';

/** Markdown transformers with task lists, which the default list leaves out. Checklist goes first, so it wins over the plain list. */
const MARKDOWN_TRANSFORMERS = [
    CHECK_LIST,
    INLINE_IMAGE_MARKDOWN,
    ...TRANSFORMERS,
];
import { OverflowExtension } from '@lexical/overflow';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextExtension } from '@lexical/rich-text';
import { $createQuoteNode, $isQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND, TableExtension } from '@lexical/table';
import { TailwindExtension } from '@lexical/tailwind';
import { $findMatchingParent, $insertNodeToNearestRoot } from '@lexical/utils';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $getRoot,
    $isDecoratorNode,
    $isElementNode,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    defineExtension,
    configExtension,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import type { ElementNode, LexicalEditor } from 'lexical';
import {
    Bold,
    Code,
    Download,
    Grid3x3,
    ImagePlus,
    Images,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Strikethrough,
    Undo2,
    Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { MutableRefObject } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { Input } from '@/components/tailgrids/core/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tailgrids/core/tooltip';
import { mediaApi } from '@/modules/media/api/media-api';
import { MediaLibraryPicker } from '@/modules/media/picker';
import { cn } from '@/utils/cn';
import { $isBodyEmpty } from './editor-body';
import {
    $createInlineImageNode,
    INLINE_IMAGE_MARKDOWN,
    InlineImageNode,
} from './inline-image-node';
import type { InlineImagePosition } from './inline-image-node';
import { IMAGE_WIDTHS, normalizeImageWidth } from './inline-image-width';

type ImageDraft = {
    src: string;
    altText: string;
    caption: string;
    position: InlineImagePosition;
    width: number;
};

/** Link target choices. `true` opens the link in a new tab. */
const LINK_TARGETS: [boolean, string][] = [
    [false, 'Same tab'],
    [true, 'New tab'],
];

const IMAGE_POSITIONS: [InlineImagePosition, string][] = [
    ['left', 'Left'],
    ['right', 'Right'],
    ['full', 'Full width'],
];

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

/** Content area: wide tables scroll inside it, and the body markup is styled here, not in the stored HTML. */
const CONTENT_CLASS =
    'min-h-32 overflow-x-auto px-4 py-3 leading-relaxed outline-none [&_a]:text-primary-500 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary-500 [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_table]:my-2 [&_td]:border [&_td]:border-base-300 [&_td]:px-2 [&_th]:border [&_th]:border-base-300 [&_th]:px-2 [&_th]:font-semibold [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-base-100 [&_pre]:p-3 [&_code]:font-mono';

/** The two formats a body can be written in. Matches the form data and the server enum. */
export type BodyFormatValue = 'html' | 'markdown';

/**
 * Fills the editor from Markdown. An empty document gets one empty paragraph.
 */
function loadMarkdown(markdown: string): void {
    const root = $getRoot();

    root.clear();
    $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS);

    if (root.isEmpty()) {
        root.append($createParagraphNode());
    }
}

/**
 * Fills the editor from stored HTML. Blank HTML gives one empty paragraph.
 * Top-level text is wrapped in a paragraph, because Lexical needs block nodes at the root.
 */
function loadHtml(editor: LexicalEditor, html: string): void {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    const nodes = $generateNodesFromDOM(editor, dom).map((node) =>
        $isElementNode(node) || $isDecoratorNode(node)
            ? node
            : $createParagraphNode().append(node),
    );
    const root = $getRoot();

    root.clear();
    root.append(...(nodes.length > 0 ? nodes : [$createParagraphNode()]));
}

/**
 * Converts the editor state to HTML. A document with no text gives an empty string.
 * Editor classes and the `dir` attribute are removed, so the stored markup stays plain.
 */
function readHtml(editor: LexicalEditor): string {
    return editor.getEditorState().read(() =>
        $isBodyEmpty()
            ? ''
            : $generateHtmlFromNodes(editor)
                  .replace(/ dir="[^"]*"/g, '')
                  .replace(/ class="[^"]*"/g, ''),
    );
}

/**
 * The editor extension. It is built once per mount, from the first value, as the old editor was.
 */
function buildEditorExtension(
    initialValue: string,
    initialFormat: BodyFormatValue,
) {
    return defineExtension({
        name: '[page-body]',
        namespace: 'PageBody',
        nodes: [InlineImageNode],
        $initialEditorState: (editor: LexicalEditor) =>
            initialFormat === 'markdown'
                ? loadMarkdown(initialValue)
                : loadHtml(editor, initialValue),
        onError: (error: Error) => {
            throw error;
        },
        dependencies: [
            RichTextExtension,
            HistoryExtension,
            ListExtension,
            LinkExtension,
            AutoLinkExtension,
            AutoLinkAnnounceExtension,
            TabIndentationExtension,
            configExtension(TableExtension, { hasHorizontalScroll: false }),
            CodePrismExtension,
            HashtagExtension,
            MarkExtension,
            OverflowExtension,
            DragonExtension,
            ClipboardImportExtension,
            TailwindExtension,
            AriaLiveRegionExtension,
            EditorModeAnnounceExtension,
            FocusManagerExtension,
            FocusTrapExtension,
            HistoryAnnounceExtension,
            RovingTabIndexExtension,
        ],
    });
}

type ActiveState = {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    quote: boolean;
    code: boolean;
    bulletList: boolean;
    orderedList: boolean;
    link: boolean;
};

const NO_ACTIVE: ActiveState = {
    bold: false,
    italic: false,
    strikethrough: false,
    quote: false,
    code: false,
    bulletList: false,
    orderedList: false,
    link: false,
};

/**
 * Toolbar buttons and link form. Reads the selection on each update, so the buttons show the active state.
 */
function Toolbar() {
    const [editor] = useLexicalComposerContext();
    const [active, setActive] = useState<ActiveState>(NO_ACTIVE);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkNewTab, setLinkNewTab] = useState(true);
    const [linkError, setLinkError] = useState<string | null>(null);
    const [mediaOpen, setMediaOpen] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [imageOpen, setImageOpen] = useState(false);
    const [imageDraft, setImageDraft] = useState<ImageDraft | null>(null);

    useEffect(
        () =>
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    const selection = $getSelection();

                    if (!$isRangeSelection(selection)) {
                        setActive(NO_ACTIVE);

                        return;
                    }

                    const anchor = selection.anchor.getNode();
                    const list = $findMatchingParent(anchor, $isListNode);

                    setActive({
                        bold: selection.hasFormat('bold'),
                        italic: selection.hasFormat('italic'),
                        strikethrough: selection.hasFormat('strikethrough'),
                        quote:
                            $findMatchingParent(anchor, $isQuoteNode) !== null,
                        code: $findMatchingParent(anchor, $isCodeNode) !== null,
                        bulletList:
                            $isListNode(list) &&
                            list.getListType() === 'bullet',
                        orderedList:
                            $isListNode(list) &&
                            list.getListType() === 'number',
                        link: $findMatchingParent(anchor, $isLinkNode) !== null,
                    });
                });
            }),
        [editor],
    );

    useEffect(() => {
        const unregisterUndo = editor.registerCommand(
            CAN_UNDO_COMMAND,
            (payload) => {
                setCanUndo(payload);

                return false;
            },
            COMMAND_PRIORITY_LOW,
        );
        const unregisterRedo = editor.registerCommand(
            CAN_REDO_COMMAND,
            (payload) => {
                setCanRedo(payload);

                return false;
            },
            COMMAND_PRIORITY_LOW,
        );

        return () => {
            unregisterUndo();
            unregisterRedo();
        };
    }, [editor]);

    const toggleBlock = (isActive: boolean, createBlock: () => ElementNode) =>
        editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () =>
                    isActive ? $createParagraphNode() : createBlock(),
                );
            }
        });

    const openLinkForm = () => {
        const existing = editor.getEditorState().read(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
                return null;
            }

            const link = $findMatchingParent(
                selection.anchor.getNode(),
                $isLinkNode,
            );

            return $isLinkNode(link)
                ? { url: link.getURL(), target: link.getTarget() }
                : null;
        });

        setLinkUrl(existing?.url ?? '');
        // A new link opens in a new tab. An existing link keeps its own target.
        setLinkNewTab(existing ? existing.target === '_blank' : true);
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

        editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
            url: linkUrl.trim(),
            rel: 'noopener noreferrer',
            target: linkNewTab ? '_blank' : undefined,
        });
        setLinkOpen(false);
    };

    /** Inserts the public URL of the chosen file as plain text. The editor adds no link tag. */
    const insertMediaUrl = async (uuid: string) => {
        try {
            const { url } = await mediaApi.fileUrl(uuid);

            editor.update(() => {
                let selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    selection = $getRoot().selectEnd();
                }

                selection.insertText(url);
            });
            setMediaError(null);
        } catch {
            setMediaError('The file link could not be loaded.');
        }

        editor.focus();
    };

    /** Reads the picked image. Private files get signed links that expire, so they are refused. */
    const prepareImage = async (uuid: string) => {
        try {
            const [{ url, temporary }, file] = await Promise.all([
                mediaApi.fileUrl(uuid),
                mediaApi.showFile(uuid),
            ]);

            if (temporary) {
                setMediaError(
                    'Only public files can be inserted as images. Set the file to public in the media library.',
                );

                return;
            }

            setMediaError(null);
            setImageDraft({
                src: url,
                altText: file.alt_text ?? '',
                caption: '',
                position: 'left',
                width: 100,
            });
        } catch {
            setMediaError('The image could not be loaded.');
        }
    };

    const insertImage = (draft: ImageDraft) => {
        editor.update(() => {
            $insertNodeToNearestRoot(
                $createInlineImageNode({
                    ...draft,
                    width: normalizeImageWidth(draft.width),
                }),
            );
        });
        setImageDraft(null);
        editor.focus();
    };

    const tool = (
        label: string,
        isActive: boolean,
        onPress: () => void,
        icon: ReactNode,
        disabled = false,
    ) => (
        <Tooltip key={label} placement="top">
            <TooltipTrigger asChild>
                <span className="inline-flex">
                    <Button
                        type="button"
                        variant={isActive ? 'primary' : 'ghost'}
                        appearance={isActive ? 'fill' : 'outline'}
                        iconOnly
                        aria-label={label}
                        aria-pressed={isActive}
                        disabled={disabled}
                        onPress={onPress}
                    >
                        {icon}
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent className="z-[60] block">{label}</TooltipContent>
        </Tooltip>
    );

    return (
        <>
            <div
                role="toolbar"
                aria-label="Text formatting"
                className="flex flex-wrap items-center gap-1 border-b border-base-300 p-2"
            >
                {tool(
                    'Bold',
                    active.bold,
                    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
                    <Bold className="size-4" />,
                )}
                {tool(
                    'Italic',
                    active.italic,
                    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
                    <Italic className="size-4" />,
                )}
                {tool(
                    'Strikethrough',
                    active.strikethrough,
                    () =>
                        editor.dispatchCommand(
                            FORMAT_TEXT_COMMAND,
                            'strikethrough',
                        ),
                    <Strikethrough className="size-4" />,
                )}
                {tool(
                    'Bullet list',
                    active.bulletList,
                    () =>
                        editor.dispatchCommand(
                            active.bulletList
                                ? REMOVE_LIST_COMMAND
                                : INSERT_UNORDERED_LIST_COMMAND,
                            undefined,
                        ),
                    <List className="size-4" />,
                )}
                {tool(
                    'Numbered list',
                    active.orderedList,
                    () =>
                        editor.dispatchCommand(
                            active.orderedList
                                ? REMOVE_LIST_COMMAND
                                : INSERT_ORDERED_LIST_COMMAND,
                            undefined,
                        ),
                    <ListOrdered className="size-4" />,
                )}
                {tool(
                    'Quote',
                    active.quote,
                    () => toggleBlock(active.quote, $createQuoteNode),
                    <Quote className="size-4" />,
                )}
                {tool(
                    'Code block',
                    active.code,
                    () => toggleBlock(active.code, $createCodeNode),
                    <Code className="size-4" />,
                )}
                {tool(
                    'Table',
                    false,
                    () =>
                        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                            columns: '3',
                            rows: '3',
                            includeHeaders: true,
                        }),
                    <Grid3x3 className="size-4" />,
                )}
                {tool(
                    'Choose media file from library and paste the link',
                    false,
                    () => setMediaOpen(true),
                    <Images className="size-4" />,
                )}
                {tool(
                    'Insert image file from library',
                    false,
                    () => setImageOpen(true),
                    <ImagePlus className="size-4" />,
                )}
                {tool(
                    'Link',
                    active.link || linkOpen,
                    openLinkForm,
                    <Link2 className="size-4" />,
                )}
                {active.link &&
                    tool(
                        'Remove link',
                        false,
                        () => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null),
                        <Link2Off className="size-4" />,
                    )}
                {tool(
                    'Undo',
                    false,
                    () => editor.dispatchCommand(UNDO_COMMAND, undefined),
                    <Undo2 className="size-4" />,
                    !canUndo,
                )}
                {tool(
                    'Redo',
                    false,
                    () => editor.dispatchCommand(REDO_COMMAND, undefined),
                    <Redo2 className="size-4" />,
                    !canRedo,
                )}
                {tool(
                    'Export file',
                    false,
                    () => exportFile(editor, { fileName: 'page-body' }),
                    <Download className="size-4" />,
                )}
                {tool(
                    'Import file',
                    false,
                    () => importFile(editor),
                    <Upload className="size-4" />,
                )}
            </div>

            {mediaError && (
                <p role="alert" className="px-2 pt-2 text-sm text-error-500">
                    {mediaError}
                </p>
            )}

            <MediaLibraryPicker
                open={mediaOpen}
                onClose={() => setMediaOpen(false)}
                onSelect={(uuid) => void insertMediaUrl(uuid)}
            />

            <MediaLibraryPicker
                open={imageOpen}
                accept="image/*"
                onClose={() => setImageOpen(false)}
                onSelect={(uuid) => {
                    setImageOpen(false);
                    void prepareImage(uuid);
                }}
            />

            {imageDraft && (
                <div
                    onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            insertImage(imageDraft);
                        }
                    }}
                    className="flex flex-wrap items-end gap-2 border-b border-base-300 p-2"
                >
                    <div className="min-w-48 flex-1">
                        <Input
                            aria-label="Image alt text"
                            placeholder="Alt text"
                            value={imageDraft.altText}
                            onChange={(event) =>
                                setImageDraft((draft) =>
                                    draft
                                        ? {
                                              ...draft,
                                              altText: event.target.value,
                                          }
                                        : draft,
                                )
                            }
                            className="w-full"
                        />
                    </div>
                    <div className="min-w-48 flex-1">
                        <Input
                            aria-label="Image caption"
                            placeholder="Caption (optional)"
                            value={imageDraft.caption}
                            onChange={(event) =>
                                setImageDraft((draft) =>
                                    draft
                                        ? {
                                              ...draft,
                                              caption: event.target.value,
                                          }
                                        : draft,
                                )
                            }
                            className="w-full"
                        />
                    </div>
                    {IMAGE_WIDTHS.map((value) => (
                        <Button
                            key={value}
                            type="button"
                            variant={
                                imageDraft.width === value ? 'primary' : 'ghost'
                            }
                            appearance={
                                imageDraft.width === value ? 'fill' : 'outline'
                            }
                            aria-pressed={imageDraft.width === value}
                            onPress={() =>
                                setImageDraft((draft) =>
                                    draft ? { ...draft, width: value } : draft,
                                )
                            }
                        >
                            {value}%
                        </Button>
                    ))}
                    {IMAGE_POSITIONS.map(([value, label]) => (
                        <Button
                            key={value}
                            type="button"
                            variant={
                                imageDraft.position === value
                                    ? 'primary'
                                    : 'ghost'
                            }
                            appearance={
                                imageDraft.position === value
                                    ? 'fill'
                                    : 'outline'
                            }
                            aria-pressed={imageDraft.position === value}
                            onPress={() =>
                                setImageDraft((draft) =>
                                    draft
                                        ? { ...draft, position: value }
                                        : draft,
                                )
                            }
                        >
                            {label}
                        </Button>
                    ))}
                    <Button
                        type="button"
                        variant="primary"
                        onPress={() => insertImage(imageDraft)}
                    >
                        Insert image
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onPress={() => setImageDraft(null)}
                    >
                        Cancel
                    </Button>
                </div>
            )}

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
                    {LINK_TARGETS.map(([isNewTab, label]) => (
                        <Button
                            key={label}
                            type="button"
                            variant={
                                linkNewTab === isNewTab ? 'primary' : 'ghost'
                            }
                            appearance={
                                linkNewTab === isNewTab ? 'fill' : 'outline'
                            }
                            aria-pressed={linkNewTab === isNewTab}
                            onPress={() => setLinkNewTab(isNewTab)}
                        >
                            {label}
                        </Button>
                    ))}
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
        </>
    );
}

/**
 * Editor surface for rich text. It is mounted only in rich text mode, so Markdown mode does not load the editor.
 * It registers an export function, so the parent can convert the content to Markdown before it unmounts.
 */
function EditorSurface({
    emitOnMount,
    exportRef,
    onChange,
}: {
    emitOnMount: boolean;
    exportRef: MutableRefObject<(() => string) | null>;
    onChange: (body: string, format: BodyFormatValue) => void;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        exportRef.current = () =>
            editor
                .getEditorState()
                .read(() => $convertToMarkdownString(MARKDOWN_TRANSFORMERS));

        return () => {
            exportRef.current = null;
        };
    }, [editor, exportRef]);

    // Content converted from Markdown is emitted as HTML once the editor has loaded it.
    useEffect(() => {
        if (emitOnMount) {
            onChange(readHtml(editor), 'html');
        }
        // Runs once per mount: the editor is mounted again for each switch.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Toolbar />
            <ContentEditable className={CONTENT_CLASS} />
            <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
            <OnChangePlugin
                ignoreSelectionChange
                onChange={(_state, current) =>
                    onChange(readHtml(current), 'html')
                }
            />
        </>
    );
}

/**
 * Body editor for a page translation. It edits rich text (stored as HTML) or Markdown (stored as written).
 * Switching converts the content. Only one editor is mounted at a time. The server sanitises HTML on save
 * and renders Markdown on output.
 */
export function RichTextEditor({
    value,
    format,
    onChange,
    invalid = false,
}: {
    value: string;
    format: BodyFormatValue;
    onChange: (body: string, format: BodyFormatValue) => void;
    invalid?: boolean;
}) {
    const [mode, setMode] = useState<BodyFormatValue>(format);
    const [draft, setDraft] = useState(format === 'markdown' ? value : '');
    // The rich editor is built from this seed each time it mounts.
    const [seed, setSeed] = useState<{
        value: string;
        format: BodyFormatValue;
    }>({ value, format });
    const extension = useMemo(
        () => buildEditorExtension(seed.value, seed.format),
        [seed],
    );
    const exportRef = useRef<(() => string) | null>(null);

    // The change listener runs outside React state. The latest callback is read from a ref.
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    const showMarkdown = () => {
        const markdown = exportRef.current?.() ?? draft;

        setDraft(markdown);
        setMode('markdown');
        onChange(markdown, 'markdown');
    };

    const showRich = () => {
        setSeed({ value: draft, format: 'markdown' });
        setMode('html');
    };

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg border bg-input-background',
                invalid ? 'border-input-error-focus-border' : 'border-base-300',
            )}
        >
            <div
                role="group"
                aria-label="Body format"
                className="flex items-center gap-2 border-b border-base-300 p-2"
            >
                <Button
                    type="button"
                    variant={mode === 'html' ? 'primary' : 'ghost'}
                    appearance={mode === 'html' ? 'fill' : 'outline'}
                    aria-pressed={mode === 'html'}
                    onPress={() => {
                        if (mode === 'markdown') {
                            showRich();
                        }
                    }}
                >
                    Rich text
                </Button>
                <Button
                    type="button"
                    variant={mode === 'markdown' ? 'primary' : 'ghost'}
                    appearance={mode === 'markdown' ? 'fill' : 'outline'}
                    aria-pressed={mode === 'markdown'}
                    onPress={() => {
                        if (mode === 'html') {
                            showMarkdown();
                        }
                    }}
                >
                    Markdown
                </Button>
            </div>

            {mode === 'markdown' && (
                <textarea
                    aria-label="Markdown source"
                    value={draft}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        onChange(event.target.value, 'markdown');
                    }}
                    className="min-h-64 w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none"
                />
            )}

            {mode === 'html' && (
                <LexicalExtensionComposer
                    extension={extension}
                    contentEditable={null}
                >
                    <EditorSurface
                        emitOnMount={seed.format === 'markdown'}
                        exportRef={exportRef}
                        onChange={(body, nextFormat) =>
                            onChangeRef.current(body, nextFormat)
                        }
                    />
                </LexicalExtensionComposer>
            )}
        </div>
    );
}
