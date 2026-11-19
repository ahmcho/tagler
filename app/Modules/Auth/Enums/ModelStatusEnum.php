<?php

namespace App\Modules\Auth\Enums;

use App\Modules\Auth\Concerns\HasOptions;
use App\Modules\Auth\Enums\Contracts\BadgeContract;
use App\Modules\Auth\Models\Contracts\CustomStatusLabelsContract;

enum ModelStatusEnum: int implements BadgeContract
{
    use HasOptions;

    case Inactive = 0;
    case Active = 1;

    /**
     * Returns the label of the case. Uses the model's custom label when the model
     * implements CustomStatusLabelsContract and maps this case.
     */
    public function label(?string $modelClass = null): string
    {
        if ($modelClass !== null && is_subclass_of($modelClass, CustomStatusLabelsContract::class)) {
            $customLabels = $modelClass::statusLabels();

            if (array_key_exists($this->value, $customLabels)) {
                return $customLabels[$this->value];
            }
        }

        return $this->defaultLabel();
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::Inactive => 'danger',
            self::Active => 'success',
        };
    }

    private function defaultLabel(): string
    {
        return match ($this) {
            self::Inactive => __('translations.common.status_inactive'),
            self::Active => __('translations.common.status_active'),
        };
    }
}
