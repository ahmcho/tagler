<?php

use App\Modules\Media\Enums\MediaProcessingStatusEnum;

test('each processing status maps to its badge color', function (MediaProcessingStatusEnum $case, string $color): void {
    expect($case->color())->toBe($color);
})->with([
    [MediaProcessingStatusEnum::Pending, 'gray'],
    [MediaProcessingStatusEnum::Processing, 'warning'],
    [MediaProcessingStatusEnum::Ready, 'success'],
    [MediaProcessingStatusEnum::Failed, 'error'],
]);
