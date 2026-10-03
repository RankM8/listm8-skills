export type StageView = {
  stage: string
  /** Leads that reached this stage: jobs created for it so far. */
  total: number
  pending: number
  running: number
  completed: number
  /** Ended without success: failed, no result or cancelled. Each ends that lead's chain. */
  failed: number
}

export type RunView = {
  id: string
  campaignId: number
  status: string
  stages: StageView[]
  leadTotal: number
  spentUsd: number
  budgetUsd: number | null
  isTerminal: boolean
  isDemo: boolean
  finishedAt: number | null
  /** The MCP server the run came from, as its tool names spell it; the band asks that one. */
  server: string
  /** When the run was created, epoch ms: the band orders runs by it. */
  createdAt: number
  /** The run's page in the app as the server names it, tenant-correct; null when it names none. */
  appUrl: string | null
  /** Why a run stopped short, as the server explains it; null while running or when completed. */
  reason: string | null
}

export type ImportView = {
  id: string
  status: string
  percent: number
  message: string
  received: number
  campaignId: number | null
  imported: number | null
  duplicates: number | null
  isTerminal: boolean
  isDemo: boolean
  finishedAt: number | null
  appUrl: string | null
}

/** A phase of an outreach workflow that Claude runs itself, with its own agents, instead of on the server. */
export type LocalRun = {
  id: string
  campaignId: number
  phase: 'qualification' | 'research' | 'email'
  total: number
  /** Leads whose result for this phase has been written, by id. */
  doneLeadIds: number[]
  isTerminal: boolean
  finishedAt: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'outreach': {
      /** Runs started or checked in this chat, by id: what the band above the prompt shows. */
      runs: Record<string, RunView>
      /** Workflow phases Claude runs locally in this chat, by campaign and phase. */
      locals: Record<string, LocalRun>
      /** Spinner frame of the band, advanced only while a run is going. */
      frame: number
    }
  }
}
