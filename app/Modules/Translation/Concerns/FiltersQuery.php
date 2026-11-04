<?php

namespace App\Modules\Translation\Concerns;

/**
 * Non-null and non-empty validated values, for display back to the
 * frontend (the Inertia `filters` prop echoes the current search state).
 */
trait FiltersQuery
{
    /**
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        $filters = array_filter(
            $this->validated(),
            fn (mixed $value): bool => $value !== null && $value !== '',
        );

        if (in_array($this->query('sort'), $this->sortable(), true)) {
            $filters['sort'] = $this->query('sort');
            $filters['direction'] = strtolower((string) $this->query('direction')) === 'desc' ? 'desc' : 'asc';
        }

        return $filters;
    }
}
