<?php

use App\Modules\Auth\Controllers\ActivityLogController;
use App\Modules\Auth\Controllers\PermissionController;
use App\Modules\Auth\Controllers\RoleController;
use App\Modules\Auth\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth'])->group(function (): void {
    Route::resource('roles', RoleController::class)
        ->names('roles')
        ->parameters(['roles' => 'role']);

    Route::get('roles-search', [RoleController::class, 'search'])->name('roles.search');
    Route::get('roles-permissions-search', [RoleController::class, 'permissionsSearch'])->name('roles.permissions-search');

    Route::get('permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::get('permissions-search', [PermissionController::class, 'search'])->name('permissions.search');
    Route::get('permissions/{permission}', [PermissionController::class, 'show'])->name('permissions.show');

    Route::resource('users', UserController::class)
        ->names('users')
        ->parameters(['users' => 'user'])
        ->only(['index', 'show', 'create', 'store', 'edit', 'update', 'destroy']);

    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('activity-logs/{activityLog}', [ActivityLogController::class, 'show'])->name('activity-logs.show');
});
