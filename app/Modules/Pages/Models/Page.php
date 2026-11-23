<?php

namespace App\Modules\Pages\Models;

use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Pages\Database\Factories\PageFactory;
use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Settings\Concerns\HasLocalDates;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Locale-independent page data. Titles, slugs, paths and content live in
 * PageTranslation, one row per locale.
 *
 * @property int $id
 * @property int|null $parent_id
 * @property PageStatus $status
 * @property bool $is_homepage
 * @property string|null $layout
 * @property CarbonInterface|null $published_at
 * @property-read Collection<int, PageTranslation> $translations
 */
#[Table(name: 'pages')]
#[UseFactory(PageFactory::class)]
#[Fillable(['parent_id', 'status', 'layout', 'published_at'])]
class Page extends Model
{
    use HasActivityLogs, HasFactory, HasLocalDates;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PageStatus::class,
            'is_homepage' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Whether visitors may see the page at the given moment. Pure check, no
     * query. The repository applies the same rule in SQL.
     */
    public function isLive(CarbonInterface $now): bool
    {
        if (! in_array($this->status, [PageStatus::Published, PageStatus::Scheduled], true)) {
            return false;
        }

        return $this->published_at === null || $this->published_at->lessThanOrEqualTo($now);
    }

    /**
     * The translation for one locale. Needs the `translations` relation loaded.
     * Never falls back to another locale: a missing translation means the page
     * does not exist in that locale.
     */
    public function translationFor(string $locale): ?PageTranslation
    {
        return $this->translations->firstWhere('locale', $locale);
    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<self, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * @return HasMany<PageTranslation, $this>
     */
    public function translations(): HasMany
    {
        return $this->hasMany(PageTranslation::class);
    }
}
