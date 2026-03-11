# Email Sequences

Framework and templates for email marketing content.

---

## Cold Outbound Principles

### Primary Goal
The goal is NOT to sell MDD.
The goal is to **trigger a reply or demo conversation**.

### Core Rules
1. **Pattern interrupt subject lines** — Questions, scenarios (not benefit statements)
2. **Under 120 words** per email
3. **One pain per email** — Don't try to cover everything
4. **Soft CTA** — Never hard-sell
5. **Personalization** — At minimum: {{FirstName}}, {{Dealership}}
6. **Mobile-optimized** — Dealership operators skim on phones

### Soft CTA Examples
- "Worth seeing?"
- "Curious if something like that would help?"
- "Would it be crazy to show you?"
- "Does this sound familiar?"
- "Should I close your file?"

---

## Cold Outbound Sequence Structure (10 Emails)

| # | Name | Angle | Subject Line Example |
|---|------|-------|---------------------|
| 1 | Trigger Event | Lost keys scenario | "Quick question about lost keys" |
| 2 | Saturday Chaos | Saturday scenario | "Saturday at 11:30am" |
| 3 | Big Dealer Proof | Bill Brown Ford story | "How the largest Ford dealer handles 2,000 cars" |
| 4 | Service Bottleneck | Corwin Toyota cycle time | "Service wait times dropping from 2.5 hrs" |
| 5 | Inventory Cashflow | Recon days = dead capital | "Inventory sitting = cash sitting" |
| 6 | Lost Key Cost | $300-$800 per key | "How much does a lost key cost?" |
| 7 | Service Revenue | Cycle time reduction | "Service wait times cut by 60%" |
| 8 | VehicleVault Upsell | F&I profit center | "A new profit center for dealerships" |
| 9 | Simple Curiosity | Direct question | "Do you already have this?" |
| 10 | Breakup | Final touch | "Should I stop reaching out?" |

---

## Product Launch Email Sequence (5 Emails)

| # | Name | Content |
|---|------|---------|
| 1 | Announcement | What's new, key headline benefit |
| 2 | Feature Deep-Dive | How it works, LocateIQ mechanism |
| 3 | Social Proof | Named dealership results |
| 4 | Urgency/Scarcity | Limited implementation slots, calendar CTA |
| 5 | Last Chance | Final CTA, breakup-style |

**Scheduling:** Day 0 / Day 3 / Day 7 / Day 10 / Day 14

---

## Nurture Sequence (5 Emails)

| # | Name | Content |
|---|------|---------|
| 1 | Problem Awareness | Scenario-based pain |
| 2 | Industry Trend | Why the market is shifting |
| 3 | Solution Overview | How MDD solves it |
| 4 | Case Study | Full named-dealer story |
| 5 | Demo CTA | Soft close |

**Scheduling:** Day 0 / Day 5 / Day 10 / Day 15 / Day 20

---

## Subject Line Formulas

### Question About Pain
```
Quick question about lost keys
Quick question about service wait times
```

### Scenario
```
Saturday at 11:30am
The 2.5-hour oil change
```

### Proof/Stat
```
Service wait times dropping from 2.5 hrs
How the largest Ford dealer handles 2,000 cars
```

### Social Proof
```
What Bill Brown Ford figured out
How Corwin Toyota fixed their service lane
```

### Cost/Loss
```
How much does a lost key cost?
The hidden cost of recon delays
```

### Curiosity
```
Do you already have this?
A question about your service lane
```

### Breakup
```
Should I stop reaching out?
Closing your file
```

---

## Persona-Specific Email Rules

### Owner/GM
- Focus on: Brand, profitability, operational efficiency
- Proof points: Bill Brown Ford scale, Brandon Honda revenue
- Products: All (they're the final decision maker)
- Tone: Executive, strategic

### Service Manager
- Focus on: CSI scores (tied to their pay), cycle times, billable hours
- Proof points: Corwin Toyota cycle times, Longo Toyota time savings
- Products: MDD Locate, Service Workflow
- **NEVER pitch:** VehicleVault (they won't care)
- Tone: Operational, specific to service

### Sales Manager
- Focus on: Recon visibility, inventory turns, customer-ready vehicles
- Proof points: Bill Brown Ford adoption, recon time savings
- Products: MDD Locate, Recon Workflow, VehicleVault (profit per deal)
- Tone: Sales-focused, results-oriented

### F&I Manager
- Focus on: Profit per deal, recurring revenue, zero chargebacks
- Proof points: Brandon Honda $308K/mo
- Products: **VehicleVault ONLY**
- Tone: Revenue-focused, practical

### Used Car Manager
- Focus on: Recon speed, days to frontline, finding keys/cars for customers
- Proof points: Longo Toyota 3 days saved in recon
- Products: MDD Locate, Recon Workflow
- **NEVER pitch:** VehicleVault (likely won't care)
- Tone: Practical, inventory-focused

---

## Email Template Structure

```markdown
# Cold Outbound Email Template

**Angle:** [Angle from 12-messaging-angles.md]
**Target Persona:** [From 11-personas.md]
**Position in Sequence:** [1-10]

**Subject:** [≤50 chars, pattern interrupt, question or scenario]
**Preview Text:** [≤100 chars]

---

Hi {{FirstName}},

[Opening: 1-2 sentences. Scenario or question. Specific to their role.]

[Pain elaboration: 2-3 bullet points or short lines. Specific dealership moments.]

[Bridge to MDD: 1-2 sentences. LocateIQ mechanism or specific result.]

[Proof: 1 sentence. Named dealership + specific metric.]

[Soft CTA: 1 sentence. Question format.]

— {{SenderName}}

---
**Word count target:** Under 120 words
**Rules:** One pain per email. No forbidden phrases. Dealer language only.
```

---

## Example Cold Outbound Emails

### Email 1: Trigger Event
```
Subject: Quick question about lost keys

Hi {{FirstName}},

Quick question.

How often does this happen at {{Dealership}}?

A salesperson has a customer ready to buy…
but no one can find the key.

Usually it turns into:
• 3 people searching the lot
• a customer waiting awkwardly
• momentum on the deal dying

A lot of dealers start looking at us after losing 2–3 keys in a week.

Mobile Dealer Data lets your team instantly see where every car and key is on the lot.

Worth seeing how it works?

— {{SenderName}}
```

### Email 2: Saturday Chaos
```
Subject: Saturday at 11:30am

Hi {{FirstName}},

You probably know this moment.

It's Saturday around 11:30.
The showroom is packed, a customer is ready to test drive a vehicle…
and the key isn't where it's supposed to be.

Now 3 employees are walking the lot trying to find it while the customer waits.

Dealerships use Mobile Dealer Data to instantly locate:
• the key
• the car
• who last had it

No searching. No guessing.

Do you currently have a way to see exactly where keys and cars are in real time?

— {{SenderName}}
```

### Email 10: Breakup
```
Subject: Should I stop reaching out?

Hi {{FirstName}},

I've reached out a few times because we work with dealerships to eliminate lost keys and improve service and recon workflow visibility.

Totally understand if it's not a priority right now.

Should I close your file for the time being, or would it make sense to take a quick 15-minute look sometime?

Either way, just let me know.

— {{SenderName}}
```

---

## Email Quality Checklist

Before sending any email:

- [ ] Under 120 words
- [ ] One pain point only
- [ ] Pattern interrupt subject line (≤50 chars)
- [ ] Scenario-first opening
- [ ] Named dealership proof point
- [ ] Soft CTA (not "Book a demo now!")
- [ ] No forbidden phrases
- [ ] Persona-appropriate products only
- [ ] Personalization tokens work
- [ ] Mobile-readable (short paragraphs)
