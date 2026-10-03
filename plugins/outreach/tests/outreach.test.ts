import { describe, expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On, ToolGroupCall } from 'claude-code'

/** What the engine would draw itself: a marker the tests can tell apart from the mod's own tree. */
const engineDraws = (on: On) =>
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['engine'] }))

const LIST_LEADS = {
  campaign: { id: 12, name: 'Zahnärzte München' },
  total: 3,
  offset: 0,
  remaining: 2,
  leads: [
    { id: 7, email: 'a@huber.de', company: 'Dr. Huber Zahnmedizin', city: 'München', score: 86, contactStatus: 'not_contacted', qualification: { fitLevel: 'qualified' } },
  ],
}

const RUN_STATUS = {
  id: 'run-1',
  campaignId: 12,
  status: 'running',
  stages: ['qualification', 'research'],
  leadTotal: 150,
  budgetUsd: 5,
  spentUsd: 0.12,
  stageProgress: [
    { stage: 'qualification', pending: 3, running: 2, completed: 40, failed: 1, noResult: 0, cancelled: 0, total: 46 },
  ],
  is_terminal: false,
}

const IMPORT_QUEUED = { status: 'success', job_id: 'job-1', received: 500, queued: true, campaign_id: 12, list_id: null }

const toolRow = (tool: string, payload: unknown) => ({
  plugin: 'outreach',
  component: 'ToolResult' as const,
  requestId: 'toolu_1',
  props: {
    tool_use_id: 'toolu_1',
    tool,
    isErrored: false,
    output: [{ type: 'text', text: JSON.stringify(payload) }],
  },
})

const SURFACES = ['terminal', 'desktop', 'vscode', 'mobile'] as const

describe('lead preview', () => {
  test('list_leads draws the leads with links into the campaign, on every surface', async $ => {
    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ ...toolRow('mcp__akquise__list_leads', LIST_LEADS), surface })
      expect(await ui.find({ text: /Dr\. Huber Zahnmedizin/ })).toBeDefined()
      expect(await ui.find({ text: /3 Leads/ })).toBeDefined()
      const hrefs = (await ui.findAll({ type: 'Link' })).map(l => l.props.href)
      expect(hrefs).toContain('https://outreach.akquise.de/campaigns/12/leads/7')
      expect(hrefs).toContain('https://outreach.akquise.de/campaigns/12/leads')
      await ui.unmount()
    }
  })

  test('every fit level the server sends gets a German label', async $ => {
    const leads = ['highly_qualified', 'mid_qualified', 'not_qualified', null].map((fitLevel, i) => ({
      id: i + 1, company: `Firma ${i + 1}`, city: 'Freiburg', score: null, contactStatus: 'not_contacted', qualification: { fitLevel },
    }))
    const ui = await $.ui.mount({ ...toolRow('mcp__akquise__list_leads', { ...LIST_LEADS, total: 4, leads }), surface: 'terminal' })
    for (const label of ['sehr passend', 'bedingt', 'passt nicht', 'nicht bewertet']) {
      expect(await ui.find({ text: label })).toBeDefined()
    }
    expect(await ui.find({ text: 'not_contacted' })).toBeUndefined()
    await ui.unmount()
  })

  test('another server’s tools are left to the engine', async ($, on) => {
    engineDraws(on)
    const ui = await $.ui.mount({ ...toolRow('mcp__other__list_leads', LIST_LEADS), surface: 'terminal' })
    expect(await ui.find({ text: /Dr\. Huber/ })).toBeUndefined()
    await ui.unmount()
  })
})

const BAND = {
  plugin: 'outreach',
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 12, bodyColumns: 100, scroll: { offset: 0, bodyRows: 12 }, view: {} },
}

/** Claude calls a ListM8 tool; the hook beneath answers it as the server would. */
const toolCall = ($: Engine, tool: string, input: Record<string, unknown>) =>
  $.tool.call({ tool, ...input } as unknown as Parameters<typeof $.tool.call>[0])

describe('which MCP server is ours', () => {
  const offers = (server: string, names: string[]) =>
    names.map(n => ({ name: `mcp__${server}__${n}`, description: '', mcp: true }))

  test('a server is recognised by what it offers, whatever its name', async ($, on) => {
    engineDraws(on)
    on('tool.list', () => ({
      value: [
        ...offers('Outreach_Akquise', ['list_leads', 'start_lead_run', 'get_lead_run_status', 'get_lead_data']),
        ...offers('crm', ['list_leads']),
      ],
    }))
    const ours = await $.ui.mount({ ...toolRow('mcp__Outreach_Akquise__list_leads', LIST_LEADS), surface: 'terminal' })
    expect(await ours.find({ text: /Dr\. Huber Zahnmedizin/ })).toBeDefined()
    await ours.unmount()

    const foreign = await $.ui.mount({ ...toolRow('mcp__crm__list_leads', LIST_LEADS), surface: 'terminal' })
    expect(await foreign.find({ text: /Dr\. Huber/ })).toBeUndefined()
    await foreign.unmount()
  })

  test('a link the server sends wins over the configured app address', async $ => {
    const withLinks = {
      ...LIST_LEADS,
      campaign: { ...LIST_LEADS.campaign, appUrl: 'https://kunde.example/campaigns/12/leads' },
      leads: [{ ...LIST_LEADS.leads[0], appUrl: 'https://kunde.example/campaigns/12/leads/7' }],
    }
    const ui = await $.ui.mount({ ...toolRow('mcp__akquise__list_leads', withLinks), surface: 'terminal' })
    const hrefs = (await ui.findAll({ type: 'Link' })).map(l => l.props.href)
    expect(hrefs).toContain('https://kunde.example/campaigns/12/leads/7')
    expect(hrefs).toContain('https://kunde.example/campaigns/12/leads')
    expect(hrefs.some(h => String(h).includes('outreach.akquise.de'))).toBe(false)
    await ui.unmount()
  })

  test('the band asks the server a run came from', async ($, on) => {
    engineDraws(on)
    const clock = mock.clock(on)
    const asked: string[] = []
    on('tool.list', () => ({ value: offers('akquise', ['list_leads', 'start_lead_run', 'get_lead_run_status']) }))
    on('tool.call', () => ({ result: RUN_STATUS }))
    on('mcp.call', ($, e) => {
      asked.push(String((e as { server: string }).server))
      return { value: { content: [{ type: 'text', text: JSON.stringify(RUN_STATUS) }], isError: false } }
    })
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-1' })
    await clock.advance(10_000)
    expect(asked).toEqual(['akquise'])
  })
})

describe('run status', () => {
  test('a started run is one line in the chat', async $ => {
    const started = { status: 'success', lead_run_id: 'run-1', campaign_id: 12, run_status: 'preparing', stages: ['qualification'], lead_total: 10, budget_usd: 1, queued: true }
    const ui = await $.ui.mount({ ...toolRow('mcp__akquise__start_lead_run', started), surface: 'terminal' })
    expect(await ui.find({ text: /Lead-Run gestartet · 10 Leads · Qualifizierung · Budget 1.00 \$/ })).toBeDefined()
    await ui.unmount()
  })

  test('a run just started counts no lead as through, not all of them', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    const started = { status: 'success', lead_run_id: 'run-new', campaign_id: 12, run_status: 'preparing', stages: ['qualification', 'research', 'email'], lead_total: 10, budget_usd: 2, queued: true }
    on('tool.call', () => ({ result: started }))
    await toolCall($, 'mcp__akquise__start_lead_run', { campaign_id: 12, stages: ['qualification'] })
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '0/10' })).toBeDefined()
    expect(await band.find({ text: '10/10' })).toBeUndefined()
    await band.unmount()
  })

  test('a checked run shows in the band, not as a card in the chat', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    on('tool.call', () => ({ result: RUN_STATUS }))
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-1' })

    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: 'Outreach · Lead-Run' })).toBeDefined()
    expect(await band.find({ text: '40/46' })).toBeDefined()
    expect(await band.find({ text: '2 laufen · 3 warten' })).toBeDefined()
    expect(await band.find({ text: '⠋' })).toBeDefined()
    expect(await band.find({ text: '· 1 Fehler' })).toBeDefined()
    await band.unmount()

    const row = await $.ui.mount({ ...toolRow('mcp__akquise__get_lead_run_status', RUN_STATUS), surface: 'terminal' })
    expect(await row.find({ text: 'engine' })).toBeDefined()
    await row.unmount()
  })

  test('the band asks every 10 s until the run has ended, and says why it stopped', async ($, on) => {
    engineDraws(on)
    const clock = mock.clock(on)
    const stopped = { ...RUN_STATUS, status: 'provider_exhausted', is_terminal: true, statusReason: 'OpenRouter rejected the API key' }
    let asked = 0
    on('tool.call', () => ({ result: RUN_STATUS }))
    on('mcp.call', () => {
      asked += 1
      return { value: { content: [{ type: 'text', text: JSON.stringify(stopped) }], isError: false } }
    })
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-1' })

    await clock.advance(10_000)
    expect(asked).toBe(1)
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '· KI-Anbieter nicht verfügbar' })).toBeDefined()
    expect(await band.find({ text: /OpenRouter rejected the API key/ })).toBeDefined()

    await clock.advance(30_000)
    expect(asked).toBe(1)
    await band.unmount()
  })

  test('leads run their own chains: the band counts leads through, not a stage', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    // Lead 1 is writing its mail, lead 2 was judged not qualified, lead 3 is still being researched.
    const sideBySide = {
      ...RUN_STATUS,
      stages: ['qualification', 'research', 'email'],
      leadTotal: 3,
      stageProgress: [
        { stage: 'qualification', pending: 0, running: 0, completed: 3, failed: 0, noResult: 0, cancelled: 0, total: 3 },
        { stage: 'research', pending: 0, running: 1, completed: 1, failed: 0, noResult: 0, cancelled: 0, total: 2 },
        { stage: 'email', pending: 0, running: 1, completed: 0, failed: 0, noResult: 0, cancelled: 0, total: 1 },
      ],
    }
    on('tool.call', () => ({ result: sideBySide }))
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-1' })
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '3/3' })).toBeDefined()
    expect(await band.find({ text: '2 passen · 1 raus' })).toBeDefined()
    expect(await band.find({ text: '1/2' })).toBeDefined()
    expect(await band.find({ text: '0/1' })).toBeDefined()
    expect(await band.find({ text: '✓' })).toBeDefined()
    await band.unmount()
  })

  test('several runs share one frame, a row each', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    let n = 0
    on('tool.call', () => {
      n += 1
      return { result: { ...RUN_STATUS, id: `run-${n}`, leadTotal: n === 1 ? 3 : 13 } }
    })
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-1' })
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-2' })
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: 'Outreach · 2 Läufe' })).toBeDefined()
    expect(await band.find({ text: '2 laufen' })).toBeDefined()
    expect(await band.find({ text: '3 Leads' })).toBeDefined()
    expect(await band.find({ text: '13 Leads' })).toBeDefined()
    await band.unmount()
  })

  test('in a shared band each run names only its working stage, with a spinner', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    const researchOnly = {
      ...RUN_STATUS,
      id: 'run-vg',
      stages: ['research', 'email'],
      leadTotal: 1,
      stageProgress: [{ stage: 'research', pending: 0, running: 1, completed: 0, failed: 0, total: 1 }],
    }
    const full = {
      ...RUN_STATUS,
      id: 'run-ten',
      stages: ['qualification', 'research', 'email'],
      leadTotal: 10,
      stageProgress: [{ stage: 'qualification', pending: 3, running: 7, completed: 0, failed: 0, total: 10 }],
    }
    let n = 0
    on('tool.call', () => ({ result: (n += 1) === 1 ? researchOnly : full }))
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-vg' })
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-ten' })

    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '· Rech. 0/1' })).toBeDefined()
    expect(await band.find({ text: '· Qual. 0/10' })).toBeDefined()
    expect(await band.find({ text: /Mail/ })).toBeUndefined()
    expect(await band.find({ text: '⠋' })).toBeDefined()
    await band.unmount()
  })

  test('/outreach-runs puts every run still going into the band, and only those', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    const ended = { ...RUN_STATUS, id: 'run-old', status: 'completed', is_terminal: true }
    on('mcp.call', () => ({
      value: { content: [{ type: 'text', text: JSON.stringify({ runs: [RUN_STATUS, ended], count: 2 }) }], isError: false },
    }))
    const res = await $.command.run({ command: 'outreach-runs' } as Parameters<typeof $.command.run>[0])
    expect(String((res as { text?: string }).text)).toContain('1 laufende')
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: 'Outreach · Lead-Run' })).toBeDefined()
    expect(await band.find({ text: '40/46' })).toBeDefined()
    await band.unmount()
  })

  test('asking Claude for the runs fills the band too', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    on('tool.call', () => ({ result: { runs: [RUN_STATUS], count: 1 } }))
    await toolCall($, 'mcp__akquise__list_lead_runs', { active_only: true })
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '40/46' })).toBeDefined()
    await band.unmount()
  })

  test('the spinner turns while a stage works and stops once the run has ended', async ($, on) => {
    engineDraws(on)
    const clock = mock.clock(on)
    const ended = { ...RUN_STATUS, status: 'completed', is_terminal: true }
    on('tool.call', () => ({ result: RUN_STATUS }))
    on('mcp.call', () => ({ value: { content: [{ type: 'text', text: JSON.stringify(ended) }], isError: false } }))
    await toolCall($, 'mcp__akquise__get_lead_run_status', { lead_run_id: 'run-1' })

    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '⠋' })).toBeDefined()
    await clock.advance(250)
    expect(await band.find({ text: '⠙' })).toBeDefined()

    await clock.advance(10_000)
    expect(await band.find({ text: /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/ })).toBeUndefined()
    await band.unmount()
  })

  test('every run still going is in the band, oldest first, however many', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    // list_lead_runs answers newest first; six runs started a second apart, none with work done yet.
    const listed = [2240, 2238, 2236, 2237, 2235, 2234].map((campaignId, i) => ({
      ...RUN_STATUS,
      id: `run-${campaignId}`,
      campaignId,
      leadTotal: campaignId,
      createdAt: `2026-10-03T16:39:${String(25 - i).padStart(2, '0')}+00:00`,
      stageProgress: [{ stage: 'qualification', pending: 10, running: 0, completed: 0, failed: 0, total: 10 }],
    }))
    on('tool.call', () => ({ result: { runs: listed, count: 6 } }))
    await toolCall($, 'mcp__akquise__list_lead_runs', { active_only: true })

    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: 'Outreach · 6 Läufe' })).toBeDefined()
    for (const total of [2234, 2235, 2236, 2237, 2238, 2240]) {
      expect(await band.find({ text: `${total} Leads` })).toBeDefined()
    }
    const order = (await band.findAll({ text: /^\d+ Leads$/ })).map(e => e.text)
    expect(order[0]).toBe('2234 Leads')
    expect(order[order.length - 1]).toBe('2240 Leads')
    await band.unmount()
  })

  test('without runs the band is the engine’s', async ($, on) => {
    engineDraws(on)
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: 'engine' })).toBeDefined()
    await band.unmount()
  })
})

describe('local workflow phases', () => {
  const progress = ($: Engine, input: Record<string, unknown>) => toolCall($, 'mcp__outreach__outreach_progress', input)

  test('a phase Claude runs itself counts each lead written, once, and ends at its total', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    on('tool.call', () => ({ result: { status: 'success' } }))
    await progress($, { action: 'start', campaign_id: 2162, phase: 'research', total: 2 })

    const write = (leadId: number, fields: Record<string, unknown>) =>
      toolCall($, 'mcp__akquise__write_lead_details', { campaign_id: 2162, lead_id: leadId, fields })
    await write(1, { researchText: 'Bericht' })
    await write(1, { researchText: 'Bericht, nachgebessert' })
    await write(3, { qualificationFitLevel: 'qualified' })

    let band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '1 fertig' })).toBeDefined()
    expect(await band.find({ text: 'Recherche' })).toBeDefined()
    expect(await band.find({ text: '· lokal in Claude' })).toBeDefined()
    await band.unmount()

    await write(2, { researchText: 'Bericht' })
    band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: 'fertig' })).toBeDefined()
    expect(await band.find({ text: 'alle beendet' })).toBeDefined()
    await band.unmount()
  })

  test('email variables count for the email phase; a dry run counts nothing', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    on('tool.call', () => ({ result: { status: 'success' } }))
    await progress($, { action: 'start', campaign_id: 7, phase: 'email', total: 3 })
    await toolCall($, 'mcp__akquise__save_lead_variables', { campaign_id: 7, lead_id: 1, variables: '{}' })
    await toolCall($, 'mcp__akquise__write_lead_details', { campaign_id: 7, lead_id: 2, fields: { researchText: 'x' }, dry_run: true })
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: '1 fertig' })).toBeDefined()
    expect(await band.find({ text: 'E-Mail' })).toBeDefined()
    await band.unmount()
  })

  test('the tool answers what it shows, and end closes a phase early', async ($, on) => {
    engineDraws(on)
    mock.clock(on)
    const started = await progress($, { action: 'start', campaign_id: 7, phase: 'qualification', total: 20 })
    expect(String(started.result)).toContain('0/20')
    const again = await progress($, { action: 'start', campaign_id: 7, phase: 'qualification', total: 10 })
    expect(String(again.result)).toContain('läuft bereits')
    const ended = await progress($, { action: 'end', campaign_id: 7, phase: 'qualification' })
    expect(String(ended.result)).toContain('0/20')
    const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
    expect(await band.find({ text: 'alle beendet' })).toBeDefined()
    await band.unmount()
  })
})

describe('import card', () => {
  test('a queued import shows its size and the way into the app', async $ => {
    const ui = await $.ui.mount({ ...toolRow('mcp__akquise__import_leads', IMPORT_QUEUED), surface: 'terminal' })
    expect(await ui.find({ text: '500 Leads' })).toBeDefined()
    const hrefs = (await ui.findAll({ type: 'Link' })).map(l => l.props.href)
    expect(hrefs).toContain('https://outreach.akquise.de/campaigns/12/leads')
    await ui.unmount()
  })
})

describe('folded lookups', () => {
  const group = (calls: ToolGroupCall[]) => ({
    plugin: 'outreach',
    component: 'ToolGroup' as const,
    requestId: 'group-1',
    props: { calls, isActive: false, isExpanded: false },
  })
  const call = (tool: string, payload: unknown, isRunning = false): ToolGroupCall => ({
    tool_use_id: `toolu_${tool}`,
    tool,
    input: {},
    isRunning,
    isErrored: false,
    isInterrupted: false,
    output: isRunning ? undefined : [{ type: 'text', text: JSON.stringify(payload) }],
  })

  test('a group holding list_leads keeps its line and adds the preview beneath', async ($, on) => {
    engineDraws(on)
    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ ...group([call('Read', {}), call('mcp__akquise__list_leads', LIST_LEADS)]), surface })
      expect(await ui.find({ text: 'engine' })).toBeDefined()
      expect(await ui.find({ text: /Dr\. Huber Zahnmedizin/ })).toBeDefined()
      await ui.unmount()
    }
  })

  test('a group still running, or without ListM8 calls, is the engine’s alone', async ($, on) => {
    engineDraws(on)
    const running = await $.ui.mount({ ...group([call('mcp__akquise__list_leads', LIST_LEADS, true)]), surface: 'terminal' })
    expect(await running.find({ text: /Dr\. Huber/ })).toBeUndefined()
    await running.unmount()
    const other = await $.ui.mount({ ...group([call('Read', {})]), surface: 'terminal' })
    expect(await other.find({ text: 'engine' })).toBeDefined()
    await other.unmount()
  })
})
