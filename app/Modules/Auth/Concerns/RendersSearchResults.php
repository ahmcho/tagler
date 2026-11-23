<?php

namespace App\Modules\Auth\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

/**
 * Shapes one page of a search as `{data, has_more}`, the shape the async select reads.
 */
trait RendersSearchResults
{
    /**
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @param  class-string  $resource
     */
    private function searchResponse(LengthAwarePaginator $paginator, string $resource): JsonResponse
    {
        return response()->json([
            'data' => $resource::collection($paginator->items())->resolve(),
            'has_more' => $paginator->hasMorePages(),
        ]);
    }
}
