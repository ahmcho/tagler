<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Concerns\RendersPaginatedRecords;
use App\Modules\Auth\Concerns\RendersSearchResults;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Requests\RoleRequest;
use App\Modules\Auth\Resources\PermissionResource;
use App\Modules\Auth\Resources\PermissionSearchResource;
use App\Modules\Auth\Resources\RoleResource;
use App\Modules\Auth\Resources\RoleSearchResource;
use App\Modules\Auth\Services\Contracts\PermissionServiceContract;
use App\Modules\Auth\Services\Contracts\RoleServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    use RendersPaginatedRecords, RendersSearchResults;

    public function __construct(
        private readonly RoleServiceContract $service,
        private readonly PermissionServiceContract $permissionService,
    ) {}

    public function index(RoleRequest $request): Response
    {
        Gate::authorize('viewAny', Role::class);

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
        Gate::authorize('viewAny', Role::class);

        $roles = $this->service->search(term: (string) $request->query('q', ''));

        return $this->searchResponse(paginator: $roles, resource: RoleSearchResource::class);
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
        Gate::authorize('create', Role::class);

        return Inertia::render('roles/create', [
            'permissions' => $this->permissionOptions(),
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        Gate::authorize('create', Role::class);

        $this->service->create($request->validated());

        return Redirect::route('roles.index')->with('status', __('translations.common.operation_success'));
    }

    public function show(Role $role): Response
    {
        Gate::authorize('view', $role);

        return Inertia::render('roles/show', [
            'role' => RoleResource::make($role->load('permissions'))->resolve(),
        ]);
    }

    public function edit(Role $role): Response
    {
        Gate::authorize('update', $role);

        return Inertia::render('roles/edit', [
            'role' => RoleResource::make($role->load('permissions'))->resolve(),
            'permissions' => $this->permissionOptions(),
        ]);
    }

    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        Gate::authorize('update', $role);

        $this->service->update($role, $request->validated());

        return Redirect::route('roles.index')->with('status', __('translations.common.operation_success'));
    }

    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('delete', $role);

        $this->service->delete($role);

        return Redirect::route('roles.index')->with('status', __('translations.common.operation_success'));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function permissionOptions(): array
    {
        return PermissionResource::collection($this->permissionService->getAll(
            columns: ['id', 'name', 'description', 'guard_name', 'created_at'],
        ))->resolve();
    }
}
