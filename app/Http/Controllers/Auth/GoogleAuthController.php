<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\HashingService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(protected HashingService $hashingService) {}
    public function redirect()
    {

        return Socialite::driver('google')->redirect();
    }
    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        try {

            $user = User::where('hashed_email', $this->hashingService->hashValue($googleUser->getEmail()))->first();

            if (!$user) {
                // ActivityLog::log(
                //     'login',
                //     'unauthorized user login',
                //     $googleUser->getEmail(),
                //     request(),
                //     'failed'
                // );
                return redirect()->route('admin')->with('error', 'Invalid credentials');
            }


            $user->update([
                'name' => $googleUser->getName(),
                'avatar' => $googleUser->getAvatar(),
            ]);

            // ActivityLog::log(
            //     'login',
            //     ($user->roles()->first()->name === 'super_administrator' ? 'super administrator' : 'administrator') . ' has logged in',
            //     $user->email,
            //     request(),
            //     'success'
            // );

            Auth::login($user);

            return redirect()->route('dashboard')->with('success', 'Welcome ' . $user->name);
        } catch (Exception $e) {

            // ActivityLog::log(
            //     'login',
            //     'something went wrong to login the user: ' . $e->getMessage(),
            //     $googleUser->getEmail(),
            //     request(),
            //     'failed'
            // );

            Log::error($e->getMessage());

            return redirect()->route('admin')->with('error', 'Something went wrong.');
        }
    }
}
