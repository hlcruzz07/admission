<?php

namespace App;

enum ScheduleStatus: string
{
    case PENDING = "pending";
    case COMPLETED = "completed";
}
