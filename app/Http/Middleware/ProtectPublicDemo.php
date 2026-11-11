<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ProtectPublicDemo
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('demo.enabled')) {
            abort_if($request->routeIs('demo.login'), 404);

            if ($request->session()->get('public_demo')) {
                Auth::guard('web')->logoutCurrentDevice();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login');
            }

            return $next($request);
        }

        if ($request->routeIs('demo.login', 'logout')) {
            return $next($request);
        }

        abort_unless($request->isMethodSafe(), 403);
        abort_if($request->routeIs(
            'password.request', 'password.reset', 'password.confirm',
            'verification.*', 'profile.edit',
        ), 403);

        if ($request->routeIs('login')) {
            return redirect('/');
        }

        $user = $request->user();
        abort_if($user && ! $user->isPublicDemoAccount(), 403);

        return $next($request);
    }
}
