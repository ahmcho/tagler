import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsDown,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUp,
    ChevronUp,
} from 'lucide-react';
import ReactDualListBox from 'react-dual-listbox';
import type { DualListBoxIcons } from 'react-dual-listbox';
import type { SelectOption } from '@/components/searchable-list';
import { cn } from '@/utils/cn';

const ICON_CLASS = 'size-4';

const ICONS: DualListBoxIcons = {
    moveToSelected: <ChevronRight className={ICON_CLASS} />,
    moveAllToSelected: <ChevronsRight className={ICON_CLASS} />,
    moveToAvailable: <ChevronLeft className={ICON_CLASS} />,
    moveAllToAvailable: <ChevronsLeft className={ICON_CLASS} />,
    moveTop: <ChevronsUp className={ICON_CLASS} />,
    moveUp: <ChevronUp className={ICON_CLASS} />,
    moveDown: <ChevronDown className={ICON_CLASS} />,
    moveBottom: <ChevronsDown className={ICON_CLASS} />,
};

type DualListBoxProps = {
    id: string;
    options: SelectOption[];
    /** Selected option values. Values are numbers or strings, as the options give them. */
    value: (number | string)[];
    onChange: (value: (number | string)[]) => void;
    hasError?: boolean;
};

/**
 * Two lists with filter boxes and move buttons, built on react-dual-listbox.
 * Styled through the `.react-dual-listbox` rules in `resources/css/app.css`.
 */
export function DualListBox({
    id,
    options,
    value,
    onChange,
    hasError = false,
}: DualListBoxProps) {
    return (
        <ReactDualListBox
            id={id}
            options={options}
            selected={value}
            onChange={onChange}
            icons={ICONS}
            canFilter
            showHeaderLabels
            showNoOptionsText
            className={cn(hasError && 'rdl-has-error')}
        />
    );
}
