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

    /**
     * @return array<string, string>
     */
    protected function resourceAbilityMap(): array
    {
        return array_merge(parent::resourceAbilityMap(), [
            'move' => 'update',
        ]);
    }

    public function index(): JsonResponse
    {
        return MediaFolderResource::collection($this->service->allFolders())->response();
    }

    public function store(MediaFolderRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $folder = $this->service->create(
            $request->validated('name'),
            $request->validated('parent_id'),
            $user,
        );

        return MediaFolderResource::make($folder)->response()->setStatusCode(201);
    }

    public function update(MediaFolderRequest $request, MediaFolder $folder): JsonResponse
    {
        $folder = $this->service->rename($folder, $request->validated('name'));

        return MediaFolderResource::make($folder)->response();
    }

    public function move(MediaFolderMoveRequest $request, MediaFolder $folder): JsonResponse
    {
        $folder = $this->service->move($folder, $request->validated('parent_id'));

        return MediaFolderResource::make($folder)->response();
    }

    public function destroy(MediaFolder $folder): Response
    {
        $this->service->delete($folder);

        return response()->noContent();
    }
}
