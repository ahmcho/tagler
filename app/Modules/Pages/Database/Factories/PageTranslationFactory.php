<?php

namespace App\Modules\Pages\Database\Factories;

use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Support\PageContentDocument;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PageTranslation>
 */
class PageTranslationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $slug = Str::slug(fake()->unique()->words(2, true));

        return [
            'locale' => config('app.locale'),
            'title' => fake()->sentence(3),
            'subtitle' => null,
            'slug' => $slug,
            'path' => $slug,
            'seo_title' => null,
            'seo_description' => null,
            'content' => PageContentDocument::empty(),
        ];
    }
}
