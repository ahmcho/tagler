<?php

use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;

if (! function_exists('setting')) {
    /**
     * Without a key, returns the setting service. With a key, returns that setting's value.
     *
     * @return ($key is null ? SettingServiceContract : mixed)
     */
    function setting(SettingKeyEnum|string|null $key = null, mixed $default = null): mixed
    {
        $settingService = app(SettingServiceContract::class);

        if ($key === null) {
            return $settingService;
        }

        return $settingService->get($key, $default);
    }
}
