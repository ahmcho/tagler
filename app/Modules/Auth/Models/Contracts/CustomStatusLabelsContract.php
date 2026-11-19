<?php

namespace App\Modules\Auth\Models\Contracts;

interface CustomStatusLabelsContract
{
    /**
     * Returns a map of enum backing value => model-specific label
     *
     * @return array<int, string>
     */
    public static function statusLabels(): array;
}
