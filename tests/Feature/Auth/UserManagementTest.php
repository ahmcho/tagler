<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('an Admin can open the user list', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('users/index'));
});

test('an Admin can create a user with roles', function (): void {
    $userRoleId = Role::findByName('User', 'web')->id;

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('users.store'), [
            'name' => 'New Person',
            'email' => 'new@example.com',
            'password' => 'Secret-Passw0rd!',
            'password_confirmation' => 'Secret-Passw0rd!',
            'roles' => [$userRoleId],
        ])
        ->assertRedirect(route('users.index'));

    $created = User::query()->where('email', 'new@example.com')->firstOrFail();

    expect($created->hasRole('User'))->toBeTrue()
        ->and(Hash::check('Secret-Passw0rd!', $created->password))->toBeTrue()
        ->and($created->email_verified_at)->not->toBeNull();
});

test('creating a user requires at least one role', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('users.store'), [
            'name' => 'New Person',
            'email' => 'new@example.com',
            'password' => 'Secret-Passw0rd!',
            'password_confirmation' => 'Secret-Passw0rd!',
            'roles' => [],
        ])
        ->assertSessionHasErrors('roles');
});

test('updating a user without a password keeps the current password', function (): void {
    $user = User::factory()->create();
    $user->assignRole('User');
    $passwordBefore = $user->password;

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('users.update', $user), [
            'name' => 'Renamed',
            'email' => $user->email,
            'password' => '',
            'roles' => [Role::findByName('User', 'web')->id],
        ])
        ->assertRedirect(route('users.index'));

    expect($user->fresh()->name)->toBe('Renamed')
        ->and($user->fresh()->password)->toBe($passwordBefore);
});

test('an Admin can remove the Admin role from a user when another Admin remains', function (): void {
    $otherAdmin = User::factory()->create();
    $otherAdmin->assignRole('Admin');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('users.update', $otherAdmin), [
            'name' => $otherAdmin->name,
            'email' => $otherAdmin->email,
            'roles' => [Role::findByName('User', 'web')->id],
        ])
        ->assertRedirect(route('users.index'));

    expect($otherAdmin->fresh()->hasRole('Admin'))->toBeFalse();
});

test('the last Admin cannot lose the Admin role', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('users.update', $this->admin), [
            'name' => $this->admin->name,
            'email' => $this->admin->email,
            'roles' => [Role::findByName('User', 'web')->id],
        ])
        ->assertSessionHasErrors('roles');

    expect($this->admin->fresh()->hasRole('Admin'))->toBeTrue();
});

test('an Admin can delete a user who is not the last Admin', function (): void {
    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('users.destroy', $user))
        ->assertRedirect(route('users.index'));

    expect(User::query()->whereKey($user->id)->exists())->toBeFalse();
});

test('the last Admin cannot be deleted', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('users.destroy', $this->admin))
        ->assertForbidden();

    expect(User::query()->whereKey($this->admin->id)->exists())->toBeTrue();
});

test('the last Admin cannot delete their own account from the profile page', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertRedirect(route('profile.edit'))
        ->assertSessionHasErrors('password');

    expect(User::query()->whereKey($this->admin->id)->exists())->toBeTrue();
});

test('a user without users.destroy cannot delete a user', function (): void {
    $user = User::factory()->create();
    $user->assignRole('User');
    $target = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('users.destroy', $target))
        ->assertForbidden();

    expect(User::query()->whereKey($target->id)->exists())->toBeTrue();
});

test('an Admin can open a user detail page', function (): void {
    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('users/show')
            ->where('user.roles.0.name', 'User'));
});

test('a user without users.show cannot open a user detail page', function (): void {
    $viewer = User::factory()->create();
    $viewer->assignRole('User');
    $target = User::factory()->create();

    $this->actingAs($viewer)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.show', $target))
        ->assertForbidden();
});

test('the user list can be filtered to users that hold a role', function (): void {
    $member = User::factory()->create(['name' => 'Role Member']);
    $member->assignRole('User');
    $other = User::factory()->create(['name' => 'Other Person']);
    $other->assignRole('Admin');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.index', ['role' => Role::findByName('User', 'web')->id]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.name', 'Role Member')
            ->where('selectedRole.name', 'User'));
});

test('the user create page receives an empty model and the edit page receives the bound user', function (): void {
    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.create'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('users/create')
            ->where('model.id', null)
            ->has('model.roles', 0)
            ->has('roles'));

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('users.edit', $user))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('users/edit')
            ->where('model.id', $user->id)
            ->where('model.roles.0.name', 'User')
            ->has('roles'));
});
