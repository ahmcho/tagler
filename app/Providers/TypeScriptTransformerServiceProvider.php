<?php

namespace App\Providers;

use Spatie\LaravelTypeScriptTransformer\TypeScriptTransformerApplicationServiceProvider as BaseTypeScriptTransformerServiceProvider;
use Spatie\TypeScriptTransformer\Formatters\PrettierFormatter;
use Spatie\TypeScriptTransformer\Transformers\EnumTransformer;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfigFactory;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

class TypeScriptTransformerServiceProvider extends BaseTypeScriptTransformerServiceProvider
{
    protected function configure(TypeScriptTransformerConfigFactory $config): void
    {
        $config
            ->transformer(new EnumTransformer(useUnionEnums: false))
            ->transformDirectories(...(glob(app_path('Modules/*/Enums'), GLOB_ONLYDIR) ?: []))
            ->outputDirectory(resource_path('js/types/generated'))
            ->writer(new FlatModuleWriter('index.ts'))
            ->withoutManifest()
            ->formatter(PrettierFormatter::class);
    }
}
