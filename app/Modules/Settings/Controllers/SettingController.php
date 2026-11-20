<?php

namespace App\Modules\Settings\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Enums\InputValueTypeEnum;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Requests\SettingUpdateRequest;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class SettingController extends Controller
{
    public function __construct(private readonly SettingServiceContract $settingService) {}

    /**
     * Show the application settings page.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Setting::class);

        return Inertia::render('settings/application', [
            'tabs' => $this->settingService->tabs(),
            'fields' => $this->settingService->fields(),
        ]);
    }

    /**
     * Save the application settings.
     */
    public function update(SettingUpdateRequest $request): RedirectResponse
    {
        $this->authorize('update', Setting::class);

        $this->settingService->setMany($request->validated('settings'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('translations.common.operation_success')]);

        return to_route('settings.index');
    }

    /**
     * Reset a file setting to its bundled default.
     */
    public function resetFile(SettingKeyEnum $key): RedirectResponse
    {
        $this->authorize('update', Setting::class);

        abort_unless($key->type() === InputValueTypeEnum::File, HttpResponse::HTTP_NOT_FOUND);

        $this->settingService->resetFile($key);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('translations.common.operation_success')]);

        return to_route('settings.index');
    }
}
