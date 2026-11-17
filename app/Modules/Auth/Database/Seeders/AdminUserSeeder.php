<?php

namespace App\Modules\Auth\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Creates the admin account from the module config (ADMIN_EMAIL and ADMIN_PASSWORD) and assigns the
     * Admin role. Skips with a warning when either value is missing. An existing account keeps its password.
     */
    public function run(): void
    {
        $email = config('modules.auth.admin_email');
        $password = config('modules.auth.admin_password');

        if (! $email || ! $password) {
            $this->command?->warn('Set ADMIN_EMAIL and ADMIN_PASSWORD to create the admin account.');

            return;
        }

        $role = config('modules.auth.admin_role_name');

        $user = User::query()->where('email', $email)->first();

        if ($user !== null) {
            $user->assignRole($role);
            $this->command?->info('Admin account already exists.');

            return;
        }

        User::factory()->create([
            'name' => $email,
            'email' => $email,
            'password' => $password,
        ])->assignRole($role);

        $this->command?->info('Admin account created.');
    }
}
