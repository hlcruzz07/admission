<?php

namespace App\Http\Middleware;

use App\Services\AppSettings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmissionIsOpen
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!AppSettings::isAdmissionOpen()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Admission is currently closed.'], 403);
            }
            return redirect()->route('home')->with('error', 'Admission is currently closed.');
        }

        return $next($request);
    }
}
