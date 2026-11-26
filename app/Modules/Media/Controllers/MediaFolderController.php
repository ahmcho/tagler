<?php

namespace App\Modules\Media\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Media\Models\MediaFolder;
use App\Modules\Media\Requests\MediaFolderMoveRequest;
use App\Modules\Media\Requests\MediaFolderRequest;
use App\Modules\Media\Resources\MediaFolderResource;
use App\Modules\Media\Services\Contracts\MediaFolderServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class MediaFolderController extends Controller
{
    public function __construct(
        private readonly MediaFolderServiceContract $service,
    ) {
        $this->authorizeResource(MediaFolder::class, 'folder');
    }

    public function index(): JsonResponse
    {
        return MediaFolderResource::collection($this->service->allFolders())->response();
    }

    public function store(MediaFolderRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validated();

        $folder = $this->service->create(
            $payload['name'],
            $payload['parent_id'] ?? null,
            $user,
        );

        return MediaFolderResource::make($folder)->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(MediaFolderRequest $request, MediaFolder $folder): JsonResponse
    {
        $payload = $request->validated();

        $folder = $this->service->rename($folder, $payload['name']);

        return MediaFolderResource::make($folder)->response();
    }

    public function move(MediaFolderMoveRequest $request, MediaFolder $folder): JsonResponse
    {
        $payload = $request->validated();

        $folder = $this->service->move($folder, $payload['parent_id']);

        return MediaFolderResource::make($folder)->response();
    }

    public function destroy(MediaFolder $folder): Response
    {
        $this->service->delete($folder);

        return response()->noContent();
    }

    /**
     * @return array<string, string>
     */
    protected function resourceAbilityMap(): array
    {
        return array_merge(parent::resourceAbilityMap(), [
            'move' => 'update',
        ]);
    }
}
