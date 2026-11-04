<?php

namespace App\Modules\Translation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Translation\Enums\TranslationGroupEnum;
use App\Modules\Translation\Requests\TranslationRequest;
use App\Modules\Translation\Resources\TranslationResource;
use App\Modules\Translation\Services\Contracts\TranslationServiceContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class TranslationController extends Controller
{
    public function __construct(private readonly TranslationServiceContract $service) {}

    public function index(TranslationRequest $request): Response
    {
        Gate::authorize('translations.index');

        $paginator = $this->service->getAllPaginated(
            requestParser: $request->parser(),
            columns: ['id', 'lang', 'group', 'table', 'key', 'value', 'updated_at'],
            conditions: [['lang', '=', app()->getLocale()]],
        );

        return Inertia::render('translations/index', [
            'records' => [
                'data' => TranslationResource::collection($paginator->items())->resolve(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
            'groups' => array_map(fn (TranslationGroupEnum $group) => $group->value, TranslationGroupEnum::cases()),
            'tables' => $this->service->getDistinctTables(lang: app()->getLocale()),
            'filters' => $request->filters(),
            'status' => session('status'),
        ]);
    }

    public function edit(string $group, string $key): Response
    {
        Gate::authorize('translations.update');

        return Inertia::render('translations/edit', [
            'group' => $group,
            'translationKey' => $key,
            'locales' => config('app.supported_locales'),
            'values' => $this->service->getTranslationsForKey(group: $group, key: $key),
        ]);
    }

    public function update(TranslationRequest $request, string $group, string $key): RedirectResponse
    {
        Gate::authorize('translations.update');

        $payload = $request->validated();

        $this->service->saveTranslationsForKey(group: $group, key: $key, valuesByLocale: $payload['translations']);

        return Redirect::route('translations.index')->with('status', __('translations.common.operation_success'));
    }
}
