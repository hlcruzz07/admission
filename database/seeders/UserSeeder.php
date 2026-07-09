<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\HashingService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function __construct(protected HashingService $hashingService)
    {

    }
    public function run(): void
    {
        $user = User::create([
            'email' => 'haroldlyndon.cruz@chmsu.edu.ph',
            'avatar' => null,
            'name' => 'Harold Lyndon Cruz',
            'email_verified_at' => Carbon::now(),
        ]);

        $user->assignRole('super_administrator');
    }
}
