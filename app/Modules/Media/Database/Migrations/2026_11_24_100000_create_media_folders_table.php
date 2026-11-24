<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_folders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('media_folders')->restrictOnDelete();
            $table->string('name', 120);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['parent_id', 'name']);
        });

        DB::statement('CREATE UNIQUE INDEX media_folders_root_name_unique ON media_folders (name) WHERE parent_id IS NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('media_folders');
    }
};
