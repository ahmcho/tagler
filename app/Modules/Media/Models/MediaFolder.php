<?php

namespace App\Modules\Media\Models;

use App\Models\User;
use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Media\Database\Factories\MediaFolderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A logical folder. Folders are an adjacency list and never map to a storage path.
 *
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property int|null $created_by
 */
#[Table(name: 'media_folders')]
#[UseFactory(MediaFolderFactory::class)]
#[Fillable(['parent_id', 'name', 'created_by'])]
class MediaFolder extends Model
{
    /** @use HasFactory<MediaFolderFactory> */
    use HasActivityLogs, HasFactory;

    /**
     * @return BelongsTo<MediaFolder, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'parent_id');
    }

    /**
     * @return HasMany<MediaFolder, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(MediaFolder::class, 'parent_id');
    }

    /**
     * @return HasMany<Media, $this>
     */
    public function files(): HasMany
    {
        return $this->hasMany(Media::class, 'folder_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
