<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mediables', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('mediable_type', 64);
            $table->unsignedBigInteger('mediable_id');
            $table->string('collection', 64);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['media_id', 'mediable_type', 'mediable_id', 'collection'], 'mediables_unique_attachment');
            $table->index(['mediable_type', 'mediable_id', 'collection', 'position'], 'mediables_owner_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mediables');
    }
};
