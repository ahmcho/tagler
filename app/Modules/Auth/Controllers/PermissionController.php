<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Concerns\RendersPaginatedRecords;
use App\Modules\Auth\Concerns\RendersSearchResults;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Requests\PermissionIndexRequest;
use App\Modules\Auth\Resources\PermissionResource;
use App\Modules\Auth\Resources\PermissionSearchResource;
use App\Modules\Auth\Services\Contracts\PermissionServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    use RendersPaginatedRecords, RendersSearchResults;

    public function __construct(private readonly PermissionServiceContract $service) {}

    public function show(Permission $permission): Response
    {
        Gate::authorize('view', $permission);

        return Inertia::render('permissions/show', [
            'permission' => PermissionResource::make($permission->load('roles'))->resolve(),
        ]);
    }

    /**
     * Async search for the permission filter on the roles index.
     */
    public function search(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Permission::class);

        $permissions = $this->service->search(term: (string) $request->query('q', ''));

        return $this->searchResponse(paginator: $permissions, resource: PermissionSearchResource::class);
    }

    public function index(PermissionIndexRequest $request): Response
    {
        Gate::authorize('viewAny', Permission::class);

        $paginator = $this->service->getAllPaginated(
            requestParser: $request->parser(),
            columns: ['id', 'name', 'description', 'guard_name', 'created_at'],
        );

        return Inertia::render('permissions/index', [
            'permissions' => $this->paginatedRecords($paginator, PermissionResource::class),
            'filters' => (object) $request->filters(),
        ]);
    }
}
