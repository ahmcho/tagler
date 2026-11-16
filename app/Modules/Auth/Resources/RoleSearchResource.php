<?php

namespace App\Modules\Auth\Resources;

use App\Modules\Auth\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Role
 */
class RoleSearchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'name' => $this->name];
    }
}
