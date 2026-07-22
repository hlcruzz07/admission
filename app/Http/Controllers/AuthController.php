<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\HashingService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Laravel\Socialite\Socialite;

class AuthController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Auth/Index');
    }
    public function redirect()
    {

        return Socialite::driver('google')->redirect();
    }
    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        try {

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // ActivityLog::log(
                //     'login',
                //     'unauthorized user login',
                //     $googleUser->getEmail(),
                //     request(),
                //     'failed'
                // );
                abort(403, 'Your account is not authorized.');
                return;
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

            return redirect()->route('admin')->with('error', $e->getMessage());
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $request->session()->flush();

        return redirect()->route('admin')->with('success', 'Logged out successfully');
    }
}
