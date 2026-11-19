<?php

namespace App\Modules\Auth\Enums\Contracts;

interface LabelContract
{
    /**
     * Returns the label of the enum case, resolved against the model's custom labels when given
     */
    public function label(?string $modelClass = null): string;
}
