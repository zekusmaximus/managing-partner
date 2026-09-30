# Managing Partner: plan for the next learning playtest build

Prepared September 28, 2026 against `main` at `dbdacf6`. **Status (September 30): Stage 1 / delivery slice A, Phase 2 / delivery slice B, and Phase 3 / delivery slice C are implemented.** The case has a separate opening firm, required January–March decisions, short prediction and reflection prompts, actual-result recaps, and an April teaching review. The learning-focused playtest kit and human study belong to slice D. The report that one player enjoyed the game but was unsure how much they learned remains one preliminary observation; technical case completion does not establish learning. The numerical Stage 1 workload bands remain fictional assumptions; the [balance report](service-balance-simulation.md) distinguishes model runs from player evidence.

**The intended result is a 20–30 minute introduction with three rounds of consequential management decisions that players can explain.** Keep the current dashboard, Finances, HR, Clients, and Inbox. Improve what those decisions teach, ensure players encounter the important consequences, and give the introductory case an ending. Do not measure success by the number of glossary terms or screens visited.

**1. Scope and learning outcomes**

The package has three product improvements: a bounded guided case; credible workload and partner-attention tradeoffs; and a short government-relations client intake and policy-setback story. All three belong in the next learning playtest build. The delivery slices below are implementation boundaries, not additional product initiatives.

| By the end, a player should be able to… | Required practice | Evidence to capture |
| --- | --- | --- |
| Explain why profit and spendable cash differ | Respond to a named overdue account and inspect financial effects | Predict cash, AR, and profit directions; explain an unfamiliar cash problem afterward |
| Evaluate growth against existing commitments | Review a prospect's fee, mandate, service demand, and current coverage | Explain what accepting, narrowing, holding, or declining gives up |
| Allocate scarce senior attention | Choose personal intervention versus a delegated response | Identify the other intervention that becomes unavailable that month |
| Distinguish firm management from individual advocacy | Make staffing, client acceptance, and oversight decisions | Explain what the partner owns and what the team can execute |
| Recognize conflicts and realistic engagement boundaries | Review opposing client interests and a proposed narrower mandate | Require appropriate review before commitment; decline when unresolved |
| Separate professional service from uncertain results | Respond to an external policy delay, then observe renewal or departure | Explain why neither outcome alone proves the management decision was good or bad |

Keep deeper tax accounting, additional save slots, export/import, accounts, sync, a legislative simulator, a general conflicts engine, per-employee assignment grids, a reputation market, and a new win/loss scoring system out of scope. The existing local save must continue to work; the small amount of compatibility work required by new gameplay state is maintenance, not a save-feature project.

**2. Player experience: one existing client anchors three rounds**

Offer **Start guided case — about 25 minutes** and **Explore freely** on a fresh game. Replace the long mandatory walkthrough with brief contextual guidance. Keep explanations accessible through the existing help system. A player loading an existing firm continues that firm; starting the case must use the existing explicit New Game/reset flow, never silently replace saved state.

Use one existing anchor client, such as TechTrade Association, in the receivables, policy, and renewal story. Its guided-case contract starts with three months remaining. January decisions advance to February; February to March; March to April, when that client's renewal resolves and the case review appears. Free play retains its existing starting contracts.

| Segment | Target time | What happens |
| --- | --- | --- |
| Orientation | 2 minutes | Explain the partner role, three-month objective, and where to find the current decision |
| Round 1: cash and commitments | 5 minutes | Address overdue payment while protecting upcoming operating cash |
| Round 2: growth and fit | 7 minutes | Review a prospect's conflict/scope and capacity implications; decide whether to proceed |
| Round 3: service under uncertainty | 6 minutes | Respond to a policy delay, allocate senior attention, and observe the anchor client's renewal |
| Case review and a fresh application question | 3–5 minutes | Explain actual consequences and apply a principle to a new situation |

The game itself targets 23–25 minutes with room for exploration up to 30. Research-session pre/post questions add time outside that play duration. Avoid promising that the full facilitated study, including interviews, fits inside the game's time budget.

Build a separate authored starting fixture from the same initialization functions. It should have positive reported profit, constrained but survivable cash, a named overdue receivable, coverage near the service limit, and the anchor renewal. Reconcile cash, credit, AR totals, opening financial history, tax estimates, and budget data. Choose exact fixture amounts using the engine and balance checks before implementation is considered complete; do not invent intra-month payroll deadlines that the monthly engine does not represent.

The fixture must provide at least two defensible ways through the case, rather than force a particular hire or collection tactic. Automatic borrowing/repayment remains active and visible: the recap must not let a credit draw appear to be operating income or successful collection.

**Round 1: profitable, but waiting to be paid.** Put the anchor's overdue balance beside cash, billed revenue, profit, and recurring commitments. Use the existing collections scenario and AR view. The player can choose a stronger collection demand with a relationship cost, a personal collection call using senior attention, or closing collection efforts with no cash receipt. Routine manual collections remain available under their existing monthly limit. The opening case must not force a write-off.

Before acting, ask which measures the player expects to change. Afterward, show cash, AR, profit, relationship, and attention effects using actual transactions. Offer one concise explanation: collecting a previously billed amount changes cash and AR without creating new revenue. If the player chose to close collection efforts, explain the distinct effect instead. Then show the next monthly result and any credit movement separately.

**Round 2: an attractive fee comes with obligations.** Introduce one authored prospect with a concrete mandate, proposed monthly fee, and one additional client slot under the simplified model. Its initial request opposes the anchor client's position on the same issue. The brief presents both positions and the firm's commitments; the original request is not signable while that conflict remains unresolved.

The intake review is ordinary required firm work, available without consuming the player's scarce intervention slot. Do not make compliance something the player can purchase permission to bypass. Reveal a short authored review finding: the original mandate cannot proceed; a genuinely separate, limited monitoring assignment is available only under the expressly described scope and approvals in this fictional case. Do not suggest that disclosure or consent universally cures a conflict.

Give three viable decisions: decline; hold pending clarification; or pursue the reviewed, narrower engagement. For the last path, reuse the current initial-contact/aggressive-pursuit costs and signing odds, visibly stated as game assumptions. Show the current and projected service coverage if the prospect signs, plus the cost of a potential hire. All paths require considering capacity, but declining is a valid result and the tutorial never requires hiring or signing.

If the prospect declines, the player still sees the pursuit expense, the absence of added workload, and the explanation of the tradeoff. If intake is held, no fee or client is created; record that the opportunity was left unresolved for this introductory case and identify the missing information. Do not leave an infinitely pending onboarding action that the ending requires.

**Round 3: policy timing changes, but the client still needs service.** A committee postpones consideration of the anchor's issue. The case explicitly identifies the postponement as external and independent of the player's earlier performance. The partner decides how to communicate the setback and agree the next step. A routine complaint from a different existing client creates competition for the one senior-intervention slot; this is the only extra required relationship decision in the round.

Options are a personally led recovery meeting, a delegated factual update with next steps, or an explicitly deferred response. Personal and delegated responses affect client satisfaction and available attention, not the committee's schedule. The update must distinguish what the firm delivered, what remains uncertain, and what it recommends next. Avoid an option that promises guaranteed enactment in exchange for spending more.

Advance to April and resolve the anchor's renewal through the same service/satisfaction rules as free play. Both renewal and departure need a coherent review. The policy event must still occur if the prospect was declined, held, or lost; it is attached to the pre-existing anchor, not the new account.

**3. Correct the management incentives before wrapping them in instruction**

Use the following initial rules as tuning proposals, explicitly fictional. Validate their behavior before locking the playtest fixture.

| Mechanic | Proposed small change | Acceptance criteria |
| --- | --- | --- |
| Workload and burnout | Calculate workload pressure once from service coverage immediately before the monthly staff update. Initial bands: under 90% coverage adds 6 burnout; 90–under 100% adds 3; 100–under 115% adds 0; 115%+ reduces 3. No clients also reduces 3. Clamp to 0–100. | For the same roster, more workload cannot produce less burnout pressure; a hire that improves coverage reduces or preserves pressure. Zero-client and zero-capacity states remain finite. |
| Fatigue and capability | Remove routine calendar-driven efficacy erosion. Let the existing burnout multiplier reduce effective service. Keep efficacy as capability affected by explicit staff events. Recovery reduces burnout; remove its automatic efficacy bonus so repeated recovery cannot buy unlimited skill. | Adequately staffed firms do not inevitably lose all capability with time. High burnout still hurts service. Recovery helps current fatigue but does not cure a persistently overloaded book. |
| Senior attention | Generalize the existing once-monthly meeting limit into **one major partner intervention per month**. Share it across personally led client recovery meetings, personal collection calls, and the new policy-response meeting. | Spending the slot in one route makes the others unavailable with a visible reason; it resets next month and survives reload. An unsuccessful or rejected action does not consume it. |
| Complaint response | Reuse the existing meeting quote/action for personally led recovery: $1,000, up to +6 satisfaction, and existing bounded overdue collections where applicable. Delegated routine response: up to +3 satisfaction, no additional cash cost or partner slot, requires billable staff, and does not improve service capacity. | Neither personal nor delegated handling is always better once cash and competing priorities matter. Copy explains that delegation uses the already-paid service team. |
| Compensation | Restrict the manual dialog to salary increases, with a preview of loaded recurring payroll; reject cuts in both UI and state transition. Keep existing inbox raise negotiations. | A lower salary cannot be submitted through a stale dialog or direct action. No simulated staff can be retained for $1 through the old control. |

The intervention allowance represents unusually time-consuming escalations in a compressed game month, not a claim that real partners only have one meeting a month. Manual collections and staff recovery keep their own existing limits. Routine intake review, reading reports, and ordinary delegated work do not consume the senior slot.

One canonical transition should power the same personal recovery action from Inbox and Clients. If it resolves a pending complaint, resolve that message once and apply one satisfaction award; do not stack the old +15 personal-response reward with the meeting reward. A personal collection call retains its existing collection formula and does not silently charge the $1,000 meeting fee. Quotes must show the action-specific cash effects and the shared attention cost.

Treat an active complaint or authored policy escalation as an explicit meeting-eligibility reason. The current complaint generator includes satisfaction below 75, while meeting eligibility uses below 70; reusing that quote without this change would leave some clients at 70–74 unable to receive the offered personal response. Use the same eligibility logic from every route, and include this boundary in the tests.

Do not recompute workload repeatedly within a month until it converges. Take one pre-update coverage snapshot, update burnout, then compute service and renewal effects using the resulting roster. This makes the order explainable and avoids a circular calculation. The small global workload abstraction should be disclosed; employee-by-client assignment is not part of this build.

**4. Make the causal feedback explicit and truthful**

Use a compact card in the current page rather than another full-screen tour. Every guided round follows **predict → decide → observe → explain**. One short prediction and one reflection per round are enough. Allow “I'm not sure”; no correct answer is required to continue. Avoid essays, forced guessing, or grading prose with a new AI service.

Guard Advance Month in the shared transition while a case is active: the round's prediction and each required case item need an explicit recorded choice, including a valid hold/defer, before one advance is allowed. The next round must be initialized atomically with the month change. All route controls use that guard; rapid clicks cannot skip a round or resolve the anchor before its policy event. Give a short visible explanation and link to the outstanding decision rather than silently disabling advancement.

Pausing guidance hides teaching prompts while preserving the case's pending decisions and schedule. **Leave case and continue freely** is a separate explicit handoff: retain the current firm, stop future case scheduling, record unfinished case-only items as held without invented effects, and resume ordinary scenario generation. Do not mark an abandoned case complete. Finishing the case likewise hands off without resetting finances, roster, cooldowns, or ordinary pending messages.

Immediate feedback should show the actual cash/AR/profit and attention consequences. Monthly feedback should separate four things: actions taken; staffing/service changes; collections and recurring costs; external or chance outcomes. A final renewal explanation can identify the coverage and satisfaction used in the calculation and the remaining uncertainty. It must not say a specific action caused a renewal simply because renewal followed it.

The ending should contain three short decision summaries, the anchor's outcome, and one new application question. Use actual recorded decisions and deltas. If the player declined growth, explain the preserved capacity and forgone possibility of fees. If a pursuit failed, show the cost was still paid. If a well-served client leaves, say the outcome was uncertain. Offer **Continue managing this firm** and the existing confirmed New Game route. Label completion **Case completed**, not demonstrated mastery or “You now understand.”

Limit the required onboarding content to approximately 8–10 brief cards, including the three round briefs and their recaps, instead of preserving the 34-step tour alongside the case. Most cards should fit one phone screen, excluding optional details. All five routes remain available; guidance points to the relevant action without turning exploration into repeated navigation tests.

During the case, schedule its required events directly and suppress unrelated discretionary equipment/vendor/rent story prompts. Keep financial calculations, consequences, mandatory existing obligations, and their warnings intact. Existing tax items can remain secondary tasks with their actual effects; do not add tax instruction or hide charges. End the case with every branch able to proceed, including insufficient cash, no staff, a spent attention slot, and unsuccessful signing.

**5. Correct the accompanying claims at the same time**

| Existing risk | Planned treatment |
| --- | --- |
| Reputation appears to drive acquisition and recruitment | Label it a summary of client/staff health and remove unmodeled promises. Do not add a reputation subsystem. |
| Margin, reserve, staffing, valuation, and revenue-per-employee figures read as universal industry standards | Label retained numbers as this simulation's assumptions/targets, or qualify them with a specific credible source. Remove contradictory staffing ratios. |
| Client-type diversity stands in for concentration risk | Explain fee concentration and shared issue exposure. Retain the useful fee-at-risk share. Do not add a portfolio-risk score. |
| Attorneys and lobbyists appear to have distinct modeled capabilities | Explain that the game pools their client-service capacity and does not model specialist matching or legal work. The guided case should not ask which title is strategically superior. |
| A write-off implies debt forgiveness in the real world | Name the action “Write off and close collection efforts” and state that the game combines two decisions. Preserve the current ledger behavior and add no recovery ledger. |
| Urgency can be bypassed by leaving a story unanswered | For authored case items only, make the round boundary explicit and record a chosen hold/defer path. Do not retrofit deadlines into every existing scenario. |
| Navigation completion implies competence | Replace broad “understand/learn” checkmarks with practiced decisions; leave assessment of transferable reasoning to the playtest. |

Update the tutorial, contextual help, relevant glossary entries, welcome copy, choice previews, resolution copy, README, TODO, and playtest script together so no old tooltip contradicts a revised rule.

**6. Technical implementation and compatibility boundaries**

| Area | Likely files | Responsibility |
| --- | --- | --- |
| Shared rules | `src/lib/simulation/clientService.ts`, `burnout.ts`, `engine.ts`, `src/types/simulation.ts` | Workload pressure, intervention quotes/guards, canonical client response effects, structured explanation data |
| HR and client controls | `src/context/SimulationContext.tsx`, `src/app/hr/page.tsx`, `src/app/clients/page.tsx`, `src/app/inbox/page.tsx` | Salary guard and previews; one shared intervention state; accessible disabled reasons |
| Authored case | New small case-data and case-transition modules near `src/data/` and `src/lib/simulation/`; `initialState.ts`, `scenarios.ts` | Opening variant, stable event identifiers, finite branch rules, three-month schedule |
| Guided experience | `src/lib/simulation/authoredCase.ts`, `src/context/SimulationContext.tsx`, `src/components/case/CaseStatusPanel.tsx`, dashboard | Prediction/decision/reflection checkpoints, actual-result recaps, April review, free-play handoff |
| Existing local session | `src/context/SessionContext.tsx`, `src/lib/session/tutorialState.ts`, `save.ts` | Atomic guided initialization, minimal local progress, old tutorial/meeting compatibility |
| Content and validation | README, TODO, help/glossary, docs, existing focused tests and balance harness | Accurate model explanations, branch coverage, learning study instructions |

Keep the authored case declarative and separate from general scenario generation. Call existing financial/service transitions rather than duplicate their arithmetic. Use explicit named case branches; do not build a generic narrative scripting engine. Store only what is needed to resume the three-round case and show its review: case revision/stage, compact prediction/decision records, and actual outcome evidence. No backend analytics or general event warehouse is needed.

Preserve stochastic signing/renewal while guaranteeing exposure to the relevant events. Automated tests use injected random values for both successful and unsuccessful outcomes. Human sessions use the same authored starting case; record different realized outcomes rather than pretending every player had an identical experience. Outcome feedback must be produced by the transition that calculated it, not inferred from distant before/after dashboard values. If extra random-number calls change simulated trajectories, do not attribute a whole-run financial difference to one design change without a controlled comparison.

The existing loader validates old tutorial indices and IDs against the currently imported step list. Replacing that list directly can reject a valid firm save. Preserve a legacy tutorial schema during migration, validate the simulation independently, and convert retired tutorial progress into an inactive legacy-completion state with an invitation to start the new case via New Game. Never invalidate an otherwise valid firm solely because the tutorial changed. Do not translate an old step number into an unrelated new lesson.

Normalize an existing `lastClientMeeting` into the shared intervention marker, preserving a spent slot for the same month. Missing new fields receive explicit defaults. Select the smallest clear schema migration during implementation; retaining a version number is not more important than honest compatibility. Tests must cover supported versions 1–4, current-round reloads, and old pending messages receiving current costs before the player commits. Do not retroactively invent restored employee capability or past interventions.

**7. Delivery sequence and completion criteria**

| Slice | Concrete deliverable | Depends on | Complete when |
| --- | --- | --- | --- |
| A — Rules and truthful copy | Workload/burnout correction, shared intervention, compensation guard, corrected model explanations | This plan | Pure action tests prove the intended tradeoffs; every route uses the same quote and guard; no mismatched legacy choice text |
| B — Authored three-round case (implemented in Phase 2) | Reconciled starting fixture, intake branch, policy-delay branch, scheduled renewal | A | Decline/hold/reviewed pursuit and renewal/departure paths reach a terminal case state without favorable rolls being required |
| C — Guided decisions and review (implemented in Phase 3) | Short onboarding, three predictions and reflections, actual-result recaps, final teaching review, and legacy tutorial compatibility | A and B | Required predictions, case choices, and reflections gate each round; wrong or uncertain answers do not trap the player; keyboard and mobile flows work |
| D — Integration and next study | Compatibility fixes, updated harness/results, final copy pass, revised playtest kit | A–C | The technical and rehearsal gates below pass; the exact build and study protocol are frozen for the small pilot |

Perform the compatibility design at the start of A, not as a late cleanup in D. Case text and expected feedback can be drafted alongside A; final integration follows the dependencies. These are suitable reviewable change sets, not commitments to a number of days. Avoid mixing unrelated cleanup into them.

**8. Verification before inviting new players**

Use focused behavioral tests for the changed mechanics. Do not add tests merely to snapshot every sentence.

- Workload bands, zero-client/no-capacity cases, bounded fatigue, absence of unavoidable capability collapse, and the effect of hiring versus repeated paid recovery.
- Shared intervention consumption from Inbox/Clients/collections, same-month rejection, next-month reset, insufficient funds, duplicate click prevention, and exactly-once complaint resolution.
- Salary-cut rejection against the latest state, including a stale UI submission; correct recurring payroll for permitted increases.
- Cash/AR/profit reconciliation for collection, meeting, pursuit failure, and closing collection efforts; automatic credit activity remains separately explained.
- Every authored branch: decline, hold, original conflict blocked, revised scope pursued, successful/failed signing, delegated/personal/deferred response, and renewal/departure. Include a deliberately poor-management path and zero staff; reaching the debrief must not require winning.
- No duplicate case events after rerender/reload/advance; pending items block a case advance across every route, explicit hold/defer unblocks it, and rapid repeat clicks cannot skip the next round. Pausing preserves the schedule; leaving the case performs the explicit free-play handoff without resetting the firm. Starting a new case requires the established reset confirmation.
- Legacy tutorial IDs and supported saves survive; a previously used meeting still spends that month's slot. New progress reloads into the correct round and retained actual outcome.

Run the repository gate (`bun test`, `bun typecheck`, `bun lint`, `bun run build`). Run the existing 24-month, five-seed balance report once after the final rule changes and update its documentation. Modify scripted policies to respect shared attention and include a case-branch harness; otherwise a policy that blindly selects personal responses can silently stop acting. Compare cash/credit, service, burnout, efficacy, renewals/churn, and unresolved decisions. Do not require the old exact financial totals, which will change with the rules.

Check all five routes and the guided case at 390, 768, 1280, and 1440px, with keyboard completion at phone and desktop widths. Verify focus around guidance, visible costs/disabled reasons, reachable advance controls, and a usable ending without overflow or console errors. Rehearse at least one decline path and one failed-pursuit or departure path. Internal timing can catch an obviously oversized case; it does not prove newcomer completion time or learning.

Readiness blockers are: a false causal explanation; a branch that cannot finish; incorrect financial effects; a duplicated action; a lost valid save; an inaccessible required action; or an internal run exceeding 30 minutes without optional exploration. Cosmetic issues and requests for richer realism do not automatically expand this package. All six intended lessons must have an encounter and an explanation before returning to the learning pilot.

**9. Next playtest: measure reasoning, discover misconceptions**

Recruit 3–5 newcomers for individual sessions, including at least two phone sessions. Record prior GR/business experience. Freeze one build and one starting case. Allow approximately 35–40 minutes for a short pretest, the 20–30 minute game, and a brief posttest/interview. Keep this distinct from the desired game duration. Record actual elapsed play time, pauses, and facilitator help.

Ask the same underlying concepts with different names/numbers before and after play. Do not teach or reveal correct answers during the pretest. Capture first answers to posttest questions before discussing them. During play, let the game's prompts do most of the teaching; facilitator interventions are recorded separately. Obtain consent for recordings and anonymize notes; no telemetry implementation is required.

| Transfer probe | What to listen for |
| --- | --- |
| Cash: “The firm earned $20,000, has $9,000 cash, and owners want $15,000. What would you check?” Post variant asks whether collecting an old invoice creates new profit. | Cash versus profit; obligations, collection timing, credit versus income |
| Growth: “A lucrative prospect arrives while the team is stretched. What must you learn before accepting?” Post variant changes the client type but retains shared policy exposure. | Scope, capacity, recurring cost, conflict and concentration; conditional acceptance or decline |
| Attention/role: “A routine update, a client crisis, and a possible conflict need action. What should the partner handle, delegate, or oversee?” | Limited attention, capable delegation, required oversight; duties are not simply ignored |
| Uncertainty: “A policy goal stalled despite timely agreed work. What should the partner do, and what does the setback tell you?” Post variant uses an unexpected non-renewal. | Evidence about service, truthful communication, alternative explanations, uncertainty |

Score each response 0 (misconception), 1 (relevant factor), or 2 (causal explanation plus a tradeoff or missing information). Compare within-person reasoning and report small-sample results as counts and examples, not a statistically established learning effect. A high pretest score means the question may reveal retained competence rather than new learning. These probes must remain distinct from the in-game practice question to avoid merely repeating a memorized answer.

Record enjoyment, perceived agency, and reading burden separately: “Which decision made you stop and think?”, “Which choice felt automatic?”, and “When did the game feel like reading rather than managing?” Keep current usability checks for locating AR, interpreting fee-at-risk, and finding actual outcomes, but do not count those alone as learning.

Use the next pilot to decide whether another iteration is needed. A repeated misconception in two participants becomes a priority; any serious new belief that spending guarantees a policy victory warrants investigation even if reported once. If multiple players exceed 30 minutes because of required text, cut content before adding features. Keep the three improvements as design hypotheses until these observations support them.

**10. Research basis and documentation closeout**

The earlier assessment checked the following primary sources on September 28, 2026. They support the role and constraints behind this plan; its numerical game rules are proposed tuning, not empirical industry constants.

- [Wojdak managing-partner responsibilities](https://wojdak.com/staff/tom-flynn/) and [Paragon partner biographies](https://paragonlobbying.com/about): operations and client advocacy can coexist in the role.
- [PPHC 2025 Form 10-K, filed in 2026](https://www.sec.gov/Archives/edgar/data/1903508/000162828026022359/pphc-20251231.htm): client continuity, key-person dependence, and conflicts constrain a professional-services business; its scale is not a mid-size-firm benchmark.
- [NILE ethics code](https://www.lobbyinginstitute.com/ethics): client expectations, competent service, truthful information, and conflict review. This is a professional code, not a substitute for applicable law.
- [Federal LDA guidance](https://lobbyingdisclosure.house.gov/ldaguidance.pdf) and [CRS legislative-process report](https://www.congress.gov/crs-product/R42843): disclosure responsibilities and political-process uncertainty.
- [Sevierville January 2026 council packet](https://www.seviervilletn.org/AgendaCenter/ViewFile/Agenda/_01122026-70): an example proposed engagement covering strategy, monitoring, advocacy, and reporting; the packet alone does not prove execution.
- [OCC explanation of charge-offs](https://www.helpwithmybank.gov/help-topics/personal-auto-loans/personal-loans/loan-charge-off.html): writing off an asset is distinct from cancelling the obligation, supporting explicit labeling of the game's combined action.

After implementation, update README's tutorial description and objective count, TODO's completed/remaining work, the revised playtest script, balance documentation, and relevant memory-bank context/product/architecture notes. Report what was implemented, verified, and still hypothetical. Do not claim the new build teaches effectively until player evidence has been collected.
