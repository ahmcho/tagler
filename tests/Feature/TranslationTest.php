<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Translation\Models\Translation;
use Illuminate\Support\Arr;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    Translation::query()->delete();
});

function translationManager(): User
{
    (new RolesAndPermissionsSeeder)->run();

    $user = User::factory()->create();
    $user->assignRole('Admin');

    return $user;
}

test('guests are redirected to the login page', function (): void {
    $this->get(route('translations.index'))->assertRedirect(route('login'));
});

test('a user without a confirmed password is redirected to confirm it', function (): void {
    $this->actingAs(translationManager())
        ->get(route('translations.index'))
        ->assertRedirect(route('password.confirm'));
});

test('a user without the translation permissions is forbidden', function (): void {
    (new RolesAndPermissionsSeeder)->run();

    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index'))
        ->assertForbidden();
});

test('a user with view permission but not update permission cannot edit', function (): void {
    (new RolesAndPermissionsSeeder)->run();

    $user = User::factory()->create();
    $user->givePermissionTo('translations.index');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index'))
        ->assertOk();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.edit', ['translations', 'common.save']))
        ->assertForbidden();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('translations.update', ['translations', 'common.save']), [
            'translations' => ['en' => 'Save'],
        ])
        ->assertForbidden();
});

test('a manager can view the translations list', function (): void {
    $manager = translationManager();

    Translation::create([
        'lang' => 'en',
        'group' => 'translations',
        'key' => 'common.save',
        'value' => 'Save',
    ]);

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('translations/index')
            ->has('records.data', 1)
            ->where('records.data.0.key', 'common.save')
            ->where('groups', ['auth', 'pagination', 'passwords', 'validation', 'translations']),
        );
});

test('the index lists tables and filters by an exact table match', function (): void {
    $manager = translationManager();

    Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'users.title', 'value' => 'Users']);
    Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'users_roles.title', 'value' => 'Roles']);
    Translation::create(['lang' => 'en', 'group' => 'auth', 'key' => 'failed', 'value' => 'Failed']);

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index', ['table' => 'users']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('tables', ['users'])
            ->has('records.data', 1)
            ->where('records.data.0.key', 'users.title'),
        );
});

test('the filters prop is a JSON object even when no filter is applied', function (): void {
    $manager = translationManager();

    $response = $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index'))
        ->assertOk();

    expect($response->viewData('page')['props']['filters'])->toBeInstanceOf(stdClass::class);
});

test('the index sorts by a sortable column and echoes the sort in filters', function (): void {
    $manager = translationManager();

    Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'a.first', 'value' => 'First']);
    Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'b.second', 'value' => 'Second']);

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index', ['sort' => 'key', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'key')
            ->where('filters.direction', 'desc')
            ->where('records.data.0.key', 'b.second')
            ->where('records.data.1.key', 'a.first'),
        );
});

test('a partial reload of the index returns only the records and filters', function (): void {
    $manager = translationManager();

    Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'a.first', 'value' => 'First']);

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index', ['sort' => 'key', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->reloadOnly(['records', 'filters', 'status'], fn (Assert $reload) => $reload
                ->has('records.data', 1)
                ->missing('groups')
                ->missing('tables'),
            ),
        );
});

test('a manager can open the edit form for a key', function (): void {
    $manager = translationManager();

    Translation::create(['lang' => 'az', 'group' => 'translations', 'key' => 'common.save', 'value' => 'Yadda saxla']);

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.edit', ['translations', 'common.save']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('translations/edit')
            ->where('group', 'translations')
            ->where('translationKey', 'common.save')
            ->where('values.az', 'Yadda saxla')
            ->where('values.en', null),
        );
});

test('a manager can update a translation for every supported locale', function (): void {
    $manager = translationManager();

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('translations.update', ['translations', 'common.save']), [
            'translations' => [
                'az' => 'Yadda saxla',
                'en' => 'Save',
                'ru' => 'Сохранить',
            ],
        ])
        ->assertRedirect(route('translations.index'));

    expect(Translation::where('group', 'translations')->where('key', 'common.save')->where('lang', 'az')->value('value'))
        ->toBe('Yadda saxla')
        ->and(Translation::where('group', 'translations')->where('key', 'common.save')->where('lang', 'en')->value('value'))
        ->toBe('Save')
        ->and(Translation::where('group', 'translations')->where('key', 'common.save')->where('lang', 'ru')->value('value'))
        ->toBe('Сохранить');
});

test('an unknown locale code is rejected', function (): void {
    $manager = translationManager();

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('translations.update', ['translations', 'common.save']), [
            'translations' => ['fr' => 'Bonjour'],
        ])
        ->assertSessionHasErrors('translations.fr');
});

test('database translation overrides file translation', function (): void {
    app()->setLocale('en');

    Translation::create([
        'lang' => 'en',
        'group' => 'auth',
        'key' => 'failed',
        'value' => 'Database Value',
    ]);

    expect(__('auth.failed'))->toBe('Database Value');
});

test('saving a translation invalidates the cached value so a fresh value is served', function (): void {
    app()->setLocale('en');

    __('auth.failed');

    Translation::create([
        'lang' => 'en',
        'group' => 'auth',
        'key' => 'failed',
        'value' => 'Fresh Value',
    ]);

    expect(__('auth.failed'))->toBe('Fresh Value');
});

test('table is the key prefix only when it names a real table in the translations group', function (): void {
    $tableTranslation = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'users.title', 'value' => 'Users']);
    $authTranslation = Translation::create(['lang' => 'en', 'group' => 'auth', 'key' => 'failed', 'value' => 'Failed']);
    $unknownTranslation = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'nope.title', 'value' => 'Nope']);
    $flatTranslation = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'flat', 'value' => 'Flat']);

    expect($tableTranslation->fresh()->table)->toBe('users')
        ->and($authTranslation->fresh()->table)->toBeNull()
        ->and($unknownTranslation->fresh()->table)->toBeNull()
        ->and($flatTranslation->fresh()->table)->toBeNull();
});

test('package translations still use the file system only', function (): void {
    expect(__('fortify::auth.failed'))->toBeString();
});

test('fallback to file when database is missing a key', function (): void {
    expect(__('validation.required'))->toBeString();
});

test('trans_choice works with database translations', function (): void {
    Translation::create([
        'lang' => 'en',
        'group' => 'translations',
        'key' => 'test.items',
        'value' => '{0} No items|{1} One item|[2,*] Many items',
    ]);

    expect(trans_choice('translations.test.items', 0))->toContain('No items')
        ->and(trans_choice('translations.test.items', 1))->toContain('One item')
        ->and(trans_choice('translations.test.items', 5))->toContain('Many items');
});

test('placeholder replacement works with database translations', function (): void {
    Translation::create([
        'lang' => 'en',
        'group' => 'translations',
        'key' => 'test.welcome',
        'value' => 'Welcome, :name!',
    ]);

    expect(__('translations.test.welcome', ['name' => 'Ahmad']))->toBe('Welcome, Ahmad!');
});

test('a missing key returns the key itself', function (): void {
    expect(__('nonexistent.key'))->toBe('nonexistent.key');
});

test('a user with only view permission is forbidden from resetting translations', function (): void {
    (new RolesAndPermissionsSeeder)->run();

    $user = User::factory()->create();
    $user->givePermissionTo('translations.index');

    $row = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'common.save', 'value' => 'Changed']);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('translations.reset'), ['ids' => [$row->id]])
        ->assertForbidden();

    expect($row->fresh()->value)->toBe('Changed');
});

test('a manager resets a checked key to its file value in every locale', function (): void {
    $manager = translationManager();

    $rows = collect(['en', 'az', 'ru'])->map(fn (string $locale) => Translation::create([
        'lang' => $locale,
        'group' => 'translations',
        'key' => 'common.save',
        'value' => 'Changed',
    ]));

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('translations.reset'), ['ids' => [$rows->first()->id]])
        ->assertRedirect()
        ->assertSessionHas('status', __('translations.translation.reset_result', ['reset' => 1, 'skipped' => 0]));

    foreach (['en', 'az', 'ru'] as $locale) {
        expect(Translation::where('group', 'translations')->where('key', 'common.save')->where('lang', $locale)->value('value'))
            ->toBe(Arr::get(include lang_path("{$locale}/translations.php"), 'common.save'));
    }
});

test('a key with no file value is skipped and keeps its database value', function (): void {
    $manager = translationManager();

    $row = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'database.only', 'value' => 'Only in database']);

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('translations.reset'), ['ids' => [$row->id]])
        ->assertSessionHas('status', __('translations.translation.reset_result', ['reset' => 0, 'skipped' => 1]));

    expect($row->fresh()->value)->toBe('Only in database');
});

test('reset rejects an empty, unknown or oversized selection', function (array $ids, string $errorKey): void {
    $manager = translationManager();

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('translations.reset'), ['ids' => $ids])
        ->assertSessionHasErrors($errorKey);
})->with([
    'empty selection' => [[], 'ids'],
    'unknown id' => [[999999], 'ids.0'],
    'more than 200 ids' => [range(1, 201), 'ids'],
]);
