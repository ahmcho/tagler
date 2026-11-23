<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Php81\Rector\Array_\ArrayToFirstClassCallableRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/app',
        __DIR__.'/bootstrap',
        __DIR__.'/config',
        __DIR__.'/database',
        __DIR__.'/packages/crud',
        __DIR__.'/public',
        __DIR__.'/resources',
        __DIR__.'/routes',
        __DIR__.'/tests',
    ])
    ->withSkip([
        __DIR__.'/bootstrap/cache', // auto-generated, gitignored
        // [class, method] pairs here are data consumed by Gate::can(),
        // not callables — FirstClassCallableRector rewrites them into
        // Closures and breaks the array-shape contract.
        __DIR__.'/app/Modules/Auth/Support/AbilityRegistry.php',
        // Ability providers register [class, method] pairs as data; the
        // rule would rewrite them into first-class callables.
        ArrayToFirstClassCallableRector::class => [
            __DIR__.'/app/Modules/Auth/Providers/AuthServiceProvider.php',
            __DIR__.'/app/Modules/Pages/Providers/PagesServiceProvider.php',
            __DIR__.'/app/Modules/Settings/Providers/SettingsServiceProvider.php',
            __DIR__.'/app/Modules/Translation/Providers/TranslationServiceProvider.php',
        ],
    ])
    ->withPhpSets(php84: true)
    ->withComposerBased(laravel: true)
    ->withTypeCoverageLevel(5)
    ->withDeadCodeLevel(5)
    ->withCodeQualityLevel(5);
