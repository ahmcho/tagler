<?php

namespace App\Modules\Translation\Requests;

use App\Modules\Translation\Concerns\FiltersQuery;
use Crud\Requests\AppFormRequest;
use Illuminate\Contracts\Validation\Validator;

class TranslationRequest extends AppFormRequest
{
    use FiltersQuery;

    protected ?string $sortBy = '-updated_at';

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return match ($this->scenario) {
            self::SCENARIO_UPDATE => [
                'translations' => 'required|array',
                'translations.*' => 'nullable|string',
            ],
            default => [
                'id' => 'integer|nullable',
                'lang' => 'string|nullable',
                'group' => 'string|nullable',
                'table' => 'alpha_dash|nullable',
                'key' => 'string|nullable',
            ],
        };
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        if ($this->scenario !== self::SCENARIO_UPDATE) {
            return;
        }

        $validator->after(function (Validator $validator): void {
            $allowedCodes = array_column(config('app.supported_locales'), 'code');
            $unknownCodes = array_diff(array_keys($this->input('translations', [])), $allowedCodes);

            foreach ($unknownCodes as $unknownCode) {
                $validator->errors()->add("translations.{$unknownCode}", __('translations.translation.unknown_lang_code'));
            }
        });
    }

    /**
     * @return array<int, string>
     */
    protected function sortable(): array
    {
        return ['id', 'lang', 'group', 'table', 'key', 'updated_at'];
    }
}
