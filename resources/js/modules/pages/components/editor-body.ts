import { $isRootTextContentEmpty } from '@lexical/text';
import { $dfs } from '@lexical/utils';
import { $getRoot, $isDecoratorNode } from 'lexical';

/**
 * True when the body has no text and no block such as an image. Lexical's text check
 * alone reads an image-only body as empty, so the image would not be saved.
 */
export function $isBodyEmpty(): boolean {
    return (
        $isRootTextContentEmpty(false, true) &&
        !$dfs($getRoot()).some(({ node }) => $isDecoratorNode(node))
    );
}
