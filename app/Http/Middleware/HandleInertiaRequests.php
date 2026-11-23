<?php

namespace App\Http\Middleware;

use App\Modules\Auth\Support\AbilityRegistry;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Enums\TimeFormatVariantEnum;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => setting(SettingKeyEnum::AppName),
            'favicon' => setting(SettingKeyEnum::Favicon),
            'timeHourCycle' => TimeFormatVariantEnum::tryFrom(setting()->string(SettingKeyEnum::TimeFormat))?->hourCycle() ?? 12,
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()?->getAllPermissions()->pluck('name')->sort()->values()->all() ?? [],
            ],
            'can' => fn (): array => app(AbilityRegistry::class)->resolveFor($request->user()),
        ];
    }
}
