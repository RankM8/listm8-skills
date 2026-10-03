import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { ImportView, LocalRun, RunView, StageView } from '../types'
import {
  BRAND,
  FIT_LABEL,
  RUN_STATUS_LABEL,
  STAGE_LABEL,
  appLink,
  bar,
  importFrom,
  leadsThrough,
  leadsFrom,
  payloadOf,
  runFrom,
  type LeadList,
  type LeadRow,
} from './model'

/**
 * The outreach MCP tools' results drawn readable and clickable in the chat,
 * and the lead runs of this chat as one band above the prompt. The band asks
 * the server itself only for those runs, every POLL_MS, until each has ended.
 */

const PREVIEW_ROWS = 6
const POLL_MS = 10_000
/** How long a run that ended stays in the band. */
const LINGER_MS = 120_000

const runs = atom({ plugin: 'outreach', key: 'runs' } as const, {})
const locals = atom({ plugin: 'outreach', key: 'locals' } as const, {})
const frame = atom({ plugin: 'outreach', key: 'frame' } as const, 0)
let configuredServer = 'akquise'
let poller: { cancel: () => void } | null = null
let spinner: { cancel: () => void } | null = null

let base = 'https://outreach.akquise.de'

/**
 * Which MCP servers speak the outreach tools. A server is recognised by
 * what it offers, not by its name: every customer names it as they like when
 * setting it up ("akquise", "listm8", "Outreach" ...), and one session may hold
 * several (a paid account and a local one). Cached per session; a server first
 * seen later (still connecting at start) is looked up when its first call comes.
 */
const SIGNATURE = ['list_leads', 'start_lead_run', 'get_lead_run_status'] as const
const OUR_TOOLS = new Set([
  'list_leads', 'search_leads', 'get_lead_data', 'start_lead_run', 'get_lead_run_status', 'cancel_lead_run',
  'list_lead_runs', 'import_leads', 'get_job_status', 'write_lead_details', 'save_lead_variables',
])
let knownServers = new Map<string, boolean>()

type Recognized = { server: string; name: string }

const parseTool = (tool: string): Recognized | null => {
  const m = /^mcp__(.+)__([a-z_]+)$/.exec(tool)
  return m && m[1] !== undefined && m[2] !== undefined ? { server: m[1], name: m[2] } : null
}

/** Re-reads the tool list and notes, per MCP server, whether it offers the whole signature. */
const refreshServers = async ($: EngineInterface) => {
  const offered = new Map<string, Set<string>>()
  let tools: Awaited<ReturnType<EngineInterface['tool']['list']>> = []
  try {
    tools = await $.tool.list()
  } catch {
    return // No list now: keep what is known; the configured server still works.
  }
  for (const info of tools) {
    const parsed = info.mcp ? parseTool(info.name) : null
    if (parsed === null) continue
    const names = offered.get(parsed.server) ?? new Set<string>()
    names.add(parsed.name)
    offered.set(parsed.server, names)
  }
  for (const [srv, names] of offered) knownServers.set(srv, SIGNATURE.every(n => names.has(n)))
}

/** The outreach call behind a tool name, or null when the tool is not one of ours. */
const recognize = async ($: EngineInterface, tool: string): Promise<Recognized | null> => {
  const parsed = parseTool(tool)
  if (parsed === null || !OUR_TOOLS.has(parsed.name)) return null
  if (parsed.server === configuredServer) return parsed
  if (!knownServers.has(parsed.server)) await refreshServers($)
  return knownServers.get(parsed.server) === true ? parsed : null
}

/** Every server recognised now, the configured one included. */
const akquiseServers = async ($: EngineInterface): Promise<string[]> => {
  await refreshServers($)
  const found = [...knownServers].filter(([, ok]) => ok).map(([srv]) => srv)
  return found.includes(configuredServer) ? found : [...found, configuredServer]
}

type El = ReturnType<EngineInterface['ui']['resolve']>

/** A run's page: the link its server sent, else built from the configured app address. */
const runHref = (run: RunView) => run.appUrl ?? appLink(base, `/campaigns/${run.campaignId}/leads`)

const leadPreview = (el: El, list: LeadList) => {
  const { Box, Text, Link } = el
  const shown = list.leads.slice(0, PREVIEW_ROWS)
  const more = list.total - shown.length
  const cid = list.campaign?.id
  const leadHref = (lead: LeadRow) => lead.appUrl ?? appLink(base, cid ? `/campaigns/${cid}/leads/${lead.id}` : `/leads/${lead.id}`)

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={BRAND.accent} paddingX={1}>
      <Box gap={1}>
        <Text bold>{`${list.total} ${list.total === 1 ? 'Lead' : 'Leads'}`}</Text>
        {list.campaign && <Text dimColor>{`in „${list.campaign.name}“`}</Text>}
      </Box>
      {shown.map(lead => {
        const fit = FIT_LABEL[lead.fit]
        return (
          <Box key={`lead-${lead.id}`} gap={1}>
            <Text color={fit?.color ?? 'gray'}>●</Text>
            <Box width={28}><Text wrap="truncate-end">{lead.company}</Text></Box>
            <Box width={12}><Text dimColor wrap="truncate-end">{lead.city || '–'}</Text></Box>
            <Box width={14}><Text color={fit?.color} dimColor={fit === undefined} wrap="truncate-end">{fit?.text ?? 'nicht bewertet'}</Text></Box>
            <Box width={4}><Text dimColor>{lead.score === null ? '' : String(lead.score)}</Text></Box>
            <Link href={leadHref(lead)} label="Öffnen ↗" />
          </Box>
        )
      })}
      <Box gap={1}>
        {more > 0 && <Text dimColor>{`… ${more} weitere`}</Text>}
        <Link href={list.campaign?.appUrl ?? appLink(base, cid ? `/campaigns/${cid}/leads` : '/leads')} label="Alle in der App ↗" />
      </Box>
    </Box>
  )
}

/** In the chat a started run is one line; its progress lives in the band. */
const startLine = (el: El, run: RunView) => {
  const { Box, Text, Link } = el
  const stages = run.stages.map(s => STAGE_LABEL[s.stage] ?? s.stage).join(' + ')
  const budget = run.budgetUsd === null ? '' : ` · Budget ${run.budgetUsd.toFixed(2)} $`

  return (
    <Box gap={1}>
      <Text color={BRAND.accent}>▶</Text>
      <Text>{`Lead-Run gestartet · ${run.leadTotal} Leads · ${stages}${budget}`}</Text>
      <Text dimColor>· Fortschritt über dem Prompt</Text>
      {(run.appUrl !== null || run.campaignId > 0) && <Link href={runHref(run)} label="Öffnen ↗" />}
    </Box>
  )
}

const RUN_COLOR = (run: RunView) =>
  !run.isTerminal ? BRAND.accent : run.status === 'completed' ? BRAND.done : run.status === 'cancelled' ? 'gray' : BRAND.warn

/** One run in the band: the stage it is in, done against the lead total, and why it stopped if it did. */
const STAGE_SHORT: Record<string, string> = { qualification: 'Qual.', research: 'Rech.', email: 'Mail' }

/** Cells of a two-part bar: finished, set aside, and what is left, over `width`. */
const barCells = (total: number, finished: number, setAside: number, width: number): [number, number, number] => {
  const cells = (n: number) => (total > 0 ? Math.round((Math.min(n, total) / total) * width) : 0)
  const done = cells(finished)
  const aside = Math.max(0, cells(finished + setAside) - done)
  return [done, aside, width - done - aside]
}

/**
 * One run as one row of the band, for when several share it. It never wraps:
 * the left part shrinks and cuts with an ellipsis, cost and link stay put on
 * the right. Of the stages it names only the one at work, so rows of runs with
 * different stages still line up.
 */
const bandRow = (el: El, run: RunView, step: number) => {
  const { Box, Text, Link } = el
  const color = RUN_COLOR(run)
  const isShort = run.isTerminal && run.status !== 'completed'
  const finished = run.stages[run.stages.length - 1]?.completed ?? 0
  const failed = run.stages.reduce((sum, s) => sum + s.failed, 0)
  const setAside = isShort ? 0 : Math.max(0, leadsThrough(run) - finished - failed)
  const [doneCells, asideCells, restCells] = barCells(run.leadTotal, finished, setAside, 10)
  const inFlight = (s: StageView) => (run.isTerminal ? 0 : (s.pending || 0) + (s.running || 0))
  // The stage at work: the furthest one with jobs in flight, else the last one begun.
  const working = [...run.stages].reverse().find(s => inFlight(s) > 0)
  const shown = working ?? [...run.stages].reverse().find(s => s.total > 0) ?? run.stages[0]
  const state = run.isTerminal
    ? (RUN_STATUS_LABEL[run.status] ?? run.status)
    : `${finished} fertig${setAside > 0 ? ` · ${setAside} raus` : ''}`
  const stage = shown === undefined || run.isTerminal ? '' : `${STAGE_SHORT[shown.stage] ?? shown.stage} ${shown.completed}/${shown.total}`

  return (
    <Box key={`run-${run.id}`} flexDirection="column">
      <Box>
        <Box flexGrow={1} flexShrink={1} gap={1}>
          <Text bold color={working !== undefined ? BRAND.accent : color}>
            {working !== undefined ? SPIN[step % SPIN.length] : run.isTerminal ? '■' : '▶'}
          </Text>
          <Box width={9} flexShrink={0}><Text>{`${run.leadTotal} Leads`}</Text></Box>
          <Box flexShrink={0}>
            <Text color={color}>{'█'.repeat(doneCells)}</Text>
            <Text dimColor>{'█'.repeat(asideCells)}</Text>
            <Text color={color} dimColor>{'░'.repeat(restCells)}</Text>
          </Box>
          <Text bold color={run.isTerminal ? color : undefined} wrap="truncate-end">{state}</Text>
          {stage !== '' && <Text dimColor wrap="truncate-end">{`· ${stage}`}</Text>}
          {failed > 0 && <Text color={BRAND.error} wrap="truncate-end">{`· ${failed} Fehler`}</Text>}
        </Box>
        <Box flexShrink={0} gap={2} marginLeft={1}>
          <Text dimColor>{`${run.spentUsd.toFixed(2)} $`}</Text>
          {(run.appUrl !== null || run.campaignId > 0) && <Link href={runHref(run)} label="Öffnen ↗" />}
        </Box>
      </Box>
      {run.reason !== null && <Text color={BRAND.warn} wrap="truncate-end">{`  ${run.reason}`}</Text>}
    </Box>
  )
}

/**
 * One run as a funnel, a row per stage: each stage against the leads that reached it,
 * so 10 qualified, 5 passed on, 5 in research reads as it happened. The stage at work
 * turns a spinner; one already done shows a tick.
 */
const funnelRun = (el: El, run: RunView, step: number) => {
  const { Box, Text, Link } = el
  const color = RUN_COLOR(run)
  const budget = run.budgetUsd === null ? '' : `/${run.budgetUsd.toFixed(2)}`
  const head = run.isTerminal ? (RUN_STATUS_LABEL[run.status] ?? run.status) : `${run.leadTotal} Leads`

  return (
    <Box key={`funnel-${run.id}`} flexDirection="column">
      <Box justifyContent="space-between">
        <Box gap={1}>
          <Text bold>Outreach · Lead-Run</Text>
          <Text color={color}>{`· ${head}`}</Text>
        </Box>
        <Box gap={2}>
          <Text dimColor>{`${run.spentUsd.toFixed(2)}${budget} $`}</Text>
          {(run.appUrl !== null || run.campaignId > 0) && <Link href={runHref(run)} label="Öffnen ↗" />}
        </Box>
      </Box>
      {run.stages.map((s, i) => {
        const prev = run.stages[i - 1]
        const next = run.stages[i + 1]
        // The first stage is reached by every lead once the run has prepared; later ones by those passed on.
        const reached = i === 0 && s.total === 0 && run.status === 'preparing' ? run.leadTotal : s.total
        // An ended run has nothing in flight, whatever its last counters still say.
        const inFlight = (x: StageView) => (run.isTerminal ? 0 : (x.pending || 0) + (x.running || 0))
        const live = inFlight(s)
        const earlierLive = run.stages.slice(0, i).some(p => inFlight(p) > 0)
        const isDone = reached > 0 && live === 0 && !earlierLive
        const isSkipped = reached === 0 && (run.isTerminal || (prev !== undefined && !earlierLive && run.status !== 'preparing'))
        const mark = live > 0 ? SPIN[step % SPIN.length] : isDone ? '✓' : isSkipped ? '–' : '·'
        const markColor = live > 0 ? BRAND.accent : isDone ? BRAND.done : undefined
        const out = next !== undefined && s.stage === 'qualification' && isDone ? Math.max(0, s.completed - next.total) : 0
        const notes = [
          out > 0 ? `${next !== undefined ? next.total : 0} passen · ${out} raus` : '',
          live > 0 && s.running > 0 ? `${s.running} laufen` : '',
          live > 0 && (s.pending || 0) > 0 ? `${s.pending} warten` : '',
          isSkipped ? 'übersprungen' : '',
          !isDone && !isSkipped && live === 0 ? 'wartet' : '',
        ].filter(n => n !== '')

        return (
          <Box key={`funnel-${run.id}-${s.stage}`} gap={1}>
            <Text color={markColor} dimColor={markColor === undefined}>{mark}</Text>
            <Box width={15}><Text dimColor={!isDone && live === 0}>{STAGE_LABEL[s.stage] ?? s.stage}</Text></Box>
            <Text color={isDone ? BRAND.done : BRAND.accent} dimColor={!isDone && live === 0}>{bar(s.completed, Math.max(1, reached), 10)}</Text>
            <Box width={7}><Text>{reached > 0 ? `${s.completed}/${reached}` : '–'}</Text></Box>
            <Text dimColor>{notes.join(' · ')}</Text>
            {s.failed > 0 && <Text color={BRAND.error}>{`· ${s.failed} Fehler`}</Text>}
          </Box>
        )
      })}
      {run.reason !== null && <Text color={BRAND.warn} wrap="wrap">{run.reason}</Text>}
    </Box>
  )
}

/** One local workflow phase as one row: counted from the writes, so exact and without polling. */
const localRow = (el: El, local: LocalRun) => {
  const { Box, Text, Link } = el
  const done = local.doneLeadIds.length
  const color = local.isTerminal ? (done >= local.total ? BRAND.done : BRAND.warn) : BRAND.local

  return (
    <Box key={`local-${local.id}`} justifyContent="space-between">
      <Box gap={1}>
        <Text bold color={color}>{local.isTerminal ? '■' : '▶'}</Text>
        <Box width={9}><Text>{`${local.total} Leads`}</Text></Box>
        <Text color={color}>{bar(done, local.total, 14)}</Text>
        <Box width={13}>
          <Text bold color={local.isTerminal ? color : undefined}>{local.isTerminal ? 'fertig' : `${done} fertig`}</Text>
        </Box>
        <Text>{STAGE_LABEL[local.phase] ?? local.phase}</Text>
        <Text dimColor>· lokal in Claude</Text>
      </Box>
      <Link href={appLink(base, `/campaigns/${local.campaignId}/leads`)} label="Öffnen ↗" />
    </Box>
  )
}

/** Server runs and local phases in one frame. A single run shows as a funnel; several as a row each. */
const band = (el: El, shown: RunView[], phases: LocalRun[], step: number) => {
  const { Box, Text } = el
  const count = shown.length + phases.length
  const active = shown.filter(r => !r.isTerminal).length + phases.filter(l => !l.isTerminal).length
  const allGood = shown.every(r => r.status === 'completed') && phases.every(l => l.doneLeadIds.length >= l.total)
  const color = active > 0 ? BRAND.accent : allGood ? BRAND.done : BRAND.warn
  const single = shown.length === 1 && phases.length === 0 ? shown[0] : undefined

  if (single !== undefined) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={color} paddingX={1}>
        {funnelRun(el, single, step)}
      </Box>
    )
  }

  const summary = active === 0 ? 'alle beendet' : active === 1 ? '1 läuft' : `${active} laufen`

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={color} paddingX={1}>
      <Box justifyContent="space-between">
        <Text bold>{`Outreach · ${count} Läufe`}</Text>
        <Text color={color}>{summary}</Text>
      </Box>
      {shown.map(run => bandRow(el, run, step))}
      {phases.map(local => localRow(el, local))}
    </Box>
  )
}

/** How many runs that have ended stay in the band beside the ones still going. */
const ENDED_SHOWN = 2

/**
 * Every run still going, oldest first, then the few that ended last. No cap on
 * the active ones: a run started last still belongs in the band, with 0 % too.
 * (list_lead_runs answers newest first, so insertion order is no start order.)
 */
const bandRuns = (all: RunView[]): RunView[] => [
  ...all.filter(r => !r.isTerminal).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
  ...all
    .filter(r => r.isTerminal)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
    .slice(0, ENDED_SHOWN),
]

const bandPhases = (all: LocalRun[]): LocalRun[] => [
  ...all.filter(l => !l.isTerminal),
  ...all
    .filter(l => l.isTerminal)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
    .slice(0, ENDED_SHOWN),
]

// ── the runs of this chat ────────────────────────────────────────────────

const call = async ($: EngineInterface, server: string, tool: string, args: Record<string, unknown>) => {
  const res = await $.mcp.call(server, tool, args)
  return res.isError ? null : payloadOf(res.structuredContent ?? res.content)
}

/** Keeps a run's newest state; says so in a toast when it has just ended. */
const putRun = async ($: EngineInterface, payload: Record<string, unknown>, server: string) => {
  let ended: RunView | null = null
  await update($, runs, all => {
    const id = String(payload.id ?? payload.lead_run_id ?? '')
    const before = all[id]
    const next = runFrom(payload, before)
    if (next === null) return all
    next.server = server
    if (next.isTerminal && next.finishedAt === null) next.finishedAt = Date.now()
    if (next.isTerminal && before !== undefined && !before.isTerminal) ended = next
    return { ...all, [next.id]: next }
  })
  if (ended !== null) {
    const run: RunView = ended
    $.ui.toast(`Outreach: Lead-Run ${RUN_STATUS_LABEL[run.status] ?? run.status}`)
  }
}

/** Asks for each run still going; stops asking once none is. Ended runs leave the band after LINGER_MS. */
const tick = async ($: EngineInterface) => {
  for (const run of Object.values(await read($, runs))) {
    if (run.isTerminal) continue
    try {
      const server = run.server || configuredServer
      const status = await call($, server, 'get_lead_run_status', { lead_run_id: run.id })
      if (status) await putRun($, status, server)
    } catch {
      // Not connected right now: the next tick tries again.
    }
  }
  const now = Date.now()
  await update($, runs, all =>
    Object.fromEntries(Object.entries(all).filter(([, r]) => r.finishedAt === null || now - r.finishedAt < LINGER_MS)),
  )
  const left = Object.values(await read($, runs))
  if (!left.some(r => !r.isTerminal)) {
    poller?.cancel()
    poller = null
    // One last pass once the ended ones are due to leave.
    if (left.length > 0) $.clock.after(LINGER_MS, () => void tick($))
  }
}

// ── workflow phases Claude runs itself ───────────────────────────────────

const PHASES = ['qualification', 'research', 'email'] as const
type Phase = (typeof PHASES)[number]

const localKey = (campaignId: number, phase: Phase) => `${campaignId}:${phase}`

/** Which phase a successful write belongs to: email variables, a verdict, or research. */
const phaseOfWrite = (name: string | null, input: Record<string, unknown>): Phase | null => {
  if (name === 'save_lead_variables') return 'email'
  if (name !== 'write_lead_details' || input.dry_run === true) return null
  const fields = typeof input.fields === 'object' && input.fields !== null ? Object.keys(input.fields) : []
  return fields.some(f => f.startsWith('qualification')) ? 'qualification' : 'research'
}

/** Counts one lead as done for its phase; the phase ends once every lead of it is. */
const countWrite = async ($: EngineInterface, phase: Phase, input: Record<string, unknown>) => {
  const campaignId = Number(input.campaign_id)
  const leadId = Number(input.lead_id)
  if (!Number.isFinite(campaignId) || !Number.isFinite(leadId)) return
  let ended: LocalRun | null = null
  await update($, locals, all => {
    const key = localKey(campaignId, phase)
    const local = all[key]
    if (local === undefined || local.isTerminal || local.doneLeadIds.includes(leadId)) return all
    const doneLeadIds = [...local.doneLeadIds, leadId]
    const isTerminal = doneLeadIds.length >= local.total
    const next = { ...local, doneLeadIds, isTerminal, finishedAt: isTerminal ? Date.now() : null }
    if (isTerminal) ended = next
    return { ...all, [key]: next }
  })
  if (ended !== null) await endLocal($, ended)
}

const endLocal = async ($: EngineInterface, local: LocalRun) => {
  $.ui.toast(`Outreach: ${STAGE_LABEL[local.phase] ?? local.phase} fertig · ${local.doneLeadIds.length}/${local.total} Leads`)
  $.clock.after(LINGER_MS, () =>
    void update($, locals, all => {
      const now = Date.now()
      return Object.fromEntries(Object.entries(all).filter(([, l]) => l.finishedAt === null || now - l.finishedAt < LINGER_MS))
    }),
  )
}

type ProgressInput = { campaign_id?: unknown; phase?: unknown; total?: unknown; action?: unknown }

/** What the workflow skills call: a phase begins with its lead count, or ends. */
const reportProgress = async ($: EngineInterface, input: ProgressInput): Promise<string> => {
  const campaignId = Number(input.campaign_id)
  const phase = PHASES.find(p => p === input.phase)
  if (!Number.isFinite(campaignId) || phase === undefined) return 'campaign_id und phase (qualification|research|email) angeben.'
  const key = localKey(campaignId, phase)
  if (input.action === 'end') {
    const local = (await read($, locals))[key]
    if (local === undefined || local.isTerminal) return 'Keine laufende Phase dazu.'
    const ended = { ...local, isTerminal: true, finishedAt: Date.now() }
    await update($, locals, all => ({ ...all, [key]: ended }))
    await endLocal($, ended)
    return `Phase beendet: ${ended.doneLeadIds.length}/${ended.total} Leads.`
  }
  // A phase already going keeps its count: a skill that starts it again for its next batch must not reset it.
  const going = (await read($, locals))[key]
  if (going !== undefined && !going.isTerminal) {
    return `Phase läuft bereits: ${STAGE_LABEL[phase]} · ${going.doneLeadIds.length}/${going.total} Leads.`
  }
  const total = Math.max(1, Math.floor(Number(input.total)) || 1)
  const local: LocalRun = { id: key, campaignId, phase, total, doneLeadIds: [], isTerminal: false, finishedAt: null }
  await update($, locals, all => ({ ...all, [key]: local }))
  spin($)
  return `Fortschritt läuft im Band: ${STAGE_LABEL[phase]} · 0/${total} Leads. Gezählt wird jeder erfolgreiche Schreibaufruf.`
}

/** The runs still going from a list_lead_runs answer join the band; ended ones are history and stay out. */
const putActiveRuns = async ($: EngineInterface, payload: Record<string, unknown>, server: string): Promise<number> => {
  const listed = Array.isArray(payload.runs) ? payload.runs : []
  let active = 0
  for (const run of listed) {
    if (typeof run !== 'object' || run === null) continue
    const one = run as Record<string, unknown>
    if (one.is_terminal === true) continue
    await putRun($, one, server)
    active += 1
  }
  if (active > 0) watch($)
  return active
}

const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const SPIN_MS = 250

/** Turns the band's spinner while anything runs, and stops itself once nothing does. */
const spin = ($: EngineInterface) => {
  if (spinner !== null) return
  spinner = $.clock.every(SPIN_MS, () =>
    void (async () => {
      const going =
        Object.values(await read($, runs)).some(r => !r.isTerminal) ||
        Object.values(await read($, locals)).some(l => !l.isTerminal)
      if (!going) {
        spinner?.cancel()
        spinner = null
        return
      }
      await update($, frame, n => (n + 1) % SPIN.length)
    })(),
  )
}

const watch = ($: EngineInterface) => {
  if (poller === null) poller = $.clock.every(POLL_MS, () => void tick($))
  spin($)
}

const importCard = (el: El, job: ImportView) => {
  const { Box, Text, Link } = el
  const color = job.isTerminal ? (job.status === 'completed' ? BRAND.done : BRAND.error) : BRAND.accent
  const summary =
    job.status === 'completed'
      ? `${job.imported ?? job.received} importiert${job.duplicates ? `, ${job.duplicates} Duplikate` : ''}`
      : job.isTerminal
        ? 'fehlgeschlagen'
        : job.message || 'in der Warteschlange'

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={BRAND.accent} paddingX={1}>
      <Box gap={1}>
        <Text bold color={color}>Import</Text>
        {job.received > 0 && <Text>{`${job.received} Leads`}</Text>}
        <Text dimColor>{summary}</Text>
      </Box>
      {!job.isTerminal && (
        <Box gap={1}>
          <Text color={color}>{bar(job.percent, 100)}</Text>
          <Text>{`${job.percent} %`}</Text>
        </Box>
      )}
      <Link href={job.appUrl ?? appLink(base, job.campaignId ? `/campaigns/${job.campaignId}/leads` : '/jobs')} label="In der App öffnen ↗" />
    </Box>
  )
}

/** The card for one outreach call, or null when it is not ours or carries nothing to draw. */
const cardFor = (el: El, name: string | null, output: unknown, key: string) => {
  if (name === null) return null
  const payload = payloadOf(output)
  if (payload === null) return null
  const { Box } = el
  let card = null
  if (name === 'list_leads' || name === 'search_leads' || name === 'get_lead_data') {
    const list = leadsFrom(payload)
    card = list && list.leads.length > 0 ? leadPreview(el, list) : null
  } else if (name === 'start_lead_run') {
    const run = runFrom(payload)
    card = run ? startLine(el, run) : null
  } else if (name === 'import_leads' || name === 'get_job_status') {
    const job = importFrom(payload)
    card = job ? importCard(el, job) : null
  }
  return card === null ? null : <Box key={`outreach-${key}`}>{card}</Box>
}

/** The progress tool skills call in manual mode; may fail where a server already carries this plugin's name. */
const registerProgressTool = async ($: EngineInterface) => {
  await $.tool.register({
    name: 'outreach_progress',
    description:
      'Zeigt den Fortschritt einer Outreach-Phase, die du selbst mit Subagents ausführst (Manuell-Modus von ' +
      'outreach-qualify, outreach-research, outreach-generate), im Outreach-Band über dem Prompt. Zu Beginn jeder Phase ' +
      'einmal mit action=start, campaign_id, phase (qualification|research|email) und total (Anzahl Leads der Phase) aufrufen. ' +
      'Gezählt wird danach automatisch: jeder erfolgreiche write_lead_details- bzw. save_lead_variables-Aufruf für einen ' +
      'Lead dieser Kampagne zählt als erledigt. action=end schließt die Phase vorzeitig ab. Nicht für Server-Läufe (start_lead_run).',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['start', 'end'] },
        campaign_id: { type: 'integer' },
        phase: { type: 'string', enum: ['qualification', 'research', 'email'] },
        total: { type: 'integer', minimum: 1 },
      },
      required: ['campaign_id', 'phase'],
    },
  })
}

export const register: Register = (on, options) => {
  configuredServer = String(options.mcpServer ?? 'akquise').replace(/[^A-Za-z0-9_-]/g, '_')
  knownServers = new Map()
  poller = null
  spinner = null
  base = String(options.appUrl ?? 'https://outreach.akquise.de')

  // A standalone tool row: our card in place of the engine's result block.
  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    if (e.props.isErrored) return next(e)
    const card = cardFor($.ui.resolve(e), (await recognize($, e.props.tool))?.name ?? null, e.props.output, e.props.tool_use_id)
    return card ?? next(e)
  })

  // Lookups like list_leads are folded into one group line ("Called akquise …"):
  // the engine's line stays, our cards follow beneath it.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    const el = $.ui.resolve(e)
    const cards = []
    for (const [i, c] of e.props.calls.entries()) {
      if (c.isRunning || c.isErrored || c.isInterrupted) continue
      const card = cardFor(el, (await recognize($, c.tool))?.name ?? null, c.output, c.tool_use_id ?? `call-${i}`)
      if (card !== null) cards.push(card)
    }
    if (cards.length === 0) return next(e)
    const { Box } = el
    const line = await next(e)

    return (
      <Box flexDirection="column">
        {line}
        {cards}
      </Box>
    )
  })

  // After a reload the timer is gone but the runs are kept: pick up the ones still going.
  // Each part stands alone: one that fails (an MCP server already named like
  // this plugin, an older engine) must not take the others down with it.
  on('session.start', async ($, e, next) => {
    try {
      await registerProgressTool($)
    } catch {
      // The band and /outreach-runs work without the progress tool.
    }
    try {
      await $.command.register({
        name: 'outreach-runs',
        description: 'Laufende Outreach-Lead-Runs über dem Prompt anzeigen',
      })
    } catch {
      // Without the command, runs still join the band when Claude checks them.
    }
    try {
      if (Object.values(await read($, runs)).some(r => !r.isTerminal)) watch($)
    } catch {
      // Nothing to resume.
    }
    return next(e)
  })


  // One command, no wording needed: every run still going appears in the band.
  on('command.run', { command: 'outreach-runs' }, async $ => {
    let active = 0
    let reached = 0
    for (const server of await akquiseServers($)) {
      try {
        const listed = await call($, server, 'list_lead_runs', { active_only: true })
        reached += 1
        if (listed !== null) active += await putActiveRuns($, listed, server)
      } catch {
        // Not connected: the others may still answer.
      }
    }
    if (reached === 0) return { text: 'Der Outreach-MCP ist nicht erreichbar – ist er verbunden?' }
    return { text: active === 0 ? 'Gerade läuft kein Lead-Run.' : `${active} laufende(r) Lead-Run(s) – Fortschritt über dem Prompt.` }
  })

  on('tool.call', { tool: 'mcp__outreach__outreach_progress' }, async ($, e) => ({
    result: await reportProgress($, e as unknown as ProgressInput),
  }))

  // A run Claude starts, checks or lists as running joins the band, and the band keeps it current.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError === true) return ran
    const recognized = await recognize($, e.tool)
    if (recognized === null) return ran
    const { name, server } = recognized
    const written = phaseOfWrite(name, e as unknown as Record<string, unknown>)
    if (written !== null) {
      await countWrite($, written, e as unknown as Record<string, unknown>)
      return ran
    }
    if (name === 'list_lead_runs') {
      const listed = payloadOf(ran.result)
      if (listed !== null) await putActiveRuns($, listed, server)
      return ran
    }
    const isRun = name === 'start_lead_run' || name === 'get_lead_run_status' || name === 'cancel_lead_run'
    if (!isRun) return ran
    const payload = payloadOf(ran.result)
    if (payload !== null) {
      await putRun($, payload, server)
      watch($)
    }
    return ran
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const shown = bandRuns(Object.values(await read($, runs)))
    const phases = bandPhases(Object.values(await read($, locals)))
    if (e.props.hasSurvey || shown.length + phases.length === 0) return next(e)
    return band($.ui.resolve(e), shown, phases, await read($, frame))
  })
}
