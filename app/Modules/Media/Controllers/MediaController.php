<?php

namespace App\Modules\Media\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Media\Enums\MediaVisibility;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Requests\MediaForceRequest;
use App\Modules\Media\Requests\MediaIndexRequest;
use App\Modules\Media\Requests\MediaMoveRequest;
use App\Modules\Media\Requests\MediaStoreRequest;
use App\Modules\Media\Requests\MediaUpdateRequest;
use App\Modules\Media\Requests\MediaVisibilityRequest;
use App\Modules\Media\Resources\MediaResource;
use App\Modules\Media\Services\Contracts\MediaServiceContract;
use App\Modules\Media\Services\MediaUrlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaServiceContract $service,
        private readonly MediaUrlService $urls,
    ) {
        $this->authorizeResource(Media::class, 'file');
    }

    /**
     * @return array<string, string>
     */
    protected function resourceAbilityMap(): array
    {
        return array_merge(parent::resourceAbilityMap(), [
            'move' => 'update',
            'visibility' => 'visibility',
            'restore' => 'restore',
            'purge' => 'forceDelete',
            'download' => 'view',
            'url' => 'view',
            'references' => 'view',
        ]);
    }

    /**
     * @return list<string>
     */
    protected function resourceMethodsWithoutModels(): array
    {
        return array_merge(parent::resourceMethodsWithoutModels(), ['stats']);
    }

    public function index(MediaIndexRequest $request): JsonResponse
    {
        $paginator = $this->service->paginateLibrary($request->filters(), $request->resultsPerPage());

        return MediaResource::collection($paginator)->response();
    }

    public function store(MediaStoreRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $media = $this->service->upload($request->file('file'), $request->validated(), $user);

        return MediaResource::make($media->load('uploader'))->response()->setStatusCode(201);
    }

    public function show(Media $file): JsonResponse
    {
        return MediaResource::make($file->load('uploader'))->response();
    }

    public function update(MediaUpdateRequest $request, Media $file): JsonResponse
    {
        $media = $this->service->update($file, $request->validated());

        return MediaResource::make($media->load('uploader'))->response();
    }

    public function destroy(MediaForceRequest $request, Media $file): Response
    {
        $this->service->trash($file, (bool) $request->validated('force'));

        return response()->noContent();
    }

    public function move(MediaMoveRequest $request, Media $file): JsonResponse
    {
        $media = $this->service->move($file, $request->validated('folder_id'));

        return MediaResource::make($media->load('uploader'))->response();
    }

    public function visibility(MediaVisibilityRequest $request, Media $file): JsonResponse
    {
        $media = $this->service->changeVisibility(
            $file,
            MediaVisibility::from($request->validated('visibility')),
        );

        return MediaResource::make($media->load('uploader'))->response();
    }

    public function restore(Media $file): JsonResponse
    {
        return MediaResource::make($this->service->restore($file)->load('uploader'))->response();
    }

    public function purge(MediaForceRequest $request, Media $file): Response
    {
        $this->service->purge($file, (bool) $request->validated('force'));

        return response()->noContent();
    }

    /**
     * Streams the file with headers that stop it running as a page. Private files are only
     * served to users with the view permission; the policy check runs on this route too.
     */
    public function download(Request $request, Media $file): HttpResponse
    {
        $disposition = $request->query('disposition') === 'inline' ? 'inline' : 'attachment';
        $cacheControl = $file->visibility === MediaVisibility::Public ? 'public, max-age=3600' : 'private, no-store';

        return Storage::disk($file->disk)->response($file->path, $file->original_name, [
            'Content-Type' => $file->mime_type,
            'Cache-Control' => $cacheControl,
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ], $disposition);
    }

    public function url(Media $file): JsonResponse
    {
        $isPublic = $file->visibility === MediaVisibility::Public;

        return response()->json([
            'url' => $isPublic ? $this->urls->publicUrl($file) : $this->urls->temporaryUrl($file),
            'temporary' => ! $isPublic,
        ]);
    }

    public function references(Media $file): JsonResponse
    {
        return response()->json([
            'data' => $this->service->attachments($file)->map(fn (object $row): array => [
                'type' => $row->mediable_type,
                'id' => $row->mediable_id,
                'collection' => $row->collection,
                'position' => $row->position,
            ])->values(),
        ]);
    }

    public function stats(): JsonResponse
    {
        $usage = $this->service->usage();

        return response()->json([
            'data' => [
                ...$usage,
                'quota_bytes' => config('modules.media.storage_quota_bytes'),
            ],
        ]);
    }
}
