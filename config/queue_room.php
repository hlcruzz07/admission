<?php

return [
    'max_active' => env('QUEUE_ROOM_MAX', 2),
    'active_seconds' => 300,
    'grace_seconds' => 300,
];