<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Replaces the JSON section document with one HTML body per locale. The old
 * content cannot be converted, so the revisions that hold it are removed too.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('page_revisions')->delete();

        Schema::table('page_translations', function (Blueprint $table): void {
            $table->longText('body')->nullable()->after('seo_description');
            $table->dropColumn('content');
        });
    }

    public function down(): void
    {
        Schema::table('page_translations', function (Blueprint $table): void {
            $table->jsonb('content')->nullable()->after('seo_description');
            $table->dropColumn('body');
        });
    }
};
