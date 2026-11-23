<!DOCTYPE html>
<html lang="{{ $page['props']['page']['locale'] ?? str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Public pages load only public.tsx. No admin stylesheet, font or theme script is loaded here. --}}
        @viteReactRefresh
        @vite(['resources/js/public.tsx'])

        {{-- Search and sharing tags for public pages. The client Head keeps these in step with the same keys. --}}
        <x-inertia::head>
            @php($seo = $page['props']['page'] ?? null)
            @if (! $seo)
                <title data-inertia="">{{ __('pages.public.not_found_title') }}</title>
            @else
                @php($seoTitle = $seo['seo_title'] ?? $seo['title'] ?? '')
                <title data-inertia="">{{ $seoTitle }}</title>
                @if ($seo['seo_description'] ?? null)
                    <meta name="description" content="{{ $seo['seo_description'] }}" data-inertia="description">
                @endif
                <meta property="og:type" content="website" data-inertia="og:type">
                @if ($seo['og_locale'] ?? null)
                    <meta property="og:locale" content="{{ $seo['og_locale'] }}" data-inertia="og:locale">
                @endif
                <meta property="og:title" content="{{ $seoTitle }}" data-inertia="og:title">
                @if ($seo['seo_description'] ?? null)
                    <meta property="og:description" content="{{ $seo['seo_description'] }}" data-inertia="og:description">
                @endif
                @if ($seo['canonical_url'] ?? null)
                    <link rel="canonical" href="{{ $seo['canonical_url'] }}" data-inertia="canonical">
                    <meta property="og:url" content="{{ $seo['canonical_url'] }}" data-inertia="og:url">
                @endif
            @endif
        </x-inertia::head>
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
