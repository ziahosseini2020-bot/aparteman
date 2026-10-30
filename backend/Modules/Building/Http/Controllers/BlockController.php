<?php

namespace Modules\Building\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Building\Models\Block;

class BlockController extends Controller
{
    public function index($buildingId): JsonResponse
    {
        $blocks = Block::where('building_id', $buildingId)->get();

        return response()->json([
            'success' => true,
            'data' => $blocks,
        ]);
    }

    public function store(Request $request, $buildingId): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string'],
            'floor_count' => ['required', 'integer', 'min:1'],
            'unit_count' => ['required', 'integer', 'min:1'],
        ]);

        $block = Block::create([
            'building_id' => $buildingId,
            'name' => $request->name,
            'floor_count' => $request->floor_count,
            'unit_count' => $request->unit_count,
        ]);

        return response()->json([
            'success' => true,
            'data' => $block,
        ], 201);
    }
}
