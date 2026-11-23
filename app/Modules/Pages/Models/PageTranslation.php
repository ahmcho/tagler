<?php

namespace App\Modules\Pages\Models;

use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Pages\Database\Factories\PageTranslationFactory;
use App\Modules\Settings\Concerns\HasLocalDates;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The per-locale part of a page: title, slug and the path built from it, SEO
 * and the content document. Each locale has its own slugs and paths.
 *
 * @property int $id
 * @property int $page_id
 * @property string $locale
 * @property string $title
 * @property string|null $subtitle
 * @property string $slug
 * @property string $path
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property array<string, mixed> $content
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 */
#[Table(name: 'page_translations')]
#[UseFactory(PageTranslationFactory::class)]
#[Fillable(['page_id', 'locale', 'title', 'subtitle', 'slug', 'path', 'seo_title', 'seo_description', 'content'])]
class PageTranslation extends Model
{
    use HasActivityLogs, HasFactory, HasLocalDates;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Page, $this>
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }
}
