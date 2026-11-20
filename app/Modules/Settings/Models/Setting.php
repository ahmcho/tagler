<?php

namespace App\Modules\Settings\Models;

use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Settings\Enums\InputValueTypeEnum;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 * @property InputValueTypeEnum $type
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable(['key', 'value', 'type'])]
class Setting extends Model
{
    use HasActivityLogs;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => InputValueTypeEnum::class,
        ];
    }

    /**
     * Casts the stored value to its declared PHP type. A File value is resolved to a root-relative URL,
     * unless it is a bundled public asset path that starts with "/".
     *
     * @return string|int|bool|array<array-key, mixed>|null
     */
    public function typedValue(): string|int|bool|array|null
    {
        return match ($this->type) {
            InputValueTypeEnum::Integer => $this->value !== null ? (int) $this->value : null,
            InputValueTypeEnum::Boolean => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            InputValueTypeEnum::Json => $this->value !== null ? json_decode($this->value, true) : null,
            InputValueTypeEnum::String => $this->value,
            InputValueTypeEnum::File => $this->value === null || str_starts_with($this->value, '/')
                ? $this->value
                : '/storage/'.$this->value,
        };
    }
}
