export interface ContextualHelpItem {
  id: string;
  page: string;
  metricName: string;
  shortDescription: string;
  grExplanation: string;
  relatedGlossaryTerms?: string[];
}

export const contextualHelpItems: Record<string, ContextualHelpItem> = {
  // Dashboard
  'dashboard-cash': {
    id: 'dashboard-cash',
    page: '/',
    metricName: 'Cash on Hand',
    shortDescription: 'Your firm\'s available liquid capital.',
    grExplanation: 'In real GR firms, managing partners aim to maintain 3-6 months of operating expenses as a cash buffer. This covers late client payments, unexpected costs, and seasonal slowdowns (e.g., August recess, holiday breaks). Running low on cash can force difficult decisions like delaying payroll or cutting staff.',
    relatedGlossaryTerms: ['monthly-recurring-revenue', 'accounts-receivable'],
  },
  'dashboard-revenue': {
    id: 'dashboard-revenue',
    page: '/',
    metricName: 'Monthly Revenue',
    shortDescription: 'Total income from all client retainers and billings this month.',
    grExplanation: 'For a mid-size DC firm, $100K-$200K monthly revenue is typical. Revenue stability depends on your retainer vs. hourly billing mix — retainers provide predictable income, while hourly work fluctuates. Most successful firms aim for 70%+ retainer revenue for stability.',
    relatedGlossaryTerms: ['retainer', 'hourly-billing', 'monthly-recurring-revenue'],
  },
  'dashboard-expenses': {
    id: 'dashboard-expenses',
    page: '/',
    metricName: 'Monthly Expenses',
    shortDescription: 'Total operating costs, primarily payroll.',
    grExplanation: 'In GR firms, compensation typically represents 60-75% of total expenses. Other costs include office space (often premium DC locations), travel to state capitals, compliance filings, political event sponsorships, and professional development. Controlling expenses without cutting talent is a constant balancing act.',
    relatedGlossaryTerms: ['utilization-rate'],
  },
  'dashboard-profit': {
    id: 'dashboard-profit',
    page: '/',
    metricName: 'Net Profit',
    shortDescription: 'Revenue minus all expenses.',
    grExplanation: 'Healthy GR firms target 20-35% profit margins. This funds partner distributions, firm growth investments, and cash reserves. Profit margins below 15% suggest the firm is either overstaffed or under-pricing its services. Negative margins require immediate corrective action.',
    relatedGlossaryTerms: ['retainer', 'managing-partner'],
  },
  'dashboard-satisfaction': {
    id: 'dashboard-satisfaction',
    page: '/',
    metricName: 'Avg Client Satisfaction',
    shortDescription: 'Aggregate measure of how well you\'re serving clients.',
    grExplanation: 'In real GR, client satisfaction correlates with: legislative and regulatory outcomes achieved, responsiveness to requests, quality of strategic advice, strength of personal relationships, and transparency in reporting progress. Dissatisfied clients rarely give warning before leaving.',
    relatedGlossaryTerms: ['client-affinity', 'book-of-business'],
  },
  'dashboard-reputation': {
    id: 'dashboard-reputation',
    page: '/',
    metricName: 'Firm Reputation',
    shortDescription: 'How the GR community perceives your firm.',
    grExplanation: 'Reputation is driven by client satisfaction (60%) and employee performance (40%). In the real world, this encompasses word-of-mouth among Hill staffers, rankings in publications like The National Journal, media mentions, and your track record of legislative wins. It directly affects your ability to win new clients and recruit top talent.',
    relatedGlossaryTerms: ['k-street', 'rainmaker'],
  },

  // Finances page
  'finance-ar': {
    id: 'finance-ar',
    page: '/finances',
    metricName: 'Accounts Receivable',
    shortDescription: 'Money clients owe you for services already rendered.',
    grExplanation: 'Industry standard is net-30 payment terms. AR aging beyond 60 days signals collection problems and threatens your cash position. Some government-adjacent clients (especially non-profits and associations) are chronically slow payers. Proactive collections management is essential for firm health.',
    relatedGlossaryTerms: ['accounts-receivable', 'retainer'],
  },
  'finance-avg-profit': {
    id: 'finance-avg-profit',
    page: '/finances',
    metricName: 'Avg Monthly Profit',
    shortDescription: 'Your trailing average profit across all months.',
    grExplanation: 'Trailing averages smooth out monthly fluctuations and reveal the true profit trajectory. Declining averages may indicate rising payroll costs, client attrition, pricing problems, or an increasing share of unprofitable hourly work. Three consecutive months of decline warrants a strategic review.',
    relatedGlossaryTerms: ['monthly-recurring-revenue'],
  },
  'finance-revenue-chart': {
    id: 'finance-revenue-chart',
    page: '/finances',
    metricName: 'Revenue vs Expenses',
    shortDescription: 'Historical comparison of income against costs.',
    grExplanation: 'This chart reveals whether your firm is growing or shrinking. Healthy firms show revenue outpacing expense growth over time. When the gap narrows, it means margins are compressing — often a sign that you\'re hiring ahead of revenue or that client attrition is outpacing new business development.',
    relatedGlossaryTerms: ['retainer', 'utilization-rate'],
  },
  'finance-profit-trend': {
    id: 'finance-profit-trend',
    page: '/finances',
    metricName: 'Profit Trend',
    shortDescription: 'Month-over-month profit trajectory.',
    grExplanation: 'The profit trend line is the single most important indicator of firm health. Consistent profitability allows investment in growth — hiring rainmakers, expanding into new practice areas, or opening satellite offices. Losses mean you need to grow revenue (new clients, price increases) or cut costs (layoffs, office downsizing).',
    relatedGlossaryTerms: ['managing-partner', 'rainmaker'],
  },

  // HR page
  'hr-total-employees': {
    id: 'hr-total-employees',
    page: '/hr',
    metricName: 'Total Employees',
    shortDescription: 'Your firm\'s headcount across all roles.',
    grExplanation: 'Your headcount includes lobbyists (client-facing advocates on Capitol Hill), attorneys (regulatory filings and compliance), and support staff (scheduling, research, administration). The ideal ratio depends on your client load — industry standard is roughly 1.5-2 lobbyists per active client for quality service.',
    relatedGlossaryTerms: ['lobbyist', 'bench-strength'],
  },
  'hr-payroll': {
    id: 'hr-payroll',
    page: '/hr',
    metricName: 'Total Payroll',
    shortDescription: 'Your largest expense category.',
    grExplanation: 'In the GR industry, top lobbyists command $120K-$300K+ annually, with senior partners earning significantly more. Attorneys with regulatory expertise are equally expensive. Payroll typically represents 60-75% of total costs. The challenge is balancing competitive compensation (to retain talent) with profitability.',
    relatedGlossaryTerms: ['lobbyist', 'rainmaker', 'book-of-business'],
  },
  'hr-efficacy': {
    id: 'hr-efficacy',
    page: '/hr',
    metricName: 'Employee Efficacy',
    shortDescription: 'How effectively each team member performs their role.',
    grExplanation: 'Efficacy reflects client outcomes, relationship quality on the Hill, successful advocacy campaigns, and overall productivity. High-efficacy lobbyists have strong networks, deep policy knowledge, and the trust of policymakers. Low efficacy often correlates with burnout, poor role fit, or insufficient mentoring.',
    relatedGlossaryTerms: ['efficacy', 'client-affinity', 'direct-lobbying'],
  },
  'hr-burnout': {
    id: 'hr-burnout',
    page: '/hr',
    metricName: 'Burnout',
    shortDescription: 'Physical and emotional exhaustion from sustained high-pressure work.',
    grExplanation: 'Burnout is a real crisis in the GR industry. Long hours, high-stakes advocacy, constant travel between DC and state capitals, tight legislative deadlines, and the pressure of representing client interests before powerful officials all contribute. When burnout exceeds 60%, performance drops sharply. Above 80%, you risk losing the employee entirely.',
    relatedGlossaryTerms: ['burnout', 'managing-partner'],
  },
  'hr-affinity': {
    id: 'hr-affinity',
    page: '/hr',
    metricName: 'Client Affinity',
    shortDescription: 'How well an employee connects with and serves clients.',
    grExplanation: 'High-affinity lobbyists build deep trust with their clients, leading to renewals and referrals. In the real GR world, client relationships are often personal — clients hire specific lobbyists, not just firms. When a high-affinity lobbyist leaves, their clients may follow them to their new firm.',
    relatedGlossaryTerms: ['client-affinity', 'book-of-business', 'rainmaker'],
  },

  // Clients page
  'clients-satisfaction': {
    id: 'clients-satisfaction',
    page: '/clients',
    metricName: 'Client Satisfaction',
    shortDescription: 'How well your firm is meeting each client\'s GR needs.',
    grExplanation: 'In reality, satisfaction is driven by legislative wins, responsiveness, quality of strategic advice, and the personal relationship with their assigned lobbyist. Below 60% means the client is actively considering other firms. Below 40% means they are likely already talking to competitors. Proactive communication and honest progress reporting are the best defenses.',
    relatedGlossaryTerms: ['client-affinity', 'direct-lobbying'],
  },
  'clients-contract': {
    id: 'clients-contract',
    page: '/clients',
    metricName: 'Contract Duration',
    shortDescription: 'Months remaining on each client\'s engagement.',
    grExplanation: 'When contracts expire, clients decide whether to renew based on satisfaction and perceived value. High satisfaction leads to renewals; low satisfaction means they may take their business to a competing firm. Smart managing partners begin renewal conversations 3-4 months before expiry — never wait until the last minute.',
    relatedGlossaryTerms: ['retainer', 'book-of-business'],
  },
  'clients-type': {
    id: 'clients-type',
    page: '/clients',
    metricName: 'Client Type',
    shortDescription: 'The kind of organization your client represents.',
    grExplanation: 'Corporations lobby on specific business issues (tax policy, trade regulation, industry rules). Trade Associations represent entire industries and tend to have broader policy portfolios. Non-Profits advocate for causes (environment, healthcare, education) and typically have smaller budgets. A diverse portfolio reduces revenue concentration risk — losing one client type shouldn\'t threaten the firm.',
    relatedGlossaryTerms: ['government-relations', 'coalition-building'],
  },
  'clients-fee': {
    id: 'clients-fee',
    page: '/clients',
    metricName: 'Monthly Fee',
    shortDescription: 'The retainer or expected monthly billing for each client.',
    grExplanation: 'Fees vary by client size, complexity of issues, and scope of work. Typical retainers range from $5K/month for small non-profits to $50K+ for major corporations with complex legislative agendas. Hourly rates for senior lobbyists can exceed $500/hour. Pricing should reflect the value delivered, not just time spent.',
    relatedGlossaryTerms: ['retainer', 'hourly-billing', 'monthly-recurring-revenue'],
  },

  // Inbox page
  'inbox-urgency': {
    id: 'inbox-urgency',
    page: '/inbox',
    metricName: 'Message Urgency',
    shortDescription: 'How time-sensitive each situation is.',
    grExplanation: 'In real GR, "high" urgency means a client crisis, approaching legislative deadline, or personnel emergency demanding same-day attention. "Medium" urgency involves important but non-critical decisions with a few days\' window. "Low" urgency items are informational or can be addressed during your weekly review. Effective managing partners triage ruthlessly.',
    relatedGlossaryTerms: ['managing-partner'],
  },
  'inbox-action-required': {
    id: 'inbox-action-required',
    page: '/inbox',
    metricName: 'Action Required',
    shortDescription: 'Decisions only the managing partner can make.',
    grExplanation: 'In a real firm, these would be escalated to you by your operations director, office manager, or senior partners. They typically involve financial commitments (salary changes, new hires), client relationship decisions (how to handle complaints), or business development choices (whether to pursue new opportunities). Delegation is important, but these decisions rest with you.',
    relatedGlossaryTerms: ['managing-partner', 'rainmaker'],
  },
  'inbox-choices': {
    id: 'inbox-choices',
    page: '/inbox',
    metricName: 'Decision Choices',
    shortDescription: 'The realistic options a managing partner would face.',
    grExplanation: 'Each choice represents a real trade-off. Approving a raise costs money but retains talent. Scheduling a client meeting takes time but may save the relationship. Pursuing new business aggressively uses resources but grows revenue. There are rarely perfect answers — experienced GR leaders weigh costs, relationships, and long-term consequences.',
    relatedGlossaryTerms: ['managing-partner', 'book-of-business'],
  },

  // Back-office / Finance tabs
  'finance-pl': {
    id: 'finance-pl',
    page: '/finances',
    metricName: 'P&L Statement',
    shortDescription: 'Your firm\'s income statement showing revenue, costs, and profit.',
    grExplanation: 'The Profit & Loss (P&L) statement is the single most important financial report for a managing partner. It shows whether the firm is making or losing money, breaking down revenue sources and every expense category. Review it monthly to spot trends — rising payroll as a percentage of revenue, vendor costs creeping up, or operating margins compressing. Healthy GR firms target 20-35% operating margins.',
    relatedGlossaryTerms: ['profit-loss-statement', 'gross-margin', 'operating-margin'],
  },
  'finance-gross-margin': {
    id: 'finance-gross-margin',
    page: '/finances',
    metricName: 'Gross Margin',
    shortDescription: 'Revenue minus the direct cost of delivering services (payroll).',
    grExplanation: 'Gross margin shows how much revenue remains after paying the people who do the work. In a GR firm, this is primarily lobbyist, attorney, and support staff compensation (salary + benefits + payroll taxes). A healthy gross margin is 40-55%. If it drops below 35%, you\'re spending too much on compensation relative to revenue — either raise prices, improve utilization, or reduce headcount.',
    relatedGlossaryTerms: ['gross-margin', 'utilization-rate'],
  },
  'finance-operating-margin': {
    id: 'finance-operating-margin',
    page: '/finances',
    metricName: 'Operating Margin',
    shortDescription: 'Profit after all operating expenses but before partner draws.',
    grExplanation: 'Operating margin is gross margin minus overhead (rent, insurance, technology, compliance, vendors). It represents the true profitability of firm operations before partner compensation. Target 20-35%. Below 15% means overhead is eating into profits. This metric helps you decide whether to invest in growth (more staff, better office) or cut costs.',
    relatedGlossaryTerms: ['operating-margin', 'operating-leverage'],
  },
  'finance-budget-variance': {
    id: 'finance-budget-variance',
    page: '/finances',
    metricName: 'Budget Variance',
    shortDescription: 'Difference between planned and actual spending by category.',
    grExplanation: 'Budget variance analysis is how managing partners control costs. Set quarterly budgets for each expense category, then track actual spending against them. Variances above 10% warrant investigation. Consistent overruns in a category mean either the budget was unrealistic or spending is out of control. Consistent underruns may mean you\'re under-investing.',
    relatedGlossaryTerms: ['budget-variance'],
  },
  'finance-dso': {
    id: 'finance-dso',
    page: '/finances',
    metricName: 'Days Sales Outstanding',
    shortDescription: 'Average number of days it takes to collect payment after invoicing.',
    grExplanation: 'DSO measures how quickly clients pay. Industry standard for GR firms is 30-45 days. Above 45 days signals collection problems that will eventually hurt cash flow. Non-profits and trade associations tend to pay slower than corporations. Proactive collection efforts (monthly statements, personal calls at 45 days, formal demands at 60) keep DSO manageable.',
    relatedGlossaryTerms: ['days-sales-outstanding', 'accounts-receivable'],
  },
  'finance-collections': {
    id: 'finance-collections',
    page: '/finances',
    metricName: 'Collections',
    shortDescription: 'Actual cash received from clients this month.',
    grExplanation: 'Collections is the cash you actually received, as opposed to revenue (which is what you billed). The gap between billing and collections is your accounts receivable. A healthy firm collects 85-95% of billings within 30 days. If collections consistently lag revenue, your cash position deteriorates even if the firm is "profitable" on paper.',
    relatedGlossaryTerms: ['accounts-receivable', 'days-sales-outstanding'],
  },
  'finance-loc': {
    id: 'finance-loc',
    page: '/finances',
    metricName: 'Line of Credit',
    shortDescription: 'A revolving credit facility for short-term cash needs.',
    grExplanation: 'Most GR firms maintain a line of credit (LOC) for working capital management. It covers timing gaps between when you pay expenses (payroll is due regardless) and when clients pay you. Drawing on the LOC costs interest, so minimize usage. The LOC should be a safety net, not a funding source. If you\'re constantly drawn, your firm has a structural cash flow problem.',
    relatedGlossaryTerms: ['line-of-credit', 'working-capital'],
  },
  'finance-partner-draw': {
    id: 'finance-partner-draw',
    page: '/finances',
    metricName: 'Partner Draw',
    shortDescription: 'Your guaranteed monthly payment as managing partner.',
    grExplanation: 'A partner draw is a regular payment to the managing partner, similar to a salary but technically an advance against profits. It\'s your "guaranteed" income. Set it at a sustainable level — too high drains cash, too low and you\'re not compensating yourself fairly. Typical managing partner draws at mid-size DC firms range from $12,000-$25,000/month, with additional quarterly distributions from profits.',
    relatedGlossaryTerms: ['partner-draw', 'partner-distribution'],
  },
  'finance-partner-equity': {
    id: 'finance-partner-equity',
    page: '/finances',
    metricName: 'Firm Equity Value',
    shortDescription: 'Estimated value of your ownership stake in the firm.',
    grExplanation: 'GR firms are typically valued at 1-2x trailing 12-month profit, adjusted for client retention rates, staff quality, brand reputation, and recurring revenue stability. This is what you\'d receive if you sold the firm. Building equity value is a long-term wealth creation strategy — every dollar of sustainable profit increases your firm\'s value by $1.50 or more.',
    relatedGlossaryTerms: ['equity-value'],
  },

  // HR back-office
  'hr-total-cost': {
    id: 'hr-total-cost',
    page: '/hr',
    metricName: 'Total Employee Cost',
    shortDescription: 'Full cost including salary, benefits, and payroll taxes.',
    grExplanation: 'Base salary is only about 75% of what an employee actually costs. Add health insurance, retirement contributions (25% benefits load) and employer payroll taxes (7.65% FICA). A lobbyist earning $8,000/mo actually costs ~$10,600/mo. Always think in total cost when evaluating whether a hire is affordable or a raise is justified.',
    relatedGlossaryTerms: ['utilization-rate'],
  },
  'hr-revenue-per-employee': {
    id: 'hr-revenue-per-employee',
    page: '/hr',
    metricName: 'Revenue per Employee',
    shortDescription: 'Total firm revenue divided by headcount.',
    grExplanation: 'Revenue per employee is a key efficiency metric. For mid-size DC GR firms, $15,000-$25,000 per employee per month is typical. Below $15,000 suggests overstaffing or underpricing. Above $25,000 suggests the team is stretched thin (watch burnout). This metric helps you decide when to hire (revenue growing faster than headcount) or when to hold.',
    relatedGlossaryTerms: ['utilization-rate'],
  },
  'hr-utilization': {
    id: 'hr-utilization',
    page: '/hr',
    metricName: 'Utilization / Client Load',
    shortDescription: 'Number of clients per billing staff member.',
    grExplanation: 'Client load per lobbyist/attorney indicates whether your team is properly sized. Ideal is 1.5-3 clients per billing staff member, depending on engagement complexity. Below 1.5 means you\'re overstaffed (or need more clients). Above 3 means staff is stretched, quality suffers, and burnout accelerates. Monitor this alongside satisfaction and burnout metrics.',
    relatedGlossaryTerms: ['utilization-rate', 'book-of-business'],
  },

  // Dashboard back-office
  'dashboard-operating-margin': {
    id: 'dashboard-operating-margin',
    page: '/',
    metricName: 'Operating Margin',
    shortDescription: 'Percentage of revenue remaining after all operating expenses.',
    grExplanation: 'Operating margin is your firm\'s profitability ratio. It answers: "For every dollar of revenue, how many cents remain as operating profit?" Target 20-35% for a healthy GR firm. Below 15% means you need to either grow revenue or cut costs. This single number tells you more about firm health than any other metric.',
    relatedGlossaryTerms: ['operating-margin'],
  },
  'dashboard-dso': {
    id: 'dashboard-dso',
    page: '/',
    metricName: 'Days Sales Outstanding',
    shortDescription: 'How many days, on average, it takes clients to pay.',
    grExplanation: 'DSO directly impacts your cash position. Every day of DSO represents one day\'s revenue tied up in receivables instead of in your bank account. At $111K monthly revenue, each day of DSO equals ~$3,700 in unavailable cash. Reducing DSO from 45 to 30 days frees up ~$55,000 in working capital.',
    relatedGlossaryTerms: ['days-sales-outstanding'],
  },
  'dashboard-collections': {
    id: 'dashboard-collections',
    page: '/',
    metricName: 'Monthly Collections',
    shortDescription: 'Cash actually received from clients this month.',
    grExplanation: 'Collections — not revenue — is what pays your bills. Revenue is what you billed; collections is what you collected. In a cash-flow-driven simulation, watching collections is more important than watching revenue. If collections drop while revenue stays flat, you have an AR problem that will eventually become a cash crisis.',
    relatedGlossaryTerms: ['accounts-receivable'],
  },
};

export const getHelpItem = (id: string): ContextualHelpItem | undefined =>
  contextualHelpItems[id];
