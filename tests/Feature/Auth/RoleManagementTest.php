<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('an Admin can open the role list', function () {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('roles/index'));
});

test('a user without roles.index cannot open the role list', function () {
    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('roles.index'))
        ->assertForbidden();
});

test('an Admin can create a role with selected permissions', function () {
    $permissionIds = Permission::query()->whereIn('name', ['translations.index', 'users.index'])->pluck('id')->all();

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('roles.store'), ['name' => 'Editor', 'permissions' => $permissionIds])
        ->assertRedirect(route('roles.index'));

    $role = Role::findByName('Editor', 'web');

    expect($role->permissions->pluck('name')->sort()->values()->all())->toBe(['translations.index', 'users.index']);
});

test('creating a role requires a name', function () {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('roles.store'), ['name' => '', 'permissions' => []])
        ->assertSessionHasErrors('name');
});

test('a role must keep at least one permission', function () {
    $role = Role::findByName('User', 'web');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('roles.update', $role), ['name' => 'User', 'permissions' => []])
        ->assertSessionHasErrors('permissions');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('roles.store'), ['name' => 'Empty', 'permissions' => []])
        ->assertSessionHasErrors('permissions');

    expect(Role::query()->where('name', 'Empty')->exists())->toBeFalse();
});

test('a role name must be unique', function () {
    $permissionIds = Permission::query()->pluck('id')->take(1)->all();

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('roles.store'), ['name' => 'User', 'permissions' => $permissionIds])
        ->assertSessionHasErrors('name');
});

test('an Admin can update the permissions of a role', function () {
    $role = Role::findByName('User', 'web');
    $permissionIds = Permission::query()->where('name', 'translations.index')->pluck('id')->all();

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('roles.update', $role), ['name' => 'User', 'permissions' => $permissionIds])
        ->assertRedirect(route('roles.index'));

    expect($role->fresh()->permissions->pluck('name')->all())->toBe(['translations.index']);
});

test('the Admin role cannot be edited', function () {
    $role = Role::findByName('Admin', 'web');
    $permissionIds = Permission::query()->pluck('id')->take(1)->all();

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('roles.update', $role), ['name' => 'Renamed', 'permissions' => $permissionIds])
        ->assertForbidden();

    expect($role->fresh()->name)->toBe('Admin');
});

test('the Admin role cannot be deleted', function () {
    $role = Role::findByName('Admin', 'web');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('roles.destroy', $role))
        ->assertForbidden();

    expect(Role::query()->where('name', 'Admin')->exists())->toBeTrue();
});

test('an Admin can delete a role that is not Admin', function () {
    $role = Role::query()->create(['name' => 'Editor', 'guard_name' => 'web']);

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('roles.destroy', $role))
        ->assertRedirect(route('roles.index'));

    expect(Role::query()->whereKey($role->id)->exists())->toBeFalse();
});

test('a user without roles.store cannot create a role', function () {
    $user = User::factory()->create();
    $user->assignRole('User');
    $permissionIds = Permission::query()->pluck('id')->take(1)->all();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('roles.store'), ['name' => 'Editor', 'permissions' => $permissionIds])
        ->assertForbidden();

    expect(Role::query()->where('name', 'Editor')->exists())->toBeFalse();
});

test('an Admin can open the permission list', function () {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('permissions.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('permissions/index'));
});

test('a user without permissions.index cannot open the permission list', function () {
    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('permissions.index'))
        ->assertForbidden();
});

test('an Admin can open a permission detail page with the roles that hold it', function () {
    $permission = Permission::findByName('translations.index', 'web');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('permissions.show', $permission))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('permissions/show')
            ->where('permission.name', 'translations.index')
            ->where('permission.roles.0.name', 'Admin'));
});

test('a user without permissions.show cannot open a permission detail page', function () {
    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('permissions.show', Permission::findByName('translations.index', 'web')))
        ->assertForbidden();
});

test('the role search returns matching roles with only id and name', function () {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson(route('roles.search', ['q' => 'Us']))
        ->assertOk()
        ->assertExactJson([
            'data' => [['id' => Role::findByName('User', 'web')->id, 'name' => 'User']],
            'has_more' => false,
        ]);
});

test('the permission search returns matching permissions', function () {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson(route('permissions.search', ['q' => 'translations']))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonFragment(['name' => 'translations.update'])
        ->assertJsonPath('has_more', false);
});

test('the role list can be filtered to roles that hold a permission', function () {
    $permission = Permission::findByName('translations.update', 'web');

    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('roles.index', ['permission' => $permission->id]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('roles.total', 1)
            ->where('roles.data.0.name', 'Admin')
            ->where('selectedPermission.name', 'translations.update'));
});
