<?php

namespace App\Modules\Pages\Models;

use App\Models\User;
use App\Modules\Pages\Database\Factories\PageRevisionFactory;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A saved copy of a page's locale-independent data and every translation, taken on each explicit save.
 *
 * @property int $id
 * @property int $page_id
 * @property int|null $user_id
 * @property array<string, mixed> $snapshot
 * @property CarbonInterface $created_at
 */
#[Table(name: 'page_revisions')]
#[UseFactory(PageRevisionFactory::class)]
#[Fillable(['page_id', 'user_id', 'snapshot'])]
class PageRevision extends Model
{
    /** @use HasFactory<PageRevisionFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @return BelongsTo<Page, $this>
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
