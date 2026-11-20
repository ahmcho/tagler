<?php

namespace App\Modules\Settings\Requests;

use App\Modules\Settings\Enums\SettingKeyEnum;
use Crud\Requests\AppFormRequest;

class SettingUpdateRequest extends AppFormRequest
{
    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        $rules = ['settings' => ['required', 'array']];

        foreach (SettingKeyEnum::cases() as $key) {
            $rules['settings.'.$key->value] = $key->rules();
        }

        return $rules;
    }
}
