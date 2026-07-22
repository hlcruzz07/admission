<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\StudentRepo;
use Exception;
use Illuminate\Http\Request;

class StudentApiController extends Controller
{
    public function __construct(protected StudentRepo $studentRepo)
    {

    }

    public function paginate(Request $request)
    {
        try {
            $data = $this->studentRepo->paginate($request->all());

            return response()->json($data);
        } catch (Exception $e) {

            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
