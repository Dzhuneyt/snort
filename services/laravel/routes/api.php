<?php

use App\Http\Requests\LinkStoreRequest;
use App\Link;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/link', function (LinkStoreRequest $request) {
    $hash = Str::random(8);
    $model = Link::create(
        array_merge_recursive($request->all(), [
            'hash' => $hash
        ]));
    return $model;
});
Route::get('/link/{hash}', function (Request $request, $hash) {
    return Link::where('hash', $hash)
               ->firstOrFail();
});
