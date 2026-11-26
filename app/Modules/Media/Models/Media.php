<?php

namespace App\Modules\Media\Models;

use App\Models\User;
use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Media\Database\Factories\MediaFactory;
use App\Modules\Media\Enums\MediaCategoryEnum;
use App\Modules\Media\Enums\MediaProcessingStatusEnum;
use App\Modules\Media\Enums\MediaVisibilityEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes as HasSoftDeletes;

/**
 * A stored file. The physical path is server-generated; `original_name` is display only.
 *
 * @property int $id
 * @property string $uuid Public identifier used in references and editor content
 * @property string $disk
 * @property string $path
 * @property string $original_name
 * @property string $file_name
 * @property string $mime_type
 * @property string $extension
 * @property int $size
 * @property string $checksum
 * @property string|null $collection
 * @property int|null $folder_id
 * @property string|null $title
 * @property string|null $alt_text
 * @property string|null $description
 * @property array<string, mixed> $metadata
 * @property MediaVisibilityEnum $visibility
 * @property int|null $link_ttl_minutes Lifetime of signed links in minutes. Null uses the global setting.
 * @property MediaProcessingStatusEnum $processing_status
 * @property string|null $processing_error
 * @property int|null $uploaded_by
 */
#[Table(name: 'media')]
#[UseFactory(MediaFactory::class)]
#[Fillable(['title', 'alt_text', 'description', 'folder_id', 'visibility', 'link_ttl_minutes'])]
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasActivityLogs, HasFactory, HasSoftDeletes;

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'link_ttl_minutes' => 'integer',
            'metadata' => 'array',
            'visibility' => MediaVisibilityEnum::class,
            'processing_status' => MediaProcessingStatusEnum::class,
        ];
    }

    /**
     * @return BelongsTo<MediaFolder, $this>
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'folder_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * @return Attribute<MediaCategoryEnum, never>
     */
    protected function category(): Attribute
    {
        return Attribute::get(fn (): MediaCategoryEnum => MediaCategoryEnum::fromMimeType($this->mime_type));
    }
}
