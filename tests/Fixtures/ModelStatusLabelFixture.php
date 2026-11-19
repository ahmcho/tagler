<?php

namespace Tests\Fixtures;

use App\Modules\Auth\Enums\ModelStatusEnum;
use App\Modules\Auth\Models\Contracts\CustomStatusLabelsContract;

class ModelStatusLabelFixture implements CustomStatusLabelsContract
{
    /**
     * @return array<int, string>
     */
    public static function statusLabels(): array
    {
        return [
            ModelStatusEnum::Inactive->value => 'Passive',
        ];
    }
}
