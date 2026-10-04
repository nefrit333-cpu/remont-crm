<?php

namespace Database\Seeders;

use App\Models\Act;
use App\Models\CalendarEvent;
use App\Models\Comment;
use App\Models\Customer;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\ProjectStage;
use App\Models\RenovationTask;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage users',
            'manage settings',
            'manage leads',
            'manage projects',
            'view assigned projects',
            'view own projects',
            'manage payments',
            'manage documents',
            'comment',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'Администратор'])->syncPermissions($permissions);
        $managerRole = Role::firstOrCreate(['name' => 'Менеджер'])->syncPermissions(['manage leads', 'manage projects', 'manage payments', 'manage documents', 'comment']);
        $foremanRole = Role::firstOrCreate(['name' => 'Прораб'])->syncPermissions(['view assigned projects', 'manage projects', 'manage documents', 'comment']);
        $clientRole = Role::firstOrCreate(['name' => 'Клиент'])->syncPermissions(['view own projects', 'comment']);

        $password = Hash::make('password');

        $customers = collect([
            ['name' => 'Анна Кузнецова', 'phone' => '+7 916 204-18-74', 'email' => 'anna.kuznetsova@example.test', 'address' => 'Москва, Хамовники, ул. Ефремова, 12'],
            ['name' => 'Илья Морозов', 'phone' => '+7 925 710-44-19', 'email' => 'ilya.morozov@example.test', 'address' => 'Москва, Пресненский район, Шмитовский проезд, 22'],
            ['name' => 'Мария Орлова', 'phone' => '+7 903 118-07-45', 'email' => 'maria.orlova@example.test', 'address' => 'Москва, Аэропорт, ул. Усиевича, 9'],
            ['name' => 'Павел Соколов', 'phone' => '+7 926 590-21-33', 'email' => 'pavel.sokolov@example.test', 'address' => 'Москва, Даниловский район, ул. Мастеркова, 6'],
            ['name' => 'Елена Романова', 'phone' => '+7 985 301-62-88', 'email' => 'elena.romanova@example.test', 'address' => 'Москва, Раменки, Мосфильмовская ул., 35'],
        ])->map(fn (array $customer) => Customer::create($customer));

        $admin = User::create(['name' => 'Алексей Волков', 'email' => 'admin@remont-crm.test', 'password' => $password, 'email_verified_at' => now()]);
        $manager = User::create(['name' => 'Ольга Сергеева', 'email' => 'manager@remont-crm.test', 'password' => $password, 'phone' => '+7 999 210-44-00', 'email_verified_at' => now()]);
        $foreman = User::create(['name' => 'Дмитрий Лебедев', 'email' => 'foreman@remont-crm.test', 'password' => $password, 'phone' => '+7 999 210-44-10', 'email_verified_at' => now()]);
        $client = User::create([
            'name' => 'Анна Кузнецова',
            'email' => 'client@remont-crm.test',
            'password' => $password,
            'phone' => '+7 916 204-18-74',
            'customer_id' => $customers[0]->id,
            'email_verified_at' => now(),
        ]);

        $admin->assignRole($adminRole);
        $manager->assignRole($managerRole);
        $foreman->assignRole($foremanRole);
        $client->assignRole($clientRole);

        $leadRows = [
            ['Анна Кузнецова', '+7 916 204-18-74', 'anna.kuznetsova@example.test', 'Капитальный ремонт', 'Хамовники, ул. Ефремова, 12', 78.5, 4650000, 'Договор', 'Рекомендация'],
            ['Илья Морозов', '+7 925 710-44-19', 'ilya.morozov@example.test', 'Дизайн-ремонт', 'Шмитовский проезд, 22', 64.0, 5100000, 'В работе', 'Сайт'],
            ['Мария Орлова', '+7 903 118-07-45', 'maria.orlova@example.test', 'Черновой ремонт', 'ул. Усиевича, 9', 52.3, 2100000, 'Смета готовится', 'Авито'],
            ['Павел Соколов', '+7 926 590-21-33', 'pavel.sokolov@example.test', 'Ремонт санузла', 'ул. Мастеркова, 6', 8.6, 620000, 'Замер назначен', 'Звонок'],
            ['Елена Романова', '+7 985 301-62-88', 'elena.romanova@example.test', 'Косметический ремонт', 'Мосфильмовская ул., 35', 41.0, 1450000, 'Связаться', 'Сайт'],
            ['Никита Беляев', '+7 916 808-73-41', 'nikita.belyaev@example.test', 'Капитальный ремонт', 'Ленинский проспект, 101', 88.2, 5900000, 'Новая', 'Реклама'],
            ['Софья Павлова', '+7 925 404-62-11', 'sofia.pavlova@example.test', 'Отделка новостройки', 'ЖК Символ, корпус 11', 59.4, 3300000, 'Смета готовится', 'Рекомендация'],
            ['Кирилл Фомин', '+7 977 164-90-02', 'kirill.fomin@example.test', 'Ремонт кухни', 'Перовская ул., 18', 14.5, 980000, 'Отказ', 'Сайт'],
            ['Виктория Громова', '+7 903 711-82-04', 'viktoria.gromova@example.test', 'Дизайн-ремонт', 'Большая Черкизовская, 5', 72.0, 5200000, 'Договор', 'Instagram'],
            ['Роман Крылов', '+7 985 602-30-77', 'roman.krylov@example.test', 'Черновые работы', 'ул. Народного Ополчения, 15', 47.8, 1750000, 'Новая', 'Партнёр'],
        ];

        $leads = collect($leadRows)->map(fn (array $lead, int $index) => Lead::create([
            'client_name' => $lead[0],
            'phone' => $lead[1],
            'email' => $lead[2],
            'renovation_type' => $lead[3],
            'address' => 'Москва, '.$lead[4],
            'area' => $lead[5],
            'budget' => $lead[6],
            'desired_start_date' => now()->addDays(12 + $index * 4)->toDateString(),
            'status' => $lead[7],
            'source' => $lead[8],
            'manager_id' => $manager->id,
            'comment' => 'Demo-заявка для портфолио. Данные вымышлены.',
        ]));

        $logger = app(ActivityLogger::class);
        $projectRows = [
            [$customers[0], $leads[0], 'Хамовники: квартира 78 м2', 'В работе', 'Капитальный ремонт', 4650000, 78.5],
            [$customers[1], $leads[1], 'Пресня: дизайн-ремонт', 'Черновые работы', 'Дизайн-ремонт', 5100000, 64.0],
            [$customers[2], $leads[2], 'Аэропорт: подготовка к отделке', 'Подготовка', 'Черновой ремонт', 2100000, 52.3],
            [$customers[3], null, 'Даниловский: санузел', 'Приёмка', 'Ремонт санузла', 620000, 8.6],
        ];

        foreach ($projectRows as $projectIndex => [$customer, $lead, $name, $status, $type, $budget, $area]) {
            $project = Project::create([
                'name' => $name,
                'address' => $customer->address,
                'customer_id' => $customer->id,
                'foreman_id' => $foreman->id,
                'manager_id' => $manager->id,
                'lead_id' => $lead?->id,
                'area' => $area,
                'renovation_type' => $type,
                'status' => $status,
                'start_date' => now()->subDays(28 - $projectIndex * 6)->toDateString(),
                'planned_finish_date' => now()->addDays(62 + $projectIndex * 11)->toDateString(),
                'budget' => $budget,
            ]);

            foreach (['Подготовка', 'Демонтаж', 'Черновые работы', 'Электрика', 'Сантехника', 'Отделка', 'Приёмка'] as $stageIndex => $stage) {
                ProjectStage::create([
                    'project_id' => $project->id,
                    'name' => $stage,
                    'status' => $stageIndex < $projectIndex + 2 ? 'Готово' : ($stageIndex === $projectIndex + 2 ? 'В работе' : 'Ожидает'),
                    'start_date' => now()->subDays(24 - $stageIndex * 4)->toDateString(),
                    'finish_date' => $stageIndex < $projectIndex + 2 ? now()->subDays(18 - $stageIndex * 3)->toDateString() : null,
                    'progress' => $stageIndex < $projectIndex + 2 ? 100 : ($stageIndex === $projectIndex + 2 ? 45 : 0),
                    'comment' => 'Плановый demo-этап.',
                    'sort_order' => $stageIndex + 1,
                ]);
            }

            foreach (['Проверить поставку материалов', 'Согласовать скрытые работы', 'Подготовить фотоотчёт'] as $taskIndex => $title) {
                RenovationTask::create([
                    'project_id' => $project->id,
                    'assignee_id' => $foreman->id,
                    'title' => $title,
                    'description' => 'Рабочая demo-задача по объекту.',
                    'due_date' => now()->addDays($taskIndex + $projectIndex + 1)->toDateString(),
                    'priority' => $taskIndex === 1 ? 'Высокий' : 'Средний',
                    'status' => ['Новая', 'В работе', 'На проверке'][$taskIndex],
                    'visible_to_client' => $taskIndex !== 1,
                ]);
            }

            foreach ([['Ожидается', 700000, 'Промежуточный платёж'], ['Оплачено', 1200000, 'Аванс по договору']] as [$paymentStatus, $amount, $purpose]) {
                Payment::create([
                    'project_id' => $project->id,
                    'amount' => $amount,
                    'purpose' => $purpose,
                    'due_date' => $paymentStatus === 'Ожидается' ? now()->addDays(7 + $projectIndex)->toDateString() : now()->subDays(12)->toDateString(),
                    'status' => $paymentStatus,
                    'paid_at' => $paymentStatus === 'Оплачено' ? now()->subDays(11)->toDateString() : null,
                ]);
            }

            Act::create([
                'project_id' => $project->id,
                'number' => 'АКТ-'.now()->format('ym').'-'.str_pad((string) ($projectIndex + 1), 3, '0', STR_PAD_LEFT),
                'title' => 'Акт выполненных работ',
                'amount' => 850000 + $projectIndex * 120000,
                'status' => $projectIndex % 2 === 0 ? 'На согласовании' : 'Подписан',
                'issued_at' => now()->subDays(3 + $projectIndex)->toDateString(),
            ]);

            foreach (['Фото объекта', 'Смета', 'Договор'] as $fileType) {
                ProjectFile::create([
                    'project_id' => $project->id,
                    'uploaded_by' => $manager->id,
                    'name' => "{$fileType}: {$project->name}",
                    'type' => $fileType,
                    'path' => 'demo/'.str($fileType)->slug().'-'.$project->id.'.pdf',
                    'visible_to_client' => true,
                ]);
            }

            CalendarEvent::create([
                'project_id' => $project->id,
                'user_id' => $foreman->id,
                'title' => 'Выезд на объект',
                'type' => 'Визит',
                'starts_at' => now()->addDays(2 + $projectIndex)->setTime(11, 0),
                'ends_at' => now()->addDays(2 + $projectIndex)->setTime(13, 0),
                'description' => 'Плановый контроль работ.',
                'visible_to_client' => true,
            ]);

            Comment::create([
                'user_id' => $manager->id,
                'commentable_type' => Project::class,
                'commentable_id' => $project->id,
                'body' => 'Demo-комментарий: согласовали следующий этап и список материалов.',
                'visible_to_client' => true,
            ]);

            $logger->log($project, 'project.seeded', 'Создан demo-объект ремонта', $admin->id);
        }

        foreach ($leads as $lead) {
            Comment::create([
                'user_id' => $manager->id,
                'commentable_type' => Lead::class,
                'commentable_id' => $lead->id,
                'body' => 'Первичный контакт зафиксирован в demo-воронке.',
                'visible_to_client' => false,
            ]);

            $logger->log($lead, 'lead.seeded', 'Создана demo-заявка', $admin->id);
        }
    }
}
