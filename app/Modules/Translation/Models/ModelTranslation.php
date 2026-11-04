<?php

namespace App\Modules\Translation\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property string $translatable_type
 * @property int $translatable_id
 * @property string $locale
 * @property string $field
 * @property string $value
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Model $translatable
 */
#[Fillable(['translatable_type', 'translatable_id', 'locale', 'field', 'value'])]
class ModelTranslation extends Model
{
    /**
     * @return MorphTo<Model, $this>
     */
    public function translatable(): MorphTo
    {
        return $this->morphTo();
    }
}
