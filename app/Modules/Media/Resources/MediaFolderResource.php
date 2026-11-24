<?php

namespace App\Modules\Media\Resources;

use App\Modules\Media\Models\MediaFolder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MediaFolder
 */
class MediaFolderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'parent_id' => $this->parent_id,
            'files_count' => (int) ($this->files_count ?? 0),
            'bytes' => (int) ($this->files_sum_size ?? 0),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
