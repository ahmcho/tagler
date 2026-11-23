<?php

use App\Modules\Translation\Concerns\HasTranslations;
use App\Modules\Translation\Models\ModelTranslation;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

function translatableUser(): Model
{
    return new #[Table(name: 'users')] class extends Model
    {
        use HasTranslations;

        public static function translatableFields(): array
        {
            return ['name'];
        }
    };
}

function translationRow(string $locale, string $field, string $value): ModelTranslation
{
    return new ModelTranslation(['locale' => $locale, 'field' => $field, 'value' => $value]);
}

test('t() returns the value for the requested locale', function (): void {
    $model = translatableUser();
    $model->setRelation('translations', collect([
        translationRow('az', 'name', 'Ad'),
        translationRow('en', 'name', 'Name'),
    ]));

    expect($model->t('name', 'az'))->toBe('Ad');
});

test('t() falls back to the fallback locale when the requested locale has no row', function (): void {
    config(['app.fallback_locale' => 'en']);

    $model = translatableUser();
    $model->setRelation('translations', collect([
        translationRow('en', 'name', 'Name'),
    ]));

    expect($model->t('name', 'ru'))->toBe('Name');
});

test('t() returns null when the translations relation is not loaded', function (): void {
    expect(translatableUser()->t('name', 'en'))->toBeNull();
});

test('translationsMap() groups loaded translations by locale and field', function (): void {
    $model = translatableUser();
    $model->setRelation('translations', collect([
        translationRow('az', 'name', 'Ad'),
        translationRow('en', 'name', 'Name'),
    ]));

    expect($model->translationsMap())->toBe([
        'az' => ['name' => 'Ad'],
        'en' => ['name' => 'Name'],
    ]);
});
