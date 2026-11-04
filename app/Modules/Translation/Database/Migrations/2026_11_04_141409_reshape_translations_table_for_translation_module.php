<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Moves the `translations` table to the translation module schema:
     * `locale` becomes `lang`, `translation` becomes `value`, `group` is
     * required, and keys drop their group prefix (`auth.failed` in group
     * `auth` becomes `failed`). Adds the `table` column.
     */
    public function up(): void
    {
        Schema::table('translations', function (Blueprint $table): void {
            $table->string('lang', 3)->nullable();
            $table->text('value')->nullable();
            $table->string('table')->nullable()->index();
        });

        DB::table('translations')->update([
            'lang' => DB::raw('"locale"'),
            'value' => DB::raw('"translation"'),
            'group' => DB::raw("COALESCE(\"group\", 'translations')"),
        ]);

        DB::statement(
            'UPDATE translations SET "key" = SUBSTRING("key" FROM LENGTH("group") + 2) '
            .'WHERE LEFT("key", LENGTH("group") + 1) = "group" || \'.\''
        );

        $this->fillTableColumn();

        Schema::table('translations', function (Blueprint $table): void {
            $table->dropColumn(['locale', 'translation']);
        });

        Schema::table('translations', function (Blueprint $table): void {
            $table->string('lang', 3)->nullable(false)->change();
            $table->string('group')->nullable(false)->change();
            $table->unique(['lang', 'group', 'key']);
            $table->index(['group', 'key']);
        });
    }

    /**
     * Reverses the reshape. Keys get their group prefix back. The `table`
     * column is dropped.
     */
    public function down(): void
    {
        Schema::table('translations', function (Blueprint $table): void {
            $table->string('locale', 10)->nullable();
            $table->text('translation')->nullable();
        });

        DB::table('translations')->update([
            'locale' => DB::raw('"lang"'),
            'translation' => DB::raw('"value"'),
        ]);

        DB::statement('UPDATE translations SET "key" = "group" || \'.\' || "key"');

        Schema::table('translations', function (Blueprint $table): void {
            $table->dropColumn(['lang', 'value', 'table']);
        });

        Schema::table('translations', function (Blueprint $table): void {
            $table->string('locale', 10)->nullable(false)->change();
            $table->text('translation')->nullable(false)->change();
            $table->string('group')->nullable()->change();
            $table->unique(['key', 'locale']);
        });
    }

    /**
     * `table` is the key prefix for the `translations` group when that
     * prefix names an actual database table.
     */
    private function fillTableColumn(): void
    {
        $prefixes = DB::table('translations')
            ->where('group', 'translations')
            ->where('key', 'like', '%.%')
            ->pluck('key')
            ->map(fn (string $key): string => strstr($key, '.', true))
            ->unique();

        foreach ($prefixes as $prefix) {
            DB::table('translations')
                ->where('group', 'translations')
                ->where('key', 'like', "{$prefix}.%")
                ->update(['table' => Schema::hasTable($prefix) ? $prefix : null]);
        }
    }
};
