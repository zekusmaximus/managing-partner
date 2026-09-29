import type { TutorialPhase } from './learningObjectives';

export interface TutorialStep {
  id: string;
  phase: TutorialPhase;
  page: '/' | '/finances' | '/hr' | '/clients' | '/inbox';
  title: string;
  content: string;
  targetSelector: string; // CSS selector or 'center' for modal
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  learningObjectiveIds: string[];
  requiresAction?: 'navigate' | 'advance_month';
  actionTarget?: string;
}

export const tutorialSteps: TutorialStep[] = [
  // =============================================
  // WELCOME PHASE (4 steps) — Center modals
  // =============================================
  {
    id: 'welcome-intro',
    phase: 'welcome',
    page: '/',
    title: 'Welcome to Managing Partner',
    content:
      'You are the newly appointed managing partner of a mid-size government relations firm in Washington, D.C. Your firm represents corporations, trade associations, and non-profit organizations before Congress and federal agencies.\n\nYour job is to grow the firm, keep clients satisfied, manage your team of lobbyists and attorneys, and navigate the complex world of government affairs. The decisions you make each month will determine whether your firm thrives or struggles.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: [],
  },
  {
    id: 'welcome-what-is-gr',
    phase: 'welcome',
    page: '/',
    title: 'What is Government Relations?',
    content:
      'Government relations (GR) firms help organizations navigate legislative and regulatory processes and communicate with public officials. Managing the firm includes staffing, client commitments, finances, and oversight.\n\nThis version pools Lobbyist and Attorney service capacity. It does not model specialist matching, distinct legal capabilities, or legislative outcomes. Support staff improve the team’s pooled capacity. The numbers and scenarios are simplified simulation assumptions.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: ['lo-m1-gr-role'],
  },
  {
    id: 'welcome-how-firm-makes-money',
    phase: 'welcome',
    page: '/',
    title: 'How Your Firm Makes Money',
    content:
      'The simulation bills each active client’s stated monthly fee. Expenses include loaded payroll and other recurring or one-time commitments. The difference between billed revenue and recorded expenses is profit; cash arrives when clients pay.\n\nA 20-35% operating margin is an illustrative simulation target, not an industry standard. Review margins alongside cash and service coverage: a profitable firm can still lack cash or enough staff to serve its clients.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: ['lo-m1-financials'],
  },
  {
    id: 'welcome-game-overview',
    phase: 'welcome',
    page: '/',
    title: 'How This Simulation Works',
    content:
      'Each turn represents one month in the life of your firm. You will:\n\n\u2022 Monitor your firm\'s financial health on the Dashboard\n\u2022 Manage your team\'s workload and burnout on the HR page\n\u2022 Track client satisfaction and contracts on the Clients page\n\u2022 Make critical decisions through your Inbox\n\u2022 Review detailed financials on the Finances page\n\nWhen you\'re ready to move forward, click "Advance Month" to see how your decisions play out. Let\'s start by exploring your Dashboard.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: [],
  },

  // =============================================
  // MONTH 1: "Getting Your Bearings" (12 steps)
  // =============================================
  {
    id: 'm1-dashboard-overview',
    phase: 'month1',
    page: '/',
    title: 'Your Command Center',
    content:
      'This is your Dashboard — the command center of your firm. These cards show your firm\'s vital signs at a glance. In real GR firms, managing partners review metrics like these weekly during partner meetings.\n\nEach number tells a story about your firm\'s health. Let\'s walk through the most important ones.',
    targetSelector: '[data-tutorial-target="stats-row"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-financials'],
  },
  {
    id: 'm1-cash-on-hand',
    phase: 'month1',
    page: '/',
    title: 'Cash on Hand',
    content:
      'Cash on Hand is the money available right now. A buffer of 3-6 months of recurring cash costs is an illustrative simulation target, not an industry standard.\n\nYour current reserve is {{cash}}. At the current recurring cash-cost estimate of {{expenses}} per month, cash alone covers about {{runway}} months before collections. Available credit is a separate buffer. This position can change quickly if you lose a major client or hire aggressively.',
    targetSelector: '[data-tutorial-target="stat-cash"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-cash-mgmt'],
  },
  {
    id: 'm1-revenue-card',
    phase: 'month1',
    page: '/',
    title: 'Collections and Revenue',
    content:
      'Clients are billed each month for your advocacy services. The Collections card shows the cash received this month, while the Billed line shows the value of this month\'s client fees. The difference becomes accounts receivable until clients pay.\n\nCollections may lag behind billing, so compare both numbers when judging how much cash the firm can spend.',
    targetSelector: '[data-tutorial-target="stat-revenue"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-financials'],
  },
  {
    id: 'm1-profit-card',
    phase: 'month1',
    page: '/',
    title: 'Operating Margin',
    content:
      'Operating margin is operating income divided by billed revenue. Operating income is what remains after payroll and operating costs, before the partner draw and credit-line interest.\n\nUse the P&L statement to see those costs and the separate net income figure. A falling margin leaves less room for partner compensation, cash reserves, and growth.',
    targetSelector: '[data-tutorial-target="stat-profit"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-financials'],
  },
  {
    id: 'm1-reputation',
    phase: 'month1',
    page: '/',
    title: 'Firm Reputation',
    content:
      'At the monthly update, reputation summarizes average client satisfaction (60%) and employee efficacy (40%). It is a quick read on those measures.\n\nThe reputation score does not change acquisition odds or recruitment in this version. Inspect the underlying client and staff measures to decide what needs attention.',
    targetSelector: '[data-tutorial-target="stat-reputation"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-gr-role'],
  },
  {
    id: 'm1-nav-to-finances',
    phase: 'month1',
    page: '/',
    title: 'Explore Your Finances',
    content:
      'Let\'s look at your firm\'s finances in detail. Click "Finances" in the sidebar to see the full financial picture.',
    targetSelector: '[data-tutorial-target="sidenav-finances"]',
    position: 'right',
    learningObjectiveIds: ['lo-m1-financials'],
    requiresAction: 'navigate',
    actionTarget: '/finances',
  },
  {
    id: 'm1-finances-overview',
    phase: 'month1',
    page: '/finances',
    title: 'Financial Management',
    content:
      'This page gives you several ways to review your firm’s finances. The highlighted P&L statement compares billed revenue with payroll, operating costs, and net income for the current month and year to date.\n\nUse the tabs above to inspect budgets, receivables, cash activity, and partner economics. A profitable month on the P&L does not necessarily mean clients have paid their bills yet.',
    targetSelector: '[data-tutorial-target="finance-stats-row"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-financials'],
  },
  {
    id: 'm1-accounts-receivable',
    phase: 'month1',
    page: '/finances',
    title: 'Accounts Receivable',
    content:
      'Accounts Receivable (AR) is billed money clients have not yet paid. Each client row shows its recorded balance by age. Prior balances without a known client appear as unassigned; former clients remain until their balance is resolved.\n\nCollecting raises cash and reduces AR without creating new revenue. “Write off and close collection efforts” reduces AR and profit, brings in no cash, and ends collection of that amount in this game. Accounting write-off alone does not necessarily cancel a debt.',
    targetSelector: '[data-tutorial-target="ar-aging-table"]',
    position: 'top',
    learningObjectiveIds: ['lo-m1-cash-mgmt'],
  },
  {
    id: 'm1-nav-to-hr',
    phase: 'month1',
    page: '/finances',
    title: 'Meet Your Team',
    content:
      'Now let\'s meet your team — your most valuable asset. Click "HR/Roster" in the sidebar.',
    targetSelector: '[data-tutorial-target="sidenav-hr"]',
    position: 'right',
    learningObjectiveIds: ['lo-m1-team-roles'],
    requiresAction: 'navigate',
    actionTarget: '/hr',
  },
  {
    id: 'm1-hr-overview',
    phase: 'month1',
    page: '/hr',
    title: 'Your Team',
    content:
      'The roster has Lobbyists, Attorneys, and Support staff. This version pools Lobbyist and Attorney service capacity using the same formula; specialist matching and distinct legal capabilities are not modeled. Support staff improve that pooled capacity.\n\nEfficacy represents capability, burnout represents fatigue, and affinity helps determine service effectiveness. Hiring adds loaded recurring payroll. Salaries are commitments: the manual control allows increases only, with the cost beginning in the next monthly payroll.',
    targetSelector: '[data-tutorial-target="employee-table"]',
    position: 'top',
    learningObjectiveIds: ['lo-m1-team-roles'],
  },
  {
    id: 'm1-burnout',
    phase: 'month1',
    page: '/hr',
    title: 'Workload and Burnout',
    content:
      'The monthly update uses one coverage snapshot for the whole team. Fictional tuning bands: below 90% coverage adds 6 burnout points; 90% to below 100% adds 3; 100% to below 115% adds none; 115% or more removes 3. With no clients, burnout falls by 3.\n\nFatigue above 60% reduces effective service capacity. It does not permanently reduce efficacy each month. Paid recovery reduces fatigue without adding capability; adequate staffing addresses continuing overload.',
    targetSelector: '[data-tutorial-target="burnout-chart"]',
    position: 'left',
    learningObjectiveIds: ['lo-m1-team-roles'],
  },
  {
    id: 'm1-advance-month',
    phase: 'month1',
    page: '/hr',
    title: 'Advance to the Next Month',
    content:
      'You have reviewed your firm’s finances, team, and metrics. Click "Advance Month" in the top bar to see the next monthly result.\n\nCoverage determines the team’s burnout change first. Service, satisfaction, and renewal effects then use the updated roster. Contracts tick down, bills and collections are recorded, and new situations may arrive in your inbox. The shared partner intervention becomes available again in the new month.',
    targetSelector: '[data-tutorial-target="advance-month"]',
    position: 'bottom',
    learningObjectiveIds: [],
    requiresAction: 'advance_month',
  },

  // =============================================
  // MONTH 2: "Client Management & Decision-Making" (10 steps)
  // =============================================
  {
    id: 'm2-intro',
    phase: 'month2',
    page: '/',
    title: 'Client Management',
    content:
      'In this part of the tutorial, we focus on your clients — the organizations that pay your firm for government relations services.\n\nClient management is a core competency for any managing partner. You need to keep existing clients happy while also developing new business. Let\'s start by reviewing your client roster.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: ['lo-m2-client-types'],
  },
  {
    id: 'm2-nav-to-clients',
    phase: 'month2',
    page: '/',
    title: 'Review Your Clients',
    content:
      'Click "Clients" in the sidebar to review your client roster and their satisfaction levels.',
    targetSelector: '[data-tutorial-target="sidenav-clients"]',
    position: 'right',
    learningObjectiveIds: ['lo-m2-client-types'],
    requiresAction: 'navigate',
    actionTarget: '/clients',
  },
  {
    id: 'm2-client-types',
    phase: 'month2',
    page: '/clients',
    title: 'Understanding Client Types',
    content:
      'The roster includes corporations, trade associations, and non-profits. Organization type describes the client; it does not automatically diversify risk.\n\nCompare each client’s monthly fee with the total contracted fees. Losing a large account creates greater fee exposure. Different organization types can also share an issue or funding source. This version shows fee exposure but does not simulate shared-issue shocks or a portfolio-risk score.',
    targetSelector: '[data-tutorial-target="client-type-chart"]',
    position: 'left',
    learningObjectiveIds: ['lo-m2-client-types'],
  },
  {
    id: 'm2-satisfaction',
    phase: 'month2',
    page: '/clients',
    title: 'Client Satisfaction',
    content:
      'Client satisfaction is a model score affected by service coverage, monthly variation, and your responses. Lower satisfaction and insufficient coverage weaken renewal odds. Those odds are simulation assumptions, not predictions about real clients.\n\nA recovery meeting adds up to 6 satisfaction for $1,000 and one shared partner intervention. Delegating a routine complaint response adds up to 3 using the already-paid billable team. Neither response repairs a staffing shortfall.',
    targetSelector: '[data-tutorial-target="client-table"]',
    position: 'top',
    learningObjectiveIds: ['lo-m2-satisfaction'],
  },
  {
    id: 'm2-contracts',
    phase: 'month2',
    page: '/clients',
    title: 'Contract Management',
    content:
      'Every client engagement has a contract term. When it expires, the client decides whether to renew based on satisfaction and current service coverage.\n\nThe dashboard expiry warning shows the monthly fee and its share of current contracted monthly revenue, so you can judge the amount at risk without searching the roster. You can hold a paid client meeting to improve satisfaction, but it cannot guarantee renewal or repair a staffing shortfall. Losing a client means losing its monthly fee, which affects cash flow and profit.',
    targetSelector: '[data-tutorial-target="contract-chart"]',
    position: 'left',
    learningObjectiveIds: ['lo-m2-satisfaction'],
  },
  {
    id: 'm2-nav-to-inbox',
    phase: 'month2',
    page: '/clients',
    title: 'Check Your Inbox',
    content:
      'New messages have arrived that need your attention. Click "Inbox" in the sidebar to handle them.',
    targetSelector: '[data-tutorial-target="sidenav-inbox"]',
    position: 'right',
    learningObjectiveIds: ['lo-m2-decisions'],
    requiresAction: 'navigate',
    actionTarget: '/inbox',
  },
  {
    id: 'm2-inbox-overview',
    phase: 'month2',
    page: '/inbox',
    title: 'Your Inbox',
    content:
      'Your inbox simulates the daily decisions a managing partner faces. Messages have urgency levels — some demand immediate attention, others can wait.\n\nMessages marked "Action Required" need a decision from you. In a real firm, these would be escalated by your operations director or senior partners — compensation requests, client issues, and business opportunities that only the managing partner can authorize.',
    targetSelector: '[data-tutorial-target="inbox-message-list"]',
    position: 'right',
    learningObjectiveIds: ['lo-m2-decisions'],
  },
  {
    id: 'm2-inbox-choices',
    phase: 'month2',
    page: '/inbox',
    title: 'Making Decisions',
    content:
      'Compare each action’s current costs and effects before choosing.\n\n\u2022 Lead recovery meeting costs $1,000 and adds up to 6 satisfaction, with bounded overdue collections when applicable. Inbox and Clients use the same action and complaint reward.\n\u2022 Delegate routine response requires billable staff, adds up to 3 satisfaction, and uses no extra cash or partner intervention. It does not improve capacity.\n\u2022 Meetings and personal collection calls share one major partner intervention per month. Calls keep their own collection effects and do not charge the meeting fee.\n\nThis limit represents major escalations in a compressed month. Reports, routine delegation, manual collections, and staff recovery do not use it; the last two have separate monthly limits.',
    targetSelector: '[data-tutorial-target="inbox-message-list"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m2-decisions', 'lo-m2-tradeoffs'],
  },
  {
    id: 'm2-decision-making',
    phase: 'month2',
    page: '/inbox',
    title: 'The Art of Decision-Making',
    content:
      'Compare cash commitments, ongoing workload, and the other uses of partner attention. A personal intervention has an opportunity cost: it leaves no allowance for another major intervention that month.\n\nDelegating uses the already-paid team but does not repair understaffing. Explicitly deferring a complaint lowers satisfaction as shown in its preview. Pursuing new business can add fees and workload, but success is uncertain.\n\nRead the recorded outcome and compare it with the next monthly result. An uncertain renewal outcome alone cannot prove a decision was good or bad.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: ['lo-m2-tradeoffs'],
  },
  {
    id: 'm2-advance-month',
    phase: 'month2',
    page: '/inbox',
    title: 'Advance to the Next Month',
    content:
      'Handle your inbox messages, then advance the month to continue learning. Review any decisions you need to make, then click "Advance Month" when ready.',
    targetSelector: '[data-tutorial-target="advance-month"]',
    position: 'bottom',
    learningObjectiveIds: [],
    requiresAction: 'advance_month',
  },

  // =============================================
  // MONTH 3: "Strategic Thinking" (8 steps)
  // =============================================
  {
    id: 'm3-intro',
    phase: 'month3',
    page: '/',
    title: 'Strategic Thinking',
    content:
      'You have visited the finances, team, and client screens. Next, compare trends and recurring commitments over several months.\n\nConsider whether growth leaves enough service capacity and cash for the commitments already made. This tour introduces the controls; visiting a screen does not demonstrate that you can apply the ideas in a new situation.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: ['lo-m3-strategy'],
  },
  {
    id: 'm3-dashboard-trends',
    phase: 'month3',
    page: '/',
    title: 'Reading the Trends',
    content:
      'Notice how your numbers have shifted as the game has advanced. This chart tells the story of your firm\'s trajectory.\n\nTrends matter more than any single month\'s numbers. Is revenue growing or flat? Are expenses outpacing revenue? Is profit consistent or volatile? A real managing partner would look at charts like this to identify emerging problems before they become crises.',
    targetSelector: '[data-tutorial-target="financial-chart"]',
    position: 'top',
    learningObjectiveIds: ['lo-m3-trends'],
  },
  {
    id: 'm3-resource-allocation',
    phase: 'month3',
    page: '/',
    title: 'Resource Allocation',
    content:
      'Look at your employee and client summaries below. Compare the number of clients with your team\'s efficacy and burnout. Is payroll affordable at your current revenue and cash levels?\n\nThere is no single staffing ratio that fits every firm. Use these measures together when deciding whether to hire.',
    targetSelector: '[data-tutorial-target="employee-summary"]',
    position: 'top',
    learningObjectiveIds: ['lo-m3-staffing'],
  },
  {
    id: 'm3-nav-to-hr-hiring',
    phase: 'month3',
    page: '/',
    title: 'Consider Your Staffing',
    content:
      'Navigate to the HR page to evaluate whether your team size matches your workload. Consider whether you need to hire — or whether you can\'t afford to.',
    targetSelector: '[data-tutorial-target="sidenav-hr"]',
    position: 'right',
    learningObjectiveIds: ['lo-m3-staffing'],
    requiresAction: 'navigate',
    actionTarget: '/hr',
  },
  {
    id: 'm3-hiring-decision',
    phase: 'month3',
    page: '/hr',
    title: 'The Hiring Decision',
    content:
      'Hiring is one of the most consequential decisions a managing partner makes. Each new hire adds to your monthly payroll permanently.\n\nBefore hiring, ask yourself:\n\u2022 Can my current team handle the client load without burning out?\n\u2022 Will the new hire generate enough value to justify their salary?\n\u2022 Do I have enough cash reserves to cover payroll if revenue dips?\n\nThe "Hire Employee" button lets you add staff when you\'re ready.',
    targetSelector: '[data-tutorial-target="hire-employee-btn"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m3-staffing'],
  },
  {
    id: 'm3-reputation-management',
    phase: 'month3',
    page: '/hr',
    title: 'Reading the Reputation Summary',
    content:
      'The reputation score in the top bar summarizes average client satisfaction (60%) and staff efficacy (40%) at the monthly update. It has no separate effect on new-client acquisition or recruitment.\n\nLook behind the summary: are client scores changing because coverage is strained? Has an explicit staff scenario changed efficacy? Use the underlying measures to explain the change.',
    targetSelector: '[data-tutorial-target="reputation-display"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m3-reputation'],
  },
  {
    id: 'm3-congratulations',
    phase: 'month3',
    page: '/hr',
    title: 'Tutorial Complete!',
    content:
      'Tutorial complete. You have toured the main controls and reports:\n\n\u2022 Billed revenue, profit, cash, and receivables\n\u2022 Staffing commitments, coverage, fatigue, and efficacy\n\u2022 Satisfaction, contracts, and fee exposure\n\u2022 Shared partner attention and delegated responses\n\u2022 Trends and the reputation summary\n\nCompleting this tour records screens visited, not demonstrated mastery. Continue making decisions and explaining their costs and consequences to practice these ideas.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: [],
  },
  {
    id: 'm3-whats-next',
    phase: 'month3',
    page: '/hr',
    title: 'What\'s Next',
    content:
      'Continue managing the firm. Compare opportunities for growth with recurring payroll, service capacity, and cash. Before spending your monthly partner intervention, consider which other escalation must wait or be delegated.\n\nUse the help icons and GR Glossary for explanations of the model and its limits. The fictional numerical assumptions are not industry benchmarks. You can replay this tour from the sidebar.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: [],
  },
];

export const getStepsForPhase = (phase: TutorialPhase): TutorialStep[] =>
  tutorialSteps.filter((step) => step.phase === phase);

export const getStepById = (id: string): TutorialStep | undefined =>
  tutorialSteps.find((step) => step.id === id);

export const getTotalStepCount = (): number => tutorialSteps.length;
