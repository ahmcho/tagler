<?php

namespace App\Modules\Settings\Repositories;

use App\Modules\Settings\Enums\InputValueTypeEnum;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryContract;
use Illuminate\Support\Collection;

class SettingRepository implements SettingRepositoryContract
{
    /**
     * @return Collection<string, Setting>
     */
    public function allKeyed(): Collection
    {
        return Setting::query()->get()->keyBy('key');
    }

    public function updateOrCreate(string $key, InputValueTypeEnum $type, ?string $value): Setting
    {
        return Setting::query()->updateOrCreate(
            ['key' => $key],
            ['type' => $type, 'value' => $value],
        );
    }
}
