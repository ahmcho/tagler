<?php

declare(strict_types=1);

namespace App\Modules\Pages\Console\Commands;

use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Settings\Support\LocalDateFormatter;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Set scheduled pages to published once their publish time has passed')]
#[Signature('tagler:pages:publish-scheduled')]
class PublishScheduledPages extends Command
{
    public function handle(PageServiceContract $service): int
    {
        $count = $service->publishDueScheduled(LocalDateFormatter::now());

        $this->components->info("Published {$count} scheduled page(s).");

        return Command::SUCCESS;
    }
}
