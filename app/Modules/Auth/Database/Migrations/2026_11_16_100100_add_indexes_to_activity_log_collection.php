<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Indexes the activity log collection for the filters and sorting of the activity log page.
 */
return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->table('activity_log', function (Blueprint $collection): void {
            $collection->index(['subject_type' => 1, 'subject_id' => 1]);
            $collection->index(['causer_type' => 1, 'causer_id' => 1]);
            $collection->index(['event' => 1]);
            $collection->index(['created_at' => -1]);
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->table('activity_log', function (Blueprint $collection): void {
            $collection->dropIndex(['subject_type' => 1, 'subject_id' => 1]);
            $collection->dropIndex(['causer_type' => 1, 'causer_id' => 1]);
            $collection->dropIndex(['event' => 1]);
            $collection->dropIndex(['created_at' => -1]);
        });
    }
};
