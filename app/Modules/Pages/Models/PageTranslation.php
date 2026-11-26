<?php

namespace App\Modules\Pages\Models;

use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Pages\Database\Factories\PageTranslationFactory;
use App\Modules\Pages\Enums\BodyFormatEnum;
use App\Modules\Pages\Support\MarkdownRenderer;
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
 * and the HTML body. Each locale has its own slugs and paths.
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
 * @property string|null $body The body as written: sanitised HTML, or Markdown
 * @property BodyFormatEnum $body_format
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 */
#[Table(name: 'page_translations')]
#[UseFactory(PageTranslationFactory::class)]
#[Fillable(['page_id', 'locale', 'title', 'subtitle', 'slug', 'path', 'seo_title', 'seo_description', 'body', 'body_format'])]
class PageTranslation extends Model
{
    /** @use HasFactory<PageTranslationFactory> */
    use HasActivityLogs, HasFactory, HasLocalDates;

    /**
     * The HTML a visitor sees. Markdown bodies are rendered here, so the stored text stays as written.
     */
    public function renderedBody(): ?string
    {
        if ($this->body === null || $this->body === '') {
            return null;
        }

        return $this->body_format === BodyFormatEnum::Markdown
            ? app(MarkdownRenderer::class)->render($this->body)
            : $this->body;
    }

    /**
     * @return BelongsTo<Page, $this>
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    protected function casts(): array
    {
        return [
            'body_format' => BodyFormatEnum::class,
        ];
    }
}
