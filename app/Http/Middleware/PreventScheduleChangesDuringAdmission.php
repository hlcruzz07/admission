<?php

namespace App\Http\Middleware;

use App\Services\AppSettings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventScheduleChangesDuringAdmission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (AppSettings::isAdmissionOpen()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Schedules cannot be modified while admission is active.'], 403);
            }
            return redirect()->back()->with('error', 'Schedules are locked during active admission.');
        }

        return $next($request);
    }
}
