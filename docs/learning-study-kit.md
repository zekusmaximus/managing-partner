# Phase 4 learning study kit · D1

**Status: optional newcomer pilot ready to facilitate; human sessions pending (0 of 3–5, including 0 of at least 2 on physical phones).** The [personal learning protocol](solo-learning-plan.md) is the primary evaluation path for the likely sole user preparing for a managing-partner role. This kit remains a small qualitative usability and transfer pilot if other players are available, not a claim that the game teaches effectively. Use the separate [pretest](learning-study-pretest.md) and [posttest](learning-study-posttest.md) sheets verbatim. Keep the scoring key in this facilitator document out of participants' view.

## Frozen build and starting situation

- Use the local Git tag `learning-study-d1` and record its full commit SHA with `git rev-list -n 1 learning-study-d1`. Run every session from that commit, with the same app assets and no mid-pilot edits. Record the exact browser, device, and viewport for each session. If a readiness blocker requires a code fix, create a new tagged study version and restart or report the mixed versions separately.
- Start **New Game → Start guided case** on a fresh disposable browser profile for each person. New Game clears that profile's single local save; never reset someone else's firm. The fixture is January 2026, eight clients, five employees, $45,000 cash, $33,000 AR (including TechTrade Association's $18,000 at 61–90 days), $111,000 billed revenue, $94,411 expenses, $16,589 reported profit, $5,530 estimated tax payable, undrawn $100,000 credit line, about 100.7% service coverage, and three months to the anchor renewal. The opening history is a snapshot, with no recurring cash payment already made.
- The participant may choose any valid path. Do not steer toward signing, hiring, collecting, or renewal. Do not substitute the scripted balance harness for a participant. Case completion is a gameplay event, not a learning score.
- For a local session, build that tagged commit with `bun run build` and serve it with `bun run start`; arrange access on the actual phone before the participant arrives. A desktop responsive viewport does **not** count as a phone session. No public deployment is part of this freeze.

## Recruitment and session plan

Recruit **3–5 people who have never played Managing Partner**. Book P01 and P03 on physical phones; book P02 on a laptop/desktop; P04 and P05 are optional additional newcomers, with a phone preferred if available. Record self-reported government-relations experience and business/firm-management experience separately (none, some coursework or adjacent work, professional work; approximate years and general role). Do not record employer, client, or other identifying names in the study sheet.

Target approximately 35–40 minutes with a 25-minute game. Reserve up to 45 minutes so a 30-minute game does not squeeze out first posttest answers. Log actual times; do not cut the posttest to make the total look on target.

| Segment | Target elapsed | Facilitator action |
| --- | ---: | --- |
| Consent and experience | 0–2 min | Read the script below; record consent and background. |
| Pretest | 2–6 min | Ask four pretest probes with no hints, answers, or correction. |
| Guided case | 6–31 min | Start fresh case; invite think-aloud if comfortable; time January, February, March, and April review. |
| Posttest, first answers | 31–36 min | Ask four posttest probes before any discussion; capture each first answer verbatim or near-verbatim. |
| Short interview | 36–40 min | Ask the separate enjoyment, agency, and reading-burden questions below. |

If play exceeds 30 minutes, let the participant finish if willing and log whether required reading, navigation, deliberation, interruption, or optional exploration caused the overrun. A technical failure or withdrawal is recorded as such, not scored as a misconception.

## Participant invitation and consent script

> We are testing an early educational game about managing a fictional public-affairs firm. We are interested in how clear and useful its decisions are, not in judging you. The session includes four short questions before play, about 20–30 minutes of game play, four different questions afterward, and a few experience questions. You may skip a question or stop at any time. We will use a participant code rather than your name in the notes and report only small-group counts and anonymous examples. May I take written notes? Separately, may I record audio or the screen for note accuracy? Recording is optional; saying no does not affect participation. Please avoid mentioning real clients or confidential work. Do you agree to participate?

Record three separate fields: **participation yes/no**, **written notes yes/no**, **audio/screen recording yes/no and which type**. If participation or notes are declined, stop. If recording is declined, continue with notes. Tell the participant where any recording is stored, who can access it, and when it will be deleted under the study organizer's actual retention practice; do not invent a retention promise. Keep the consent record and any raw recording outside this repository. Use only coded, anonymized excerpts in a report. Ask again before using any quote that might identify a real workplace.

After consent say:

> Please answer each question as you would in real life; “I don't know” is useful. I will not tell you the answers during the pretest. During the game, make the choices you think best. Please say what you are looking for or wondering about when comfortable. I may occasionally ask what you expected, but I will not coach a decision unless you are stuck. Afterward I will ask different situations first, then we can discuss the experience.

## Facilitator conduct

1. Give the [pretest sheet](learning-study-pretest.md) in order. Record the first answer to each question and any request for clarification. Use only neutral repetition of the wording. Do not explain cash accounting, conflict handling, capacity, the attention rule, or renewal odds.
2. Open the frozen case. Start a play timer when the participant sees the January firm. Let the game's guidance teach. If stuck, wait about 60 seconds or until asked for help, then use the least specific prompt: “What on this page looks relevant?” Next, if needed: “Where else might that be shown?” Only then point to a route or control. Record every prompt, time, reason, and outcome in the intervention log. Never make a choice for the player.
3. Note whether the participant can locate AR, read a client's monthly fee and fee-at-risk share, and find actual cash/profit and renewal outcomes. These are **usability observations**, not transfer scores. Log reading pauses, text skipped, inaccessible controls, reloads, and any technical interruption.
4. Stop the play timer when the April review is reached or the participant stops. Record whether the application question was attempted, but do not use its answer as a posttest score. Administer the [posttest sheet](learning-study-posttest.md) before discussing the case. Capture **each first answer before asking any follow-up or giving feedback**. Mark the answer's start time and whether the person had already discussed that concept with the facilitator. Do not revise the first-answer transcript after discussion.
5. After all first posttest answers, ask: “Which decision made you stop and think?” (agency/deliberation), “Which choice felt automatic?” (agency), “What did you enjoy or dislike?” (enjoyment), and “When did the game feel like reading rather than managing?” (reading burden). Ask what felt confusing or unfair. Record each as a separate observation; do not collapse them into a learning score.

## 0–2 causal-reasoning rubric

Score the four **pretest and four posttest first answers** independently. Use the same rule for both forms. Score the participant's explanation, not whether their chosen tactic matches the facilitator's preferred tactic. Do not mark “not asked,” inaudible, or technical failure as zero; use `NA` with a reason.

| Score | General rule |
| --- | --- |
| **0** | No relevant reasoning, or a clear misconception (for example, old-invoice collection creates new profit; a conflicting mandate can be signed without review; spending guarantees a policy result). |
| **1** | Names at least one relevant factor or plausible action, but gives no causal link and no tradeoff or missing-information condition. |
| **2** | Explains a causal link **and** a tradeoff, boundary, or missing fact that could change the decision. A defensible decline, hold, or delegation can earn 2. |

| Probe | Evidence for 2; examples of 0-level misconceptions |
| --- | --- |
| **C · Cash versus profit** | Old-bill collection raises cash and lowers AR without new billed profit; evaluate due cash obligations, timing, and credit separately. Misconception: profit equals spendable cash, or credit draw/old collection is new revenue. |
| **G · Growth, conflicts, capacity** | Check opposing interests and actual scope/required review before commitment, then compare fee possibility with current service load, loaded hire cost, and fee/shared-issue exposure. A genuinely separate scope requires case-specific review; disclosure alone is no universal cure. Misconception: high fee bypasses conflict or adds no work. |
| **A · Attention and delegation** | Partner retains oversight of conflict and consequential client judgment, delegates suitable factual/routine work to capable staff, and names the escalation that loses personal attention. Misconception: delegate compliance responsibility away, ignore the other client, or assume staff delegation creates capacity for free. |
| **U · Policy and renewal uncertainty** | Separate documented service from external schedule and stochastic renewal; communicate facts and next steps, investigate service/client reasons, and avoid guaranteed-outcome claims. Misconception: delay or non-renewal alone proves poor service, or paying for a meeting guarantees victory/renewal. |

When a response has a relevant factor plus an unsupported guarantee, score **0** if the guarantee is central to the recommendation, otherwise **1** and flag the serious misconception. Keep the exact phrase and rationale in the coding notes. A second scorer may review the anonymized first-answer text; resolve disagreements by the rubric before looking at whether scores improved.

## Session record · copy once per participant

**Participant code:** P__  **Date:** ____  **Tag commit SHA:** ____  **Device/OS/browser:** ____  **Physical phone?** Y/N  **Viewport:** ____

**Consent:** participation Y/N; written notes Y/N; recording Y/N, type ____; actual storage/retention explanation given ____

**Prior experience:** GR category/years/general role ____; business or firm-management category/years/general role ____; other relevant coursework ____

| Clock / phase | Start | End | Duration | Notes |
| --- | --- | --- | --- | --- |
| Pretest | | | | No teaching/feedback? |
| January | | | | Choice, prediction, reflection, where stopped |
| February | | | | Review, scope choice, cost/capacity interpretation |
| March | | | | Policy response, complaint, attention tradeoff |
| April review | | | | Renewal/departure, application attempted? |
| Total game play | | | | Exclude/identify paused time separately |
| Posttest first answers | | | | Before discussion? |
| Interview | | | | |

**Facilitator intervention log** (include navigation help and concept hints; add rows as needed):

| Time / game month | Trigger and participant's action | Exact facilitator words or technical help | Level: neutral / route hint / direct help | Seconds paused | What happened next |
| --- | --- | --- | --- | ---: | --- |
| | | | | | |

**Anonymized observation sheet** (record evidence or `not observed`; do not infer learning from completion):

| Domain | Observation, time, and short coded quote | Independent / helped / not found / not observed |
| --- | --- | --- |
| Usability: find AR and cash vs P&L | | |
| Usability: fee-at-risk and actual outcome | | |
| Usability: phone controls, focus, overflow, reload | | |
| Enjoyment: liked/disliked moment | | |
| Agency: thoughtful vs automatic choice | | |
| Reading burden: required text skipped or slowing play | | |
| Transfer misconception heard during play (not scored) | | |
| Technical issue or case branch/outcome | | |

**First-answer capture** (use the separate question sheets for exact wording; record first answer before follow-up):

| Probe | Pre first answer / time | Pre 0–2 or NA | Post first answer / time | Post 0–2 or NA | Scoring rationale and facilitator exposure |
| --- | --- | ---: | --- | ---: | --- |
| C | | | | | |
| G | | | | | |
| A | | | | | |
| U | | | | | |

## Analysis template · complete only after real sessions

**Observed sample:** N = __ newcomers; __ physical phones; build SHA(s) ____; GR background counts ____; business background counts ____; game duration median/range ____; facilitator help counts by level ____; incomplete sessions and reasons ____.

| Participant | C pre→post | G pre→post | A pre→post | U pre→post | Phone? | Game minutes | Help count | Notes on exposure |
| --- | --- | --- | --- | --- | --- | ---: | ---: | --- |
| P01 | | | | | | | | |
| P02 | | | | | | | | |
| P03 | | | | | | | | |
| P04 (if run) | | | | | | | | |
| P05 (if run) | | | | | | | | |

For each probe, report **within-person improved / unchanged / lower / NA counts**, with the denominator of paired answers. Report the number starting at 2; such an answer may show prior competence rather than new learning. Add one or two anonymized first-answer examples of change or persistent misconception, with scores and any facilitator hint. Keep usability success/help, enjoyment comments, agency comments, and reading burden in distinct paragraphs. Do not report statistical significance from this pilot.

**Decision memo:** recurring misconception heard in at least two participants ____; any claim that spending guarantees policy victory or renewal ____; participants over 30 minutes because of required text ____; accessibility or financial/case blocker ____; proposed next iteration and evidence ____.

If a misconception repeats in two participants, prioritize it for revision. Investigate a serious guaranteed-outcome belief even once. If multiple people exceed 30 game minutes because of required text, cut reading before adding features. Until observations exist, all these fields remain **pending**, and the only reportable results are technical/model checks.
