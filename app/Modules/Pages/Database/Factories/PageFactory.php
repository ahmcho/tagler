<?php

namespace App\Modules\Pages\Database\Factories;

use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Pages\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Creates the locale-independent page row. Use `Tests\Support\PageFixtures` to add a translation too.
 *
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'status' => PageStatus::Published,
            'is_homepage' => false,
            'layout' => null,
            'published_at' => now()->subDay(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => PageStatus::Draft, 'published_at' => null]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (): array => ['status' => PageStatus::Scheduled, 'published_at' => now()->addDay()]);
    }

    public function homepage(): static
    {
        return $this->state(fn (): array => ['is_homepage' => true]);
    }
}
