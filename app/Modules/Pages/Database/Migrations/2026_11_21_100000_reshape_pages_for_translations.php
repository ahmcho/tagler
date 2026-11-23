<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Moves the per-locale fields (title, slug, path, SEO, content) from `pages`
 * into `page_translations`. The default locale's values are copied across.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_translations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('locale', 8);
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('slug');
            $table->string('path', 1024);
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 500)->nullable();
            $table->jsonb('content')->default('{"version": 1, "sections": []}');
            $table->timestamps();

            $table->unique(['page_id', 'locale']);
            $table->unique(['locale', 'path']);
        });

        DB::statement(
            'INSERT INTO page_translations (page_id, locale, title, slug, path, seo_title, seo_description, content, created_at, updated_at)
             SELECT id, ?, title, slug, path, seo_title, seo_description, content, created_at, updated_at FROM pages',
            [config('app.locale')],
        );

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropIndex(['parent_id', 'slug']);
            $table->dropColumn(['title', 'slug', 'path', 'seo_title', 'seo_description', 'content']);
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->string('title')->default('');
            $table->string('slug')->default('');
            $table->string('path', 1024)->default('');
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 500)->nullable();
            $table->jsonb('content')->default('{"version": 1, "sections": []}');
        });

        DB::statement(
            'UPDATE pages SET title = t.title, slug = t.slug, path = t.path, seo_title = t.seo_title,
                 seo_description = t.seo_description, content = t.content
             FROM page_translations t WHERE t.page_id = pages.id AND t.locale = ?',
            [config('app.locale')],
        );

        Schema::table('pages', function (Blueprint $table): void {
            $table->index(['parent_id', 'slug']);
        });

        Schema::dropIfExists('page_translations');
    }
};
