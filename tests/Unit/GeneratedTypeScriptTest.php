<?php

/**
 * @return array<string, array{class-string<BackedEnum>}>
 */
function moduleEnumClasses(): array
{
    $classes = [];

    foreach (glob(__DIR__.'/../../app/Modules/*/Enums/*.php') ?: [] as $file) {
        $module = basename(dirname($file, 2));
        $class = "App\\Modules\\{$module}\\Enums\\".basename($file, '.php');

        if (enum_exists($class)) {
            $classes[class_basename($class)] = [$class];
        }
    }

    return $classes;
}

function generatedTypeScript(): string
{
    return (string) file_get_contents(__DIR__.'/../../resources/js/types/generated/index.ts');
}

dataset('module enums', moduleEnumClasses());

it('generates every module enum with all its cases', /** @param  class-string<BackedEnum>  $enum */ function (string $enum): void {
    $typeScript = generatedTypeScript();
    $name = class_basename($enum);

    expect($typeScript)->toContain("export enum {$name} {");

    foreach ($enum::cases() as $case) {
        $value = is_int($case->value) ? $case->value : "'{$case->value}'";

        expect($typeScript)->toContain("{$case->name} = {$value},");
    }
})->with('module enums')->group('typescript');
