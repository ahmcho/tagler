<?php

namespace App\Modules\Translation\Resources;

use App\Modules\Translation\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Translation
 */
class TranslationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lang' => $this->lang,
            'group' => $this->group,
            'table' => $this->table,
            'key' => $this->key,
            'value' => $this->value,
            'updated_at' => $this->updated_at,
        ];
    }
}
