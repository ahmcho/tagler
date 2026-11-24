<?php

namespace App\Modules\Media\Resources;

use App\Modules\Media\Models\Media;
use App\Modules\Media\Services\MediaUrlService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Never exposes the disk or the physical path.
 *
 * @mixin Media
 */
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'extension' => $this->extension,
            'size' => $this->size,
            'category' => $this->category->value,
            'title' => $this->title,
            'alt_text' => $this->alt_text,
            'description' => $this->description,
            'folder_id' => $this->folder_id,
            'visibility' => $this->visibility->value,
            'processing_status' => $this->processing_status->value,
            'processing_error' => $this->processing_error,
            'dimensions' => $this->when(
                isset($this->metadata['width'], $this->metadata['height']),
                fn (): array => ['width' => $this->metadata['width'], 'height' => $this->metadata['height']],
            ),
            'url' => app(MediaUrlService::class)->publicUrl($this->resource),
            'download_url' => route('media.files.download', ['file' => $this->uuid]),
            'thumbnail_url' => app(MediaUrlService::class)->conversionUrl($this->resource, 'thumbnail'),
            'uploaded_by' => $this->whenLoaded('uploader', fn (): ?array => $this->uploader
                ? ['id' => $this->uploader->id, 'name' => $this->uploader->name]
                : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
