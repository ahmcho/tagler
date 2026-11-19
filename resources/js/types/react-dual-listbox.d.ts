declare module 'react-dual-listbox' {
    import type { ComponentType, ReactNode } from 'react';

    export type DualListBoxOption = {
        value: number | string;
        label: string;
        disabled?: boolean;
    };

    export type DualListBoxIcons = Partial<
        Record<
            | 'moveToAvailable'
            | 'moveAllToAvailable'
            | 'moveToSelected'
            | 'moveAllToSelected'
            | 'moveBottom'
            | 'moveDown'
            | 'moveUp'
            | 'moveTop',
            ReactNode
        >
    >;

    export type DualListBoxProps = {
        options: DualListBoxOption[];
        selected: (number | string)[];
        onChange: (selected: (number | string)[]) => void;
        id?: string;
        name?: string;
        className?: string;
        disabled?: boolean;
        required?: boolean;
        canFilter?: boolean;
        showHeaderLabels?: boolean;
        showNoOptionsText?: boolean;
        icons?: DualListBoxIcons;
    };

    const ReactDualListBox: ComponentType<DualListBoxProps>;

    export default ReactDualListBox;
}
