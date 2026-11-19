<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\Concerns\RendersPaginatedRecords;
use App\Modules\Auth\Requests\UserRequest;
use App\Modules\Auth\Resources\RoleResource;
use App\Modules\Auth\Resources\RoleSearchResource;
use App\Modules\Auth\Resources\UserResource;
use App\Modules\Auth\Services\Contracts\RoleServiceContract;
use App\Modules\Auth\Services\Contracts\UserServiceContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use RendersPaginatedRecords;

    public function __construct(
        private readonly UserServiceContract $service,
        private readonly RoleServiceContract $roleService,
    ) {}

    public function index(UserRequest $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $paginator = $this->service->getAllPaginated(
            requestParser: $request->parser(),
            columns: ['id', 'name', 'email', 'status', 'created_at'],
            relations: ['roles'],
        );

        return Inertia::render('users/index', [
            'users' => $this->paginatedRecords($paginator, UserResource::class),
            'filters' => (object) $request->filters(),
            'selectedRole' => $this->selectedRole($request->validated('role')),
            'status' => session('status'),
        ]);
    }

    public function show(User $user): Response
    {
        Gate::authorize('view', $user);

        return Inertia::render('users/show', [
            'user' => UserResource::make($user->load('roles'))->resolve(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        $model = new User;
        $model->setRelation('roles', collect());

        return Inertia::render('users/create', [
            'model' => UserResource::make($model)->resolve(),
            'roles' => $this->roleOptions(),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $this->service->create($request->validated());

        return Redirect::route('users.index')->with('status', __('translations.common.operation_success'));
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('users/edit', [
            'model' => UserResource::make($user->load('roles'))->resolve(),
            'roles' => $this->roleOptions(),
        ]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $this->service->update($user, $request->validated());

        return Redirect::route('users.index')->with('status', __('translations.common.operation_success'));
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        $this->service->delete($user);

        return Redirect::route('users.index')->with('status', __('translations.common.operation_success'));
    }

    /**
     * @return array<string, mixed>|null
     */
    private function selectedRole(?int $roleId): ?array
    {
        return $roleId === null ? null : RoleSearchResource::make($this->roleService->findById($roleId, columns: ['id', 'name']))->resolve();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function roleOptions(): array
    {
        return RoleResource::collection($this->roleService->getAll(columns: ['id', 'name']))->resolve();
    }
}
