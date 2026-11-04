<?php

use App\Support\Inertia\PageEntrypoint;

it('resolves a top-level page', function () {
    expect(PageEntrypoint::for('dashboard'))->toBe('resources/js/pages/dashboard.tsx');
});

it('resolves a page inside a module', function () {
    expect(PageEntrypoint::for('auth/login'))->toBe('resources/js/modules/auth/pages/auth/login.tsx');
});

it('fails for a page that does not exist', function () {
    expect(fn () => PageEntrypoint::for('missing/page'))
        ->toThrow(RuntimeException::class, 'matched 0 files');
});
