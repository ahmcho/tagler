<?php

namespace App\Modules\Settings\Services;

use App\Modules\Settings\Enums\InputValueTypeEnum;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryContract;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class SettingService implements SettingServiceContract
{
    private const string CACHE_KEY = 'settings:all';

    private const int ICON_SIZE = 32;

    public function __construct(private readonly SettingRepositoryContract $settingRepository) {}

    public function all(): array
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn () => $this->settingRepository->allKeyed()
                ->map(fn (Setting $setting) => $setting->typedValue())
                ->all(),
        );
    }

    public function tabs(): array
    {
        return collect(SettingKeyEnum::cases())
            ->groupBy(fn (SettingKeyEnum $key) => $key->tab())
            ->map(fn ($keys, string $tab) => [
                'value' => $tab,
                'label' => __("translations.settings.groups.{$tab}.title"),
                'icon' => $keys->first()->tabIcon(),
            ])
            ->values()
            ->all();
    }

    public function fields(): array
    {
        $values = $this->all();

        return array_map(
            fn (SettingKeyEnum $key) => [
                'key' => $key->value,
                'label' => $key->label(),
                'description' => $key->description(),
                'tab' => $key->tab(),
                'input' => $key->input(),
                'value' => $values[$key->value] ?? $key->defaultValue(),
                'required' => $key->isRequired(),
            ],
            SettingKeyEnum::cases(),
        );
    }

    public function get(SettingKeyEnum|string $key, mixed $default = null): mixed
    {
        $keyValue = $key instanceof SettingKeyEnum ? $key->value : $key;
        $value = $this->all()[$keyValue] ?? null;

        if ($value !== null) {
            return $value;
        }

        return $default ?? ($key instanceof SettingKeyEnum ? $key->defaultValue() : null);
    }

    public function string(SettingKeyEnum|string $key, string $default = ''): string
    {
        $value = $this->get($key);

        return is_scalar($value) ? (string) $value : $default;
    }

    public function integer(SettingKeyEnum|string $key, int $default = 0): int
    {
        $value = $this->get($key);

        return is_numeric($value) ? (int) $value : $default;
    }

    public function boolean(SettingKeyEnum|string $key, bool $default = false): bool
    {
        $value = $this->get($key);

        return is_scalar($value) ? filter_var($value, FILTER_VALIDATE_BOOLEAN) : $default;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    public function setMany(array $values): void
    {
        foreach ($values as $key => $value) {
            $settingKey = SettingKeyEnum::from($key);

            if ($settingKey->type() === InputValueTypeEnum::File) {
                if (! $value instanceof UploadedFile) {
                    continue;
                }

                $value = $this->replaceFile($settingKey, $value);
            }

            $this->write($settingKey, $value);
        }

        $this->forgetCache();
    }

    /**
     * Resets a file setting to its bundled default and deletes the uploaded file.
     */
    public function resetFile(SettingKeyEnum $key): void
    {
        $this->deleteUploadedFile($key);

        $this->write($key, $key->defaultValue());

        $this->forgetCache();
    }

    public function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    private function replaceFile(SettingKeyEnum $key, UploadedFile $file): string
    {
        $this->deleteUploadedFile($key);

        return $this->storeIcon($file);
    }

    /**
     * A stored value starting with "/" is a bundled public asset and is never deleted.
     */
    private function deleteUploadedFile(SettingKeyEnum $key): void
    {
        $path = $this->settingRepository->allKeyed()->get($key->value)?->value;

        if ($path !== null && ! str_starts_with($path, '/')) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Resizes the upload to a square PNG. Every file setting is treated as a 32x32 icon for now.
     */
    private function storeIcon(UploadedFile $file): string
    {
        $source = imagecreatefromstring((string) $file->get());
        $canvas = imagecreatetruecolor(self::ICON_SIZE, self::ICON_SIZE);

        if ($source === false || $canvas === false) {
            throw new RuntimeException('Uploaded icon is not a valid image.');
        }

        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, self::ICON_SIZE, self::ICON_SIZE, imagesx($source), imagesy($source));

        ob_start();
        imagepng($canvas);
        $png = ob_get_clean();

        $path = 'settings/'.Str::uuid().'.png';
        Storage::disk('public')->put($path, $png);

        return $path;
    }

    private function write(SettingKeyEnum $key, mixed $value): void
    {
        $this->settingRepository->updateOrCreate(
            key: $key->value,
            type: $key->type(),
            value: $this->encode($value),
        );
    }

    private function encode(mixed $value): ?string
    {
        return is_scalar($value) || $value === null ? (string) $value : json_encode($value, JSON_THROW_ON_ERROR);
    }
}
