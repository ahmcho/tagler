import type { MediaFolder } from '../types';

/** Direct children of a folder, sorted by name. `null` means the top level. */
export function childFolders(
    folders: MediaFolder[],
    parentId: number | null,
): MediaFolder[] {
    return folders
        .filter((folder) => folder.parent_id === parentId)
        .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, {
                numeric: true,
                sensitivity: 'base',
            }),
        );
}

/** Folders from the top level down to `folderId`. Empty for the root. */
export function folderTrail(
    folders: MediaFolder[],
    folderId: number | null,
): MediaFolder[] {
    const trail: MediaFolder[] = [];
    let current = folders.find((folder) => folder.id === folderId);

    // The length bound stops a corrupt parent loop from running forever.
    while (current && trail.length <= folders.length) {
        trail.unshift(current);
        const parentId = current.parent_id;
        current = folders.find((folder) => folder.id === parentId);
    }

    return trail;
}
