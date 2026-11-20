<?php

namespace App\Modules\Settings\Services\Contracts;

use App\Modules\Settings\Enums\SettingInputEnum;
use App\Modules\Settings\Enums\SettingKeyEnum;

interface SettingServiceContract
{
    /**
     * @return array<string, string|int|bool|array<array-key, mixed>|null>
     */
    public function all(): array;

    /**
     * The tabs of the application settings page, one per tab name in SettingKeyEnum.
     *
     * @return array<int, array{value: string, label: string, icon: string}>
     */
    public function tabs(): array;

    /**
     * One descriptor per SettingKeyEnum case, in declaration order.
     *
     * @return array<int, array{key: string, label: string, description: string, tab: string, input: SettingInputEnum, value: string|int|bool|array<array-key, mixed>|null, required: bool}>
     */
    public function fields(): array;

    public function get(SettingKeyEnum|string $key, mixed $default = null): mixed;

    public function string(SettingKeyEnum|string $key, string $default = ''): string;

    public function integer(SettingKeyEnum|string $key, int $default = 0): int;

    public function boolean(SettingKeyEnum|string $key, bool $default = false): bool;

    /**
     * @param  array<string, mixed>  $values
     */
    public function setMany(array $values): void;

    public function resetFile(SettingKeyEnum $key): void;

    /**
     * Drops the cached settings.
     */
    public function forgetCache(): void;
}
