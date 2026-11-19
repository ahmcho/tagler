<?php

namespace App\Modules\Auth\Enums\Contracts;

interface BadgeContract extends LabelContract
{
    /**
     * Returns the badge variant class of the enum case
     */
    public function badgeClass(): string;
}
