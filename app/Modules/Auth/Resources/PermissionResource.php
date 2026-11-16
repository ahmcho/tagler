<?php

namespace App\Modules\Auth\Resources;

use App\Modules\Auth\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Permission
 */
class PermissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'guard_name' => $this->guard_name,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->map(fn ($role): array => [
                'id' => $role->id,
                'name' => $role->name,
            ])->values()),
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
