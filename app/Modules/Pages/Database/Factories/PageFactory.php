<?php

namespace App\Modules\Pages\Database\Factories;

use App\Modules\Pages\Enums\PageStatusEnum;
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
            'status' => PageStatusEnum::Published,
            'is_homepage' => false,
            'layout' => null,
            'publish_date' => now()->subDay()->toDateString(),
            'publish_time' => now()->subDay()->format('H:i'),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => PageStatusEnum::Draft, 'publish_date' => null, 'publish_time' => null]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (): array => [
            'status' => PageStatusEnum::Scheduled,
            'publish_date' => now()->addDay()->toDateString(),
            'publish_time' => now()->addDay()->format('H:i'),
        ]);
    }

    public function homepage(): static
    {
        return $this->state(fn (): array => ['is_homepage' => true]);
    }
}
