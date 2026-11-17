<?php

use App\Modules\Auth\Controllers\ActivityLogController;
use App\Modules\Auth\Controllers\PermissionController;
use App\Modules\Auth\Controllers\RoleController;
use App\Modules\Auth\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'password.confirm'])->group(function () {
    Route::resource('settings/roles', RoleController::class)
        ->names('roles')
        ->parameters(['roles' => 'role']);

    Route::get('settings/roles-search', [RoleController::class, 'search'])->name('roles.search');
    Route::get('settings/roles-permissions-search', [RoleController::class, 'permissionsSearch'])->name('roles.permissions-search');

    Route::get('settings/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::get('settings/permissions-search', [PermissionController::class, 'search'])->name('permissions.search');
    Route::get('settings/permissions/{permission}', [PermissionController::class, 'show'])->name('permissions.show');

    Route::resource('settings/users', UserController::class)
        ->names('users')
        ->parameters(['users' => 'user'])
        ->only(['index', 'show', 'create', 'store', 'edit', 'update', 'destroy']);

    Route::get('settings/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});
