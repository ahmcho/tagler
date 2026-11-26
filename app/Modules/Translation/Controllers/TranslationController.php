<?php

namespace App\Modules\Translation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Translation\Enums\TranslationGroupEnum;
use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Requests\ResetTranslationsRequest;
use App\Modules\Translation\Requests\TranslationRequest;
use App\Modules\Translation\Resources\TranslationResource;
use App\Modules\Translation\Services\Contracts\TranslationServiceContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class TranslationController extends Controller
{
    public function __construct(private readonly TranslationServiceContract $service)
    {
        $this->authorizeResource(Translation::class, 'translation');
    }

    public function index(TranslationRequest $request): Response
    {
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
            'tables' => fn () => $this->service->getDistinctTables(lang: app()->getLocale()),
            'filters' => (object) $request->filters(),
            'status' => session('status'),
        ]);
    }

    public function edit(string $group, string $key): Response
    {
        return Inertia::render('translations/edit', [
            'model' => ['id' => $group.'.'.$key],
            'group' => $group,
            'translationKey' => $key,
            'locales' => config('app.supported_locales'),
            'values' => $this->service->getTranslationsForKey(group: $group, key: $key),
        ]);
    }

    public function update(TranslationRequest $request, string $group, string $key): RedirectResponse
    {
        $payload = $request->validated();

        $this->service->saveTranslationsForKey(group: $group, key: $key, valuesByLocale: $payload['translations']);

        return Redirect::route('translations.index')->with('status', __('translations.common.operation_success'));
    }

    public function reset(ResetTranslationsRequest $request): RedirectResponse
    {
        $counts = $this->service->resetToFileDefaults(ids: $request->validated('ids'));

        return Redirect::back()->with('status', __('translations.translation.reset_result', $counts));
    }

    /**
     * The `can` middleware checks `reset` against the `update` policy method.
     *
     * @return array<string, string>
     */
    protected function resourceAbilityMap(): array
    {
        return array_merge(parent::resourceAbilityMap(), [
            'reset' => 'update',
        ]);
    }

    /**
     * Translation routes use a group and key, not a model, so the policy gets the class name.
     *
     * @return list<string>
     */
    protected function resourceMethodsWithoutModels(): array
    {
        return array_merge(parent::resourceMethodsWithoutModels(), ['edit', 'update', 'reset']);
    }
}
