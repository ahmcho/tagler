<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\AdminUserSeeder;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('the admin seeder creates the admin account with the Admin role', function (): void {
    config([
        'modules.auth.admin_email' => 'owner@example.test',
        'modules.auth.admin_password' => 'secret-pass',
    ]);

    $this->seed(AdminUserSeeder::class);

    $admin = User::query()->where('email', 'owner@example.test')->firstOrFail();

    expect($admin->hasRole('Admin'))->toBeTrue()
        ->and(Hash::check('secret-pass', $admin->password))->toBeTrue();
});

test('the admin seeder keeps the password of an existing admin account', function (): void {
    $existing = User::factory()->create(['email' => 'owner@example.test']);
    $originalPassword = $existing->password;

    config([
        'modules.auth.admin_email' => 'owner@example.test',
        'modules.auth.admin_password' => 'secret-pass',
    ]);

    $this->seed(AdminUserSeeder::class);

    expect($existing->fresh()->hasRole('Admin'))->toBeTrue()
        ->and($existing->fresh()->password)->toBe($originalPassword);
});

test('the admin seeder throws and creates nothing when the email is missing', function (): void {
    config([
        'modules.auth.admin_email' => null,
        'modules.auth.admin_password' => 'secret-pass',
    ]);

    expect(fn () => $this->seed(AdminUserSeeder::class))
        ->toThrow(InvalidArgumentException::class, 'ADMIN_EMAIL');

    expect(User::query()->count())->toBe(0);
});

test('the admin seeder throws and creates nothing when the password is missing', function (): void {
    config([
        'modules.auth.admin_email' => 'owner@example.test',
        'modules.auth.admin_password' => '',
    ]);

    expect(fn () => $this->seed(AdminUserSeeder::class))
        ->toThrow(InvalidArgumentException::class, 'ADMIN_PASSWORD');

    expect(User::query()->count())->toBe(0);
});

test('the user factory role helper assigns the role after creation', function (): void {
    $user = User::factory()->role('User')->create();

    expect($user->hasRole('User'))->toBeTrue();
});
