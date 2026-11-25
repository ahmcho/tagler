<?php

namespace App\Modules\Pages\Database\Factories;

use App\Modules\Pages\Models\PageTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

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
        $slug = fake()->unique()->slug(2);

        return [
            'locale' => config('app.locale'),
            'title' => fake()->sentence(3),
            'subtitle' => null,
            'slug' => $slug,
            'path' => $slug,
            'seo_title' => null,
            'seo_description' => null,
            'body' => '<p>'.fake()->paragraph().'</p>',
        ];
    }
}
