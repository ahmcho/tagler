<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('pages')->nullOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('path', 1024)->unique();
            $table->string('status', 20)->default('draft');
            $table->boolean('is_homepage')->default(false);
            $table->string('layout', 64)->nullable();
            $table->jsonb('content')->default('{"version": 1, "sections": []}');
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 500)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index(['parent_id', 'slug']);
        });

        DB::statement('CREATE UNIQUE INDEX pages_single_homepage_unique ON pages (is_homepage) WHERE is_homepage');
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
