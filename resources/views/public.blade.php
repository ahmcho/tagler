<!DOCTYPE html>
<html lang="{{ $page['props']['page']['locale'] ?? str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Public pages load only public.tsx. No admin stylesheet, font or theme script is loaded here. --}}
        @viteReactRefresh
        @vite(['resources/js/public.tsx'])

        <x-inertia::head />
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
