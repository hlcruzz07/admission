<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campus;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CampusApiController extends Controller
{
    public function all()
    {
        try {

            $campuses = Cache::remember('campuses.all', now()->addHours(12), function () {
                Log::error('Fetching from database');

                return Campus::select('id', 'name')->get();
            });

            return response()->json($campuses);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
