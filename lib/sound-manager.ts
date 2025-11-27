// KidPix sound effects from https://github.com/vikrum/kidpix/tree/main/sndmp3

type SoundName = 
  | 'click'      // Tool selection
  | 'option'     // Submenu/option click
  | 'draw'       // Pencil/brush drawing
  | 'stamp'      // Placing stamps
  | 'fill'       // Fill bucket
  | 'erase'      // Eraser (explosion!)
  | 'undo'       // Undo action
  | 'pop'        // Bubble pop
  | 'success'    // Success/complete
  | 'wacky'      // Wacky effects
  | 'spray'      // Spray paint brush

const soundFiles: Record<SoundName, string> = {
  click: '/sounds/kidpix-menu-click-main-tools.wav.mp3',
  option: '/sounds/kidpix-menu-click-submenu-options.wav.mp3',
  draw: '/sounds/kidpix-tool-pencil.wav.mp3',
  stamp: '/sounds/stamp0.wav.mp3',
  fill: '/sounds/flood0.wav.mp3',
  erase: '/sounds/kidpix-tool-eraser-tnt-explosion.wav.mp3',
  undo: '/sounds/oops0.wav.mp3',
  pop: '/sounds/bubble-pop-WAVSOUND.R_000031f6.wav.mp3',
  success: '/sounds/chord.wav.mp3',
  wacky: '/sounds/electric-mixer-pip-drum-crash-1WAVSOUND.R_0002d96e.wav.mp3',
  spray: '/sounds/kidpix-submenu-brush-spraypaint.wav.mp3',
}

// Cache for preloaded audio elements
const audioCache: Map<SoundName, HTMLAudioElement> = new Map()

// Preload sounds for faster playback
export function preloadSounds() {
  if (typeof window === 'undefined') return
  
  Object.entries(soundFiles).forEach(([name, path]) => {
    const audio = new Audio(path)
    audio.preload = 'auto'
    audioCache.set(name as SoundName, audio)
  })
}

export function playSound(soundName: string) {
  if (typeof window === 'undefined') return
  
  const name = soundName as SoundName
  const path = soundFiles[name]
  
  if (!path) return
  
  try {
    // Use cached audio if available, otherwise create new
    let audio = audioCache.get(name)
    
    if (audio) {
      // Clone for overlapping sounds
      audio = audio.cloneNode() as HTMLAudioElement
    } else {
      audio = new Audio(path)
    }
    
    audio.volume = 0.5 // 50% volume
    audio.play().catch(() => {
      // Ignore autoplay errors (user hasn't interacted yet)
    })
  } catch {
    // Ignore sound errors
  }
}
