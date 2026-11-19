<?php

namespace App\Modules\Auth\Concerns;

trait HasOptions
{
    /**
     * @return array<int|string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $enumCase): array => [$enumCase->value => $enumCase->label()])
            ->all();
    }
}
