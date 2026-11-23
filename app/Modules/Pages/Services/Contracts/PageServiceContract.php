<?php

namespace App\Modules\Pages\Services\Contracts;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Support\PagePath;
use Crud\Services\Contracts\BaseCrudServiceContract;
use Illuminate\Database\Eloquent\Model;

interface PageServiceContract extends BaseCrudServiceContract
{
    /**
     * @param  array{status: string, parent_id?: int|null, published_at?: string|null, layout?: string|null, translations: array<string, array<string, mixed>>}  $payload
     */
    public function create(array $payload): Model;

    /**
     * @param  array{status: string, parent_id?: int|null, published_at?: string|null, layout?: string|null, translations: array<string, array<string, mixed>>}  $payload
     */
    public function update(int|Model $modelOrModelId, array $payload): Model;

    /**
     * Makes the page the only homepage. The page must be live.
     */
    public function assignHomepage(Page $page): Page;

    public function publish(Page $page): Page;

    public function unpublish(Page $page): Page;

    /**
     * The path a page with this parent and slug gets in this locale, or null when the slug is invalid or too deep.
     */
    public function resolvePath(string $locale, ?int $parentId, string $slug): ?PagePath;

    /**
     * Whether the parent has a translation in this locale. A child cannot exist in a locale its parent lacks.
     */
    public function parentHasLocale(?int $parentId, string $locale): bool;

    public function pathIsTaken(string $locale, PagePath $path, ?int $ignorePageId = null): bool;
}
