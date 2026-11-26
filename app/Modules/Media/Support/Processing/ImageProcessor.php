<?php

namespace App\Modules\Media\Support\Processing;

use App\Modules\Media\Models\Media;
use App\Modules\Settings\Enums\AllowedMimeTypesEnum;
use GdImage;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Reads image dimensions and writes resized copies next to the original.
 * GD decodes JPEG, PNG and GIF only, so other formats are left to the fallback processor.
 */
class ImageProcessor implements MediaProcessorContract
{
    public function supports(Media $media): bool
    {
        return array_key_exists($media->mime_type, [
            AllowedMimeTypesEnum::Jpeg->value => AllowedMimeTypesEnum::Jpeg->extension(),
            AllowedMimeTypesEnum::Png->value => AllowedMimeTypesEnum::Png->extension(),
            AllowedMimeTypesEnum::Gif->value => AllowedMimeTypesEnum::Gif->extension(),
        ]) && function_exists('imagecreatefromstring');
    }

    /**
     * @return array{width: int, height: int, conversions: array<string, array{path: string, mime_type: string, width: int, height: int}>}
     */
    public function process(Media $media): array
    {
        $disk = Storage::disk($media->disk);
        $bytes = $disk->get($media->path);

        $info = @getimagesizefromstring($bytes);
        $source = @imagecreatefromstring($bytes);

        if ($info === false || $source === false) {
            throw new RuntimeException('The image could not be decoded.');
        }

        [$width, $height] = [imagesx($source), imagesy($source)];
        $conversions = [];

        foreach (config('modules.media.image_conversions', []) as $name => $maxSide) {
            $conversions[$name] = $this->writeConversion($media, $source, $width, $height, $name, (int) $maxSide);
        }

        return ['width' => $width, 'height' => $height, 'conversions' => $conversions];
    }

    /**
     * Fits the longest side into the limit. Images are never enlarged.
     *
     * @return array{path: string, mime_type: string, width: int, height: int}
     */
    private function writeConversion(Media $media, GdImage $source, int $width, int $height, string $name, int $maxSide): array
    {
        $scale = min(1, $maxSide / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));

        $target = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagefill($target, 0, 0, imagecolorallocatealpha($target, 0, 0, 0, 127));
        imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        // GIF is re-encoded as PNG because GD writes only single-frame GIFs.
        $isJpeg = $media->mime_type === AllowedMimeTypesEnum::Jpeg->value;
        $mimeType = $isJpeg ? AllowedMimeTypesEnum::Jpeg->value : AllowedMimeTypesEnum::Png->value;
        $extension = $isJpeg ? AllowedMimeTypesEnum::Jpeg->extension() : AllowedMimeTypesEnum::Png->extension();

        ob_start();

        if ($isJpeg) {
            imagejpeg($target, null, 85);
        } else {
            imagepng($target, null, 6);
        }

        $encoded = (string) ob_get_clean();

        $path = dirname($media->path).'/'.$media->uuid.'-'.$name.'.'.$extension;
        Storage::disk($media->disk)->put($path, $encoded);

        return ['path' => $path, 'mime_type' => $mimeType, 'width' => $targetWidth, 'height' => $targetHeight];
    }
}
