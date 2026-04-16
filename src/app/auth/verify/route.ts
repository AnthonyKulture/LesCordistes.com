export const dynamic = 'force-dynamic';

const SUPABASE_VERIFY_URL = 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/auth/v1/verify';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const target = new URL(SUPABASE_VERIFY_URL);
  searchParams.forEach((value, key) => target.searchParams.set(key, value));
  return Response.redirect(target.toString(), 302);
}
