<?php

use App\Models\User;
use App\Modules\Auth\Models\ActivityLog;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Policies\ActivityLogPolicy;
use App\Modules\Auth\Policies\PermissionPolicy;
use App\Modules\Auth\Policies\RolePolicy;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Models\MediaFolder;
use App\Modules\Media\Policies\MediaFolderPolicy;
use App\Modules\Media\Policies\MediaPolicy;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Policies\PagePolicy;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Policies\SettingPolicy;
use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Policies\TranslationPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;

test('each model resolves to its policy without a manual registration', function (string $model, string $policy): void {
    expect(Gate::getPolicyFor($model))->toBeInstanceOf($policy);
})->with([
    [User::class, UserPolicy::class],
    [Role::class, RolePolicy::class],
    [Permission::class, PermissionPolicy::class],
    [ActivityLog::class, ActivityLogPolicy::class],
    [Media::class, MediaPolicy::class],
    [MediaFolder::class, MediaFolderPolicy::class],
    [Page::class, PagePolicy::class],
    [Setting::class, SettingPolicy::class],
    [Translation::class, TranslationPolicy::class],
]);
