<?php

return [
    'namespace' => 'Modules',
    'overwrite' => false,
    'custom_app_folder' => null,
    'paths' => [
        'modules' => base_path('Modules'),
        'assets' => public_path('modules'),
        'migration' => base_path('database/migrations'),
        'generator' => [
            'config' => ['path' => 'Config', 'generate' => true],
            'command' => ['path' => 'Console', 'generate' => false],
            'migration' => ['path' => 'Database/Migrations', 'generate' => true],
            'seeder' => ['path' => 'Database/Seeders', 'generate' => true],
            'factory' => ['path' => 'Database/factories', 'generate' => true],
            'model' => ['path' => 'Models', 'generate' => true],
            'routes' => ['path' => 'Routes', 'generate' => true],
            'controller' => ['path' => 'Http/Controllers', 'generate' => true],
            'service' => ['path' => 'Services', 'generate' => true],
        ],
    ],
    'scan' => [
        'enabled' => true,
        'paths' => [
            base_path('Modules'),
        ],
    ],
    'composer' => [
        'vendor' => 'aparteman',
        'author' => [
            'name' => 'Aparteman Team',
            'email' => 'dev@aparteman.ir',
        ],
    ],
    'cache' => [
        'enabled' => false,
        'key' => 'laravel-modules',
        'lifetime' => 60,
    ],
    'auto-discover' => [
        'migrations' => true,
        'translations' => true,
    ],
];
