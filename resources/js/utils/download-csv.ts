const formulaPrefixes = ['=', '+', '-', '@'];

function escapeCsvValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    let text = String(value);

    if (formulaPrefixes.some((prefix) => text.startsWith(prefix))) {
        text = `'${text}`;
    }

    if (/[",\r\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

export function downloadCsv<Row extends object>(
    filename: string,
    rows: Row[],
    columns: (keyof Row & string)[],
): void {
    const lines = [
        columns.join(','),
        ...rows.map((row) =>
            columns.map((column) => escapeCsvValue(row[column])).join(','),
        ),
    ];

    const blob = new Blob(['﻿', lines.join('\r\n')], {
        type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}
