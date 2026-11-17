<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Concerns\RendersPaginatedRecords;
use App\Modules\Auth\Concerns\RendersSearchResults;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Requests\RoleRequest;
use App\Modules\Auth\Resources\PermissionSearchResource;
use App\Modules\Auth\Resources\RoleResource;
use App\Modules\Auth\Resources\RoleSearchResource;
use App\Modules\Auth\Services\Contracts\PermissionServiceContract;
use App\Modules\Auth\Services\Contracts\RoleServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    use RendersPaginatedRecords, RendersSearchResults;

    public function __construct(
        private readonly RoleServiceContract $service,
        private readonly PermissionServiceContract $permissionService,
    ) {
        $this->authorizeResource(Role::class, 'role');
    }

    /**
     * @return array<string, string>
     */
    protected function resourceAbilityMap(): array
    {
        return array_merge(parent::resourceAbilityMap(), [
            'search' => 'viewAny',
            'permissionsSearch' => 'searchPermissions',
        ]);
    }

    /**
     * @return list<string>
     */
    protected function resourceMethodsWithoutModels(): array
    {
        return array_merge(parent::resourceMethodsWithoutModels(), ['search', 'permissionsSearch']);
    }

    public function index(RoleRequest $request): Response
    {
        $paginator = $this->service->getAllPaginated(
            requestParser: $request->parser(),
            columns: ['id', 'name', 'guard_name', 'created_at'],
            relations: ['permissions'],
        );

        return Inertia::render('roles/index', [
            'roles' => $this->paginatedRecords($paginator, RoleResource::class),
            'filters' => (object) $request->filters(),
            'selectedPermission' => $this->selectedOption(
                id: $request->validated('permission'),
                resolve: fn (int $id) => PermissionSearchResource::make($this->permissionService->findById($id, columns: ['id', 'name', 'description'])),
            ),
            'status' => session('status'),
        ]);
    }

    /**
     * Async search for the role pickers (roles index and user filters).
     */
    public function search(Request $request): JsonResponse
    {
        $roles = $this->service->search(term: (string) $request->query('q', ''));

        return $this->searchResponse(paginator: $roles, resource: RoleSearchResource::class);
    }

    /**
     * Async search for the permission picker on the role form. Checked against
     * the role policy, so users who manage roles can pick permissions without
     * permissions.index.
     */
    public function permissionsSearch(Request $request): JsonResponse
    {
        $permissions = $this->permissionService->search(term: (string) $request->query('q', ''));

        return $this->searchResponse(paginator: $permissions, resource: PermissionSearchResource::class);
    }

    /**
     * @param  callable(int): mixed  $resolve
     * @return array<string, mixed>|null
     */
    private function selectedOption(?int $id, callable $resolve): ?array
    {
        return $id === null ? null : $resolve($id)->resolve();
    }

    public function create(): Response
    {
        $model = new Role;
        $model->setRelation('permissions', collect());

        return Inertia::render('roles/create', [
            'model' => RoleResource::make($model)->resolve(),
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return Redirect::route('roles.index')->with('status', __('translations.common.operation_success'));
    }

    public function show(Role $role): Response
    {
        return Inertia::render('roles/show', [
            'role' => RoleResource::make($role->load('permissions'))->resolve(),
        ]);
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('roles/edit', [
            'model' => RoleResource::make($role->load('permissions'))->resolve(),
        ]);
    }

    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        $this->service->update($role, $request->validated());

        return Redirect::route('roles.index')->with('status', __('translations.common.operation_success'));
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->service->delete($role);

        return Redirect::route('roles.index')->with('status', __('translations.common.operation_success'));
    }
}
