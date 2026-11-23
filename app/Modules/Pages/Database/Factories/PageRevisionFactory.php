<?php

namespace App\Modules\Pages\Database\Factories;

use App\Modules\Pages\Models\PageRevision;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * A revision with one default-locale translation. Pass `page_id` to attach it to a page.
 *
 * @extends Factory<PageRevision>
 */
class PageRevisionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'snapshot' => [
                'status' => 'published',
                'parent_id' => null,
                'publish_date' => null,
                'publish_time' => null,
                'layout' => null,
                'translations' => [
                    config('app.locale') => [
                        'title' => fake()->sentence(3),
                        'subtitle' => null,
                        'slug' => fake()->unique()->slug(2),
                        'seo_title' => null,
                        'seo_description' => null,
                        'content' => ['version' => 1, 'sections' => []],
                    ],
                ],
            ],
        ];
    }
}
