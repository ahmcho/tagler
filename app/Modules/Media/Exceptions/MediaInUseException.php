<?php

namespace App\Modules\Media\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

/**
 * A file that other records still use cannot be trashed or purged without force.
 */
class MediaInUseException extends RuntimeException
{
    public function __construct(
        public readonly int $references,
    ) {
        parent::__construct(__('media.errors.in_use', ['count' => $references]), Response::HTTP_CONFLICT);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'references' => $this->references,
        ], Response::HTTP_CONFLICT);
    }
}
