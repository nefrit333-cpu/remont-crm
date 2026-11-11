<?php

return [
    'enabled' => env('PUBLIC_DEMO_MODE', false),
    'accounts' => [
        'admin@remont-crm.test' => 'Администратор',
        'manager@remont-crm.test' => 'Менеджер',
        'foreman@remont-crm.test' => 'Прораб',
        'client@remont-crm.test' => 'Клиент',
    ],
];
