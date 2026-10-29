import { AppItem } from '../types';
import { APP_MEDIA_ASSETS } from '../utils/media';

export const APPS_DATA: AppItem[] = [
  {
    id: 'harmonics-synth-pro',
    name: 'Harmonics Synth Pro',
    tagline: 'Modular polyphonic sound laboratory with zero latency',
    developer: 'Voxel Soundworks',
    developerVerified: true,
    category: 'Audio & Music',
    price: 19.99,
    priceFormatted: '$19.99',
    priceModel: 'One-Time',
    rating: 4.9,
    reviewCount: 3840,
    downloadsCount: '142K+',
    sizeMB: 38.4,
    currentVersion: '3.4.2',
    minOS: 'Android 12 / iOS 16 / macOS 13',
    supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'],
    heroImage: APP_MEDIA_ASSETS.orbitHero,
    thumbnail: APP_MEDIA_ASSETS.orbitHero,
    accentColor: '#6366f1',
    editorialHighlight: {
      headline: "The DAW-grade synthesizer that refuses subscription lock-in",
      curatorQuote: "Voxel Soundworks proves high-end DSP audio processing doesn't require a monthly lease. Uncompressed floating-point audio with instant local patch saving."
    },
    summary: 'A studio-grade polyphonic modular synthesizer built for sound designers, composers, and live performers. Features three analog-modeled oscillators, multimode resonant ladder filters, and real-time WebAudio/ASIO engine.',
    features: [
      '32-voice polyphony with true analog drift emulation',
      'Zero cloud dependencies — 100% offline patch saving',
      'MIDI 2.0 and MPE expressive control support',
      'Bilinear frequency modulation (FM) and wavetable morphing',
      'Direct loss-free WAV/FLAC session recording'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: false,
    privacyGrade: 'A+',
    permissions: [
      {
        id: 'mic',
        name: 'Microphone & Audio Input',
        category: 'Hardware',
        required: false,
        reason: 'Required only when recording live external audio into the vocoder or sampler engine.',
        safetyImpact: 'Low'
      },
      {
        id: 'storage',
        name: 'Local Preset Storage',
        category: 'Data',
        required: true,
        reason: 'Saves user sound patches and audio stems directly onto your device sandbox.',
        safetyImpact: 'Low'
      }
    ],
    dataCollected: [],
    versionHistory: [
      {
        version: '3.4.2',
        releaseDate: 'October 2, 2026',
        sizeMB: 38.4,
        isLatest: true,
        highlights: [
          'Added stereo spread parameter to resonant low-pass filter',
          'Reduced ASIO audio buffer latency by 18% on desktop',
          'Fixed occasional pitch drift when switching between octave presets'
        ]
      },
      {
        version: '3.3.0',
        releaseDate: 'August 14, 2026',
        sizeMB: 36.8,
        highlights: [
          'Introduced MPE microtonal tuning scale importer',
          'Improved battery efficiency during continuous background playback',
          'New dark ambient preset collection (32 soundscapes)'
        ]
      },
      {
        version: '3.1.5',
        releaseDate: 'May 20, 2026',
        sizeMB: 34.2,
        highlights: [
          'Original release of the v3 audio kernel with 64-bit float mixing'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Julian M.',
        rating: 5,
        date: '3 days ago',
        device: 'Desktop / Studio M2',
        title: 'Finally, an audio tool with no subscription greed',
        content: 'Paid once and got a beast of a synthesizer. The filter resonance sounds as warm as my hardware Prophet. Zero ads, zero background telemetry.',
        helpfulCount: 42,
        verifiedPurchase: true
      },
      {
        id: 'rev-2',
        author: 'Elena Rostova',
        rating: 5,
        date: '1 week ago',
        device: 'Tablet Pro 12.9',
        title: 'Latencies are imperceptible on touch',
        content: 'The on-screen keys with velocity glide make finger drumming and soloing fluid. Testing it in the store sandbox sold me immediately.',
        helpfulCount: 29,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'audio-synth'
  },
  {
    id: 'lumina-vector-studio',
    name: 'Lumina Poster & Vector Studio',
    tagline: 'Precision typographic layouts and vector drafting tool',
    developer: 'Nordic Gridworks',
    developerVerified: true,
    category: 'Design & Creative',
    price: 0,
    priceFormatted: 'Free',
    priceModel: 'Free',
    rating: 4.8,
    reviewCount: 2190,
    downloadsCount: '98K+',
    sizeMB: 29.1,
    currentVersion: '2.8.0',
    minOS: 'Android 11 / iOS 15 / Web',
    supportedDevices: ['Tablet', 'Desktop', 'Phone'],
    heroImage: APP_MEDIA_ASSETS.luminaShowcase,
    thumbnail: APP_MEDIA_ASSETS.luminaShowcase,
    accentColor: '#0ea5e9',
    editorialHighlight: {
      headline: "The typographic playground built for print and editorial purists",
      curatorQuote: "Lumina eschews heavy cloud design bloat in favor of instant local SVG canvas rendering. Works seamlessly offline on high-res tablets."
    },
    summary: 'A nimble, high-precision vector illustration and poster layout workstation. Designed for graphic designers who demand mathematical grid snapping, variable font glyph controls, and native SVG/PDF exports.',
    features: [
      'Sub-pixel Bezier curve editing with pressure curve mapping',
      'Dynamic typography layout engine with variable font optical axes',
      'Modular 12-column Swiss typographic grid overlays',
      'Instant vector export to pure SVG, CMYK PDF, and high-res PNG',
      'Zero account registration required — works 100% offline'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: true,
    license: 'MIT Open Source',
    sourceCodeUrl: 'https://github.com/nordicgridworks/lumina-studio',
    privacyGrade: 'A+',
    permissions: [
      {
        id: 'photos',
        name: 'Device Photo & File Picker',
        category: 'Data',
        required: false,
        reason: 'Required to import reference imagery or custom TrueType/OTF fonts.',
        safetyImpact: 'Low'
      }
    ],
    dataCollected: [],
    versionHistory: [
      {
        version: '2.8.0',
        releaseDate: 'September 28, 2026',
        sizeMB: 29.1,
        isLatest: true,
        highlights: [
          'Variable font weight & slant interpolator slider',
          'Added automatic color palette harmony generator',
          'Fixed vector node snapping on dense 120Hz display refresh'
        ]
      },
      {
        version: '2.6.4',
        releaseDate: 'July 11, 2026',
        sizeMB: 27.5,
        highlights: [
          'Enhanced CMYK print color profile conversion',
          'Pen tool anchor point angle locking shortcut'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-3',
        author: 'Kaelen Vance',
        rating: 5,
        date: '2 weeks ago',
        device: 'Tablet Pro',
        title: 'Open source excellence at its finest',
        content: 'I replaced my monthly Adobe Illustrator subscription with Lumina for poster design. The variable font axis slider is so responsive.',
        helpfulCount: 56,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'vector-canvas'
  },
  {
    id: 'adinkra-studio',
    name: 'Adinkra Studio',
    tagline: 'West African Adinkra geometric symbology and vector typography workstation',
    developer: 'Asante Cultural Labs',
    developerVerified: true,
    category: 'Design & Creative',
    price: 0,
    priceFormatted: 'Free',
    priceModel: 'Open Source',
    rating: 4.9,
    reviewCount: 1420,
    downloadsCount: '58K+',
    sizeMB: 24.6,
    currentVersion: '1.4.0',
    minOS: 'Android 11 / iOS 15 / macOS / Web',
    supportedDevices: ['Tablet', 'Phone', 'Desktop', 'Vision'],
    heroImage: APP_MEDIA_ASSETS.adinkraStudio,
    thumbnail: APP_MEDIA_ASSETS.adinkraStudio,
    accentColor: '#f97316',
    editorialHighlight: {
      headline: "Sacred West African visual philosophies rendered into mathematical vectors",
      curatorQuote: "Adinkra Studio brings ancient Akan proverbs, cultural wisdom, and geometric symbols into modern vector typography with zero cloud telemetry."
    },
    summary: 'A high-precision vector illustration studio dedicated to West African Adinkra visual philosophy. Features parametric geometry generation, Akan proverb etymology archives, and native SVG exports.',
    features: [
      '100% offline procedural vector rendering of historical Adinkra symbols',
      'Philosophical meaning and Akan proverb archives',
      'Export to pure SVG, EPS, and high-resolution PNG',
      'Direct link to live web app and source code repositories',
      'Zero third-party trackers or data harvesting'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: true,
    isUserUploaded: true,
    ownerId: 'PRISM-USER-DEMO',
    uploadedAt: 'Today (Active Listing)',
    license: 'MIT Open Source',
    liveAppUrl: 'https://adinkra-studio.app',
    websiteUrl: 'https://adinkra-studio.app',
    sourceCodeUrl: 'https://github.com/asantecultural/adinkra-studio',
    packageBundleName: 'adinkra-studio-v1.4.0-bundle.zip',
    privacyGrade: 'A+',
    permissions: [
      {
        id: 'storage',
        name: 'Local Vector Export Folder',
        category: 'Data',
        required: true,
        reason: 'Saves exported SVG vectors and Akan typography sheets onto your device.',
        safetyImpact: 'Low'
      }
    ],
    dataCollected: [],
    versionHistory: [
      {
        version: '1.4.0',
        releaseDate: 'October 10, 2026',
        sizeMB: 24.6,
        isLatest: true,
        highlights: [
          'Added Aya (Fern) endurance parametric vector glyph',
          'Export presets for laser cutting and textile block printing',
          'Offline audio recordings of Akan philosophical proverb pronunciations'
        ]
      },
      {
        version: '1.2.0',
        releaseDate: 'August 18, 2026',
        sizeMB: 22.8,
        highlights: [
          'Initial release of Gye Nyame and Sankofa vector generators'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-adinkra-1',
        author: 'Kwame Mensah',
        rating: 5,
        date: '2 days ago',
        device: 'Tablet Studio',
        title: 'Breathtaking cultural and technical precision',
        content: 'Having accurate mathematical curves for Gye Nyame and Sankofa with the real proverb philosophy is incredible. The live web link works instantly.',
        helpfulCount: 48,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'adinkra-vector'
  },
  {
    id: 'aether-soundscape',
    name: 'Aether Generative Ambience',
    tagline: 'Neuro-acoustic soundscapes for deep focus and sleep',
    developer: 'Obsidian Audio Lab',
    developerVerified: true,
    category: 'Audio & Music',
    price: 4.99,
    priceFormatted: '$4.99',
    priceModel: 'One-Time',
    rating: 4.9,
    reviewCount: 1740,
    downloadsCount: '62K+',
    sizeMB: 21.0,
    currentVersion: '4.1.0',
    minOS: 'Android 10 / iOS 15 / WatchOS 9',
    supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Watch'],
    heroImage: APP_MEDIA_ASSETS.aetherSound,
    thumbnail: APP_MEDIA_ASSETS.aetherSound,
    accentColor: '#8b5cf6',
    editorialHighlight: {
      headline: "Sound design engineered down to the resonant frequency",
      curatorQuote: "Unlike looping MP3 apps with loud ads, Aether computes organic frequencies algorithmically in real-time. No loops, no jarring breaks."
    },
    summary: 'A mathematically infinite ambient sound generator that creates organic audio scapes in real time. Combines pink noise, rain resonance, binaural theta frequencies, and deep interstellar pads.',
    features: [
      'Pure algorithmic sound synthesis — never repeats or loops',
      'Binaural 432Hz and 528Hz solfeggio frequency options',
      'Hardware-accelerated OLED dark mode visualizer',
      'Configurable sleep timer with gentle psychoacoustic volume fade',
      '100% offline operation with zero data transmission'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: false,
    privacyGrade: 'A+',
    permissions: [],
    dataCollected: [],
    versionHistory: [
      {
        version: '4.1.0',
        releaseDate: 'September 15, 2026',
        sizeMB: 21.0,
        isLatest: true,
        highlights: [
          'Added Tidal Resonator sound algorithm',
          'Sleep timer soft harmonic fade out enhancement',
          'Watch companion app standalone sound playback'
        ]
      },
      {
        version: '3.9.0',
        releaseDate: 'June 02, 2026',
        sizeMB: 19.8,
        highlights: [
          'Support for custom binaural beat frequency tuning'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-4',
        author: 'Dr. Sarah Lin',
        rating: 5,
        date: '5 days ago',
        device: 'Phone Ultra',
        title: 'Indispensable for coding focus',
        content: 'No annoying 2-minute loops that your brain starts noticing. The organic procedural sound keeps my mind in flow state for hours.',
        helpfulCount: 38,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'audio-synth'
  },
  {
    id: 'zenith-biomechanics',
    name: 'Zenith Biometrics & Trail',
    tagline: 'Precision telemetry, cadence analysis, and offline topo maps',
    developer: 'Apex Trail Works',
    developerVerified: true,
    category: 'Health & Biometrics',
    price: 0,
    priceFormatted: '$2.99/mo',
    priceModel: 'Subscription',
    subscriptionPeriod: 'Monthly',
    rating: 4.7,
    reviewCount: 3120,
    downloadsCount: '115K+',
    sizeMB: 44.5,
    currentVersion: '5.2.1',
    minOS: 'Android 12 / iOS 16 / WearOS / WatchOS',
    supportedDevices: ['Phone', 'Watch', 'Tablet'],
    heroImage: APP_MEDIA_ASSETS.zenithFitness,
    thumbnail: APP_MEDIA_ASSETS.zenithFitness,
    accentColor: '#10b981',
    editorialHighlight: {
      headline: "The outdoor tracker that stores your health data on your device, not in ad exchanges",
      curatorQuote: "Apex Trail Works has set the standard for runner privacy. Vector topographic maps download directly to your watch with zero tracking beacons."
    },
    summary: 'Engineered for ultra-runners, mountaineers, and endurance athletes. Delivers instantaneous stride length, ground contact time, vertical oscillation, and 3D offline topographic elevation contours.',
    features: [
      'High-frequency 200Hz inertial sensor gait and cadence telemetry',
      'Full offline vector topo contours with 10-meter elevation isolines',
      'Heart Rate Variability (HRV) autonomic recovery index',
      'Zero third-party analytics SDKs — your route remains strictly on device',
      'Direct GPX, FIT, and TCX local file export'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: false,
    privacyGrade: 'A',
    permissions: [
      {
        id: 'gps',
        name: 'High-Precision Location',
        category: 'Hardware',
        required: true,
        reason: 'Required for real-time pacing, trail navigation, and elevation contour plotting.',
        safetyImpact: 'Medium'
      },
      {
        id: 'sensors',
        name: 'Heart Rate & Motion Sensors',
        category: 'Hardware',
        required: true,
        reason: 'Reads sensor telemetry for ground contact time and cardiac zones.',
        safetyImpact: 'Low'
      }
    ],
    dataCollected: [
      {
        category: 'Health & Fitness Stats',
        linkedToUser: false,
        purposes: ['Local Performance Analytics Only']
      }
    ],
    versionHistory: [
      {
        version: '5.2.1',
        releaseDate: 'October 1, 2026',
        sizeMB: 44.5,
        isLatest: true,
        highlights: [
          'Enhanced offline contour map caching speed by 3x',
          'Added alpine gradient grade resistance metric',
          'Optimized GPS polling to save 22% battery on 100k ultramarathons'
        ]
      },
      {
        version: '5.0.0',
        releaseDate: 'July 18, 2026',
        sizeMB: 41.2,
        highlights: [
          'Major release with custom GPX route waypoint editor'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-5',
        author: 'Markus Weber',
        rating: 5,
        date: '3 weeks ago',
        device: 'Watch Titan + Phone',
        title: 'Reliable in the Alps with zero cell service',
        content: 'Spent 4 days backpacking in the Dolomites with airplane mode turned on the entire trip. The topo contour rendering was instantaneous.',
        helpfulCount: 71,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'biomechanics'
  },
  {
    id: 'cipher-notes-studio',
    name: 'Cipher Note Studio',
    tagline: 'End-to-end encrypted local-first markdown sanctuary',
    developer: 'Cryptic Systems (Community)',
    developerVerified: true,
    category: 'Productivity & Notes',
    price: 0,
    priceFormatted: 'Free',
    priceModel: 'Open Source',
    rating: 4.9,
    reviewCount: 4620,
    downloadsCount: '210K+',
    sizeMB: 16.2,
    currentVersion: '3.1.0',
    minOS: 'Android 10 / iOS 15 / macOS / Linux / Windows',
    supportedDevices: ['Phone', 'Tablet', 'Desktop'],
    thumbnail: APP_MEDIA_ASSETS.orbitHero,
    accentColor: '#14b8a6',
    editorialHighlight: {
      headline: "Your notes belong to you — not AI scrapers or cloud telemetry",
      curatorQuote: "An uncompromising markdown editor with client-side AES-GCM encryption. Syncs via your own WebDAV, local folder, or Git."
    },
    summary: 'A fast, distraction-free markdown note-taking environment designed for researchers, writers, and engineers. Every character is saved as plain text on your filesystem with optional zero-knowledge AES-256 encryption.',
    features: [
      'Local-first plain markdown storage — zero proprietary lock-in',
      'Hardware-accelerated AES-GCM encryption with Argon2 key derivation',
      'Bi-directional wiki links [[backlinks]] and interactive graph view',
      'Full KaTeX math rendering and code block syntax highlighting',
      'Peer-to-peer sync via local WiFi with zero cloud intermediary'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: true,
    license: 'GPL v3.0',
    sourceCodeUrl: 'https://github.com/crypticsystems/cipher-notes',
    privacyGrade: 'A+',
    permissions: [
      {
        id: 'storage',
        name: 'Filesystem Access',
        category: 'Data',
        required: true,
        reason: 'Required to read and write markdown files in your selected local vault directory.',
        safetyImpact: 'Low'
      }
    ],
    dataCollected: [],
    versionHistory: [
      {
        version: '3.1.0',
        releaseDate: 'September 22, 2026',
        sizeMB: 16.2,
        isLatest: true,
        highlights: [
          'Interactive neural graph view with cluster coloring',
          'Instant full-text regex search across 50,000+ notes in <15ms',
          'Support for frontmatter YAML tags and custom query filters'
        ]
      },
      {
        version: '3.0.2',
        releaseDate: 'July 05, 2026',
        sizeMB: 15.6,
        highlights: [
          'Initial v3 release with local peer-to-peer sync protocol'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-6',
        author: 'Dr. Naomi Chen',
        rating: 5,
        date: '1 week ago',
        device: 'Desktop Workstation',
        title: 'The antidote to proprietary note apps',
        content: 'I have 14,000 research notes. Cipher opens instantly, never tries to sell me an AI subscription, and keeps my files safe on disk.',
        helpfulCount: 64,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'markdown-editor'
  },
  {
    id: 'hyperkite-shell',
    name: 'HyperKite Shell & Containers',
    tagline: 'Modern terminal emulator, SSH manager, and container inspector',
    developer: 'Kite Labs',
    developerVerified: true,
    category: 'Developer Tools',
    price: 12.00,
    priceFormatted: '$12.00',
    priceModel: 'One-Time',
    rating: 4.8,
    reviewCount: 1890,
    downloadsCount: '78K+',
    sizeMB: 24.8,
    currentVersion: '4.4.0',
    minOS: 'Android 11 / iOS 16 / macOS / Linux',
    supportedDevices: ['Tablet', 'Desktop', 'Phone'],
    thumbnail: APP_MEDIA_ASSETS.aetherSound,
    accentColor: '#f59e0b',
    summary: 'A high-performance terminal emulator written in Rust with GPU-accelerated glyph rendering. Features split panes, serial port monitoring, hardware security key (FIDO2) SSH authentication, and live Docker container statistics.',
    features: [
      '60+ FPS GPU-rendered font rendering with ligatures',
      'Native FIDO2 / YubiKey hardware SSH authentication',
      'Live Docker & Podman container status dashboard',
      'Port forwarding tunnel manager with background keep-alive',
      'Built-in SFTP file explorer with diff viewer'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: true,
    license: 'Apache 2.0',
    privacyGrade: 'A+',
    permissions: [
      {
        id: 'network',
        name: 'Local Network & Sockets',
        category: 'Network',
        required: true,
        reason: 'Required to initiate SSH, Telnet, and local Docker daemon socket connections.',
        safetyImpact: 'Medium'
      }
    ],
    dataCollected: [],
    versionHistory: [
      {
        version: '4.4.0',
        releaseDate: 'September 30, 2026',
        sizeMB: 24.8,
        isLatest: true,
        highlights: [
          'Added Docker compose stack topology visualizer',
          'Support for eBPF live network socket telemetry',
          'Fixed keybinding conflicts on Scandinavian keyboard layouts'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-7',
        author: 'Artem Sokolov',
        rating: 5,
        date: '4 days ago',
        device: 'Tablet + Magic Keyboard',
        title: 'Turns an iPad or Galaxy Tab into a true dev machine',
        content: 'Mosh and SSH stability over spotty train 5G is rock solid. The container inspector saves so much time during on-call incidents.',
        helpfulCount: 33,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'terminal'
  },
  {
    id: 'stridex-sports-telemetry',
    name: 'StrideX Sports & Athletics Lab',
    tagline: 'Olympic sprint split timing, pitch radar, and high-intensity interval analytics',
    developer: 'Kinetic Sports Systems',
    developerVerified: true,
    category: 'Sports',
    price: 0,
    priceFormatted: 'Free',
    priceModel: 'Open Source',
    rating: 4.9,
    reviewCount: 2840,
    downloadsCount: '98K+',
    sizeMB: 28.5,
    currentVersion: '2.4.0',
    minOS: 'Android 11 / iOS 15 / WatchOS 9 / Web',
    supportedDevices: ['Phone', 'Watch', 'Tablet', 'Desktop'],
    heroImage: APP_MEDIA_ASSETS.zenithFitness,
    thumbnail: APP_MEDIA_ASSETS.zenithFitness,
    accentColor: '#0ea5e9',
    editorialHighlight: {
      headline: "High-precision athletic tracking with zero biometric harvesting",
      curatorQuote: "Kinetic Sports Systems delivers professional-grade sports analytics, sprint splits, and match tactics that execute 100% locally on your device."
    },
    summary: 'A complete sports performance laboratory for athletes, coaches, and sports clubs. Features optical 100m sprint timing, football/soccer tactical field zone heatmaps, and high-intensity interval agility timers.',
    features: [
      'Laser-accurate 100m, 200m, and 400m sprint velocity telemetry',
      'Tactical pitch formation editor and athletic zone heatmaps',
      'High-intensity interval match clock with audio whistle beeps',
      '100% offline sensor capture — your athletic telemetry never leaves your device',
      'Direct CSV, JSON, and GPX export for sports coaching staff'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: true,
    license: 'MIT Open Source',
    liveAppUrl: 'https://stridex-athletics.app',
    websiteUrl: 'https://stridex-athletics.app',
    sourceCodeUrl: 'https://github.com/kineticsports/stridex-athletics',
    privacyGrade: 'A+',
    permissions: [
      {
        id: 'sensors',
        name: 'Inertial Motion Sensor',
        category: 'Hardware',
        required: true,
        reason: 'Captures sprint cadence and rapid foot strike velocity.',
        safetyImpact: 'Low'
      }
    ],
    dataCollected: [],
    versionHistory: [
      {
        version: '2.4.0',
        releaseDate: 'October 8, 2026',
        sizeMB: 28.5,
        isLatest: true,
        highlights: [
          'Added soccer/football tactical pitch heatmaps and formation drawer',
          'Sprint reaction buzzer and split interval timer',
          'Export sports performance logs directly to local spreadsheet'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-sport-1',
        author: 'Coach Marcus Sterling',
        rating: 5,
        date: '2 days ago',
        device: 'Tablet Pro + Stopwatch',
        title: 'Essential for collegiate sprint and pitch training',
        content: 'No cloud account needed on the track. The instant split times and tactical pitch editor work flawlessly offline in stadium dead-zones.',
        helpfulCount: 52,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'biomechanics'
  },
  {
    id: 'ironpulse-strength-tactics',
    name: 'IronPulse Tactical Sports',
    tagline: 'Barbell velocity radar, tournament match clocks, and periodized athletic conditioning',
    developer: 'Vanguard Athletics',
    developerVerified: true,
    category: 'Sports',
    price: 12.99,
    priceFormatted: '$12.99',
    priceModel: 'One-Time',
    rating: 4.8,
    reviewCount: 1950,
    downloadsCount: '47K+',
    sizeMB: 31.2,
    currentVersion: '3.1.2',
    minOS: 'Android 11 / iOS 15 / Web',
    supportedDevices: ['Phone', 'Tablet', 'Desktop'],
    heroImage: APP_MEDIA_ASSETS.zenithFitness,
    thumbnail: APP_MEDIA_ASSETS.zenithFitness,
    accentColor: '#f59e0b',
    editorialHighlight: {
      headline: "Velocity-based training without monthly subscriptions",
      curatorQuote: "Measures barbell concentric speed in meters-per-second via on-device camera vision. Lifetime license with zero ads."
    },
    summary: 'Engineered for strength & conditioning coaches, track & field throwers, and power athletes. Computes instantaneous mean concentric bar velocity via phone camera with zero cloud streaming.',
    features: [
      'Optical bar velocity and trajectory path analysis (m/s)',
      'Multi-sport countdown clock & tournament match timer',
      'Periodized volume load and sports readiness monitoring',
      '100% offline local database with encrypted athlete profiles',
      'Zero tracking ad libraries or background pings'
    ],
    offlineCapable: true,
    zeroTrackers: true,
    openSource: false,
    privacyGrade: 'A+',
    permissions: [
      {
        id: 'cam',
        name: 'High-speed Camera Feed',
        category: 'Hardware',
        required: true,
        reason: 'Processes optical bar velocity in real-time strictly on device without saving footage.',
        safetyImpact: 'Low'
      }
    ],
    dataCollected: [],
    versionHistory: [
      {
        version: '3.1.2',
        releaseDate: 'September 28, 2026',
        sizeMB: 31.2,
        isLatest: true,
        highlights: [
          'Added 120fps camera bar trajectory tracking',
          'Multi-court sports match timer with audio horns'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-sport-2',
        author: 'Elena Rostova',
        rating: 5,
        date: '5 days ago',
        device: 'Phone Max',
        title: 'Replaced a $600 hardware linear transducer',
        content: 'Accurate bar velocity numbers down to 0.02 m/s. The tournament match clock is super handy on tournament days.',
        helpfulCount: 39,
        verifiedPurchase: true
      }
    ],
    sandboxType: 'biomechanics'
  },
  {
    id: 'inappropriate-ad-miner-demo',
    name: 'Stealth Miner & Ad Collector',
    tagline: 'Flagged for violating Zero-Tracker policy with hidden background ad networks',
    developer: 'AdSurveillance Media Inc',
    developerVerified: false,
    category: 'Developer Tools',
    price: 0,
    priceFormatted: 'Free',
    priceModel: 'Free',
    rating: 1.8,
    reviewCount: 42,
    downloadsCount: '340',
    sizeMB: 78.4,
    currentVersion: '0.9.1',
    minOS: 'Android 10',
    supportedDevices: ['Phone'],
    thumbnail: APP_MEDIA_ASSETS.luminaShowcase,
    accentColor: '#f43f5e',
    isFlagged: true,
    ownerId: 'ROGUE-DEV-404',
    flagReason: 'Violates Zero-Tracker Constitution: bundled 14 tracking SDKs and unauthorized crypto telemetry.',
    summary: 'Flagged application pending developer and moderator deletion due to malicious telemetry beacons and inappropriate advertising behavior.',
    features: [
      'Violates Prism zero-telemetry rules',
      'Unverified developer credentials',
      'Pending immediate moderation removal'
    ],
    offlineCapable: false,
    zeroTrackers: false,
    openSource: false,
    privacyGrade: 'B',
    permissions: [
      {
        id: 'bg-track',
        name: 'Background Location & Advertising ID',
        category: 'Data',
        required: true,
        reason: 'Third party ad targeting network (Prohibited in Prism)',
        safetyImpact: 'High'
      }
    ],
    dataCollected: [
      {
        category: 'Device Identifiers & Browsing Data',
        linkedToUser: true,
        purposes: ['Advertising & Tracking']
      }
    ],
    versionHistory: [
      {
        version: '0.9.1',
        releaseDate: 'October 2, 2026',
        sizeMB: 78.4,
        highlights: ['Flagged by automated compliance inspector']
      }
    ],
    reviews: [
      {
        id: 'rev-flag-1',
        author: 'Ecosystem Auditor',
        rating: 1,
        date: 'Yesterday',
        device: 'Pixel 9 Pro',
        title: 'Reported: Inappropriate ad SDKs detected',
        content: 'This app contains hidden telemetry libraries. Must be deleted by developer or moderators.',
        helpfulCount: 88,
        verifiedPurchase: false
      }
    ],
    sandboxType: 'terminal'
  }
];

export const EDITORIAL_COLLECTIONS = [
  {
    id: 'editorial-1',
    title: 'The Anti-Subscription Movement',
    subtitle: 'High-performance creative tools with lifetime ownership models and zero hidden micro-transactions.',
    badge: "Editor's Deep Dive",
    appIds: ['harmonics-synth-pro', 'lumina-vector-studio', 'hyperkite-shell']
  },
  {
    id: 'editorial-2',
    title: 'Zero-Telemetry Pioneers',
    subtitle: 'Audited applications that have passed rigorous local network traffic inspection with 0 third-party beacons.',
    badge: 'Privacy Vanguard',
    appIds: ['cipher-notes-studio', 'aether-soundscape', 'zenith-biomechanics']
  }
];
