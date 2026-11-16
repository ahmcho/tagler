<?php

namespace App\Modules\Auth\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Shapes a paginator into the `records` prop used by the list pages.
 */
trait RendersPaginatedRecords
{
    /**
     * @param  class-string  $resource
     * @return array{data: array<int, mixed>, current_page: int, last_page: int, total: int}
     */
    private function paginatedRecords(LengthAwarePaginator $paginator, string $resource): array
    {
        return [
            'data' => $resource::collection($paginator->items())->resolve(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'total' => $paginator->total(),
        ];
    }
}
