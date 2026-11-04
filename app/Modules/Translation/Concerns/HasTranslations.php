<?php

namespace App\Modules\Translation\Concerns;

use App\Modules\Translation\Models\ModelTranslation;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Backs a model with per-locale field values stored in the shared
 * model_translations table. Pair with `->load('translations')` before
 * calling t(). It never queries on its own, to keep list queries N+1-free.
 */
trait HasTranslations
{
    /**
     * @return MorphMany<ModelTranslation, $this>
     */
    public function translations(): MorphMany
    {
        return $this->morphMany(ModelTranslation::class, 'translatable');
    }

    /**
     * Reads one translated field off the loaded `translations` relation,
     * falling back to the fallback locale when the requested locale has no
     * row for this field.
     *
     * Uses `config('app.fallback_locale')`, not `config('app.locale')`, so
     * the fallback never changes when the viewer's locale is applied.
     */
    public function t(string $field, ?string $locale = null): ?string
    {
        if (! $this->relationLoaded('translations')) {
            return null;
        }

        $fallbackLocale = config('app.fallback_locale');
        $locale ??= app()->getLocale();

        $translation = $this->translations
            ->first(fn (ModelTranslation $translation): bool => $translation->locale === $locale && $translation->field === $field)
            ?? $this->translations
                ->first(fn (ModelTranslation $translation): bool => $translation->locale === $fallbackLocale && $translation->field === $field);

        return $translation?->value;
    }

    /**
     * The field names this model stores translations for.
     *
     * @return array<int, string>
     */
    abstract public static function translatableFields(): array;

    /**
     * All loaded translations reshaped for an admin form: locale => [field => value].
     *
     * @return array<string, array<string, string>>
     */
    public function translationsMap(): array
    {
        return $this->translations
            ->groupBy('locale')
            ->map(fn ($group) => $group->pluck('value', 'field')->all())
            ->all();
    }
}
