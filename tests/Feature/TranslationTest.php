<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Translation\Models\Translation;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Translation::query()->delete();
});

function translationManager(): User
{
    (new RolesAndPermissionsSeeder)->run();

    $user = User::factory()->create();
    $user->assignRole('Admin');

    return $user;
}

test('guests are redirected to the login page', function () {
    $this->get(route('translations.index'))->assertRedirect(route('login'));
});

test('a user without a confirmed password is redirected to confirm it', function () {
    $this->actingAs(translationManager())
        ->get(route('translations.index'))
        ->assertRedirect(route('password.confirm'));
});

test('a user without the translation permissions is forbidden', function () {
    (new RolesAndPermissionsSeeder)->run();

    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('translations.index'))
        ->assertForbidden();
});

test('a user with view permission but not update permission cannot edit', function () {
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

test('a manager can view the translations list', function () {
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

test('the index lists tables and filters by an exact table match', function () {
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

test('a manager can open the edit form for a key', function () {
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

test('a manager can update a translation for every supported locale', function () {
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

test('an unknown locale code is rejected', function () {
    $manager = translationManager();

    $this->actingAs($manager)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('translations.update', ['translations', 'common.save']), [
            'translations' => ['fr' => 'Bonjour'],
        ])
        ->assertSessionHasErrors('translations.fr');
});

test('database translation overrides file translation', function () {
    app()->setLocale('en');

    Translation::create([
        'lang' => 'en',
        'group' => 'auth',
        'key' => 'failed',
        'value' => 'Database Value',
    ]);

    expect(__('auth.failed'))->toBe('Database Value');
});

test('saving a translation invalidates the cached value so a fresh value is served', function () {
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

test('table is the key prefix only when it names a real table in the translations group', function () {
    $tableTranslation = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'users.title', 'value' => 'Users']);
    $authTranslation = Translation::create(['lang' => 'en', 'group' => 'auth', 'key' => 'failed', 'value' => 'Failed']);
    $unknownTranslation = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'nope.title', 'value' => 'Nope']);
    $flatTranslation = Translation::create(['lang' => 'en', 'group' => 'translations', 'key' => 'flat', 'value' => 'Flat']);

    expect($tableTranslation->fresh()->table)->toBe('users')
        ->and($authTranslation->fresh()->table)->toBeNull()
        ->and($unknownTranslation->fresh()->table)->toBeNull()
        ->and($flatTranslation->fresh()->table)->toBeNull();
});

test('package translations still use the file system only', function () {
    expect(__('fortify::auth.failed'))->toBeString();
});

test('fallback to file when database is missing a key', function () {
    expect(__('validation.required'))->toBeString();
});

test('trans_choice works with database translations', function () {
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

test('placeholder replacement works with database translations', function () {
    Translation::create([
        'lang' => 'en',
        'group' => 'translations',
        'key' => 'test.welcome',
        'value' => 'Welcome, :name!',
    ]);

    expect(__('translations.test.welcome', ['name' => 'Ahmad']))->toBe('Welcome, Ahmad!');
});

test('a missing key returns the key itself', function () {
    expect(__('nonexistent.key'))->toBe('nonexistent.key');
});
