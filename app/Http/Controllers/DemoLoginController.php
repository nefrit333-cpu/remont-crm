<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DemoLoginController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', Rule::in(array_keys(config('demo.accounts')))],
        ]);

        $user = User::where('email', $validated['email'])->first();
        abort_unless($user?->isPublicDemoAccount(), 403);

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('public_demo', true);

        return redirect()->route('dashboard');
    }
}
