<?php

use App\Http\Controllers\Api\CampusApiController;
use App\Http\Controllers\Api\QueueApiController;
use App\Http\Controllers\Api\StudentApiController;
use Illuminate\Support\Facades\Route;


Route::get('/api/queue', [QueueApiController::class, 'check'])->name('api.queue');
Route::get('/api/campuses', [CampusApiController::class, 'all'])->name('api.campuses');
Route::get('/api/campus/{id}', [CampusApiController::class, 'show'])->name('api.campus.show');
Route::get('/api/students', [StudentApiController::class, 'paginate'])->name('api.paginate.students');