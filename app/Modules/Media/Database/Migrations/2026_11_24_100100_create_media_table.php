<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('disk', 32);
            $table->string('path', 1024);
            $table->string('original_name', 255);
            $table->string('file_name', 255);
            $table->string('mime_type', 127);
            $table->string('extension', 16);
            $table->unsignedBigInteger('size');
            $table->char('checksum', 64);
            $table->string('collection', 64)->nullable();
            $table->foreignId('folder_id')->nullable()->constrained('media_folders')->nullOnDelete();
            $table->string('title', 255)->nullable();
            $table->string('alt_text', 500)->nullable();
            $table->text('description')->nullable();
            $table->jsonb('metadata')->default('{}');
            $table->string('visibility', 16)->default('private');
            $table->string('processing_status', 16)->default('pending');
            $table->text('processing_error')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['disk', 'path']);
            $table->index(['folder_id', 'deleted_at']);
            $table->index('mime_type');
            $table->index('visibility');
            $table->index('checksum');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
