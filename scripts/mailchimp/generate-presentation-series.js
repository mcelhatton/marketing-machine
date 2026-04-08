/**
 * Generate a 15-email HTML campaign series based on
 * MDD_Presentation_03072026.pptx.
 *
 * The output is a Mailchimp-friendly campaign folder with responsive HTML
 * emails, CTA variants, and a manifest for review.
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGN_ID = '2026-04-08_mdd-presentation-email-series';
const CAMPAIGN_NAME = 'MDD Presentation HTML Email Series';
const CAMPAIGN_DIR = path.join(process.cwd(), 'campaigns', CAMPAIGN_ID);
const CONTENT_DIR = path.join(CAMPAIGN_DIR, 'content');
const EMAIL_DIR = path.join(CONTENT_DIR, 'email');
const SOURCE_DECK_PATH = '/Users/colin/Library/CloudStorage/OneDrive-MobileDealerData,LLC/Documents - Mobile Dealer Data Files/Marketing/Sales Decks/MDD_Presentation_03072026.pptx';
const DEMO_URL = 'https://mdd.io/demo';
const CONTACT_URL = 'https://mdd.io/contact-us';
const PHONE_DISPLAY = '844-292-7110';
const PHONE_LINK = '8442927110';

const DECK_SUMMARY = `# MDD Presentation Messaging Source

Source deck:
\`${SOURCE_DECK_PATH}\`

## Core Messaging Extracted From Slides

1. Born at the world's largest dealerships.
2. Dealers bleed money from chaos they can't see.
3. One platform. Three revenue-driving products.
4. Trusted by Longo Toyota, Bill Brown Ford, Lithia Automotive, Morgan Automotive, Penske Automotive.
5. Measurable ROI:
   - 45 min saved per sale
   - 15 min saved per repair order
   - $308K/mo F&I revenue
6. MDD Locate:
   - Real-time location for every key and vehicle
   - Search by VIN, stock number, or name
   - After-hours movement alerts and geofencing
   - Full accountability
7. Workflow:
   - Powered by LocateIQ
   - Automatic stage updates as vehicles move
   - Real-time bottleneck alerts
   - 64% out in 60 min
   - 15 min saved per RO
   - 3-5 day recon turn
8. VehicleVault:
   - Consumer app sold in F&I
   - High-margin recurring revenue
   - Zero chargebacks
   - Dealer-branded app on the customer's phone
9. Support:
   - 1-day install
   - 4-week hypercare
   - Dedicated CSM
   - KPI reporting
   - 90-day money-back guarantee
10. CTA direction:
   - Demo-first
   - Proof-led
   - No hard sell
   - Test launch pricing / pilot / implementation incentive angles without inventing fixed discounts
`;

const EMAILS = [
  {
    slug: 'born-at-the-worlds-largest-dealerships',
    theme: 'green',
    subject: "Born at the world's largest dealerships",
    preheader: 'One platform for key tracking, workflow automation, and F&I revenue.',
    eyebrow: 'Full Platform',
    headline: "Built where dealership chaos is most expensive.",
    greeting: "Hi *|FNAME|*,",
    lead: "Mobile Dealer Data was born inside some of the busiest dealerships in the country. That matters, because the problems we solve aren't theoretical. They're the problems that cost stores money every day.",
    paragraphs: [
      "The deck says it simply: real-time key and vehicle tracking, automated workflows, and F&I revenue generation on one platform.",
      "That means fewer lost deals, faster service throughput, tighter recon turns, and a new revenue stream your team can actually explain at the desk.",
      "If you're dealing with key hunts, stale workflow boards, or F&I products customers don't really value, this is the conversation worth having."
    ],
    stats: [
      { value: '45 min', label: 'saved per sale' },
      { value: '15 min', label: 'saved per RO' },
      { value: '$308K/mo', label: 'F&I revenue at Brandon Honda' }
    ],
    bullets: [
      'Real-time visibility for every key and vehicle',
      'LocateIQ-powered workflow automation',
      'Dealer-branded VehicleVault app with recurring revenue'
    ],
    cta: {
      text: 'Schedule a 15-Min Demo →',
      subtext: 'We will show you exactly where MDD fits in your store, no pressure.',
      type: 'demo'
    }
  },
  {
    slug: 'chaos-the-dealer-cant-see',
    theme: 'green',
    subject: "The money leak most stores don't see",
    preheader: "Dealerships bleed money from chaos they can't see.",
    eyebrow: 'The Problem',
    headline: "Most dealership chaos is invisible until it shows up on the P&L.",
    greeting: "Hi *|FNAME|*,",
    lead: "The presentation frames the real issue well: dealerships bleed money from chaos they can't see.",
    paragraphs: [
      "Lost keys. Cars nobody can find. Service vehicles waiting because nobody knows where they are. Recon units sitting while holding costs pile up.",
      "Those aren't isolated annoyances. They're recurring operational leaks that stack up into real dollars every month.",
      "Most stores don't need another dashboard. They need a system that tells the team where the key is, where the car is, and what should happen next."
    ],
    stats: [
      { value: '$500+', label: 'per key replacement' },
      { value: '45 min', label: 'per sale searching for cars and keys' },
      { value: '$10K+/mo', label: 'lost at large dealerships' }
    ],
    cta: {
      text: 'See MDD Live →',
      subtext: 'If this sounds familiar, we can walk through the exact leaks MDD is built to stop.',
      type: 'demo'
    }
  },
  {
    slug: 'lost-key-cost-adds-up-fast',
    theme: 'green',
    subject: 'A lost key is never just a lost key',
    preheader: 'Replacement cost is only part of the hit.',
    eyebrow: 'Key Loss',
    headline: 'The key replacement is expensive. The lost momentum costs more.',
    greeting: "Hi *|FNAME|*,",
    lead: "A missing key can cost $500+ to replace. But that is not the part most dealers feel first.",
    paragraphs: [
      "What hurts faster is the salesperson burning 45 minutes trying to find the car or key while the customer stands there cooling off.",
      "That is how little operational misses become lost gross, frustrated staff, and a slower store.",
      "MDD Locate gives your team a real-time search layer for every key and vehicle, so the deal does not stall while someone starts asking who had the key last."
    ],
    bullets: [
      'Search by VIN, stock number, or name',
      'See who had the asset and where it went',
      'Set after-hours movement alerts and geofences'
    ],
    cta: {
      text: 'Get a Dealer ROI Review →',
      subtext: 'We can quantify what key hunts are really costing your store before you change anything.',
      type: 'roi'
    }
  },
  {
    slug: 'mdd-locate-product-spotlight',
    theme: 'green',
    subject: 'Find every key. Find every car. Every time.',
    preheader: 'A closer look at MDD Locate.',
    eyebrow: 'Product Spotlight',
    headline: 'Key and vehicle tracking that operators actually use.',
    greeting: "Hi *|FNAME|*,",
    lead: "MDD Locate was built for dealership reality, not ideal behavior.",
    paragraphs: [
      "Your team gets real-time location for every key and vehicle from one dashboard.",
      "They can search instantly by VIN, stock number, or name. They can see after-hours movement. They can track across multiple lots. And they can see accountability, not guesses.",
      "The deck backs that up with 100,000+ tracked assets, 90% adoption, and zero lost keys in the highlighted installs."
    ],
    cards: [
      {
        title: 'Instant Search',
        body: 'Search by VIN, stock number, or customer-friendly name and go straight to the asset.'
      },
      {
        title: 'Multi-Lot Visibility',
        body: 'Track across lots and buildings from one view instead of asking three people to start looking.'
      },
      {
        title: 'Accountability',
        body: 'See who had it, where it went, and when movement happened.'
      },
      {
        title: 'Alerts',
        body: 'After-hours movement alerts and geofencing help protect inventory.'
      }
    ],
    cta: {
      text: 'See LocateIQ In Action →',
      subtext: 'We will show you what the live search experience looks like on an actual dealership map.',
      type: 'demo'
    }
  },
  {
    slug: 'proof-bill-brown-and-adoption',
    theme: 'green',
    subject: 'What 90% adoption looks like in the real world',
    preheader: 'Bill Brown Ford is not a soft test case.',
    eyebrow: 'Proof',
    headline: 'When the team uses it, the store feels it fast.',
    greeting: "Hi *|FNAME|*,",
    lead: "One reason the presentation hits is that it anchors everything in real stores.",
    paragraphs: [
      "Bill Brown Ford, the world's largest Ford dealer, is one of the proof points highlighted across the deck.",
      "The message is straightforward: high-volume stores do not keep systems around unless the team actually uses them.",
      "MDD is showing 90% sales team adoption and zero lost keys after install in the showcased accounts. That is what makes the ROI believable."
    ],
    quote: {
      text: "Born at Longo Toyota, scaled to 250+ dealerships, now in top public auto groups.",
      byline: 'Slide 4 traction story'
    },
    stats: [
      { value: '250+', label: 'dealerships' },
      { value: '10+ years', label: 'in market' },
      { value: '$0', label: 'lost keys after install' }
    ],
    cta: {
      text: 'Book a Dealer-Specific Demo →',
      subtext: 'We can show you where adoption usually happens first and how teams roll it out without disruption.',
      type: 'demo'
    }
  },
  {
    slug: 'service-bottlenecks-cost-billable-hours',
    theme: 'green',
    subject: 'Service bottlenecks are usually a visibility problem',
    preheader: 'Faster throughput starts with knowing where the car is.',
    eyebrow: 'Service',
    headline: 'If nobody knows where the vehicle is, the workflow board is already wrong.',
    greeting: "Hi *|FNAME|*,",
    lead: "The deck calls out 15+ minutes wasted per RO just from not knowing where cars are.",
    paragraphs: [
      "That is not just a service ops irritation. It is fewer billable hours, slower lane movement, and more customers waiting longer than they expected.",
      "MDD's approach is different because LocateIQ ties workflow to physical vehicle location.",
      "When the car moves, the status moves. That is how you stop the board from becoming fiction."
    ],
    bullets: [
      'Reduce idle time caused by vehicle searching',
      'Spot bottlenecks before advisors feel them',
      'Give managers a live operational picture, not manual guesses'
    ],
    cta: {
      text: 'See the Workflow Demo →',
      subtext: 'We will walk through how MDD turns location into service throughput.',
      type: 'demo'
    }
  },
  {
    slug: 'workflow-product-spotlight',
    theme: 'green',
    subject: 'The only workflow that knows where the car actually is',
    preheader: 'Automatic stage updates as vehicles move.',
    eyebrow: 'Workflow',
    headline: 'This is what changes when physical location drives workflow.',
    greeting: "Hi *|FNAME|*,",
    lead: "Most workflow tools rely on someone remembering to update the board. MDD does not.",
    paragraphs: [
      "The presentation leans into that difference for a reason: LocateIQ powers automatic stage updates as vehicles move through the lane or recon process.",
      "That gives managers a vehicle queue, a live work plan, and bottleneck visibility without asking the team to do more admin work.",
      "The result is a workflow system that behaves more like operations and less like data entry."
    ],
    stats: [
      { value: '64%', label: 'out in 60 min' },
      { value: '15 min', label: 'saved per RO' },
      { value: '3-5 days', label: 'recon turn' }
    ],
    cta: {
      text: 'Reserve a Workflow Walkthrough →',
      subtext: 'Ask us to map your current lane or recon flow to the MDD workflow model.',
      type: 'demo'
    }
  },
  {
    slug: 'corwin-and-longo-results',
    theme: 'green',
    subject: 'Corwin and Longo are the kind of proof points that matter',
    preheader: 'Real dealerships. Real throughput improvement.',
    eyebrow: 'Operator Proof',
    headline: 'The best proof is when busy stores keep expanding usage.',
    greeting: "Hi *|FNAME|*,",
    lead: "The deck does not lean on vague claims. It leans on operator results.",
    paragraphs: [
      "Corwin is tied to service throughput. Longo is tied to recon speed. Bill Brown is tied to scale and adoption.",
      "That combination matters because it shows MDD is not a one-product story. It is an operations platform with proof in different departments.",
      "If your team wants to see a workflow example, we can show the same kind of stage automation and bottleneck visibility those stores use."
    ],
    quote: {
      text: "Real numbers. Real dealerships. Measurable from day one.",
      byline: 'Slide 5'
    },
    cta: {
      text: 'Ask About Launch Pricing →',
      subtext: 'On the demo, ask whether your store qualifies for current pilot or rollout pricing.',
      type: 'offer'
    },
    offer: 'Pilot / Launch Pricing'
  },
  {
    slug: 'recon-delay-holding-cost',
    theme: 'green',
    subject: 'Recon delay is a margin problem, not just a process problem',
    preheader: 'The longer a car sits, the harder it is to like the numbers.',
    eyebrow: 'Recon',
    headline: 'Every extra recon day makes the vehicle worse on paper.',
    greeting: "Hi *|FNAME|*,",
    lead: "The deck points straight at the issue: recon delays are expensive because holding costs keep running while the unit is not front-line ready.",
    paragraphs: [
      "Stores usually feel the pain as a mix of missed turns, stale pricing, and poor visibility into where the car actually got stuck.",
      "That is why MDD positions recon as a workflow and location problem together.",
      "When you know where the vehicle is and the stage updates automatically, bottlenecks stop hiding in the handoffs."
    ],
    bullets: [
      'Identify stalled units faster',
      'Reduce time-to-line through real bottleneck visibility',
      'Keep managers focused on the exceptions instead of chasing status'
    ],
    cta: {
      text: 'Get a Recon Turn Review →',
      subtext: 'We can show how MDD is used to shorten recon time without adding manual updates.',
      type: 'roi'
    }
  },
  {
    slug: 'vehiclevault-product-spotlight',
    theme: 'gold',
    subject: 'VehicleVault turns delivery into lifetime value',
    preheader: 'A dealer-branded F&I product customers actually use.',
    eyebrow: 'VehicleVault',
    headline: 'F&I revenue is stronger when the customer sees value right away.',
    greeting: "Hi *|FNAME|*,",
    lead: "VehicleVault gives the F&I story in the deck a very different feel from traditional protection products.",
    paragraphs: [
      "It is a consumer key tracking app sold at the desk, tied to dealer branding, recurring revenue, and zero chargebacks.",
      "The reason it works as messaging is simple: customers understand the product instantly. They use it. And every time they do, your dealership brand is on their phone.",
      "That makes VehicleVault both an F&I product and a retention touchpoint."
    ],
    cards: [
      {
        title: 'High Margin',
        body: 'A cleaner F&I presentation with everyday value the customer can immediately understand.'
      },
      {
        title: 'Recurring Revenue',
        body: 'Monthly revenue instead of a one-time burst followed by chargeback risk.'
      },
      {
        title: 'Dealer-Branded',
        body: 'Your dealership sits on the customer’s phone every time they use the app.'
      },
      {
        title: 'Rewards + Vehicle Info',
        body: 'Key tracking, vehicle info, and rewards keep the dealership relationship active.'
      }
    ],
    cta: {
      text: 'See the VehicleVault Model →',
      subtext: 'We can show you how dealers present it, price it, and keep chargebacks out of the conversation.',
      type: 'demo'
    }
  },
  {
    slug: 'brandon-honda-fni-proof',
    theme: 'gold',
    subject: '$308K/month changes the conversation fast',
    preheader: 'Brandon Honda is the proof point in the deck for a reason.',
    eyebrow: 'F&I Proof',
    headline: 'When F&I revenue is real, it shows up fast and keeps showing up.',
    greeting: "Hi *|FNAME|*,",
    lead: "The sharpest number in the presentation is the Brandon Honda stat: $308K per month in F&I revenue.",
    paragraphs: [
      "The supporting message matters just as much: zero chargebacks, dealer-branded app usage, and a product customers actually keep engaging with.",
      "That is a much better foundation than products that look strong at the menu and weak six months later.",
      "If F&I growth is on your radar, VehicleVault is worth a serious look."
    ],
    stats: [
      { value: '$308K/mo', label: 'F&I revenue' },
      { value: 'Zero', label: 'chargebacks' },
      { value: 'Recurring', label: 'revenue model' }
    ],
    cta: {
      text: 'Ask About F&I Rollout Incentives →',
      subtext: 'On the call, ask whether your store qualifies for current VehicleVault rollout incentives or launch pricing.',
      type: 'offer'
    },
    offer: 'F&I Rollout Incentives'
  },
  {
    slug: 'traction-and-social-proof',
    theme: 'green',
    subject: 'Why 250+ dealerships matters more than the logo slide',
    preheader: 'Traction is useful when it proves repeatability.',
    eyebrow: 'Traction',
    headline: 'The best signal is when great operators keep making the same decision.',
    greeting: "Hi *|FNAME|*,",
    lead: "The deck's traction slide is more than a logo wall.",
    paragraphs: [
      "Longo Toyota. Bill Brown Ford. Lithia Automotive. Morgan Automotive. Penske Automotive.",
      "Those names matter because they show MDD winning with large, demanding operators who already have options.",
      "That kind of adoption says the product survives real use, real politics, and real rollout pressure inside the dealership."
    ],
    quote: {
      text: "Born at Longo Toyota → scaled to 250+ dealerships → now in top public auto groups.",
      byline: 'Slide 4'
    },
    cta: {
      text: 'See If Your Store Qualifies →',
      subtext: 'If you want to benchmark your operation against those use cases, we can do that on a 15-minute demo.',
      type: 'demo'
    }
  },
  {
    slug: 'hypercare-guarantee-and-install',
    theme: 'green',
    subject: '1-day install. 4-week hypercare. 90-day guarantee.',
    preheader: "This isn't an install-and-disappear vendor story.",
    eyebrow: 'Support',
    headline: 'Rollout works better when support does not stop after install day.',
    greeting: "Hi *|FNAME|*,",
    lead: "The support slide in the deck is strong because it lowers the risk dealers usually worry about first.",
    paragraphs: [
      "MDD is positioning a 1-day install, 4-week hypercare, dedicated CSM support, KPI reporting, and a 90-day money-back guarantee.",
      "That is a much different posture than software that gets installed and then becomes your team's problem.",
      "If adoption and follow-through are the concern, this is one of the strongest parts of the story."
    ],
    bullets: [
      'Rapid support during the adoption window',
      'Additional training and optimization help',
      'KPI reporting tied to real usage and results',
      '90-day money-back guarantee'
    ],
    cta: {
      text: 'See the Rollout Plan →',
      subtext: 'We can walk through exactly how install, hypercare, and KPI review would look at your store.',
      type: 'demo'
    }
  },
  {
    slug: 'custom-roi-and-pricing-conversation',
    theme: 'green',
    subject: 'You do not need generic pricing. You need your numbers.',
    preheader: 'The right demo should answer ROI first.',
    eyebrow: 'ROI',
    headline: 'The best next step is not a brochure. It is your own math.',
    greeting: "Hi *|FNAME|*,",
    lead: "Because MDD touches key loss, sales speed, service throughput, recon turn, and even F&I revenue, generic pricing is not the most useful conversation.",
    paragraphs: [
      "A better conversation is: where is your store leaking time or margin today, and which product line closes that gap fastest?",
      "That is why the strongest CTA in this series is a short demo paired with a custom ROI review.",
      "We can also discuss current launch pricing, implementation credits, or pilot options without forcing a one-size-fits-all package."
    ],
    cta: {
      text: 'Get a Custom ROI Breakdown →',
      subtext: 'Ask about pilot pricing, launch packages, or implementation credit while we build the business case.',
      type: 'offer'
    },
    offer: 'Custom ROI + Pilot Options'
  },
  {
    slug: 'best-dealerships-already-chose-us',
    theme: 'green',
    subject: 'The world’s best dealerships already chose us',
    preheader: 'If the problem is real in your store, this is worth a look.',
    eyebrow: 'Final Ask',
    headline: 'If this is a priority, the next step is easy.',
    greeting: "Hi *|FNAME|*,",
    lead: "The closing message in the presentation is direct for a reason: the world's best dealerships already chose MDD.",
    paragraphs: [
      "If key hunts, service drag, recon delay, or weak F&I retention are issues in your store, you do not need a huge project to start the conversation.",
      "You just need 15 minutes to see the platform, talk through your biggest pain point, and decide whether it is worth a deeper look.",
      "If the timing is right, we can also talk through current rollout incentives while we are on the call."
    ],
    stats: [
      { value: '45 min', label: 'saved per sale' },
      { value: '15 min', label: 'per repair order' },
      { value: '$308K/mo', label: 'VehicleVault F&I revenue' }
    ],
    cta: {
      text: 'Reserve a Demo Slot →',
      subtext: 'Reply or book a time and ask whether your store qualifies for current implementation incentives.',
      type: 'offer'
    },
    offer: 'Implementation Incentives'
  }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTheme(theme) {
  if (theme === 'gold') {
    return {
      accent: '#F59E0B',
      accentSoft: 'rgba(245, 158, 11, 0.12)',
      accentBorder: 'rgba(245, 158, 11, 0.35)',
    };
  }

  return {
    accent: '#8AC833',
    accentSoft: 'rgba(138, 200, 51, 0.12)',
    accentBorder: 'rgba(138, 200, 51, 0.35)',
  };
}

function buildUtmUrl(type, index) {
  const base = type === 'contact' ? CONTACT_URL : DEMO_URL;
  const content = `email-${String(index + 1).padStart(2, '0')}`;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}utm_source=mailchimp&utm_medium=email&utm_campaign=${CAMPAIGN_ID}&utm_content=${content}`;
}

function renderParagraphs(paragraphs, editPrefix) {
  return paragraphs
    .map((paragraph, index) => (
      `<div mc:edit="${editPrefix}_paragraph_${index + 1}"><p style="margin: 0 0 16px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #D1D5DB;">${paragraph}</p></div>`
    ))
    .join('\n');
}

function renderBullets(bullets, editPrefix) {
  if (!bullets || bullets.length === 0) {
    return '';
  }

  const items = bullets
    .map((bullet) => `<li style="margin: 0 0 10px;">${bullet}</li>`)
    .join('');

  return `
    <div mc:edit="${editPrefix}_bullets">
      <div style="padding: 20px 24px; background-color: #1A1E24; border-radius: 12px; border: 1px solid #2D3239;">
        <ul style="margin: 0; padding-left: 20px; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #D1D5DB;">
          ${items}
        </ul>
      </div>
    </div>
  `;
}

function renderStats(stats, theme, editPrefix) {
  if (!stats || stats.length === 0) {
    return '';
  }

  const cells = stats.map((stat, index) => `
    <td width="32%" style="padding: 0;" valign="top">
      <div mc:edit="${editPrefix}_stat_${index + 1}" style="padding: 18px 14px; background-color: #1A1E24; border-radius: 12px; border: 1px solid #2D3239; text-align: center;">
        <div style="margin: 0 0 6px; font-family: Arial, sans-serif; font-size: 28px; font-weight: 800; color: ${theme.accent};">${escapeHtml(stat.value)}</div>
        <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4; color: #FFFFFF;">${escapeHtml(stat.label)}</div>
      </div>
    </td>
  `);

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        ${cells.join('<td width="2%"></td>')}
      </tr>
    </table>
  `;
}

function renderCards(cards, theme, editPrefix) {
  if (!cards || cards.length === 0) {
    return '';
  }

  const rows = [];
  for (let i = 0; i < cards.length; i += 2) {
    const pair = cards.slice(i, i + 2);
    const cells = pair.map((card, index) => `
      <td width="49%" valign="top">
        <div mc:edit="${editPrefix}_card_${i + index + 1}" style="padding: 18px 18px 16px; background-color: #1A1E24; border-radius: 12px; border-top: 3px solid ${theme.accent};">
          <div style="margin: 0 0 8px; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; color: #FFFFFF;">${escapeHtml(card.title)}</div>
          <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #AEB6C2;">${escapeHtml(card.body)}</div>
        </div>
      </td>
    `);

    if (cells.length === 1) {
      cells.push('<td width="49%"></td>');
    }

    rows.push(`
      <tr>
        ${cells[0]}
        <td width="2%"></td>
        ${cells[1]}
      </tr>
    `);
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${rows.join('<tr><td colspan="3" height="14"></td></tr>')}
    </table>
  `;
}

function renderQuote(quote, theme, editPrefix) {
  if (!quote) {
    return '';
  }

  return `
    <div mc:edit="${editPrefix}_quote" style="padding: 22px 24px; background: linear-gradient(135deg, ${theme.accentSoft} 0%, rgba(34, 39, 46, 0.9) 100%); border: 1px solid ${theme.accentBorder}; border-radius: 14px;">
      <div style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #FFFFFF; font-weight: 600;">"${escapeHtml(quote.text)}"</div>
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: ${theme.accent};">${escapeHtml(quote.byline)}</div>
    </div>
  `;
}

function buildHtml(email, index, total) {
  const theme = getTheme(email.theme);
  const fileId = `email_${String(index + 1).padStart(2, '0')}`;
  const ctaUrl = buildUtmUrl('demo', index);
  const contactUrl = buildUtmUrl('contact', index);
  const offerBadge = email.offer ? `
    <div mc:edit="${fileId}_offer_badge" style="display: inline-block; margin-bottom: 14px; padding: 7px 12px; background-color: ${theme.accentSoft}; border: 1px solid ${theme.accentBorder}; border-radius: 999px; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; color: ${theme.accent}; text-transform: uppercase;">
      ${escapeHtml(email.offer)}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(email.subject)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media screen and (max-width: 600px) {
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding: 24px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #12161C;">
  <div mc:edit="${fileId}_preheader" style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(email.preheader)}</div>
  <div style="display: none; max-height: 0; overflow: hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #12161C;">
    <tr>
      <td align="center" style="padding: 36px 18px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="mobile-full" style="width: 100%; max-width: 600px;">
          <tr>
            <td align="center" style="padding: 0 0 18px;">
              <img mc:edit="${fileId}_logo" src="https://mdd.io/hubfs/MDD%20Logos/MDD_Logo_White2.png" alt="Mobile Dealer Data" width="148" style="display: block; width: 148px; max-width: 100%;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #22272E 0%, #1A1E24 100%); border: 1px solid #2D3239; border-radius: 18px; overflow: hidden;">
                <tr>
                  <td class="mobile-padding" style="padding: 30px 34px 24px;">
                    <div mc:edit="${fileId}_progress" style="display: inline-block; margin-bottom: 14px; padding: 7px 12px; background-color: rgba(255, 255, 255, 0.04); border: 1px solid #38414D; border-radius: 999px; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; color: #CBD5E1; text-transform: uppercase;">
                      Email ${index + 1} of ${total}
                    </div>
                    <div mc:edit="${fileId}_eyebrow" style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1.4px; color: ${theme.accent}; text-transform: uppercase;">
                      ${escapeHtml(email.eyebrow)}
                    </div>
                    <div mc:edit="${fileId}_headline" style="margin: 0 0 14px; font-family: Arial, sans-serif; font-size: 34px; line-height: 1.18; color: #FFFFFF; font-weight: 800;">
                      ${escapeHtml(email.headline)}
                    </div>
                    <div mc:edit="${fileId}_lead" style="margin: 0 0 18px; font-family: Arial, sans-serif; font-size: 17px; line-height: 1.65; color: #AEB6C2;">
                      ${escapeHtml(email.lead)}
                    </div>
                    <div mc:edit="${fileId}_greeting"><p style="margin: 0 0 16px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #D1D5DB;">${email.greeting}</p></div>
                    ${renderParagraphs(email.paragraphs, fileId)}
                  </td>
                </tr>
                ${email.stats ? `
                <tr>
                  <td class="mobile-padding" style="padding: 0 34px 22px;">
                    ${renderStats(email.stats, theme, fileId)}
                  </td>
                </tr>` : ''}
                ${email.cards ? `
                <tr>
                  <td class="mobile-padding" style="padding: 0 34px 22px;">
                    ${renderCards(email.cards, theme, fileId)}
                  </td>
                </tr>` : ''}
                ${email.bullets ? `
                <tr>
                  <td class="mobile-padding" style="padding: 0 34px 22px;">
                    ${renderBullets(email.bullets, fileId)}
                  </td>
                </tr>` : ''}
                ${email.quote ? `
                <tr>
                  <td class="mobile-padding" style="padding: 0 34px 24px;">
                    ${renderQuote(email.quote, theme, fileId)}
                  </td>
                </tr>` : ''}
                <tr>
                  <td class="mobile-padding" style="padding: 0 34px 34px;">
                    <div style="padding: 24px; background: linear-gradient(135deg, ${theme.accentSoft} 0%, rgba(26, 30, 36, 0.96) 100%); border: 1px solid ${theme.accentBorder}; border-radius: 16px; text-align: center;">
                      ${offerBadge}
                      <div mc:edit="${fileId}_cta_intro" style="margin: 0 0 12px; font-family: Arial, sans-serif; font-size: 22px; line-height: 1.3; color: #FFFFFF; font-weight: 800;">
                        See what this looks like at *|COMPANY|*.
                      </div>
                      <div mc:edit="${fileId}_cta_subcopy" style="margin: 0 0 18px; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.65; color: #CBD5E1;">
                        ${escapeHtml(email.cta.subtext)}
                      </div>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                        <tr>
                          <td mc:edit="${fileId}_cta_button" style="border-radius: 10px; background-color: ${theme.accent};">
                            <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 16px 28px; font-family: Arial, sans-serif; font-size: 16px; font-weight: 800; color: #12161C; text-decoration: none;">
                              ${escapeHtml(email.cta.text)}
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div mc:edit="${fileId}_cta_footer" style="margin: 16px 0 0; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #94A3B8;">
                        Prefer a direct conversation? <a href="${contactUrl}" style="color: ${theme.accent}; text-decoration: underline;">Request a callback</a> or call <a href="tel:${PHONE_LINK}" style="color: ${theme.accent}; text-decoration: underline;">${PHONE_DISPLAY}</a>.
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" align="center" style="padding: 24px 28px 8px;">
              <div mc:edit="${fileId}_footer_note" style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 14px; color: #94A3B8;">
                Mobile Dealer Data | We Find Keys & Cars™
              </div>
              <div style="margin: 0 0 12px; font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">
                *|LIST:ADDRESS|*
              </div>
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">
                <a href="*|UNSUB|*" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                &nbsp;|&nbsp;
                <a href="*|UPDATE_PROFILE|*" style="color: #6B7280; text-decoration: underline;">Update Preferences</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildManifest() {
  return {
    campaign_id: CAMPAIGN_ID,
    campaign_name: CAMPAIGN_NAME,
    created_at: new Date().toISOString(),
    status: 'draft',
    source_deck: SOURCE_DECK_PATH,
    channels: ['mailchimp'],
    content: EMAILS.map((email, index) => ({
      type: 'email-html',
      file: `content/email/email-${String(index + 1).padStart(2, '0')}.html`,
      title: email.headline,
      subject: email.subject,
      preheader: email.preheader,
      cta_text: email.cta.text,
      theme: email.theme,
    })),
  };
}

function writeCampaign() {
  ensureDir(CAMPAIGN_DIR);
  ensureDir(CONTENT_DIR);
  ensureDir(EMAIL_DIR);

  fs.writeFileSync(path.join(CONTENT_DIR, 'deck-messaging-source.md'), DECK_SUMMARY);

  EMAILS.forEach((email, index) => {
    const fileName = `email-${String(index + 1).padStart(2, '0')}.html`;
    const html = buildHtml(email, index, EMAILS.length);
    fs.writeFileSync(path.join(EMAIL_DIR, fileName), html);
  });

  fs.writeFileSync(
    path.join(CAMPAIGN_DIR, 'manifest.json'),
    JSON.stringify(buildManifest(), null, 2)
  );
}

if (require.main === module) {
  writeCampaign();
  console.log(`Generated ${EMAILS.length} HTML emails in ${CAMPAIGN_DIR}`);
}

module.exports = {
  CAMPAIGN_DIR,
  CAMPAIGN_ID,
  EMAILS,
  writeCampaign,
};
