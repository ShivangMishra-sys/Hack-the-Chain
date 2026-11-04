export const siteContent = {
  meta: {
    edition: 'HACKATHON 2026',
    editionNumber: '04',
    title: 'HACK THE CHAIN',
    tagline: 'You broke the chain. Now build what’s next.',
    dates: 'OCTOBER 24-26, 2026',
    venue: 'CENTRAL AUDITORIUM & INNOVATION HUB',
    duration: '36 HOURS',
    totalPrizePool: 'Rs 1,00,000',
  },
  nav: {
    brand: 'HTC://2026',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Tracks', href: '#tracks' },
      { label: 'Timeline', href: '#timeline' },
      { label: 'Prizes', href: '#prizes' },
      { label: 'Sponsors', href: '#sponsors' },
      { label: 'FAQ', href: '#faq' },
    ],
    registerCta: 'REGISTER NOW',
  },
  hero: {
    subtext: 'A 36-hour collegiate crucible for hackers, cryptographers, and builders.',
    cta: 'Hack the Chain',
  },
  stats: [
    { targetNum: 36, suffix: '', unit: 'HOURS', label: 'Continuous Innovation' },
    { targetNum: 500, suffix: '+', unit: 'HACKERS', label: 'From 60+ Campuses' },
    { targetNum: 10, suffix: '+', unit: 'MENTORS', label: 'Industry Architects' },
    { targetNum: 100000, prefix: 'Rs ', suffix: '', unit: 'PRIZE POOL', label: 'Cash & Bounties' },
  ],
  about: {
    tag: '// 01. THE CODEX',
    heading: 'BREAK THE MONOLITH. REDEFINE THE STACK.',
    clubName: 'BLOCKCHAIN & DEVELOPER STUDENT CLUB',
    body1:
      'HACK THE CHAIN is the flagship annual crucible hosted by the collegiate Developer & Web3 Society. Conceived to challenge conventional hackathon dogma, we bring together the sharpest coders, systems designers, and cryptographers.',
    body2:
      'For 36 uninterrupted hours, teams operate at the edge of computation — from decentralized consensus protocols to neural agents and hardware enclaves. Our mentors and alumni from premier tech firms guide you directly through deployment.',
    quote: '“We do not adapt to systems that bind us. We break them and build the successor.”',
  },
  tracks: [
    {
      id: 'TRACK // 01',
      title: 'Blockchain & Web3',
      description:
        'Zero-knowledge cryptography, decentralized physical infrastructure (DePIN), sovereign rollups, and verifiable smart contract systems.',
      tags: ['ZK-Rollups', 'Cross-Chain', 'Smart Contracts', 'DePIN'],
      codeSnippet: 'fn verify_snark(proof: &Proof) -> bool',
    },
    {
      id: 'TRACK // 02',
      title: 'AI & Machine Learning',
      description:
        'Autonomous multi-agent swarms, on-device edge neural inference, alignment guarantees, and multimodal generative pipelines.',
      tags: ['Autonomous Agents', 'Edge ML', 'RAG', 'Neuro-symbolic'],
      codeSnippet: 'model.eval().quantize(bits=4)',
    },
    {
      id: 'TRACK // 03',
      title: 'Cybersecurity & Defense',
      description:
        'Kernel exploit defense, formal cryptographic verification, hardware secure enclaves, and autonomous red-team fuzzing engines.',
      tags: ['Cryptography', 'Secure Enclaves', 'Fuzzing', 'Zero-Trust'],
      codeSnippet: 'enclave::seal(&payload, &policy)',
    },
    {
      id: 'TRACK // 04',
      title: 'Open Innovation',
      description:
        'High-leverage engineering defying taxonomy. Hardware-software symbiosis, high-performance compute, bio-computing, and open science.',
      tags: ['Hardware / IoT', 'Distributed Systems', 'Open Science', 'Moonshots'],
      codeSnippet: 'async fn execute_moonshot() -> !',
    },
  ],
  timeline: [
    {
      id: '01',
      time: 'DAY 01 // 18:00',
      title: 'Check-in, Hardware Depot & Opening Keynote',
      desc: 'Check-in opens at the Central Auditorium. Badge collection, Wi-Fi pairing, hardware dev kit checkout (Raspberry Pi 5, FPGAs, microcontrollers), and the inaugural opening address.',
    },
    {
      id: '02',
      time: 'DAY 01 // 21:00',
      title: 'The Severance // Hacking Commences',
      desc: 'The chain snaps officially. 36 hours of unscheduled engineering begins. Midnight catering and energy logistics activated across all hacking zones.',
    },
    {
      id: '03',
      time: 'DAY 02 // 12:00',
      title: 'Midway Checkpoint & Sponsor Office Hours',
      desc: 'Architecture critiques with 10+ industry mentors. Sponsor API office hours with lead engineers from Polygon, Solana, Google Cloud, and Anthropic.',
    },
    {
      id: '04',
      time: 'DAY 03 // 09:00',
      title: 'Code Freeze & Cryptographic Registry Verification',
      desc: 'Git repositories frozen. Commit hashes recorded to local immutable ledger. Devpost and video demo submissions locked.',
    },
    {
      id: '05',
      time: 'DAY 03 // 12:00',
      title: 'Finalist Pitching & Grand Award Ceremony',
      desc: 'Top 10 selected teams deliver 5-minute live demos before our venture partner panel. Rs 1,00,000 in bounties and grant awards announced.',
    },
  ],
  prizes: [
    {
      place: '1st',
      rank: 'CHAMPION',
      amount: 'Rs 50,000',
      badge: 'GRAND PRIZE',
      perks: [
        'Direct Fast-Track to Web3 & AI Incubator',
        '$10,000 Cloud Compute & API Credits',
        'Direct Partner VC Investment Pitch',
        'Hardware Dev Suite & Championship Trophy',
      ],
    },
    {
      place: '2nd',
      rank: 'RUNNER UP',
      amount: 'Rs 30,000',
      badge: 'FIRST RUNNER UP',
      perks: [
        'Fast-Track Accelerator Interview',
        'Security Audit & Vulnerability Assessment Credits',
        '$5,000 Cloud Compute Credits',
        'Developer Swag & Hardware Bundles',
      ],
    },
    {
      place: '3rd',
      rank: 'SECOND RUNNER UP',
      amount: 'Rs 20,000',
      badge: 'HONORABLE MENTION',
      perks: [
        'Collegiate Incubator Co-working Membership',
        '$2,500 Cloud Infrastructure Grants',
        'Exclusive Sponsor Mentorship Allocation',
        'Merit Certificate & Developer Kit',
      ],
    },
  ],
  sponsors: [
    { name: 'AETHER PROTOCOL', category: 'TITLE PARTNER', tier: 'ALPHA' },
    { name: 'TENSOR LABS', category: 'NEURAL INFRASTRUCTURE', tier: 'ALPHA' },
    { name: 'SYNAPSE ZERO', category: 'ZK CRYPTOGRAPHY', tier: 'BETA' },
    { name: 'OCTANE CLOUD', category: 'HIGH-PERFORMANCE COMPUTE', tier: 'BETA' },
    { name: 'NEXUS HARDWARE', category: 'SILICON DEPOT', tier: 'BETA' },
    { name: 'CIPHER CAPITAL', category: 'VENTURE ACCELERATOR', tier: 'ECOSYSTEM' },
    { name: 'SOLARIS NETWORK', category: 'DECENTRALIZED STORAGE', tier: 'ECOSYSTEM' },
    { name: 'VECTOR GUILD', category: 'COMMUNITY PARTNER', tier: 'ECOSYSTEM' },
  ],
  faq: [
    {
      q: 'Who is eligible to participate in Hack The Chain?',
      a: 'Any undergraduate, postgraduate, or high-school student from an accredited institution worldwide is eligible. We welcome hackers of all technical proficiencies, from first-year enthusiasts to seasoned protocol engineers.',
    },
    {
      q: 'What is the team size limit?',
      a: 'Teams can range from solo hackers (1 builder) up to a maximum of 4 members. We also provide dedicated team-formation workshops on Friday evening before hacking kicks off.',
    },
    {
      q: 'Is there any registration or entry fee?',
      a: 'Zero. Hack The Chain is completely free of cost for all accepted attendees. High-speed network, 6 meals, continuous coffee/snacks, sleeping lounges, and hardware kits are fully sponsored.',
    },
    {
      q: 'Can we build on an existing project or codebase?',
      a: 'No. All code and system architectures submitted for judging must be written during the 36-hour hackathon window. Open-source libraries, packages, public APIs, and framework boilers are completely allowed.',
    },
    {
      q: 'What hardware will be available at the depot?',
      a: 'We provide Raspberry Pi 5 boards, ESP32 microcontrollers, Arduino suites, biometric sensors, LoRaWAN gateways, and FPGA dev boards available on deposit for hardware-track hacks.',
    },
    {
      q: 'What are the judging criteria?',
      a: 'Projects are evaluated on four vectors: Technical Ambition & Complexity (30%), Originality & Problem Severity (25%), Execution & UX Polish (25%), and Feasibility/Scalability (20%).',
    },
  ],
  cta: {
    tag: '// REGISTER // SECURE YOUR SEAT',
    heading: 'THE CHAIN IS SEVERED. BUILD THE UNBREAKABLE.',
    subtext:
      'Applications close October 18, 2026. 500 hacker passes will be issued across two rolling cohorts.',
    buttonText: 'REGISTER FOR HACK THE CHAIN',
    deadline: 'APPLICATIONS CLOSE: OCT 18, 23:59 IST',
  },
  footer: {
    club: 'DEVELOPER & BLOCKCHAIN STUDENT CLUB',
    college: 'INSTITUTE OF TECHNOLOGY & RESEARCH',
    address: 'Central Campus, Innovation Hub Block 4, New Delhi',
    email: 'contact@hackthechain.dev',
    socials: [
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'X / Twitter', url: 'https://twitter.com' },
      { name: 'Discord', url: 'https://discord.com' },
      { name: 'LinkedIn', url: 'https://linkedin.com' },
    ],
    status: 'ALL SYSTEMS OPERATIONAL // ETH_BLOCK: #21908204',
    copy: '© 2026 HACK THE CHAIN. DESIGNED FOR THE BUILDERS OF TOMORROW.',
  },
};
