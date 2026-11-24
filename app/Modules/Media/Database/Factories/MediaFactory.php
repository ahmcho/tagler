<?php

namespace App\Modules\Media\Database\Factories;

use App\Modules\Media\Enums\MediaProcessingStatus;
use App\Modules\Media\Enums\MediaVisibility;
use App\Modules\Media\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Creates a file row only. Tests that need bytes on disk should use the upload service.
 *
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uuid = (string) Str::uuid();

        return [
            'uuid' => $uuid,
            'disk' => 'local',
            'path' => 'media/'.$uuid.'.jpg',
            'original_name' => fake()->word().'.jpg',
            'file_name' => $uuid.'.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size' => fake()->numberBetween(1_000, 5_000_000),
            'checksum' => hash('sha256', $uuid),
            'metadata' => [],
            'visibility' => MediaVisibility::Private,
            'processing_status' => MediaProcessingStatus::Ready,
            'uploaded_by' => null,
        ];
    }

    public function public(): static
    {
        return $this->state(fn (): array => ['visibility' => MediaVisibility::Public]);
    }

    public function pdf(): static
    {
        return $this->state(fn (): array => [
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'original_name' => fake()->word().'.pdf',
        ]);
    }
}
