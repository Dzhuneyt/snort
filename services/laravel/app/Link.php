<?php

namespace App;

use Illuminate\Database\Eloquent\Model;



class Link extends Model
{
    protected $fillable = [
        'url',
        'hash'
    ];
    protected $hidden = [
        'id',
        'updated_at',
    ];
}
