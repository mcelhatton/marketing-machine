/**
 * Content Generator - Enhanced Version
 *
 * Generates fully fleshed-out, production-ready marketing content.
 * Uses the MDD brand voice, proof points, and styling standards.
 */

const fs = require('fs');
const path = require('path');

// ============================================
// COMPREHENSIVE PRODUCT DATA
// ============================================

const PRODUCTS = {
  'key-tracking': {
    name: 'Key Tracking',
    tag: 'MDD Locate',
    tagColor: 'green',
    headline: 'Find any key in seconds.',
    subheadline: 'Know exactly where every key is on your lot — instantly. No searching. No guessing. No lost deals.',
    heroDescription: 'Real-time key tracking that eliminates the chaos of lost keys and wasted time.',
    proof: {
      dealership: 'Bill Brown Ford',
      dealershipDescription: "World's Largest Ford Dealer",
      metric: '2,000+ vehicles tracked',
      secondaryMetric: '90% sales team adoption',
      tertiaryMetric: '20 min saved per delivery',
      quote: 'MDD instantly locates 2,000 vehicles on multiple lots all over town. We get cars customer-delivered without delays.',
      quotePerson: 'Dave Bird',
      quoteTitle: 'New Car Inventory Manager',
    },
    painPoints: [
      '3 employees searching the lot',
      'Customer waiting awkwardly',
      'Deal momentum dying',
    ],
    features: [
      {
        title: 'Real-Time Key Location',
        description: 'See exactly where every key is — on a desk, in a pocket, across the lot. No more key boxes that are only as good as the last person.',
      },
      {
        title: 'Warmer/Colder Finding',
        description: 'Walk directly to any key using proximity guidance on your phone. No more systematic searches through drawers and desks.',
      },
      {
        title: 'Key Accountability Tracking',
        description: 'See who last checked out a key and where it went. Eliminate finger-pointing and build real accountability.',
      },
      {
        title: 'Zero Behavior Change',
        description: 'No check-in, no check-out, no scanning. The system tracks automatically so your team can focus on selling.',
      },
      {
        title: 'Multi-Lot Coverage',
        description: 'Track keys across all your properties. Know instantly if a key moved between lots.',
      },
      {
        title: 'DMS Integration',
        description: 'Syncs with Reynolds & Reynolds, CDK, and more. Stock numbers and VINs auto-populate.',
      },
    ],
    howItWorks: [
      { step: 'Tag', description: 'Every key gets a Bluetooth tracker. Attach in seconds.' },
      { step: 'Track', description: 'Your team sees every key\'s real-time location from their phone.' },
      { step: 'Find', description: 'Use warmer/colder to walk directly to any key instantly.' },
    ],
    stats: [
      { value: '2,000+', label: 'Vehicles tracked', source: 'Bill Brown Ford' },
      { value: '90%', label: 'Sales team adoption', source: 'Bill Brown Ford' },
      { value: '20 min', label: 'Saved per delivery', source: 'Longo Toyota' },
    ],
    blogContent: {
      challenge: `Like many high-volume dealerships, Bill Brown Ford faced a daily battle with lost keys. With over 2,000 vehicles across multiple lots spread throughout the Detroit metro area, finding a specific key could take 15-30 minutes — or longer.

"It was chaos," admits Dave Bird, New Car Inventory Manager. "You'd have three salespeople searching the building while the customer stood there waiting. Everyone knew the key was somewhere, but nobody knew where."

The math was painful: at 50+ deliveries per day, even 15 minutes of wasted time per vehicle meant 12+ hours of lost productivity daily. And that didn't count the deals that walked because customers got tired of waiting.`,
      solution: `Bill Brown Ford implemented MDD's Key Tracking solution across all their locations. Every key received a small Bluetooth tag, and gateways were installed throughout the buildings and lots.

"The installation was the easy part," Bird says. "What surprised us was how fast the team adopted it. Within two weeks, 90% of our sales team was using it daily."

The system requires zero behavior change from staff. There's no check-in, no check-out, no scanning. Keys are tracked automatically, so staff can focus on what they do best: selling cars.`,
      results: `The results exceeded expectations:

- **2,000+ vehicles** now tracked in real-time across all lots
- **90% adoption** among sales team within weeks
- **Sub-minute key finds** instead of 15-30 minute searches
- **Zero lost keys** since implementation

"Now when a customer is ready to buy, we pull up the app, see exactly where the key is, and walk directly to it," Bird explains. "The customer doesn't even know we're using a tracking system. They just know we're fast."`,
    },
  },

  'lot-management': {
    name: 'Lot Management',
    tag: 'MDD Locate',
    tagColor: 'green',
    headline: 'Know where every vehicle is.',
    subheadline: 'Track every car across all your lots — indoors and outdoors. Sub-foot accuracy means no more walking the lot searching.',
    heroDescription: 'Real-time vehicle tracking with sub-foot accuracy across all your properties.',
    proof: {
      dealership: 'Bill Brown Ford',
      dealershipDescription: "World's Largest Ford Dealer",
      metric: '2,000+ vehicles tracked',
      secondaryMetric: 'Sub-foot accuracy',
      tertiaryMetric: 'Multiple lots unified',
      quote: 'MDD instantly locates 2,000 vehicles on multiple lots all over town. We get cars customer-delivered without delays.',
      quotePerson: 'Dave Bird',
      quoteTitle: 'New Car Inventory Manager',
    },
    painPoints: [
      'Walking the lot to find cars',
      'Vehicles on wrong lots',
      'Floor plan audit headaches',
    ],
    features: [
      {
        title: 'Vehicle Location Across All Lots',
        description: 'Track every car across multiple properties. Know instantly if a vehicle moved, where it went, and when.',
      },
      {
        title: 'Sub-Foot Accuracy',
        description: 'Precise location pinpointing, not just "somewhere on the lot." Walk directly to any vehicle.',
      },
      {
        title: 'After-Hours Movement Alerts',
        description: 'Get instant notifications when vehicles move outside geofenced areas or during off-hours. Full accountability, 24/7.',
      },
      {
        title: 'Daily Audit Tools',
        description: 'Simplify floor plan audits with instant location verification. Know where every unit is without walking the lot.',
      },
      {
        title: 'Indoor & Outdoor Coverage',
        description: 'Works in service bays, showrooms, and outdoor lots. One system for your entire property.',
      },
      {
        title: 'Search by Stock or VIN',
        description: 'Type any identifier and see the vehicle\'s exact location on your lot map instantly.',
      },
    ],
    howItWorks: [
      { step: 'Tag', description: 'Every vehicle gets a Bluetooth tracker. Scan QR, assign to stock — done.' },
      { step: 'Track', description: 'See every vehicle\'s real-time location from phone or desktop.' },
      { step: 'Manage', description: 'Run audits, get movement alerts, integrate with your DMS.' },
    ],
    stats: [
      { value: '2,000+', label: 'Vehicles tracked', source: 'Bill Brown Ford' },
      { value: 'Sub-foot', label: 'Location accuracy', source: 'All dealers' },
      { value: '15 min', label: 'Saved per locate', source: 'Average' },
    ],
    blogContent: {
      challenge: `Managing inventory across multiple lots is a logistical nightmare most dealerships simply accept. At Bill Brown Ford, with locations spread across the Detroit metro area, finding a specific vehicle could mean driving between lots or calling around hoping someone spotted it.

"We'd have customers ready to test drive, and we couldn't find the car," says Dave Bird. "Sometimes it was in service. Sometimes it moved to another lot. Sometimes it was right in front of us but we didn't recognize it. It was embarrassing."

For floor plan audits, the team would spend hours walking every row, clipboard in hand, verifying locations. Any discrepancy meant a frantic search before the auditor arrived.`,
      solution: `MDD's Lot Management solution gave Bill Brown Ford what they never had before: a single source of truth for every vehicle's location.

Every vehicle receives a small tracker during intake. The system automatically monitors location and updates in real-time, with sub-foot accuracy both indoors and outdoors.

"The game-changer was the accuracy," Bird notes. "Other systems would tell you a car was 'on lot 3.' MDD tells you it's in row 7, spot 12. You walk directly to it."`,
      results: `Implementation transformed daily operations:

- **2,000+ vehicles** tracked across all locations in real-time
- **Sub-foot accuracy** eliminates searching within the lot
- **Floor plan audits** reduced from hours to minutes
- **After-hours alerts** prevent unauthorized vehicle movement

"Now we pull up the map, see exactly where every car is, and get customers into test drives immediately," Bird explains. "Our audit process is completely different — we verify locations from our phones instead of walking every row."`,
    },
  },

  'service-workflow': {
    name: 'Service Workflow',
    tag: 'Service Workflow',
    tagColor: 'green',
    headline: 'Eliminate service bottlenecks.',
    subheadline: 'Know where every vehicle is from drop-off to delivery. Reduce technician idle time, improve throughput, and boost CSI scores.',
    heroDescription: 'Real-time service lane visibility that eliminates bottlenecks and improves customer satisfaction.',
    proof: {
      dealership: 'Corwin Toyota',
      dealershipDescription: 'High-Volume Toyota Dealer',
      metric: '64% out in 60 minutes',
      secondaryMetric: '40-60% more bay turns',
      tertiaryMetric: 'CSI scores improved',
      quote: 'With this cycle time tool, we know at the 40-minute mark if there\'s an issue. Before, we wouldn\'t know until the customer was already upset.',
      quotePerson: 'Service Director',
      quoteTitle: 'Corwin Toyota',
    },
    painPoints: [
      'Express service taking 2+ hours',
      'Technicians waiting for cars',
      'CSI scores suffering',
    ],
    features: [
      {
        title: 'Real-Time Service Bay Visibility',
        description: 'See every vehicle\'s location and status from advisor desks or any device. Know instantly what\'s in progress, what\'s waiting, what\'s done.',
      },
      {
        title: 'Cycle Time Tracking',
        description: 'Automatic timestamps at every stage. Identify bottlenecks before they become customer complaints.',
      },
      {
        title: 'Proactive Alert System',
        description: 'Get notified when vehicles exceed target cycle times. Intervene early instead of apologizing later.',
      },
      {
        title: 'Technician Efficiency',
        description: 'Eliminate time techs spend walking the lot looking for their next job. Vehicles come to them in sequence.',
      },
      {
        title: 'Customer Communication',
        description: 'Automatic status updates to customers. They know where their car is without calling.',
      },
      {
        title: 'Historical Analytics',
        description: 'Track trends, identify patterns, optimize staffing. Data-driven decisions instead of gut feelings.',
      },
    ],
    howItWorks: [
      { step: 'Drop-off', description: 'Vehicle automatically checked in as it enters the service lane.' },
      { step: 'Track', description: 'Real-time location and status through every stage of service.' },
      { step: 'Alert', description: 'Proactive notifications when vehicles exceed target times.' },
    ],
    stats: [
      { value: '64%', label: 'Out in 60 minutes', source: 'Corwin Toyota' },
      { value: '40-60%', label: 'More bay turns', source: 'Corwin Toyota' },
      { value: '2.5→1.2', label: 'Hour wait time reduction', source: 'Average' },
    ],
    blogContent: {
      challenge: `Express service was anything but express at Corwin Toyota. Customers were waiting 2+ hours for oil changes that should take 30 minutes. CSI scores were dropping, and quick-lube competitors were stealing business.

"We knew we had a problem, but we couldn't pinpoint where," admits the Service Director. "Was it the advisor? The tech? Parts? Every stage pointed fingers at the other stages."

The real issue was visibility. With vehicles scattered across the lot, service bays, and wash area, no one had a clear picture of where anything was or how long it had been there.`,
      solution: `Corwin implemented MDD's Service Workflow solution to create complete visibility from drop-off to delivery.

Every vehicle is automatically tracked through each stage: check-in, waiting, in-bay, parts hold, quality check, wash, and ready for pickup. Managers can see the entire service operation on a single dashboard.

"The alerts were the game-changer," the Service Director explains. "Now we know at the 40-minute mark if there's an issue. Before, we wouldn't know until the customer was already upset."`,
      results: `The transformation was measurable within weeks:

- **64% of vehicles** now out in 60 minutes or less
- **40-60% increase** in bay turns per day
- **CSI scores** improved significantly
- **Technician idle time** nearly eliminated

"Quick-lube can't compete with us anymore," the Service Director notes. "We're faster, and customers trust dealership service. We just had to prove we could be efficient."`,
    },
  },

  'recon-workflow': {
    name: 'Recon Workflow',
    tag: 'Recon Workflow',
    tagColor: 'green',
    headline: 'Accelerate time-to-line.',
    subheadline: 'Track every vehicle from acquisition through reconditioning. Eliminate bottlenecks, reduce holding costs, and get cars sold faster.',
    heroDescription: 'Real-time reconditioning visibility that cuts days from your time-to-line.',
    proof: {
      dealership: 'Longo Toyota',
      dealershipDescription: "World's Largest Toyota Dealer",
      metric: '3 days saved per car',
      secondaryMetric: '15 min saved per RO',
      tertiaryMetric: 'Vendor accountability',
      quote: 'We cut days from our average time-to-line. When you\'re moving 1,000+ used cars a month, that\'s real money.',
      quotePerson: 'Used Car Director',
      quoteTitle: 'Longo Toyota',
    },
    painPoints: [
      'Cars sitting in recon for weeks',
      'No visibility into vendor work',
      'Holding costs piling up',
    ],
    features: [
      {
        title: 'Acquisition to Front-Line Tracking',
        description: 'See every vehicle\'s status from trade-in or auction through inspection, reconditioning, photos, and front-line ready.',
      },
      {
        title: 'Bottleneck Identification',
        description: 'Instantly see which stage is slowing you down. Is it PDI? Detail? Photos? Know in real-time, not after the fact.',
      },
      {
        title: 'Vendor Accountability',
        description: 'Track vehicles at off-site vendors. Know exactly how long that body shop has had your car.',
      },
      {
        title: 'Cost Per Day Tracking',
        description: 'See holding costs accumulating in real-time. Every day a car sits is cash not in your pocket.',
      },
      {
        title: 'Automated Stage Transitions',
        description: 'Vehicles automatically move through workflow as they physically move through your facility.',
      },
      {
        title: 'Performance Analytics',
        description: 'Track recon times by vehicle type, age, vendor. Optimize your process with data.',
      },
    ],
    howItWorks: [
      { step: 'Intake', description: 'Vehicle enters system at acquisition. Timer starts.' },
      { step: 'Track', description: 'Real-time status through every recon stage and vendor.' },
      { step: 'Optimize', description: 'Analytics identify bottlenecks. Accountability drives improvement.' },
    ],
    stats: [
      { value: '3 days', label: 'Saved per car', source: 'Longo Toyota' },
      { value: '15 min', label: 'Saved per RO', source: 'Longo Toyota' },
      { value: '$50/day', label: 'Holding cost savings', source: 'Average' },
    ],
    blogContent: {
      challenge: `At Longo Toyota, the world's largest Toyota dealer, used car volume is measured in thousands per month. With that volume, even small inefficiencies in reconditioning create massive problems.

"We'd have cars disappear into recon for two weeks," admits the Used Car Director. "By the time we found them, we'd lost $500-700 in holding costs and the market had moved."

The challenge wasn't capability — Longo had excellent recon facilities. The problem was visibility. With vehicles spread across multiple buildings, vendors, and lots, no one had a clear picture of what was where and how long it had been there.`,
      solution: `Longo implemented MDD's Recon Workflow solution to create a single source of truth for every used vehicle in the reconditioning process.

From the moment a trade hits the lot or a car arrives from auction, it's tracked through every stage: appraisal, mechanical inspection, body work, detail, photos, and front-line ready.

"The vendor tracking changed everything," the Used Car Director explains. "Now we know exactly how long that body shop has had our car. We can call them with data, not guesses."`,
      results: `The ROI was immediate and substantial:

- **3 days** cut from average time-to-line
- **15 minutes** saved per RO in tracking time
- **Vendor accountability** improved dramatically
- **Holding costs** reduced by thousands monthly

"When you're moving 1,000+ used cars a month, saving 3 days per car is transformative," the Used Car Director notes. "That's thousands of vehicles hitting the front line faster, selling faster, and generating profit faster."`,
    },
  },

  'vehiclevault': {
    name: 'VehicleVault',
    tag: 'F&I Revenue Generator',
    tagColor: 'gold',
    headline: 'Turn every sale into recurring revenue.',
    subheadline: 'VehicleVault is a high-margin F&I product that customers actually use. Key tracking for them. Recurring profit for you. Zero chargebacks.',
    heroDescription: 'The F&I product that generates revenue, not chargebacks.',
    proof: {
      dealership: 'Brandon Honda',
      dealershipDescription: 'High-Volume Honda Dealer',
      metric: '$308K/month F&I revenue',
      secondaryMetric: 'Zero chargebacks',
      tertiaryMetric: '100% dealer-branded app',
      quote: 'VehicleVault transformed our F&I revenue. Customers love it, they actually use it, and we\'ve never had a chargeback.',
      quotePerson: 'F&I Director',
      quoteTitle: 'Brandon Honda',
    },
    painPoints: [
      'F&I products with high chargebacks',
      'Low customer engagement',
      'Need for recurring revenue streams',
    ],
    features: [
      {
        title: 'Consumer Key Tracking App',
        description: 'Your customers get a dealer-branded app to track their keys. They\'ll actually use it — unlike most F&I products.',
      },
      {
        title: 'Rewards Program',
        description: 'Built-in rewards keep customers engaged and coming back to your dealership for service.',
      },
      {
        title: 'Zero Chargeback Rate',
        description: 'Because customers actually use the product, chargebacks are effectively zero. That\'s real profit, not paper profit.',
      },
      {
        title: 'Dealer-Branded Experience',
        description: 'Your name, your logo, your colors. Customers see your brand every time they use the app.',
      },
      {
        title: 'Recurring Revenue Model',
        description: 'Monthly subscription creates predictable revenue stream beyond the initial sale.',
      },
      {
        title: 'Easy F&I Presentation',
        description: 'Customers understand key tracking. It sells itself — no complicated explanations needed.',
      },
    ],
    howItWorks: [
      { step: 'Sell', description: 'Simple F&I presentation. Customers understand the value immediately.' },
      { step: 'Activate', description: 'Customer downloads your branded app and pairs their key tracker.' },
      { step: 'Profit', description: 'Recurring revenue each month. High engagement. Zero chargebacks.' },
    ],
    stats: [
      { value: '$308K', label: 'Monthly F&I revenue', source: 'Brandon Honda' },
      { value: 'Zero', label: 'Chargebacks', source: 'All MDD Dealers' },
      { value: '100%', label: 'Dealer-branded app', source: 'Standard' },
    ],
    blogContent: {
      challenge: `F&I revenue is critical for dealership profitability, but many products come with hidden costs. High chargeback rates eat into margins. Low customer engagement means products expire unused. And explaining complicated coverage terms wastes time in the box.

Brandon Honda's F&I Director was tired of products that looked profitable on paper but disappointed in reality.

"We had products with 30-40% chargeback rates," they explain. "That's not profit — that's administrative overhead. We needed something customers would actually use."`,
      solution: `VehicleVault flipped the script on traditional F&I products. Instead of selling coverage customers hope they'll never need, Brandon Honda now sells a key tracking service customers use every day.

The product is simple: customers get a Bluetooth key tracker and a dealer-branded app to find their keys. It's utility they experience immediately, not insurance they might claim someday.

"The presentation takes 30 seconds," the F&I Director explains. "I show them the app, explain they'll never lose their keys again, and they get it instantly. No complicated terms, no coverage explanations."`,
      results: `The numbers speak for themselves:

- **$308K** in additional monthly F&I revenue
- **Zero** chargebacks across all VehicleVault sales
- **High engagement** — customers use the app weekly
- **Service retention** through integrated rewards program

"This changed our F&I strategy," the F&I Director notes. "We went from pushing products customers didn't want to offering something they actually thank us for. And the profit is real because there are no chargebacks eating into it."`,
    },
  },

  'full-platform': {
    name: 'Full Platform',
    tag: 'Mobile Dealer Data',
    tagColor: 'green',
    headline: 'One platform. Total visibility.',
    subheadline: 'Track every key and vehicle across your entire operation. Sales, service, recon, F&I — all connected.',
    heroDescription: 'The complete dealership visibility solution.',
    proof: {
      dealership: 'Bill Brown Ford',
      dealershipDescription: "World's Largest Ford Dealer",
      metric: '500+ dealerships nationwide',
      secondaryMetric: 'Complete visibility',
      tertiaryMetric: 'All departments connected',
      quote: 'MDD instantly locates 2,000 vehicles on multiple lots all over town. We get cars customer-delivered without delays.',
      quotePerson: 'Dave Bird',
      quoteTitle: 'New Car Inventory Manager',
    },
    painPoints: [
      'Disconnected systems',
      'No cross-department visibility',
      'Multiple vendors to manage',
    ],
    features: [
      {
        title: 'Unified Platform',
        description: 'One system for keys, vehicles, service, and recon. No more juggling multiple vendors and logins.',
      },
      {
        title: 'Cross-Department Visibility',
        description: 'Sales can see service status. Recon can see lot location. Everyone has the information they need.',
      },
      {
        title: 'Scalable Architecture',
        description: 'Works for single-point dealers and mega-groups alike. Add locations, add vehicles, add users — the system scales.',
      },
      {
        title: 'DMS Integration',
        description: 'Connects to your existing systems. Reynolds, CDK, and more. Data flows automatically.',
      },
      {
        title: 'Mobile-First Design',
        description: 'Full functionality on any device. Your team can track from anywhere on the property.',
      },
      {
        title: 'Enterprise Security',
        description: 'Bank-level encryption. Role-based access. Audit trails. Your data is protected.',
      },
    ],
    howItWorks: [
      { step: 'Deploy', description: 'Install gateways and tag your inventory. Full setup in days, not months.' },
      { step: 'Connect', description: 'Integrate with your DMS and existing systems. Data flows automatically.' },
      { step: 'Transform', description: 'Total visibility across every department and location.' },
    ],
    stats: [
      { value: '500+', label: 'Dealerships nationwide', source: 'MDD' },
      { value: '2M+', label: 'Vehicles tracked', source: 'MDD' },
      { value: '99.9%', label: 'Uptime', source: 'MDD' },
    ],
    blogContent: {
      challenge: `Modern dealerships run on multiple disconnected systems. Inventory management doesn't talk to service scheduling. Recon tracking is separate from lot management. And the sales team has no idea where a vehicle is until they walk the lot.

This fragmentation creates daily friction. A salesperson can't find a key. Service doesn't know a customer's vehicle is ready for pickup. Recon loses track of where a car is in the process.

Every dealership has felt this pain. Most have just accepted it as the cost of doing business.`,
      solution: `Mobile Dealer Data built a unified platform that connects every aspect of vehicle and key tracking into a single system.

Instead of managing multiple vendors with separate logins, dashboards, and support contacts, dealerships get one platform that handles everything: key location, vehicle tracking, service workflow, and reconditioning.

The integration isn't just surface-level. Data flows automatically between modules, so a vehicle moving from recon to the front line updates everywhere simultaneously.`,
      results: `Dealerships on the MDD platform report transformational results:

- **Complete visibility** across all departments and locations
- **Eliminated redundancy** from multiple tracking systems
- **Faster operations** with real-time information everywhere
- **Reduced vendor management** overhead

"Before MDD, we had four different systems trying to do pieces of this," explains one General Manager. "Now we have one platform that does it all, and does it better than any of the individual solutions did."`,
    },
  },
};

// ============================================
// MESSAGING ANGLES
// ============================================

const ANGLES = {
  'saturday-chaos': {
    name: 'Saturday Chaos',
    scenario: "It's Saturday at 11:30am. A customer is ready to buy. Nobody can find the key.",
    pain: 'Three employees searching the lot. Customer waiting awkwardly. Deal momentum dying.',
    expanded: "The showroom is packed. Your best salesperson finally has a customer who's ready to sign. They just need to do a final walk-around and the deal is done. But the key isn't on the board. It's not on any desk. Nobody remembers who had it last. Twenty minutes later, the customer's enthusiasm has cooled, their spouse is texting them about lunch, and you can feel the deal slipping away.",
  },
  'inventory-cashflow': {
    name: 'Inventory Cashflow',
    scenario: 'Every day a car sits in recon is cash sitting on the lot.',
    pain: 'No visibility into where the bottlenecks are. Holding costs piling up.',
    expanded: "That $30,000 used car you acquired two weeks ago? It's cost you $500 in floor plan interest already. But is it in mechanical? Detail? Waiting for a part? At an outside vendor? Nobody knows without making five phone calls. Meanwhile, the market is shifting, your price is getting stale, and you're paying interest on inventory you can't sell because you can't find it.",
  },
  'service-revenue': {
    name: 'Service Revenue',
    scenario: 'Express service wait times hitting 2.5 hours.',
    pain: 'Customers leaving for quick-lube competitors. CSI scores suffering.',
    expanded: "You promised express service. Thirty minutes or less. But your customers are checking the clock at 90 minutes and getting frustrated. By two hours, they're posting on Google. Your CSI scores are dropping, your quick-lube competitors are advertising 15-minute oil changes, and your service lane — the profit center that should fund your dealership — is becoming a liability.",
  },
  'lost-key-cost': {
    name: 'Lost Key Cost',
    scenario: 'Quick question. What did the last lost key cost to replace?',
    pain: '$200-500 per key. Plus the time. Plus the lost deal.',
    expanded: "Modern key fobs aren't cheap. $200-500 each, depending on the make. Plus the time to order and program. Plus the customer who couldn't test drive and bought somewhere else. Lost keys aren't just a nuisance — they're a direct hit to your bottom line that happens more often than you'd like to admit.",
  },
  'vehiclevault-profit': {
    name: 'VehicleVault Profit',
    scenario: "$308,000 per month. That's how much one dealership generates.",
    pain: 'Most F&I products have high chargebacks. Low customer engagement.',
    expanded: "F&I profit looks great on paper until the chargebacks come in. A 30% chargeback rate on a $500 product means you're keeping $350 — and spending administrative time processing refunds. What if you could sell an F&I product customers actually wanted, actually used, and never returned? That's real profit, not paper profit.",
  },
};

// ============================================
// PERSONA DATA
// ============================================

const PERSONAS = {
  'owner': {
    name: 'Owner',
    title: 'Dealer Principal',
    concerns: ['ROI', 'profitability', 'competitive advantage', 'employee efficiency'],
    language: 'bottom-line focused, strategic',
  },
  'gm': {
    name: 'GM',
    title: 'General Manager',
    concerns: ['operations', 'efficiency', 'cross-department coordination', 'customer satisfaction'],
    language: 'operational, results-driven',
  },
  'service-manager': {
    name: 'Service Manager',
    title: 'Service Director',
    concerns: ['cycle time', 'CSI scores', 'technician productivity', 'throughput'],
    language: 'process-focused, efficiency-minded',
  },
  'sales-manager': {
    name: 'Sales Manager',
    title: 'Sales Manager',
    concerns: ['closing deals', 'customer experience', 'inventory access', 'time savings'],
    language: 'deal-focused, customer-centric',
  },
  'fi-manager': {
    name: 'F&I Manager',
    title: 'F&I Director',
    concerns: ['per-deal profit', 'product penetration', 'chargebacks', 'compliance'],
    language: 'profit-focused, presentation-minded',
  },
  'used-car-manager': {
    name: 'Used Car Manager',
    title: 'Used Car Manager',
    concerns: ['time-to-line', 'holding costs', 'turn rate', 'recon efficiency'],
    language: 'inventory-focused, cost-conscious',
  },
};

// ============================================
// CSS STYLES (MDD Brand)
// ============================================

const MDD_STYLES = `
:root {
  --green:#8AC833;--green-dark:#5E970F;--green-glow:rgba(138,200,51,0.15);--green-soft:#EEF7E0;
  --charcoal:#1A1E24;--card:#22272E;--card-border:#2D3239;
  --white:#FFFFFF;--off-white:#F5F6F4;--body:#9CA3AF;--muted:#6B7280;--gold:#F59E0B;--red:#EF4444;
}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:'DM Sans',system-ui,sans-serif;background:var(--charcoal);color:var(--body);overflow-x:hidden;}

nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(26,30,36,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--card-border);}
nav .inner{max-width:1100px;margin:auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;}
nav .logo{font-weight:800;font-size:20px;color:var(--white);letter-spacing:-0.3px;}
nav .logo span{color:var(--green);}
nav .logo small{font-size:11px;font-weight:400;color:var(--muted);margin-left:8px;}
nav .nav-cta{background:var(--green);color:var(--charcoal);font-weight:700;font-size:14px;padding:10px 24px;border-radius:8px;text-decoration:none;transition:all 0.2s;}
nav .nav-cta:hover{background:var(--green-dark);color:var(--white);}

.hero{padding:140px 24px 80px;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,var(--green-glow) 0%,transparent 70%);pointer-events:none;}
.hero .inner{max-width:1100px;margin:auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;}
.hero .tag{display:inline-block;background:var(--green-glow);border:1px solid rgba(138,200,51,0.25);color:var(--green);font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:20px;font-family:'Space Mono',monospace;}
.hero .tag.gold{background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.25);color:var(--gold);}
.hero h1{font-size:clamp(32px,4vw,48px);font-weight:800;color:var(--white);line-height:1.1;margin-bottom:16px;letter-spacing:-1px;}
.hero h1 em{font-style:normal;color:var(--green);}
.hero h1 em.gold{color:var(--gold);}
.hero .sub{font-size:17px;color:var(--body);margin-bottom:28px;line-height:1.6;}

.btn-primary{background:var(--green);color:var(--charcoal);font-weight:700;font-size:16px;padding:16px 36px;border-radius:10px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all 0.25s;box-shadow:0 4px 24px rgba(138,200,51,0.3);}
.btn-primary:hover{background:var(--green-dark);color:var(--white);transform:translateY(-2px);box-shadow:0 8px 32px rgba(138,200,51,0.4);}
.btn-outline{border:2px solid var(--card-border);color:var(--white);font-weight:600;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;transition:all 0.2s;margin-left:14px;}
.btn-outline:hover{border-color:var(--green);color:var(--green);}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;}

.section-tag{font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;}
.container{max-width:1100px;margin:auto;padding:0 24px;}

.pain-strip{background:var(--card);border-top:1px solid var(--card-border);border-bottom:1px solid var(--card-border);padding:32px 24px;}
.pain-strip .inner{max-width:900px;margin:auto;text-align:center;}
.pain-strip h2{font-size:20px;color:var(--white);font-weight:700;margin-bottom:8px;}
.pain-strip p{font-size:15px;color:var(--muted);line-height:1.6;}
.pain-items{display:flex;gap:32px;justify-content:center;margin-top:20px;flex-wrap:wrap;}
.pain-item{font-family:'Space Mono',monospace;font-size:13px;color:var(--gold);}
.pain-item::before{content:'▸ ';}

.stats{padding:60px 24px;background:var(--charcoal);}
.stats .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:auto;}
.stat-card{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:28px 20px;text-align:center;transition:all 0.3s;}
.stat-card:hover{border-color:var(--green);transform:translateY(-4px);}
.stat-card .num{font-size:40px;font-weight:800;color:var(--green);font-family:'Space Mono',monospace;line-height:1;}
.stat-card .num.gold{color:var(--gold);}
.stat-card .label{font-size:13px;color:var(--muted);margin-top:8px;}
.stat-card .dealer{font-size:11px;color:var(--green-dark);margin-top:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;}

.how{padding:80px 24px;background:var(--off-white);}
.how h2{font-size:36px;font-weight:800;color:var(--charcoal);margin-bottom:40px;}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;}
.step-num{width:44px;height:44px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:var(--charcoal);margin-bottom:14px;}
.step h3{font-size:18px;font-weight:700;color:var(--charcoal);margin-bottom:8px;}
.step p{font-size:14px;color:var(--muted);line-height:1.6;}

.features{padding:80px 24px;background:var(--charcoal);}
.features h2{font-size:32px;font-weight:800;color:var(--white);margin-bottom:40px;}
.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:900px;margin:auto;}
.feature-card{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:24px;transition:all 0.3s;}
.feature-card:hover{border-color:var(--green);background:#262B32;}
.feature-card h3{font-size:16px;font-weight:700;color:var(--white);margin-bottom:6px;}
.feature-card p{font-size:14px;color:var(--muted);line-height:1.5;}

.testimonial{padding:80px 24px;background:var(--card);border-top:1px solid var(--card-border);border-bottom:1px solid var(--card-border);}
.testimonial .inner{max-width:800px;margin:auto;text-align:center;}
.testimonial .quote-mark{font-size:48px;color:var(--green);font-family:Georgia,serif;opacity:0.4;margin-bottom:8px;}
.testimonial blockquote{font-size:20px;color:var(--white);font-style:italic;line-height:1.5;margin-bottom:20px;}
.testimonial .author{font-size:14px;font-weight:700;color:var(--green);}
.testimonial .author-role{font-size:13px;color:var(--muted);}

.cta-section{padding:80px 24px;background:var(--charcoal);text-align:center;position:relative;}
.cta-section::before{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(circle,var(--green-glow) 0%,transparent 70%);pointer-events:none;}
.cta-section h2{font-size:36px;font-weight:800;color:var(--white);margin-bottom:12px;}
.cta-section p{font-size:16px;color:var(--body);max-width:500px;margin:0 auto 32px;line-height:1.6;}
.cta-section .phone{font-family:'Space Mono',monospace;font-size:14px;color:var(--muted);margin-top:20px;}
.cta-section .phone a{color:var(--green);text-decoration:none;}

footer{padding:32px 24px;background:var(--card);border-top:1px solid var(--card-border);text-align:center;}
footer .brand{font-weight:800;font-size:16px;color:var(--white);}
footer .brand span{color:var(--green);}
footer .links{margin-top:10px;font-size:12px;color:var(--muted);}
footer .links a{color:var(--muted);text-decoration:none;margin:0 8px;}
footer .links a:hover{color:var(--green);}

@media(max-width:768px){
  .hero .inner{grid-template-columns:1fr;}
  .feature-grid,.steps,.stats .grid{grid-template-columns:1fr !important;}
  .pain-items{flex-direction:column;gap:12px;}
}
`;

// ============================================
// CONTENT GENERATOR CLASS
// ============================================

class ContentGenerator {
  constructor(config) {
    this.config = config;
    this.product = PRODUCTS[config.product];
    this.angle = ANGLES[config.angle];
    this.persona = PERSONAS[config.persona];

    if (!this.product) throw new Error(`Unknown product: ${config.product}`);
    if (!this.angle) throw new Error(`Unknown angle: ${config.angle}`);
    if (!this.persona) throw new Error(`Unknown persona: ${config.persona}`);
  }

  /**
   * Generate content for a specific type
   */
  async generate(contentType, campaignDir) {
    switch (contentType) {
      case 'landing-page':
        return this.generateLandingPage(campaignDir);
      case 'blog-post':
        return this.generateBlogPost(campaignDir);
      case 'linkedin-post':
        return this.generateLinkedInPosts(campaignDir);
      case 'facebook-post':
        return this.generateFacebookPosts(campaignDir);
      case 'linkedin-article':
        return this.generateLinkedInArticle(campaignDir);
      case 'email-sequence':
        return this.generateEmailSequence(campaignDir);
      case 'press-release':
        return this.generatePressRelease(campaignDir);
      case 'one-pager':
        return this.generateOnePager(campaignDir);
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  }

  // ============================================
  // LANDING PAGE
  // ============================================

  async generateLandingPage(campaignDir) {
    const filename = 'landing-page.html';
    const filePath = path.join(campaignDir, 'content', filename);
    const content = this.createLandingPageContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'landing-page',
      file: `content/${filename}`,
      title: this.product.headline,
      slug: this.config.campaignId,
      seo: {
        title_tag: `${this.product.name} | Mobile Dealer Data`,
        meta_description: `${this.angle.scenario} ${this.product.headline}`,
      },
    }];
  }

  createLandingPageContent() {
    const tagClass = this.product.tagColor === 'gold' ? ' gold' : '';
    const emClass = this.product.tagColor === 'gold' ? ' class="gold"' : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.product.name} — ${this.product.headline} | Mobile Dealer Data</title>
  <meta name="description" content="${this.product.subheadline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${MDD_STYLES}</style>
</head>
<body>
  <nav>
    <div class="inner">
      <div class="logo">Vehicle<span>Vault</span> <small>by Mobile Dealer Data</small></div>
      <a href="#demo" class="nav-cta">Book a Demo</a>
    </div>
  </nav>

  <section class="hero">
    <div class="inner">
      <div>
        <div class="tag${tagClass}">${this.product.tag}</div>
        <h1>${this.product.headline.replace(/\.$/, '').split(' ').slice(0, -1).join(' ')} <em${emClass}>${this.product.headline.replace(/\.$/, '').split(' ').slice(-1)[0]}.</em></h1>
        <p class="sub">${this.product.subheadline}</p>
        <div class="cta-row">
          <a href="#demo" class="btn-primary">Schedule a 15-Min Demo →</a>
          <a href="#how" class="btn-outline">See How It Works</a>
        </div>
      </div>
      <div class="hero-img">
        <!-- Hero image placeholder -->
      </div>
    </div>
  </section>

  <section class="pain-strip">
    <div class="inner">
      <h2>Sound familiar?</h2>
      <p>${this.angle.scenario}</p>
      <div class="pain-items">
        ${this.product.painPoints.map(p => `<span class="pain-item">${p}</span>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="stats">
    <div class="grid">
      ${this.product.stats.map((stat, i) => `
      <div class="stat-card">
        <div class="num${i === 0 && this.product.tagColor === 'gold' ? ' gold' : ''}">${stat.value}</div>
        <div class="label">${stat.label}</div>
        <div class="dealer">${stat.source}</div>
      </div>`).join('')}
    </div>
  </section>

  <section class="how" id="how">
    <div class="container">
      <div class="section-tag" style="color:var(--green-dark);">How It Works</div>
      <h2>Three steps. Zero guesswork.</h2>
      <div class="steps">
        ${this.product.howItWorks.map((step, i) => `
        <div class="step">
          <div class="step-num">${i + 1}</div>
          <h3>${step.step}</h3>
          <p>${step.description}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="features">
    <div class="container">
      <div class="section-tag" style="color:var(--green);">What You Get</div>
      <h2>Built for real dealership operations.</h2>
      <div class="feature-grid">
        ${this.product.features.map(f => `
        <div class="feature-card">
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="testimonial">
    <div class="inner">
      <div class="quote-mark">"</div>
      <blockquote>${this.product.proof.quote}</blockquote>
      <div class="author">${this.product.proof.quotePerson}</div>
      <div class="author-role">${this.product.proof.quoteTitle} — ${this.product.proof.dealership}</div>
    </div>
  </section>

  <section class="cta-section" id="demo">
    <h2>See it in 15 minutes.</h2>
    <p>We'll show you exactly how ${this.product.name} works on a live dealership. No commitment. No pressure.</p>
    <a href="https://mdd.io/demo" class="btn-primary">Schedule Your Demo →</a>
    <div class="phone">Or call: <a href="tel:8442927110">844-292-7110</a></div>
  </section>

  <footer>
    <div class="brand">Vehicle<span>Vault</span></div>
    <div class="links">
      <a href="https://mdd.io">mdd.io</a> | We Find Keys & Cars™ | <a href="tel:8442927110">844-292-7110</a>
    </div>
  </footer>
</body>
</html>`;
  }

  // ============================================
  // BLOG POST
  // ============================================

  async generateBlogPost(campaignDir) {
    const filename = 'blog-post.md';
    const filePath = path.join(campaignDir, 'content', filename);
    const content = this.createBlogPostContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'blog-post',
      file: `content/${filename}`,
      title: `How ${this.product.proof.dealership} Achieved ${this.product.proof.metric}`,
      slug: `${this.config.campaignId}-case-study`,
      seo: {
        title_tag: `${this.product.proof.dealership} Case Study | Mobile Dealer Data`,
        meta_description: `Learn how ${this.product.proof.dealership} achieved ${this.product.proof.metric} with MDD's ${this.product.name} solution.`,
      },
    }];
  }

  createBlogPostContent() {
    const blogData = this.product.blogContent;

    return `---
title: "How ${this.product.proof.dealership} Achieved ${this.product.proof.metric}"
campaign_id: ${this.config.campaignId}
product: ${this.config.product}
author: Mobile Dealer Data
date: ${new Date().toISOString().split('T')[0]}
featured_image: /images/${this.config.product}-hero.jpg
meta_description: Learn how ${this.product.proof.dealership} achieved ${this.product.proof.metric} with MDD's ${this.product.name} solution.
tags:
  - Case Study
  - ${this.product.name}
  - ${this.product.proof.dealership}
---

# How ${this.product.proof.dealership} Achieved ${this.product.proof.metric}

*${this.product.proof.dealershipDescription} transforms operations with MDD ${this.product.name}*

---

${this.angle.scenario}

${this.angle.pain}

It's a scene that plays out at dealerships across the country. But ${this.product.proof.dealership} decided they were done accepting it.

## The Challenge

${blogData.challenge}

## The Solution

${blogData.solution}

## The Results

${blogData.results}

## What This Means For Your Dealership

${this.product.proof.dealership} isn't unique. The challenges they faced are the same challenges dealerships everywhere deal with daily. What made the difference was deciding to solve the problem instead of accepting it.

The technology exists. The ROI is proven. The only question is whether you're ready to stop searching and start selling.

---

## Ready to See Similar Results?

Join ${this.product.proof.dealership} and 500+ other dealerships that have transformed their operations with MDD.

**[Schedule a 15-Minute Demo →](https://mdd.io/demo)**

Or call us: **844-292-7110**

---

*${this.product.proof.dealership} is a real MDD customer. Results may vary based on dealership size, processes, and implementation.*
`;
  }

  // ============================================
  // LINKEDIN POSTS
  // ============================================

  async generateLinkedInPosts(campaignDir) {
    const posts = [];
    const postCount = this.config.socialPostCount || 3;

    for (let i = 1; i <= postCount; i++) {
      const filename = `linkedin-post-${i}.md`;
      const filePath = path.join(campaignDir, 'content', 'social', filename);
      const content = this.createLinkedInPostContent(i, postCount);
      fs.writeFileSync(filePath, content);

      posts.push({
        type: 'linkedin-post',
        file: `content/social/${filename}`,
        title: `LinkedIn Post ${i}`,
      });
    }

    return posts;
  }

  createLinkedInPostContent(postNumber, totalPosts) {
    // Different post structures for variety
    const postTemplates = [
      // Post 1: Scenario-first
      () => `${this.angle.scenario}

${this.angle.pain}

${this.product.proof.dealership} solved this problem.

After implementing ${this.product.name.toLowerCase()} tracking, they achieved:
→ ${this.product.proof.metric}
→ ${this.product.proof.secondaryMetric}

The secret wasn't complicated. It was visibility.

When you know exactly where every ${this.config.product.includes('key') ? 'key' : 'vehicle'} is, the chaos disappears.

Worth a 15-minute conversation?

#AutomotiveRetail #DealershipLife #Efficiency`,

      // Post 2: Stat-first
      () => `${this.product.proof.metric}.

That's not a typo.

That's what ${this.product.proof.dealership} (${this.product.proof.dealershipDescription}) achieved with real-time ${this.product.name.toLowerCase()}.

Before: ${this.angle.pain}

After: ${this.product.proof.secondaryMetric}

The difference? Complete visibility into ${this.config.product.includes('key') ? 'every key and vehicle' : 'their entire operation'}.

If your ${this.persona.title.toLowerCase()} team is still searching instead of selling, there's a better way.

#Automotive #DealershipManagement #Operations`,

      // Post 3: Question-first
      () => `Quick question for ${this.persona.title}s:

How much time did your team spend searching for ${this.config.product.includes('key') ? 'keys' : 'vehicles'} last week?

Be honest.

${this.product.proof.dealership} asked themselves the same question. The answer was uncomfortable.

So they fixed it.

Now: ${this.product.proof.metric}

The technology is simple. The ROI is immediate. The only question is whether you're ready to stop accepting the chaos.

DM me if you want to see how it works.

#AutomotiveIndustry #DealerSuccess #OperationalExcellence`,

      // Post 4: Story format
      () => `Here's what happened at ${this.product.proof.dealership} last Saturday:

Customer walks in ready to buy.
Salesperson pulls up the app.
Finds the key in 30 seconds.
Customer drives off the lot in their new car.

Total time wasted searching: Zero.

This used to be different.

${this.angle.scenario}

${this.angle.pain}

Now? ${this.product.proof.metric}.

That's the difference real-time visibility makes.

#AutoDealership #CustomerExperience #DealershipOperations`,

      // Post 5: Contrarian take
      () => `Unpopular opinion:

Lost keys aren't a "dealership problem."

They're a visibility problem.

${this.product.proof.dealership} proved it.

They didn't hire more people.
They didn't buy more key boxes.
They didn't yell louder.

They got visibility.

Result: ${this.product.proof.metric}

Sometimes the solution isn't more effort. It's better information.

#DealershipLife #AutomotiveRetail #Efficiency`,
    ];

    const postIndex = (postNumber - 1) % postTemplates.length;
    const postContent = postTemplates[postIndex]();

    return `---
campaign_id: ${this.config.campaignId}
post_number: ${postNumber}
total_posts: ${totalPosts}
platform: linkedin
character_count: ${postContent.length}
---

# LinkedIn Post ${postNumber}

${postContent}
`;
  }

  // ============================================
  // FACEBOOK POSTS
  // ============================================

  async generateFacebookPosts(campaignDir) {
    const posts = [];
    const postCount = this.config.socialPostCount || 3;

    for (let i = 1; i <= postCount; i++) {
      const filename = `facebook-post-${i}.md`;
      const filePath = path.join(campaignDir, 'content', 'social', filename);
      const content = this.createFacebookPostContent(i, postCount);
      fs.writeFileSync(filePath, content);

      posts.push({
        type: 'facebook-post',
        file: `content/social/${filename}`,
        title: `Facebook Post ${i}`,
      });
    }

    return posts;
  }

  createFacebookPostContent(postNumber, totalPosts) {
    // Shorter, punchier posts for Facebook
    const postTemplates = [
      // Post 1: Result-focused
      () => `${this.product.proof.metric}. 🎯

That's what ${this.product.proof.dealership} achieved with MDD ${this.product.name}.

${this.angle.scenario}

See how they did it → [LINK]`,

      // Post 2: Problem-solution
      () => `${this.angle.scenario}

${this.product.proof.dealership} fixed this.

Now: ${this.product.proof.metric}

15-minute demo shows you how → [LINK]`,

      // Post 3: Social proof
      () => `Join 500+ dealerships that have stopped searching and started selling.

${this.product.proof.dealership}: ${this.product.proof.metric}

Your turn? → [LINK]`,

      // Post 4: Question
      () => `How much time does your team waste searching for ${this.config.product.includes('key') ? 'keys' : 'vehicles'} every day?

${this.product.proof.dealership} cut that to nearly zero.

Here's how → [LINK]`,

      // Post 5: Quote
      () => `"${this.product.proof.quote}"

— ${this.product.proof.quotePerson}, ${this.product.proof.dealership}

See how they did it → [LINK]`,
    ];

    const postIndex = (postNumber - 1) % postTemplates.length;
    const postContent = postTemplates[postIndex]();

    return `---
campaign_id: ${this.config.campaignId}
post_number: ${postNumber}
total_posts: ${totalPosts}
platform: facebook
character_count: ${postContent.length}
---

# Facebook Post ${postNumber}

${postContent}
`;
  }

  // ============================================
  // LINKEDIN ARTICLE
  // ============================================

  async generateLinkedInArticle(campaignDir) {
    const filename = 'linkedin-article.md';
    const filePath = path.join(campaignDir, 'content', filename);
    const content = this.createLinkedInArticleContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'linkedin-article',
      file: `content/${filename}`,
      title: `How ${this.product.proof.dealership} Solved the ${this.angle.name} Problem`,
    }];
  }

  createLinkedInArticleContent() {
    const blogData = this.product.blogContent;

    return `---
campaign_id: ${this.config.campaignId}
type: linkedin-article
title: "How ${this.product.proof.dealership} Eliminated the ${this.angle.name} Problem"
subtitle: "A case study in operational visibility"
author: Mobile Dealer Data
---

# How ${this.product.proof.dealership} Eliminated the ${this.angle.name} Problem

*${this.product.proof.dealershipDescription} transforms their operation with a simple change*

---

${this.angle.scenario}

${this.angle.expanded}

Sound familiar? You're not alone. This scenario plays out thousands of times daily at dealerships across the country. Most managers have simply accepted it as the cost of doing business.

But ${this.product.proof.dealership} decided they were done accepting it.

## The Problem Nobody Talks About

${blogData.challenge}

The math was stark. At scale, these inefficiencies weren't just annoying — they were expensive.

## The Solution That Changed Everything

${blogData.solution}

## The Results That Proved It

${blogData.results}

## What This Means For You

Here's the uncomfortable truth: the technology to solve this problem exists today. It's proven. It's affordable. The only barrier is deciding to stop accepting the status quo.

${this.product.proof.dealership} made that decision. Now they've achieved ${this.product.proof.metric} — and they're not looking back.

The question isn't whether this could work at your dealership. It's whether you're ready to find out.

---

**Want to see how this could work for you?**

We show dealerships exactly how ${this.product.name} works in a 15-minute demo. No commitment, no pressure — just a look at what's possible.

[Schedule a Demo](https://mdd.io/demo) | Call: 844-292-7110

---

#AutomotiveRetail #DealershipOperations #Efficiency #CaseStudy
`;
  }

  // ============================================
  // EMAIL SEQUENCE
  // ============================================

  async generateEmailSequence(campaignDir) {
    const emails = [];
    const emailCount = this.config.emailCount || 5;

    for (let i = 1; i <= emailCount; i++) {
      const filename = `email-${i}.md`;
      const filePath = path.join(campaignDir, 'content', 'email', filename);
      const content = this.createEmailContent(i, emailCount);
      fs.writeFileSync(filePath, content);

      emails.push({
        type: 'email',
        file: `content/email/${filename}`,
        title: `Email ${i} of ${emailCount}`,
        day: (i - 1) * 3,
      });
    }

    return emails;
  }

  createEmailContent(emailNumber, totalEmails) {
    const emailData = this.getEmailData(emailNumber, totalEmails);

    return `---
campaign_id: ${this.config.campaignId}
email_number: ${emailNumber}
total_emails: ${totalEmails}
email_type: ${emailData.type}
persona: ${this.config.persona}
subject: "${emailData.subject}"
preview_text: "${emailData.preview}"
send_day: ${(emailNumber - 1) * 3}
---

# Email ${emailNumber}: ${emailData.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}

**Subject:** ${emailData.subject}

**Preview:** ${emailData.preview}

---

${emailData.body}

---

${emailData.signature}
`;
  }

  getEmailData(emailNumber, totalEmails) {
    const emails = [
      // Email 1: Scenario hook
      {
        type: 'scenario-hook',
        subject: this.angle.scenario.split('.')[0],
        preview: this.angle.pain.split('.')[0],
        body: `Hi {{FirstName}},

${this.angle.scenario}

${this.angle.pain}

I see this at dealerships every week. And I've seen how the best ones solve it.

${this.product.proof.dealership} had the same problem. Now they've achieved ${this.product.proof.metric}.

Over the next few emails, I'll show you exactly how they did it — and how you could too.

Talk soon,`,
        signature: `{{SenderName}}
Mobile Dealer Data
844-292-7110`,
      },

      // Email 2: Industry trend
      {
        type: 'industry-trend',
        subject: `What ${this.product.proof.dealership} figured out`,
        preview: 'The dealerships pulling ahead right now...',
        body: `Hi {{FirstName}},

The dealerships pulling ahead right now aren't doing anything revolutionary.

They're eliminating small inefficiencies before they compound into big problems.

${this.product.proof.dealership} is a good example.

They noticed their team was spending 15-30 minutes finding ${this.config.product.includes('key') ? 'keys' : 'vehicles'} multiple times per day. At their volume, that added up to hours of lost productivity daily.

So they fixed it.

Result: ${this.product.proof.metric}.

The technology was simple. The hard part was admitting they had a problem worth solving.

More on how they did it in my next email.`,
        signature: `{{SenderName}}
Mobile Dealer Data`,
      },

      // Email 3: Solution explanation
      {
        type: 'solution-explanation',
        subject: 'How it actually works',
        preview: 'No complicated setup...',
        body: `Hi {{FirstName}},

Let me show you exactly how ${this.product.proof.dealership} solved their ${this.angle.name.toLowerCase()} problem.

**The Setup (took less than a day):**
${this.product.howItWorks.map((step, i) => `${i + 1}. ${step.step}: ${step.description}`).join('\n')}

**What Changed:**
- No more searching. They know exactly where everything is.
- No behavior change required. The system tracks automatically.
- Real-time visibility from any device.

**The Result:**
${this.product.proof.metric}

The technology isn't complicated. It's just visibility — knowing where everything is, all the time.

Would it make sense to see how this could work at {{Company}}?`,
        signature: `{{SenderName}}
Mobile Dealer Data
844-292-7110`,
      },

      // Email 4: Case study deep dive
      {
        type: 'case-study',
        subject: `${this.product.proof.metric} — here's the full story`,
        preview: `How ${this.product.proof.dealership} did it...`,
        body: `Hi {{FirstName}},

I promised to show you how ${this.product.proof.dealership} achieved ${this.product.proof.metric}.

Here's the full story:

**Before MDD:**
${this.angle.expanded.split('.').slice(0, 2).join('.')}...

**The Change:**
They implemented real-time ${this.product.name.toLowerCase()} across their entire operation. Every ${this.config.product.includes('key') ? 'key and vehicle' : 'vehicle'} is tracked automatically.

**After MDD:**
"${this.product.proof.quote}"
— ${this.product.proof.quotePerson}, ${this.product.proof.quoteTitle}

**The Numbers:**
→ ${this.product.proof.metric}
→ ${this.product.proof.secondaryMetric}
→ ${this.product.proof.tertiaryMetric}

The ROI was immediate. The only question is why they didn't do it sooner.

Interested in seeing your own numbers?`,
        signature: `{{SenderName}}
Mobile Dealer Data`,
      },

      // Email 5: Soft CTA
      {
        type: 'soft-cta',
        subject: 'Worth a quick look?',
        preview: '15 minutes. No commitment.',
        body: `Hi {{FirstName}},

Over the past couple weeks, I've shared how dealerships like ${this.product.proof.dealership} are solving the ${this.angle.name.toLowerCase()} problem.

Quick recap:
→ ${this.product.proof.metric}
→ ${this.product.proof.secondaryMetric}
→ Setup takes less than a day

Would it make sense to see how this could work at {{Company}}?

I can show you exactly how it works in 15 minutes. No commitment, no pressure — just a look at what's possible.

If the timing isn't right, no worries. But if you're curious, I'd love to show you.

Either way, I appreciate you reading these emails.`,
        signature: `Best,

{{SenderName}}
Mobile Dealer Data
844-292-7110

P.S. — If you'd rather just call, we're at 844-292-7110.`,
      },
    ];

    // For sequences longer than 5, add more follow-up emails
    if (emailNumber > 5) {
      const followUpTemplates = [
        {
          type: 'follow-up-value',
          subject: 'One more thing about ${this.product.name.toLowerCase()}...',
          preview: 'Something I forgot to mention...',
          body: `Hi {{FirstName}},

One thing I didn't mention in my previous emails:

${this.product.features[0].title}: ${this.product.features[0].description}

This is what makes the ROI so fast. It's not just about finding things — it's about never having to look in the first place.

Still interested in seeing a demo?`,
          signature: `{{SenderName}}`,
        },
        {
          type: 'follow-up-social-proof',
          subject: 'Join 500+ dealerships',
          preview: 'You\'d be in good company...',
          body: `Hi {{FirstName}},

Just a quick note — MDD is now used by over 500 dealerships nationwide.

From single-point stores to the largest dealer groups in the country, they've all discovered the same thing: visibility changes everything.

${this.product.proof.dealership} was one of them. Their results: ${this.product.proof.metric}.

Your dealership could be next.

15-minute demo shows you exactly how it works.`,
          signature: `{{SenderName}}
844-292-7110`,
        },
        {
          type: 'follow-up-question',
          subject: 'Quick question',
          preview: 'Wondering if...',
          body: `Hi {{FirstName}},

I've sent a few emails about how dealerships are solving the ${this.angle.name.toLowerCase()} problem.

Wondering — is this something you're dealing with at {{Company}}?

If so, happy to show you how ${this.product.proof.dealership} and others have solved it.

If not, no worries — I'll stop filling your inbox.

Either way, let me know?`,
          signature: `{{SenderName}}`,
        },
      ];

      const templateIndex = (emailNumber - 6) % followUpTemplates.length;
      return followUpTemplates[templateIndex];
    }

    return emails[emailNumber - 1];
  }

  // ============================================
  // PRESS RELEASE
  // ============================================

  async generatePressRelease(campaignDir) {
    const filename = 'press-release.md';
    const filePath = path.join(campaignDir, 'content', filename);
    const content = this.createPressReleaseContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'press-release',
      file: `content/${filename}`,
      title: `${this.product.proof.dealership} Achieves ${this.product.proof.metric} with MDD`,
    }];
  }

  createPressReleaseContent() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return `---
campaign_id: ${this.config.campaignId}
type: press-release
embargo: none
---

**FOR IMMEDIATE RELEASE**

# ${this.product.proof.dealership} Achieves ${this.product.proof.metric} with Mobile Dealer Data's ${this.product.name} Solution

*${this.product.proof.dealershipDescription} Transforms Operations with Real-Time Tracking Technology*

**DETROIT, MI — ${dateStr}** — Mobile Dealer Data (MDD), the leading provider of real-time vehicle and key tracking solutions for automotive dealerships, today announced that ${this.product.proof.dealership} has achieved ${this.product.proof.metric} following implementation of MDD's ${this.product.name} solution.

"${this.product.proof.quote}" said ${this.product.proof.quotePerson}, ${this.product.proof.quoteTitle} at ${this.product.proof.dealership}.

${this.product.proof.dealership}, ${this.product.proof.dealershipDescription.toLowerCase()}, implemented MDD's ${this.product.name} solution to address operational challenges common across the automotive retail industry. The solution provides real-time visibility into ${this.config.product.includes('key') ? 'key and vehicle locations' : 'vehicle locations and workflow status'} across all dealership properties.

**Key Results:**

- ${this.product.proof.metric}
- ${this.product.proof.secondaryMetric}
- ${this.product.proof.tertiaryMetric}

"${this.product.proof.dealership} represents exactly the kind of operational transformation we see when dealerships commit to visibility," said a Mobile Dealer Data spokesperson. "The technology is straightforward — what matters is the results, and ${this.product.proof.dealership} has achieved exceptional outcomes."

MDD's ${this.product.name} solution is currently deployed at over 500 dealerships nationwide, including many of the largest automotive retailers in the country.

**About Mobile Dealer Data**

Mobile Dealer Data (MDD) provides real-time vehicle and key tracking solutions for automotive dealerships. The company's LocateIQ technology delivers sub-foot accuracy and automated workflow updates, helping dealerships eliminate inefficiencies and improve customer experience. MDD serves over 500 dealerships nationwide, tracking more than 2 million vehicles.

For more information, visit [mdd.io](https://mdd.io) or call 844-292-7110.

###

**Media Contact:**

Media Relations
Mobile Dealer Data
press@mdd.io
844-292-7110
`;
  }

  // ============================================
  // ONE-PAGER
  // ============================================

  async generateOnePager(campaignDir) {
    const filename = 'one-pager.md';
    const filePath = path.join(campaignDir, 'content', filename);
    const content = this.createOnePagerContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'one-pager',
      file: `content/${filename}`,
      title: `${this.product.name} One-Pager`,
    }];
  }

  createOnePagerContent() {
    return `---
campaign_id: ${this.config.campaignId}
type: one-pager
product: ${this.config.product}
format: PDF-ready
---

# ${this.product.name}

## ${this.product.headline}

---

### THE CHALLENGE

${this.angle.scenario}

${this.angle.pain}

**The Cost:**
- Lost productivity: Hours per day spent searching
- Lost deals: Customers who won't wait
- Lost money: ${this.config.product.includes('key') ? '$200-500 per lost key' : 'Holding costs adding up daily'}

---

### THE SOLUTION

${this.product.heroDescription}

**How It Works:**
${this.product.howItWorks.map((step, i) => `${i + 1}. **${step.step}:** ${step.description}`).join('\n')}

**Key Features:**
${this.product.features.slice(0, 4).map(f => `- **${f.title}:** ${f.description}`).join('\n')}

---

### THE RESULTS

**${this.product.proof.dealership}** — ${this.product.proof.dealershipDescription}

| Metric | Result |
|--------|--------|
| ${this.product.stats[0].label} | **${this.product.stats[0].value}** |
| ${this.product.stats[1].label} | **${this.product.stats[1].value}** |
| ${this.product.stats[2].label} | **${this.product.stats[2].value}** |

> "${this.product.proof.quote}"
>
> — **${this.product.proof.quotePerson}**, ${this.product.proof.quoteTitle}

---

### WHY MDD

- **500+ dealerships** nationwide trust MDD
- **Sub-foot accuracy** — know exactly where everything is
- **Zero behavior change** — tracking happens automatically
- **Rapid deployment** — up and running in days, not months

---

### READY TO STOP SEARCHING?

**Schedule a 15-minute demo** to see ${this.product.name} in action.

🌐 **mdd.io/demo**
📞 **844-292-7110**
📧 **info@mdd.io**

---

*Mobile Dealer Data — We Find Keys & Cars™*
`;
  }
}

module.exports = ContentGenerator;
