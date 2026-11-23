<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Replaces the single `published_at` timestamp with a separate publish date
 * and publish time, so each part can be stored and controlled on its own.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->date('publish_date')->nullable()->after('layout');
            $table->time('publish_time')->nullable()->after('publish_date');
        });

        DB::statement(
            'UPDATE pages SET publish_date = published_at::date, publish_time = published_at::time WHERE published_at IS NOT NULL',
        );

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropIndex(['status', 'published_at']);
            $table->dropColumn('published_at');
            $table->index(['status', 'publish_date', 'publish_time']);
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->timestamp('published_at')->nullable()->after('publish_time');
        });

        DB::statement(
            "UPDATE pages SET published_at = publish_date + COALESCE(publish_time, time '00:00') WHERE publish_date IS NOT NULL",
        );

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropIndex(['status', 'publish_date', 'publish_time']);
            $table->dropColumn(['publish_date', 'publish_time']);
            $table->index(['status', 'published_at']);
        });
    }
};
