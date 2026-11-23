<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Enums\ModelStatusEnum;
use App\Modules\Auth\Models\Role;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;
use Tests\Fixtures\ModelStatusLabelFixture;

test('a new user defaults to the active status before it is saved', function (): void {
    $user = new User;

    expect($user->status)->toBe(ModelStatusEnum::Active);
});

test('the status column casts to the enum', function (): void {
    $user = User::factory()->create();

    expect($user->fresh()->status)->toBe(ModelStatusEnum::Active);
});

test('the factory inactive state stores the inactive status', function (): void {
    $user = User::factory()->inactive()->create();

    expect($user->fresh()->status)->toBe(ModelStatusEnum::Inactive);
});

test('the status column defaults to active in the database', function (): void {
    DB::table('users')->insert([
        'name' => 'Raw Insert',
        'email' => 'raw-insert@example.test',
        'password' => 'not-used',
    ]);

    expect(DB::table('users')->where('email', 'raw-insert@example.test')->value('status'))
        ->toBe(ModelStatusEnum::Active->value);
});

test('label returns the default label without a model class', function (): void {
    expect(ModelStatusEnum::Active->label())->toBe('Active')
        ->and(ModelStatusEnum::Inactive->label())->toBe('Inactive');
});

test('label returns the custom label of a model that implements the contract', function (): void {
    expect(ModelStatusEnum::Inactive->label(ModelStatusLabelFixture::class))->toBe('Passive');
});

test('label falls back to the default label when the model has no custom label for the case', function (): void {
    expect(ModelStatusEnum::Active->label(ModelStatusLabelFixture::class))->toBe('Active');
});

test('label ignores a model class that does not implement the contract', function (): void {
    expect(ModelStatusEnum::Inactive->label(User::class))->toBe('Inactive');
});

test('options map each backing value to its label', function (): void {
    expect(ModelStatusEnum::options())->toBe([
        0 => 'Inactive',
        1 => 'Active',
    ]);
});

test('active status has the success badge class', function (): void {
    expect(ModelStatusEnum::Active->badgeClass())->toBe('success')
        ->and(ModelStatusEnum::Inactive->badgeClass())->toBe('danger');
});

test('an inactive user holding a session is signed out and sent to login', function (): void {
    $user = User::factory()->inactive()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('an active user holding a session stays signed in', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('dashboard'));

    $this->assertAuthenticatedAs($user);
});

test('an Admin can create a user with the inactive status', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('users.store'), [
            'name' => 'Inactive Person',
            'email' => 'inactive@example.com',
            'password' => 'Secret-Passw0rd!',
            'password_confirmation' => 'Secret-Passw0rd!',
            'roles' => [Role::findByName('User', 'web')->id],
            'status' => ModelStatusEnum::Inactive->value,
        ])
        ->assertRedirect(route('users.index'));

    expect(User::query()->where('email', 'inactive@example.com')->firstOrFail()->status)
        ->toBe(ModelStatusEnum::Inactive);
});

test('creating a user without a status gives the active status', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('users.store'), [
            'name' => 'Default Person',
            'email' => 'default@example.com',
            'password' => 'Secret-Passw0rd!',
            'password_confirmation' => 'Secret-Passw0rd!',
            'roles' => [Role::findByName('User', 'web')->id],
        ])
        ->assertRedirect(route('users.index'));

    expect(User::query()->where('email', 'default@example.com')->firstOrFail()->status)
        ->toBe(ModelStatusEnum::Active);
});

test('a status value outside the enum is rejected', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('users.store'), [
            'name' => 'Bad Status',
            'email' => 'bad-status@example.com',
            'password' => 'Secret-Passw0rd!',
            'password_confirmation' => 'Secret-Passw0rd!',
            'roles' => [Role::findByName('User', 'web')->id],
            'status' => 5,
        ])
        ->assertSessionHasErrors('status');
});

test('updating a user without a status keeps the current status', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');
    $user = User::factory()->inactive()->create();
    $user->assignRole('User');

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('users.update', $user), [
            'name' => 'Renamed Person',
            'email' => $user->email,
            'roles' => [Role::findByName('User', 'web')->id],
        ])
        ->assertRedirect(route('users.index'));

    expect($user->fresh()->status)->toBe(ModelStatusEnum::Inactive);
});

test('the user resource exposes the status of the user', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');
    $user = User::factory()->inactive()->create();

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('user.status', ModelStatusEnum::Inactive->value));
});

test('an inactive user cannot log in and gets no session', function (): void {
    $user = User::factory()->inactive()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('an active user can log in', function (): void {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect();

    $this->assertAuthenticatedAs($user);
});

test('the users index exposes the status of each user', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');
    User::factory()->inactive()->create();

    $response = $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.index'))
        ->assertOk();

    $statuses = collect($response->viewData('page')['props']['users']['data'])->pluck('status')->all();

    expect($statuses)->toEqualCanonicalizing([ModelStatusEnum::Inactive, ModelStatusEnum::Active]);
});
