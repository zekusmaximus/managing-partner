export type GlossaryCategory =
  | 'Industry Basics'
  | 'Lobbying & Advocacy'
  | 'Legislative Process'
  | 'Compliance & Regulation'
  | 'Business & Finance'
  | 'Firm Management';

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: GlossaryCategory;
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  // Industry Basics
  {
    id: 'government-relations',
    term: 'Government Relations (GR)',
    definition: 'The practice of representing organizations\' interests before government bodies — Congress, federal agencies, state legislatures, and regulatory bodies. Also called government affairs or public affairs. GR professionals help clients navigate the legislative and regulatory process to achieve favorable policy outcomes.',
    category: 'Industry Basics',
    relatedTerms: ['government-affairs', 'public-affairs', 'k-street'],
  },
  {
    id: 'government-affairs',
    term: 'Government Affairs',
    definition: 'A synonym for government relations, sometimes used to emphasize a broader scope that includes regulatory agencies, executive branch advocacy, and state-level engagement in addition to congressional lobbying.',
    category: 'Industry Basics',
    relatedTerms: ['government-relations', 'public-affairs'],
  },
  {
    id: 'public-affairs',
    term: 'Public Affairs',
    definition: 'A broader discipline encompassing government relations, media relations, community engagement, and strategic communications. Public affairs professionals shape public opinion and policy through a combination of lobbying, PR, and grassroots mobilization.',
    category: 'Industry Basics',
    relatedTerms: ['government-relations', 'grassroots-advocacy'],
  },
  {
    id: 'k-street',
    term: 'K Street',
    definition: 'A major thoroughfare in Washington, D.C. that has become a metonym for the lobbying industry, much as "Wall Street" represents finance. Many prominent GR firms, law firms, and trade associations have offices on or near K Street. "K Street" is often used to refer to the lobbying industry as a whole.',
    category: 'Industry Basics',
    relatedTerms: ['government-relations', 'lobbyist'],
  },

  // Lobbying & Advocacy
  {
    id: 'lobbyist',
    term: 'Lobbyist',
    definition: 'A professional who advocates on behalf of clients before legislators, congressional staff, and government officials to influence specific legislation and policy. Lobbyists who meet certain activity thresholds must register under the Lobbying Disclosure Act (LDA) and file quarterly reports.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['direct-lobbying', 'lda', 'revolving-door'],
  },
  {
    id: 'direct-lobbying',
    term: 'Direct Lobbying',
    definition: 'Communication with legislators, their staff, or executive branch officials to influence specific legislation or policy decisions. This is the core activity of most GR firms and includes meetings, phone calls, emails, and formal testimony before congressional committees.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['lobbyist', 'grassroots-advocacy', 'committee-hearing'],
  },
  {
    id: 'grassroots-advocacy',
    term: 'Grassroots Advocacy',
    definition: 'Mobilizing constituents and the general public to contact their elected representatives and influence policy. Grassroots campaigns use email, phone banks, social media, and letter-writing campaigns to demonstrate broad public support or opposition to specific legislation.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['grasstops-advocacy', 'coalition-building', 'fly-in'],
  },
  {
    id: 'grasstops-advocacy',
    term: 'Grasstops Advocacy',
    definition: 'Engaging influential community leaders and stakeholders — CEOs, university presidents, hospital administrators, union leaders — to personally contact policymakers. Grasstops contacts carry more weight than form letters because they represent established voices in a legislator\'s district or state.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['grassroots-advocacy', 'coalition-building'],
  },
  {
    id: 'coalition-building',
    term: 'Coalition Building',
    definition: 'Forming alliances with other organizations that share policy goals to amplify advocacy impact. Coalitions demonstrate broader support for a position, pool resources for lobbying campaigns, and allow members to present a unified message to policymakers. Managing coalition dynamics (competing interests, messaging disagreements) is a key GR skill.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['grassroots-advocacy', 'public-affairs'],
  },
  {
    id: 'fly-in',
    term: 'Fly-In',
    definition: 'An organized event where constituents, industry representatives, or association members travel to Washington, D.C. (or a state capital) to meet with their elected officials in person. Fly-ins are a powerful advocacy tool because they put real faces and stories in front of legislators. GR firms often coordinate logistics, talking points, and meeting schedules.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['grassroots-advocacy', 'direct-lobbying'],
  },
  {
    id: 'pac',
    term: 'PAC (Political Action Committee)',
    definition: 'An organization that raises money to support or oppose political candidates through campaign contributions. GR firms often advise clients on PAC strategy, including which candidates to support, contribution timing, and compliance with FEC regulations. PAC contributions help build relationships but are separate from lobbying activities.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['527-organization', 'lobbyist'],
  },
  {
    id: '527-organization',
    term: '527 Organization',
    definition: 'A tax-exempt political organization created under Section 527 of the Internal Revenue Code. These groups engage in political activities like issue advocacy, voter mobilization, and election-related spending. Unlike PACs, they are not subject to the same contribution limits, but they cannot directly coordinate with campaigns.',
    category: 'Lobbying & Advocacy',
    relatedTerms: ['pac'],
  },

  // Legislative Process
  {
    id: 'appropriations',
    term: 'Appropriations',
    definition: 'The congressional process of allocating federal funding to specific programs, agencies, and projects. The annual appropriations process involves 12 subcommittees in each chamber and determines how roughly $1.7 trillion in discretionary spending is distributed. Lobbying on appropriations is one of the most common GR activities.',
    category: 'Legislative Process',
    relatedTerms: ['authorization', 'earmark', 'continuing-resolution'],
  },
  {
    id: 'authorization',
    term: 'Authorization',
    definition: 'Legislation that establishes or continues a federal program or agency, sets policy guidelines, and authorizes a specific level of funding (though actual funding requires a separate appropriations bill). Authorization bills define what the government can do; appropriations bills determine how much money it gets to do it.',
    category: 'Legislative Process',
    relatedTerms: ['appropriations', 'markup'],
  },
  {
    id: 'markup',
    term: 'Markup',
    definition: 'A committee or subcommittee meeting where legislators review, amend, and vote on proposed legislation line by line. Markups are where the real legislative sausage is made — amendments are proposed, debated, and voted on. GR professionals closely monitor markups and often work to get favorable amendments included or harmful ones defeated.',
    category: 'Legislative Process',
    relatedTerms: ['committee-hearing', 'conference-committee'],
  },
  {
    id: 'earmark',
    term: 'Earmark',
    definition: 'A provision in legislation that directs federal funds to a specific project, often in a particular congressional district. After a moratorium from 2011-2021, Congress reinstated earmarks (now called "Community Project Funding" in the House or "Congressionally Directed Spending" in the Senate). GR firms help clients secure earmarks for infrastructure, research, and community projects.',
    category: 'Legislative Process',
    relatedTerms: ['appropriations'],
  },
  {
    id: 'conference-committee',
    term: 'Conference Committee',
    definition: 'A temporary joint committee formed to reconcile differences between House and Senate versions of the same bill. Conference committee members negotiate a compromise version that both chambers must then approve. This is a critical stage where final legislative language is determined, making it a high-priority lobbying target.',
    category: 'Legislative Process',
    relatedTerms: ['markup', 'cloture'],
  },
  {
    id: 'cloture',
    term: 'Cloture',
    definition: 'A Senate procedure to end debate (and overcome a filibuster) on a bill or nomination, requiring 60 votes. Cloture is one of the most important procedural mechanisms in the Senate because it effectively means most legislation needs 60 votes to pass, not just a simple majority. GR professionals must often count cloture votes, not just "yes" votes.',
    category: 'Legislative Process',
    relatedTerms: ['conference-committee'],
  },
  {
    id: 'continuing-resolution',
    term: 'Continuing Resolution (CR)',
    definition: 'A temporary funding measure that allows the government to continue operating at current spending levels when regular appropriations bills have not been enacted by the start of the fiscal year (October 1). CRs maintain the status quo, which can be advantageous or disadvantageous depending on a client\'s interests.',
    category: 'Legislative Process',
    relatedTerms: ['appropriations', 'omnibus-bill'],
  },
  {
    id: 'omnibus-bill',
    term: 'Omnibus Bill',
    definition: 'A large legislative package that combines multiple measures — often several or all 12 annual appropriations bills — into a single bill. Omnibus bills are common when Congress falls behind on individual spending bills. They are both an opportunity (to attach favorable provisions) and a risk (unfavorable language can be buried in thousands of pages).',
    category: 'Legislative Process',
    relatedTerms: ['appropriations', 'continuing-resolution'],
  },
  {
    id: 'dear-colleague-letter',
    term: 'Dear Colleague Letter',
    definition: 'A letter circulated among members of Congress to build support for or opposition to a bill, amendment, or policy position. GR professionals often help draft Dear Colleague letters and work to gather cosigners. The number of signatures on a Dear Colleague letter signals the level of support for a position.',
    category: 'Legislative Process',
    relatedTerms: ['direct-lobbying'],
  },
  {
    id: 'committee-hearing',
    term: 'Committee Hearing',
    definition: 'A formal meeting where a congressional committee examines policy issues and hears testimony from witnesses — government officials, industry experts, advocates, and affected individuals. GR firms help prepare clients to testify, draft written testimony, and coordinate witness selection. Hearings are often the first step in the legislative process on an issue.',
    category: 'Legislative Process',
    relatedTerms: ['markup', 'direct-lobbying'],
  },

  // Compliance & Regulation
  {
    id: 'lda',
    term: 'LDA (Lobbying Disclosure Act)',
    definition: 'The primary federal law (enacted 1995, amended 2007) requiring lobbyists to register with Congress and file quarterly reports disclosing their lobbying activities, issues, and expenditures. Any individual who spends 20% or more of their time on lobbying activities for a client and makes more than one lobbying contact must register within 45 days.',
    category: 'Compliance & Regulation',
    relatedTerms: ['ld-forms', 'fara', 'lobbyist'],
  },
  {
    id: 'fara',
    term: 'FARA (Foreign Agents Registration Act)',
    definition: 'A federal law requiring individuals and firms that lobby on behalf of foreign governments, political parties, or foreign principals to register with the Department of Justice. FARA requires more extensive disclosure than the LDA, including copies of informational materials distributed and detailed financial reporting. Non-compliance carries criminal penalties.',
    category: 'Compliance & Regulation',
    relatedTerms: ['lda', 'lobbyist'],
  },
  {
    id: 'ld-forms',
    term: 'LD-1 / LD-2 Forms',
    definition: 'The registration (LD-1) and quarterly activity report (LD-2) forms required under the Lobbying Disclosure Act. LD-1 forms are filed when a new lobbying engagement begins. LD-2 forms are filed quarterly and disclose specific issues lobbied on, the houses of Congress and agencies contacted, and income received from each client.',
    category: 'Compliance & Regulation',
    relatedTerms: ['lda', 'lobbyist'],
  },
  {
    id: 'revolving-door',
    term: 'Revolving Door',
    definition: 'The movement of personnel between government positions and private-sector roles in lobbying, consulting, or industry. Former congressional staffers and executive branch officials are valued in GR for their policy expertise, relationships, and understanding of government processes. However, various ethics rules and cooling-off periods restrict immediate lobbying by former officials.',
    category: 'Compliance & Regulation',
    relatedTerms: ['cooling-off-period', 'lobbyist'],
  },
  {
    id: 'cooling-off-period',
    term: 'Cooling-Off Period',
    definition: 'The legally mandated waiting period before former government officials can engage in lobbying activities directed at their former agency, chamber, or colleagues. For former members of Congress, the cooling-off period is typically 1-2 years. For senior executive branch officials, it can be 1-2 years. These restrictions are designed to prevent conflicts of interest.',
    category: 'Compliance & Regulation',
    relatedTerms: ['revolving-door', 'lda'],
  },

  // Business & Finance
  {
    id: 'retainer',
    term: 'Retainer',
    definition: 'A fixed monthly fee paid by a client for ongoing government relations representation, regardless of the actual hours worked. Retainers provide predictable revenue for the firm and ensure the client has dedicated access to their lobbyist. Typical retainers range from $5,000/month for small non-profits to $50,000+/month for major corporations with complex legislative agendas.',
    category: 'Business & Finance',
    relatedTerms: ['hourly-billing', 'monthly-recurring-revenue'],
  },
  {
    id: 'hourly-billing',
    term: 'Hourly Billing',
    definition: 'Charging clients based on the actual hours spent on their government relations work. Common for project-based engagements, litigation support, or regulatory proceedings with defined timelines. Senior lobbyists may bill $400-$750+ per hour. While potentially more lucrative for high-activity periods, hourly billing creates less predictable revenue than retainers.',
    category: 'Business & Finance',
    relatedTerms: ['retainer', 'utilization-rate', 'realization-rate'],
  },
  {
    id: 'accounts-receivable',
    term: 'Accounts Receivable (AR)',
    definition: 'Money owed to the firm by clients for services already rendered but not yet paid. Standard payment terms in the GR industry are net-30 (payment due within 30 days of invoice). AR aging beyond 60 days signals collection problems. Chronic AR issues can create cash flow crises even in otherwise profitable firms.',
    category: 'Business & Finance',
    relatedTerms: ['retainer', 'monthly-recurring-revenue'],
  },
  {
    id: 'monthly-recurring-revenue',
    term: 'Monthly Recurring Revenue (MRR)',
    definition: 'The predictable, recurring revenue from all active retainer clients. MRR is the primary financial metric for GR firms because it represents stable, forecastable income. Firms with high MRR (relative to expenses) have more financial stability and can invest in growth, while firms overly dependent on hourly billing face revenue volatility.',
    category: 'Business & Finance',
    relatedTerms: ['retainer', 'accounts-receivable'],
  },
  {
    id: 'utilization-rate',
    term: 'Utilization Rate',
    definition: 'The percentage of an employee\'s available working time that is spent on billable client work. In GR firms, a target utilization rate of 65-80% is typical for lobbyists, with the remaining time spent on business development, professional development, and administrative tasks. Low utilization suggests overstaffing; extremely high utilization leads to burnout.',
    category: 'Business & Finance',
    relatedTerms: ['realization-rate', 'burnout', 'hourly-billing'],
  },
  {
    id: 'realization-rate',
    term: 'Realization Rate',
    definition: 'The percentage of billed time that is actually collected as revenue. A 100% realization rate means every billed hour is paid; in practice, rates of 85-95% are considered good. Lower rates indicate write-offs (discounting bills for dissatisfied clients), uncollectible AR, or pricing resistance. Tracking realization helps identify problem clients.',
    category: 'Business & Finance',
    relatedTerms: ['utilization-rate', 'accounts-receivable', 'hourly-billing'],
  },

  // Firm Management
  {
    id: 'managing-partner',
    term: 'Managing Partner',
    definition: 'The senior partner responsible for the overall operations, strategy, and financial performance of the firm. The managing partner sets firm direction, manages partner relationships, oversees major client engagements, makes hiring and compensation decisions, and serves as the public face of the firm. In this simulation, you are the managing partner.',
    category: 'Firm Management',
    relatedTerms: ['rainmaker', 'book-of-business'],
  },
  {
    id: 'rainmaker',
    term: 'Rainmaker',
    definition: 'A partner or senior lobbyist who brings in significant new business and client revenue. Rainmakers are highly valued because they drive firm growth through their networks, reputation, and business development skills. They often command the highest compensation and greatest autonomy. Losing a rainmaker can mean losing their entire book of business.',
    category: 'Firm Management',
    relatedTerms: ['managing-partner', 'book-of-business', 'client-affinity'],
  },
  {
    id: 'client-affinity',
    term: 'Client Affinity',
    definition: 'The strength of the personal relationship between a GR professional and their assigned client. High affinity means deep trust, frequent communication, and a strong working partnership. In the GR industry, clients often feel more loyalty to their individual lobbyist than to the firm — making client affinity both an asset (for retention) and a risk (if the lobbyist leaves).',
    category: 'Firm Management',
    relatedTerms: ['rainmaker', 'book-of-business'],
  },
  {
    id: 'burnout',
    term: 'Burnout',
    definition: 'Physical and emotional exhaustion from sustained high-pressure work. In the GR industry, burnout is caused by long hours, constant travel, high-stakes advocacy, legislative deadline pressure, demanding clients, and the always-on nature of political work. Burnout leads to decreased performance, higher error rates, and employee turnover — all of which harm client relationships and firm reputation.',
    category: 'Firm Management',
    relatedTerms: ['efficacy', 'utilization-rate', 'managing-partner'],
  },
  {
    id: 'efficacy',
    term: 'Efficacy',
    definition: 'A measure of how effectively an employee performs their role. For lobbyists, efficacy reflects the quality of their Hill relationships, policy expertise, strategic thinking, and ability to advance client objectives. High-efficacy employees deliver better client outcomes, earn renewals, and contribute to firm reputation. Efficacy can be improved through mentoring, reduced workload, and professional development.',
    category: 'Firm Management',
    relatedTerms: ['burnout', 'client-affinity'],
  },
  {
    id: 'book-of-business',
    term: 'Book of Business',
    definition: 'The total value of clients that a particular lobbyist, partner, or team manages. A lobbyist\'s book of business represents both their revenue contribution to the firm and their portable value (clients who might follow them if they leave). Managing partners track books of business to understand revenue concentration risk and to inform compensation decisions.',
    category: 'Firm Management',
    relatedTerms: ['rainmaker', 'client-affinity', 'managing-partner'],
  },
  {
    id: 'bench-strength',
    term: 'Bench Strength',
    definition: 'The depth of talent available to cover when key team members are unavailable — whether due to vacation, illness, departure, or competing demands. Strong bench strength means no single employee is indispensable to client service. Weak bench strength creates risk: if a key lobbyist leaves or burns out, client service suffers immediately.',
    category: 'Firm Management',
    relatedTerms: ['burnout', 'managing-partner'],
  },

  // Back-Office / Financial Management Terms
  {
    id: 'profit-loss-statement',
    term: 'P&L Statement (Profit & Loss)',
    definition: 'A financial report that summarizes revenues, costs, and expenses during a specific period. For GR firms, the P&L shows client revenue at the top, subtracts cost of revenue (payroll), then operating expenses (rent, insurance, vendors), then partner compensation, arriving at net income. Review monthly to track trends and quarterly to make strategic decisions.',
    category: 'Business & Finance',
    relatedTerms: ['gross-margin', 'operating-margin'],
  },
  {
    id: 'gross-margin',
    term: 'Gross Margin',
    definition: 'Revenue minus the direct cost of delivering services. In a GR firm, this is revenue minus total payroll cost (salary + benefits + payroll taxes). Expressed as a percentage of revenue, healthy GR firms target 40-55% gross margin. A declining gross margin means payroll is growing faster than revenue.',
    category: 'Business & Finance',
    relatedTerms: ['profit-loss-statement', 'operating-margin'],
  },
  {
    id: 'operating-margin',
    term: 'Operating Margin',
    definition: 'Operating income (gross margin minus operating expenses like rent, insurance, technology, vendors) as a percentage of revenue. This measures the profitability of core firm operations before partner draws and financing costs. Target 20-35% for a healthy GR firm. Below 15% signals structural problems.',
    category: 'Business & Finance',
    relatedTerms: ['gross-margin', 'operating-leverage'],
  },
  {
    id: 'days-sales-outstanding',
    term: 'Days Sales Outstanding (DSO)',
    definition: 'The average number of days it takes to collect payment after invoicing a client. Calculated as total accounts receivable divided by average daily revenue. Industry standard for GR firms is 30-45 days. Higher DSO means more cash tied up in receivables and greater risk of bad debt. Track by client — some clients are chronically slow payers.',
    category: 'Business & Finance',
    relatedTerms: ['accounts-receivable', 'working-capital'],
  },
  {
    id: 'write-off',
    term: 'Write-Off (Bad Debt)',
    definition: 'When an account receivable is deemed uncollectable and removed from the books as a bad debt expense. In GR, this typically happens with 90+ day overdue invoices from clients who have become unresponsive. Write-offs reduce AR but also reduce revenue — they\'re a direct hit to profitability. Minimize by vetting client creditworthiness and collecting aggressively.',
    category: 'Business & Finance',
    relatedTerms: ['accounts-receivable', 'days-sales-outstanding'],
  },
  {
    id: 'line-of-credit',
    term: 'Line of Credit (LOC)',
    definition: 'A revolving credit facility from a bank that allows you to borrow up to a set limit and repay as needed. GR firms use LOCs to manage working capital — bridging the gap between paying expenses (payroll is due on the 1st) and collecting from clients (who may pay net-30 or later). Interest accrues only on the drawn balance. Keep LOC usage minimal and temporary.',
    category: 'Business & Finance',
    relatedTerms: ['working-capital'],
  },
  {
    id: 'working-capital',
    term: 'Working Capital',
    definition: 'Current assets (cash + receivables) minus current liabilities (accounts payable, LOC balance). Positive working capital means the firm can cover its short-term obligations. Negative working capital is a crisis — you owe more than you have. Managing working capital is a daily responsibility for the managing partner.',
    category: 'Business & Finance',
    relatedTerms: ['line-of-credit', 'accounts-receivable'],
  },
  {
    id: 'partner-draw',
    term: 'Partner Draw',
    definition: 'A regular payment to a partner, functioning like a salary but technically an advance against the partner\'s share of profits. In GR firms, managing partners typically take a monthly draw of $12,000-$25,000. The draw is deducted before calculating distributable profits. Setting the draw too high can strain cash flow; too low means the partner isn\'t adequately compensated.',
    category: 'Firm Management',
    relatedTerms: ['partner-distribution', 'managing-partner'],
  },
  {
    id: 'partner-distribution',
    term: 'Partner Distribution',
    definition: 'Quarterly or annual payments to partners from accumulated profits, above and beyond the regular draw. Distributions reward partners for firm profitability and provide incentive to grow the business. Decisions about distribution timing and amount involve balancing partner compensation against cash reserves needed for operations and growth.',
    category: 'Firm Management',
    relatedTerms: ['partner-draw', 'managing-partner'],
  },
  {
    id: 'budget-variance',
    term: 'Budget Variance',
    definition: 'The difference between budgeted (planned) spending and actual spending in a given category and period. Positive variance means overspending; negative variance means underspending. Regular variance analysis helps managing partners identify cost control issues early. Investigate any variance exceeding 10% of the budgeted amount.',
    category: 'Business & Finance',
    relatedTerms: ['profit-loss-statement'],
  },
  {
    id: 'operating-leverage',
    term: 'Operating Leverage',
    definition: 'The degree to which a firm\'s costs are fixed vs. variable. A GR firm with high operating leverage has significant fixed costs (rent, salaries) relative to variable costs. This means profitability is very sensitive to revenue changes — when revenue grows, profit grows faster (because fixed costs don\'t increase). But when revenue drops, losses mount quickly for the same reason.',
    category: 'Business & Finance',
    relatedTerms: ['operating-margin', 'gross-margin'],
  },
  {
    id: 'equity-value',
    term: 'Firm Equity Value',
    definition: 'The estimated market value of your ownership stake in the firm. GR firms are typically valued at 1-2x trailing 12-month net profit, adjusted for factors like client retention rate, revenue concentration, staff quality, brand reputation, and growth trajectory. Building equity value is a long-term wealth creation strategy for managing partners.',
    category: 'Firm Management',
    relatedTerms: ['partner-draw', 'managing-partner'],
  },
  {
    id: 'cash-conversion-cycle',
    term: 'Cash Conversion Cycle',
    definition: 'The time between when you pay expenses (payroll, rent) and when you collect revenue from clients. In a GR firm, you pay employees on the 1st but may not collect client payments for 30-60 days. A shorter cash conversion cycle means less working capital is needed. Improve it by collecting faster and negotiating longer payment terms with vendors.',
    category: 'Business & Finance',
    relatedTerms: ['days-sales-outstanding', 'working-capital'],
  },
  {
    id: 'accounts-payable',
    term: 'Accounts Payable',
    definition: 'Money your firm owes to vendors, landlord, and other creditors. The flip side of accounts receivable. Managing AP strategically means paying on time to maintain vendor relationships but not paying early unless there\'s a discount incentive. Stretching AP too far damages your credit reputation.',
    category: 'Business & Finance',
    relatedTerms: ['accounts-receivable', 'working-capital'],
  },
];

export const glossaryCategories: GlossaryCategory[] = [
  'Industry Basics',
  'Lobbying & Advocacy',
  'Legislative Process',
  'Compliance & Regulation',
  'Business & Finance',
  'Firm Management',
];

export const getTermById = (id: string): GlossaryTerm | undefined =>
  glossaryTerms.find((term) => term.id === id);

export const getTermsByCategory = (category: GlossaryCategory): GlossaryTerm[] =>
  glossaryTerms.filter((term) => term.category === category);

export const searchTerms = (query: string): GlossaryTerm[] => {
  const lower = query.toLowerCase();
  return glossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(lower) ||
      term.definition.toLowerCase().includes(lower)
  );
};
