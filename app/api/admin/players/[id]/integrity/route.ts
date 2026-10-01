import { createClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api-response';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.rpc('admin_set_player_integrity_v2', {
    p_player: params.id, p_level: body.level, p_reason: body.reason || null,
  });
  if (error) return apiError(error);
  return NextResponse.json({ integrity: Array.isArray(data) ? data[0] : data });
}
