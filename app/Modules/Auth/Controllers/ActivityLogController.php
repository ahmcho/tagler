<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Concerns\RendersPaginatedRecords;
use App\Modules\Auth\Models\ActivityLog;
use App\Modules\Auth\Requests\ActivityLogRequest;
use App\Modules\Auth\Resources\ActivityLogResource;
use App\Modules\Auth\Services\Contracts\ActivityLogServiceContract;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    use RendersPaginatedRecords;

    public function __construct(private readonly ActivityLogServiceContract $service) {}

    public function index(ActivityLogRequest $request): Response
    {
        Gate::authorize('viewAny', ActivityLog::class);

        $filters = $request->filters();

        $paginator = $this->service->getAllPaginated(filters: $filters, perPage: 20);

        return Inertia::render('activity-logs/index', [
            'records' => $this->paginatedRecords($paginator, ActivityLogResource::class),
            'filters' => (object) $filters,
        ]);
    }
}
