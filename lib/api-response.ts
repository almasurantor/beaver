import { NextResponse } from 'next/server';

export function apiError(error: unknown, fallback = 'Request failed') {
  const message = error && typeof error === 'object' && 'message' in error
    ? String((error as { message: unknown }).message)
    : fallback;
  return NextResponse.json({ error: message }, { status: 400 });
}
