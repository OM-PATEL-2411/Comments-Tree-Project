import { NextResponse } from "next/server";

export function successResponse(message, data = {}, status = 200) {
    return NextResponse.json(
        {
            success: true,
            message,
            data
        },
        { status }
    );
}

export function errorResponse(message, status = 500) {
    return NextResponse.json(
        {
            success: false,
            message
        },
        { status }
    );
}