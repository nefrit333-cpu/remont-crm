<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->foreignId('customer_id')->nullable()->after('password')->constrained()->nullOnDelete();
        });

        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('renovation_type');
            $table->string('address');
            $table->decimal('area', 8, 2)->nullable();
            $table->unsignedInteger('budget')->nullable();
            $table->date('desired_start_date')->nullable();
            $table->string('status')->index();
            $table->string('source')->nullable();
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('comment')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('foreman_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('area', 8, 2)->nullable();
            $table->string('renovation_type');
            $table->string('status')->index();
            $table->date('start_date')->nullable();
            $table->date('planned_finish_date')->nullable();
            $table->unsignedInteger('budget')->nullable();
            $table->timestamps();
        });

        Schema::create('project_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('status')->index();
            $table->date('start_date')->nullable();
            $table->date('finish_date')->nullable();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->text('comment')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('renovation_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date')->nullable()->index();
            $table->string('priority')->default('Средний');
            $table->string('status')->default('Новая')->index();
            $table->boolean('visible_to_client')->default(false);
            $table->timestamps();
        });

        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('type');
            $table->dateTime('starts_at')->index();
            $table->dateTime('ends_at')->nullable();
            $table->text('description')->nullable();
            $table->boolean('visible_to_client')->default(false);
            $table->timestamps();
        });

        Schema::create('project_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('type');
            $table->string('path')->nullable();
            $table->boolean('visible_to_client')->default(true);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->string('purpose');
            $table->date('due_date')->nullable()->index();
            $table->string('status')->index();
            $table->date('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('acts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('number');
            $table->string('title');
            $table->unsignedInteger('amount')->nullable();
            $table->string('status')->index();
            $table->date('issued_at')->nullable();
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->morphs('commentable');
            $table->text('body');
            $table->boolean('visible_to_client')->default(true);
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->morphs('subject');
            $table->string('event');
            $table->text('description');
            $table->json('properties')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('acts');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('project_files');
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('renovation_tasks');
        Schema::dropIfExists('project_stages');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('leads');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_id');
            $table->dropColumn('phone');
        });

        Schema::dropIfExists('customers');
    }
};
