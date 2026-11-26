import { ChevronRight, Folder1, Home } from '@tailgrids/icons';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { Separator } from '@/components/tailgrids/core/separator';
import { Skeleton } from '@/components/tailgrids/core/skeleton';
import { cn } from '@/utils/cn';
import type { MediaFolder } from '../types';
import { childFolders, folderTrail } from './folder-tree';

type Props = {
    folders: MediaFolder[];
    loading: boolean;
    activeId: number | null;
    onSelect: (folderId: number | null) => void;
};

/**
 * Nested folder list. Folders on the path to the active folder start open. The user can open or
 * close any folder, and that choice stays until the picker closes.
 */
export function MediaPickerFolderSidebar({
    folders,
    loading,
    activeId,
    onSelect,
}: Props) {
    const [toggled, setToggled] = useState<number[]>([]);
    const pathIds = folderTrail(folders, activeId).map((folder) => folder.id);

    function isOpen(folderId: number): boolean {
        return pathIds.includes(folderId) !== toggled.includes(folderId);
    }

    function toggle(folderId: number) {
        setToggled((previous) =>
            previous.includes(folderId)
                ? previous.filter((id) => id !== folderId)
                : [...previous, folderId],
        );
    }

    function renderLevel(parentId: number | null, depth: number): ReactNode {
        return childFolders(folders, parentId).map((folder) => {
            const children = childFolders(folders, folder.id);
            const open = isOpen(folder.id);
            const active = folder.id === activeId;

            return (
                <li key={folder.id}>
                    <div
                        className="flex items-center gap-1"
                        style={{ paddingLeft: depth * 12 }}
                    >
                        {children.length > 0 ? (
                            <Button
                                variant="ghost"
                                iconOnly
                                aria-label={
                                    open ? 'Collapse folder' : 'Expand folder'
                                }
                                aria-expanded={open}
                                onPress={() => toggle(folder.id)}
                            >
                                <ChevronRight
                                    className={cn(
                                        'transition-transform',
                                        open && 'rotate-90',
                                    )}
                                />
                            </Button>
                        ) : (
                            <span
                                className="size-10 shrink-0"
                                aria-hidden="true"
                            />
                        )}
                        <Button
                            variant="ghost"
                            className={cn(
                                'min-w-0 flex-1 justify-start',
                                active && 'bg-primary-50 text-primary-600',
                            )}
                            aria-current={active ? 'true' : undefined}
                            onPress={() => onSelect(folder.id)}
                        >
                            <Folder1 className="size-4 shrink-0" />
                            <span className="truncate">{folder.name}</span>
                        </Button>
                    </div>
                    {open && children.length > 0 && (
                        <ul>{renderLevel(folder.id, depth + 1)}</ul>
                    )}
                </li>
            );
        });
    }

    return (
        <>
            <nav
                aria-label="Folders"
                className="max-h-40 shrink-0 overflow-y-auto md:max-h-none md:w-56"
            >
                {loading ? (
                    <div className="flex flex-col gap-2 p-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>
                ) : (
                    <ul className="flex flex-col gap-0.5">
                        <li>
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start',
                                    activeId === null &&
                                        'bg-primary-50 text-primary-600',
                                )}
                                aria-current={
                                    activeId === null ? 'true' : undefined
                                }
                                onPress={() => onSelect(null)}
                            >
                                <Home className="size-4 shrink-0" />
                                Media library
                            </Button>
                        </li>
                        {renderLevel(null, 0)}
                    </ul>
                )}
            </nav>
            <Separator orientation="vertical" className="hidden md:block" />
        </>
    );
}
