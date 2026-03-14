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
      'Government relations (GR) firms help organizations navigate the legislative and regulatory process. Clients hire your firm to advocate on their behalf before Congress, federal agencies, and state governments.\n\nYour team includes lobbyists who build relationships with policymakers on Capitol Hill, attorneys who handle regulatory compliance and filings, and support staff who manage scheduling, research, and administration.\n\nThis is a multi-billion dollar industry centered on K Street in Washington, D.C., where the most prominent firms are headquartered.',
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
      'Most GR firms charge clients on a retainer basis — a fixed monthly fee for ongoing representation, regardless of hours worked. Some engagements are billed hourly, especially project-based or regulatory work.\n\nYour revenue comes from these client fees, while your expenses are primarily payroll for your professional staff. The difference is your profit, which funds partner distributions, firm growth, and cash reserves.\n\nA healthy GR firm targets 20-35% profit margins. Below that, and you are not generating enough to invest in the firm\'s future.',
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
      'Cash on Hand is your firm\'s available operating capital — the money in your bank account right now. In the GR industry, firms aim to maintain 3-6 months of operating expenses as a cash buffer.\n\nYour current reserve is $250,000. With monthly expenses around $37,000, that gives you roughly 6-7 months of runway. This is a comfortable position, but it can erode quickly if you lose a major client or hire aggressively.',
    targetSelector: '[data-tutorial-target="stat-cash"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-cash-mgmt'],
  },
  {
    id: 'm1-revenue-card',
    phase: 'month1',
    page: '/',
    title: 'Monthly Revenue',
    content:
      'Your Monthly Revenue comes from client retainers — the fixed fees your clients pay each month for your advocacy services. This is called Monthly Recurring Revenue (MRR) in the industry.\n\nFor a firm your size, $100K+ MRR is solid. This number rises when you add clients and falls when you lose them. Revenue stability is the foundation of everything else.',
    targetSelector: '[data-tutorial-target="stat-revenue"]',
    position: 'bottom',
    learningObjectiveIds: ['lo-m1-financials'],
  },
  {
    id: 'm1-profit-card',
    phase: 'month1',
    page: '/',
    title: 'Net Profit',
    content:
      'Net Profit is what remains after subtracting all expenses (primarily payroll) from revenue. Healthy GR firms target 20-35% profit margins.\n\nYour profit funds three critical needs: partner compensation (your paycheck), cash reserves (for lean months), and firm growth (hiring, marketing, new capabilities). If profit dips below 15%, your firm is in a precarious position.',
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
      'Reputation is everything in government relations. It determines whether clients renew their contracts, whether prospects choose your firm over competitors, and whether top talent wants to work for you.\n\nYour reputation is built on two pillars: client satisfaction (60%) and employee performance (40%). Think of it as your firm\'s "brand" on K Street.',
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
      'This page gives you the full financial picture of your firm. In a real GR practice, your CFO or office manager would prepare reports like these monthly.\n\nThe summary cards show your current financial position. The charts below track trends over time — which is where the real insights live. A single month\'s numbers can be misleading, but trends reveal the truth about your firm\'s trajectory.',
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
      'Accounts Receivable (AR) is money clients owe you for services already rendered. In the GR industry, standard payment terms are net-30 (due within 30 days).\n\nThe AR aging table breaks down outstanding invoices by how overdue they are. AR beyond 60 days is a red flag — it signals collection problems that can threaten your cash position even when the firm is profitable on paper.',
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
      'Your team is your most valuable asset in government relations. You have three types of professionals:\n\n\u2022 Lobbyists — Your client-facing advocates who build relationships on Capitol Hill and represent client interests before Congress.\n\u2022 Attorneys — Handle regulatory filings, compliance, and legal analysis of proposed legislation and rules.\n\u2022 Support Staff — Manage scheduling, research, correspondence, and the administrative backbone of the firm.\n\nEach person has efficacy (how well they perform), burnout (how exhausted they are), and client affinity (how well they connect with clients).',
    targetSelector: '[data-tutorial-target="employee-table"]',
    position: 'top',
    learningObjectiveIds: ['lo-m1-team-roles'],
  },
  {
    id: 'm1-burnout',
    phase: 'month1',
    page: '/hr',
    title: 'The Burnout Crisis',
    content:
      'Burnout is a real and serious issue in the GR industry. Long hours, high-stakes advocacy, constant travel, and the pressure of representing client interests before powerful officials all take a toll.\n\nWatch these burnout numbers carefully. When burnout exceeds 60%, employee performance drops significantly. Above 80%, you risk losing the employee entirely. Managing workload and compensation is how you fight burnout.',
    targetSelector: '[data-tutorial-target="burnout-chart"]',
    position: 'left',
    learningObjectiveIds: ['lo-m1-team-roles'],
  },
  {
    id: 'm1-advance-month',
    phase: 'month1',
    page: '/hr',
    title: 'Advance to Month 2',
    content:
      'You\'ve reviewed your firm\'s position — finances, team, and metrics. Now advance to Month 2 to see how things evolve. Click "Advance Month" in the top bar.\n\nEach month, employee burnout increases, client satisfaction fluctuates, contracts tick down, and new situations land in your inbox. This is the heartbeat of your firm.',
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
    title: 'Month 2: Client Management',
    content:
      'Welcome to Month 2. This month, we focus on your clients — the organizations that pay your firm for government relations services.\n\nClient management is a core competency for any managing partner. You need to keep existing clients happy while also developing new business. Let\'s start by reviewing your client roster.',
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
      'Your clients fall into three categories:\n\n\u2022 Corporations — Lobby on specific business issues like tax policy, trade regulation, and industry rules. They tend to have larger budgets and more focused agendas.\n\u2022 Trade Associations — Represent entire industries (tech, healthcare, finance). They have broader policy portfolios and often coordinate industry-wide advocacy.\n\u2022 Non-Profits — Advocate for causes like environment, education, or healthcare access. Typically smaller budgets but deeply mission-driven.\n\nA diversified client base reduces risk — you don\'t want one client type to dominate your revenue.',
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
      'Client satisfaction measures how well your firm is serving each organization. In real GR, satisfaction depends on:\n\n\u2022 Legislative wins and policy outcomes\n\u2022 Responsiveness to client requests\n\u2022 Quality of strategic advice\n\u2022 Strength of personal relationships\n\nBelow 60% means the client is actively considering other firms. Below 40%, they\'re probably already talking to your competitors. Proactive communication is your best defense.',
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
      'Every client engagement has a contract term. When it expires, the client decides whether to renew based on their satisfaction and the perceived value of your services.\n\nSmart managing partners begin renewal conversations 3-4 months before expiry — never wait until the last minute. Losing a client means losing their monthly retainer, which directly impacts your cash flow and profit.',
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
      'Each decision has real consequences that ripple through your firm. Consider the trade-offs:\n\n\u2022 Approving a raise costs money now but retains talent\n\u2022 Scheduling a client meeting takes time but may save the relationship\n\u2022 Pursuing new business aggressively uses resources but grows revenue\n\nClick on a message to see its details and available choices. Think carefully before deciding.',
    targetSelector: '[data-tutorial-target="inbox-detail"]',
    position: 'left',
    learningObjectiveIds: ['lo-m2-decisions', 'lo-m2-tradeoffs'],
  },
  {
    id: 'm2-decision-making',
    phase: 'month2',
    page: '/inbox',
    title: 'The Art of Decision-Making',
    content:
      'Real managing partners balance short-term costs against long-term relationships every day. There are rarely perfect answers.\n\nDenying a raise saves money this month but may cost you a key lobbyist (and their clients) next month. Ignoring a client complaint saves time today but risks losing revenue tomorrow. Aggressive pursuit of new business can overextend your team.\n\nThe best GR leaders develop judgment through experience — which is exactly what this simulation teaches.',
    targetSelector: 'center',
    position: 'center',
    learningObjectiveIds: ['lo-m2-tradeoffs'],
  },
  {
    id: 'm2-advance-month',
    phase: 'month2',
    page: '/inbox',
    title: 'Advance to Month 3',
    content:
      'Handle your inbox messages, then advance to Month 3 to continue learning. Review any decisions you need to make, then click "Advance Month" when ready.',
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
    title: 'Month 3: Strategic Thinking',
    content:
      'Welcome to Month 3. Now that you understand the fundamentals — finances, team, and clients — let\'s think about long-term strategy.\n\nReal GR firm leaders don\'t just manage day-to-day operations. They think quarters and years ahead, anticipating industry shifts, planning for growth, and positioning their firm for success in a competitive market.',
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
      'Notice how your numbers have shifted over three months. This chart tells the story of your firm\'s trajectory.\n\nTrends matter more than any single month\'s numbers. Is revenue growing or flat? Are expenses outpacing revenue? Is profit consistent or volatile? A real managing partner would look at charts like this to identify emerging problems before they become crises.',
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
      'Look at your employee and client summaries below. Do you have enough lobbyists for your client load? Are any employees in the danger zone for burnout?\n\nThe industry standard is roughly 1.5-2 lobbyists per active client for quality service. Too few lobbyists means overwork and declining client satisfaction. Too many means wasted payroll and squeezed margins.',
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
    title: 'Building Reputation',
    content:
      'Your firm\'s reputation is displayed in the top navigation bar. It reflects how the government affairs community perceives your firm.\n\nIn the real world, reputation encompasses word-of-mouth among Hill staffers, rankings in publications like The National Journal, your track record of legislative wins, and the caliber of clients you represent.\n\nReputation is slow to build and fast to destroy. Every decision you make — how you treat employees, how you serve clients — compounds over time.',
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
      'Congratulations! You\'ve completed the Managing Partner tutorial.\n\nYou now understand the fundamentals of managing a government relations firm:\n\n\u2022 Financial management — revenue, expenses, profit, and cash flow\n\u2022 Team leadership — hiring, compensation, burnout, and efficacy\n\u2022 Client relations — satisfaction, contracts, and diversification\n\u2022 Decision-making — trade-offs, urgency, and long-term thinking\n\u2022 Strategic planning — trends, resource allocation, and reputation',
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
      'Continue running your firm. Grow your client base, manage your team, build your reputation, and make the tough calls.\n\nUse the GR Glossary (the help button in the bottom-right corner) anytime you encounter unfamiliar terms. Every metric on every page has a help icon that explains what it means in real government relations context.\n\nYou can replay this tutorial anytime from the sidebar. Good luck, Managing Partner.',
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
