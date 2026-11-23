<?php

namespace App\Modules\Auth\Repositories;

use App\Models\User;
use App\Modules\Auth\Models\ActivityLog;
use App\Modules\Auth\Repositories\Contracts\ActivityLogRepositoryContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Reads the activity log from MongoDB. Causers are users in SQL, so they are loaded
 * with one query per page and attached to each entry.
 */
class ActivityLogRepository implements ActivityLogRepositoryContract
{
    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, ActivityLog>
     */
    public function getAllPaginated(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = ActivityLog::query()
            ->when($filters['event'] ?? null, fn (Builder $query, $event) => $query->where('event', $event))
            ->when($filters['subject_type'] ?? null, fn (Builder $query, $type) => $query->where('subject_type', $type))
            ->when($filters['subject_id'] ?? null, fn (Builder $query, $id) => $query->where('subject_id', (int) $id))
            ->when($filters['causer_id'] ?? null, fn (Builder $query, $id) => $query->where('causer_id', (int) $id));

        $sortColumn = $filters['sort'] ?? 'created_at';
        $query->orderBy($sortColumn, ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc');

        $paginator = $query->paginate($perPage);

        $this->attachCausers($paginator->getCollection());

        return $paginator;
    }

    public function findOrFail(string $id): ActivityLog
    {
        $log = ActivityLog::query()->findOrFail($id);

        $this->attachCausers(collect([$log]));

        return $log;
    }

    /**
     * @param  Collection<int, ActivityLog>  $logs
     */
    private function attachCausers(Collection $logs): void
    {
        $userMorphClass = (new User)->getMorphClass();

        $causerIds = $logs
            ->where('causer_type', $userMorphClass)
            ->pluck('causer_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $causers = $causerIds === []
            ? collect()
            : User::query()->whereIn('id', $causerIds)->get()->keyBy('id');

        $logs->each(function (ActivityLog $log) use ($causers, $userMorphClass): void {
            $log->setRelation('causer', $log->causer_type === $userMorphClass ? $causers->get($log->causer_id) : null);
        });
    }
}
