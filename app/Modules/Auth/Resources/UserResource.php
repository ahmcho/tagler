<?php

namespace App\Modules\Auth\Resources;

use App\Models\User;
use App\Modules\Settings\Support\LocalDateFormatter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->map(fn (Model $role): array => [
                'id' => $role->getKey(),
                'name' => $role->getAttribute('name'),
            ])->values()),
            'created_at' => $this->created_at ? LocalDateFormatter::dateTime($this->created_at) : null,
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
            ],
        ];
    }
}
