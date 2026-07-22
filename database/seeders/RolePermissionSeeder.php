<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // roles
        $admin = Role::create(['name' => 'administrator']);
        $superAdmin = Role::create(['name' => 'super_administrator']);

        // permissions
        $permissions = [

            // students
            'view_students',
            'export_students',

            // logs
            'view_activity_logs',
            'export_activity_logs',

            // campus
            'view_campuses',
            'update_campuses',
            'delete_campuses',
            'create_campuses',

            // venues
            'view_venues',
            'update_venues',
            'delete_venues',
            'create_venues',

            // schedules
            'view_schedules',
            'update_schedules',
            'delete_schedules',
            'create_schedules',

            // archive
            'view_archive',
            'restore_archive',

            'update_admission_settings',

            // Accounts
            'view_accounts',
            'update_accounts',
            'delete_accounts',
            'create_accounts',

            // Roles & Permisions
            'view_roles',
            'update_roles',
            'create_roles',
            'delete_roles',

            'view_permissions',
            'update_permissions',
            'create_permissions',
            'delete_permissions',

        ];

        foreach ($permissions as $perm) {
            Permission::create(['name' => $perm]);
        }

        // give all permissions to super admin
        $superAdmin->givePermissionTo(Permission::all());

        // admin gets limited permissions
        $admin->givePermissionTo([
            'view_students',
            'export_students',
            'view_activity_logs',
            'view_campuses',
            'create_venues',
            'update_venues',
            'view_venues',
            'view_schedules',
            'create_schedules',
            'update_schedules',
            'delete_schedules',
            'view_archive',
            'restore_archive',
        ]);
    }
}
