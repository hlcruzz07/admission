<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    public function updateAdmission(Request $request)
    {
        $request->validate([
            'status' => 'required|in:open,closed',
        ]);

        $setting = SystemSetting::where('key', 'admission_status')->firstOrFail();
        $setting->update(['value' => $request->status]);

        return redirect()->back()->with('success', 'Admission status updated successfully.');
    }
}
