<?php

use App\Modules\Translation\Support\DatabaseTranslationLoader;
use Illuminate\Contracts\Translation\Loader;
use Illuminate\Database\ConnectionResolverInterface;
use Illuminate\Support\Facades\Log;

test('a failed translations read is logged to the translations channel and falls back to file translations', function () {
    $fileLoader = Mockery::mock(Loader::class);
    $fileLoader->shouldReceive('load')->with('en', 'common', null)->andReturn(['greeting' => 'Hello']);

    $resolver = Mockery::mock(ConnectionResolverInterface::class);
    $resolver->shouldReceive('connection')->andThrow(new RuntimeException('database unavailable'));

    Log::shouldReceive('channel')->once()->with('translations')->andReturnSelf();
    Log::shouldReceive('error')
        ->once()
        ->with('DatabaseTranslationLoader: could not read translations', Mockery::on(
            fn (array $context): bool => $context['locale'] === 'en'
                && $context['group'] === 'common'
                && $context['exception'] instanceof RuntimeException,
        ));

    $loader = new DatabaseTranslationLoader($fileLoader, $resolver);

    expect($loader->load('en', 'common'))->toBe(['greeting' => 'Hello']);
});

test('package namespaces are loaded from files only', function () {
    $fileLoader = Mockery::mock(Loader::class);
    $fileLoader->shouldReceive('load')->with('en', 'auth', 'fortify')->andReturn(['failed' => 'File value']);

    $resolver = Mockery::mock(ConnectionResolverInterface::class);
    $resolver->shouldNotReceive('connection');

    $loader = new DatabaseTranslationLoader($fileLoader, $resolver);

    expect($loader->load('en', 'auth', 'fortify'))->toBe(['failed' => 'File value']);
});

test('the translations log channel keeps 14 daily files', function () {
    expect(config('logging.channels.translations'))
        ->toMatchArray([
            'driver' => 'daily',
            'days' => 14,
        ]);
});
