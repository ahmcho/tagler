<?php

namespace App\Modules\Media\Database\Factories;

use App\Modules\Media\Enums\MediaProcessingStatusEnum;
use App\Modules\Media\Enums\MediaVisibilityEnum;
use App\Modules\Media\Models\Media;
use App\Modules\Settings\Enums\AllowedMimeTypesEnum;
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
            'path' => 'media/'.$uuid.'.'.AllowedMimeTypesEnum::Jpeg->extension(),
            'original_name' => fake()->word().'.'.AllowedMimeTypesEnum::Jpeg->extension(),
            'file_name' => $uuid.'.'.AllowedMimeTypesEnum::Jpeg->extension(),
            'mime_type' => AllowedMimeTypesEnum::Jpeg->value,
            'extension' => AllowedMimeTypesEnum::Jpeg->extension(),
            'size' => fake()->numberBetween(1_000, 5_000_000),
            'checksum' => hash('sha256', $uuid),
            'metadata' => [],
            'visibility' => MediaVisibilityEnum::Private,
            'processing_status' => MediaProcessingStatusEnum::Ready,
            'uploaded_by' => null,
        ];
    }

    public function public(): static
    {
        return $this->state(fn (): array => ['visibility' => MediaVisibilityEnum::Public]);
    }

    public function pdf(): static
    {
        return $this->state(fn (): array => [
            'mime_type' => AllowedMimeTypesEnum::Pdf->value,
            'extension' => AllowedMimeTypesEnum::Pdf->extension(),
            'original_name' => fake()->word().'.'.AllowedMimeTypesEnum::Pdf->extension(),
        ]);
    }
}
