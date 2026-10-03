import type { ImportView, RunView, StageView } from '../types'

/** Die Farben des Bands (Akquise-Palette). */
export const BRAND = {
  /** primary 500, Grün: Rahmen, laufende Arbeit, Fortschritt. */
  accent: '#36ae66',
  /** primary 400: Erledigtes, damit es sich vom Laufenden abhebt. */
  done: '#6fc68e',
  /** primary 300: Phasen, die Claude lokal ausführt. */
  local: '#a8dfbd',
  warn: '#f59e0b',
  error: '#ef4444',
} as const

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)

/**
 * Pulls the JSON object out of whatever an MCP tool result looks like by the
 * time it reaches us: structuredContent, content blocks, a JSON string or the
 * object itself.
 */
export function payloadOf(v: unknown): Obj | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') {
    try {
      const parsed: unknown = JSON.parse(v)
      return isObj(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  if (Array.isArray(v)) {
    for (const block of v) {
      if (isObj(block) && block.type === 'text') {
        const found = payloadOf(block.text)
        if (found) return found
      }
    }
    return null
  }
  if (!isObj(v)) return null
  if (isObj(v.structuredContent)) return v.structuredContent
  if ('content' in v && !('leads' in v)) return payloadOf(v.content)
  return v
}

export const TERMINAL_RUN = new Set([
  'completed',
  'completed_with_failures',
  'cancelled',
  'budget_exhausted',
  'limit_exhausted',
  'provider_exhausted',
  'failed',
])

export const RUN_STATUS_LABEL: Record<string, string> = {
  preparing: 'wird vorbereitet',
  running: 'läuft',
  completed: 'fertig',
  completed_with_failures: 'fertig, mit Fehlern',
  cancelled: 'abgebrochen',
  budget_exhausted: 'Budget aufgebraucht',
  limit_exhausted: 'Planlimit erreicht',
  provider_exhausted: 'KI-Anbieter nicht verfügbar',
  failed: 'fehlgeschlagen',
}

export const STAGE_LABEL: Record<string, string> = {
  qualification: 'Qualifizierung',
  research: 'Recherche',
  email: 'E-Mail',
}

export const FIT_LABEL: Record<string, { text: string; color: string }> = {
  highly_qualified: { text: 'sehr passend', color: BRAND.done },
  qualified: { text: 'passend', color: BRAND.done },
  mid_qualified: { text: 'bedingt', color: BRAND.warn },
  not_qualified: { text: 'passt nicht', color: BRAND.error },
}

/** A run from get_lead_run_status / list_lead_runs (camelCase) or start_lead_run (snake_case). */
export function runFrom(p: Obj, previous?: RunView): RunView | null {
  const id = str(p.id) || str(p.lead_run_id)
  if (id === '') return null
  const status = str(p.status === 'success' ? p.run_status : p.status, previous?.status ?? 'preparing')
  const stageNames = Array.isArray(p.stages) ? p.stages.filter((s): s is string => typeof s === 'string') : []
  const progress = Array.isArray(p.stageProgress) ? p.stageProgress.filter(isObj) : []
  const stages: StageView[] = (stageNames.length > 0 ? stageNames : (previous?.stages.map(s => s.stage) ?? [])).map(stage => {
    const row = progress.find(r => r.stage === stage)
    const before = previous?.stages.find(s => s.stage === stage)
    return {
      stage,
      total: num(row?.total, before?.total ?? 0),
      pending: num(row?.pending, before?.pending ?? 0),
      running: num(row?.running, before?.running ?? 0),
      completed: num(row?.completed, before?.completed ?? 0),
      failed: row ? num(row.failed) + num(row.noResult) + num(row.cancelled) : (before?.failed ?? 0),
    }
  })
  const isTerminal = p.is_terminal === true || TERMINAL_RUN.has(status)

  return {
    id,
    campaignId: num(p.campaignId ?? p.campaign_id, previous?.campaignId ?? 0),
    status,
    stages,
    leadTotal: num(p.leadTotal ?? p.lead_total, previous?.leadTotal ?? 0),
    spentUsd: num(p.spentUsd, previous?.spentUsd ?? 0),
    budgetUsd: typeof (p.budgetUsd ?? p.budget_usd) === 'number' ? num(p.budgetUsd ?? p.budget_usd) : (previous?.budgetUsd ?? null),
    isTerminal,
    isDemo: previous?.isDemo ?? false,
    finishedAt: previous?.finishedAt ?? null,
    server: previous?.server ?? '',
    createdAt: previous?.createdAt ?? (Date.parse(str(p.createdAt)) || Date.now()),
    appUrl: urlOf(p.appUrl) ?? previous?.appUrl ?? null,
    reason: isTerminal && status !== 'completed' ? str(p.statusReason) || str(p.status_description) || null : null,
  }
}

/** An import from import_leads (queued) or get_job_status (progress, result). */
export function importFrom(p: Obj, previous?: ImportView): ImportView | null {
  const id = str(p.job_id)
  if (id === '') return null
  const execution = isObj(p.execution) ? p.execution : null
  const result = isObj(p.result) ? p.result : null
  const status = p.status === 'success' && p.queued === true ? 'pending' : str(p.status, previous?.status ?? 'pending')
  const isTerminal = ['completed', 'failed', 'cancelled'].includes(status)

  return {
    id,
    status,
    percent: status === 'completed' ? 100 : num(execution?.progress_percent, previous?.percent ?? 0),
    message: str(execution?.progress_message, previous?.message ?? ''),
    received: num(p.received, previous?.received ?? num(result?.total)),
    campaignId: typeof p.campaign_id === 'number' ? p.campaign_id : (previous?.campaignId ?? null),
    imported: typeof result?.imported === 'number' ? result.imported : (previous?.imported ?? null),
    duplicates: typeof result?.duplicates === 'number' ? result.duplicates : (previous?.duplicates ?? null),
    isTerminal,
    isDemo: previous?.isDemo ?? false,
    finishedAt: previous?.finishedAt ?? null,
    appUrl: urlOf(p.appUrl) ?? previous?.appUrl ?? null,
  }
}

export type LeadRow = {
  id: number
  /** The lead's page in the app as the server names it; null when it names none. */
  appUrl: string | null
  company: string
  city: string
  email: string
  score: number | null
  fit: string
  contactStatus: string
}

export type LeadList = {
  campaign: { id: number; name: string; appUrl: string | null } | null
  leads: LeadRow[]
  total: number
}

/** list_leads, search_leads and get_lead_data all answer with leads; this reads the three alike. */
export function leadsFrom(p: Obj): LeadList | null {
  const campaign = isObj(p.campaign)
    ? { id: num(p.campaign.id), name: str(p.campaign.name), appUrl: urlOf(p.campaign.appUrl) }
    : null
  const raw = Array.isArray(p.leads) ? p.leads : isObj(p.lead) ? [p.lead] : null
  if (raw === null) return null
  const leads = raw.filter(isObj).map(l => {
    const q = isObj(l.qualification) ? l.qualification : null
    return {
      id: num(l.id),
      appUrl: urlOf(l.appUrl),
      company: str(l.company) || str(l.website) || str(l.email) || `Lead ${num(l.id)}`,
      city: str(l.city),
      email: str(l.sendingEmail) || str(l.email),
      score: typeof l.score === 'number' ? l.score : null,
      fit: str(q?.fitLevel),
      contactStatus: str(l.contactStatus),
    }
  })

  return { campaign, leads, total: num(p.total, leads.length) }
}

/**
 * Leads whose chain has ended: done with every stage, judged not qualified,
 * failed, or with nothing left to do. The server chains the stages per lead
 * and runs the leads side by side, so this is the total less every lead that
 * still has a job waiting or running. In the moment between one stage ending
 * and the next being queued a lead counts as through; the next poll corrects it.
 */
export function leadsThrough(run: RunView): number {
  if (run.isTerminal) return run.leadTotal
  // While the run prepares, or before its first status, no lead has a job yet: none is through.
  const hasWork = run.stages.some(s => (s.pending || 0) + (s.running || 0) + s.completed + s.failed > 0)
  if (run.status === 'preparing' || !hasWork) return 0
  // `|| 0`: a run kept from before `pending` was tracked reads it as absent until the next poll.
  const open = run.stages.reduce((sum, s) => sum + (s.pending || 0) + (s.running || 0), 0)
  return Math.max(0, Math.min(run.leadTotal, run.leadTotal - open))
}

/** A link the server sends, if it is one a Link may draw (https, or http://localhost). */
export function urlOf(v: unknown): string | null {
  if (typeof v !== 'string') return null
  return /^https:\/\/[^\s@]+$/.test(v) || /^http:\/\/localhost(?:[:/]|$)/.test(v) ? v : null
}

export function bar(done: number, total: number, width = 20): string {
  const ratio = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0
  const full = Math.round(ratio * width)
  return '█'.repeat(full) + '░'.repeat(width - full)
}

export function appLink(base: string, path: string): string {
  return new URL(path, base.endsWith('/') ? base : `${base}/`).href
}
