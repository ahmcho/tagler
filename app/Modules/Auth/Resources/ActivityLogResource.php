<?php

namespace App\Modules\Auth\Resources;

use App\Models\User;
use App\Modules\Auth\Models\ActivityLog;
use App\Modules\Settings\Support\LocalDateFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ActivityLog
 */
class ActivityLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event' => $this->event,
            'description' => $this->description,
            'subject_type' => $this->subject_type,
            'subject_id' => $this->subject_id,
            'causer' => $this->causer instanceof User ? $this->causer->name : null,
            'causer_id' => $this->causer_id,
            'ip_address' => $this->ip_address,
            'changes' => $this->changes()->toArray(),
            'created_at' => $this->created_at ? LocalDateFormatter::dateTime($this->created_at) : null,
        ];
    }
}
