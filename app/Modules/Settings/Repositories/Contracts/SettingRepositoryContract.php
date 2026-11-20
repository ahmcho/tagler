<?php

namespace App\Modules\Settings\Repositories\Contracts;

use App\Modules\Settings\Enums\InputValueTypeEnum;
use App\Modules\Settings\Models\Setting;
use Illuminate\Support\Collection;

interface SettingRepositoryContract
{
    /**
     * @return Collection<string, Setting>
     */
    public function allKeyed(): Collection;

    public function updateOrCreate(string $key, InputValueTypeEnum $type, ?string $value): Setting;
}
