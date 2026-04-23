import { requireAdmin } from '@/lib/ops/guard'
import { runTool, TOOL_NAMES } from '@/lib/ops/tools'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Body = {
    name: string
    input: Record<string, unknown>
    tool_use_id?: string
}

export async function POST(req: Request) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const body = (await req.json()) as Body
    if (!body?.name || !(TOOL_NAMES as string[]).includes(body.name)) {
        return Response.json({ error: `Unknown tool: ${body?.name}` }, { status: 400 })
    }
    if (!body.input || typeof body.input !== 'object') {
        return Response.json({ error: 'input required' }, { status: 400 })
    }

    const result = await runTool(body.name, body.input, guard.user.id)
    return Response.json({
        tool_use_id: body.tool_use_id,
        result,
    })
}
