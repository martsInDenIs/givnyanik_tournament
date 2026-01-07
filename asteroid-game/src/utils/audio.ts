class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicIntervalId: number | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = 0.3
      this.masterGain.connect(this.audioContext.destination)
    }
  }

  private createOscillator(
    frequency: number,
    type: OscillatorType,
    duration: number,
    startTime: number
  ): void {
    if (!this.audioContext || !this.masterGain) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startTime)
    gainNode.gain.setValueAtTime(0.3, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  playShoot(): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    this.createOscillator(800, 'square', 0.1, now)
    this.createOscillator(400, 'square', 0.1, now + 0.05)
  }

  playExplosion(): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime

    for (let i = 0; i < 3; i++) {
      const frequency = 200 - i * 50
      this.createOscillator(frequency, 'sawtooth', 0.3 + i * 0.1, now + i * 0.05)
    }

    const noiseBuffer = this.createNoiseBuffer()
    const noiseSource = this.audioContext.createBufferSource()
    const noiseGain = this.audioContext.createGain()

    noiseSource.buffer = noiseBuffer
    noiseGain.gain.setValueAtTime(0.5, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

    noiseSource.connect(noiseGain)
    noiseGain.connect(this.masterGain!)

    noiseSource.start(now)
    noiseSource.stop(now + 0.4)
  }

  playGameOver(): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const frequencies = [440, 392, 349, 330]

    frequencies.forEach((freq, i) => {
      this.createOscillator(freq, 'sine', 0.5, now + i * 0.2)
    })
  }

  private createNoiseBuffer(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')

    const bufferSize = this.audioContext.sampleRate * 0.5
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    return buffer
  }

  playBackgroundMusic(): void {
    if (!this.audioContext || !this.masterGain) return

    // Stop any existing music first
    this.stopBackgroundMusic()

    const notes = [
      { freq: 220, duration: 0.4 },
      { freq: 330, duration: 0.4 },
      { freq: 277, duration: 0.4 },
      { freq: 220, duration: 0.8 },
    ]

    const playSequence = () => {
      let time = this.audioContext!.currentTime
      notes.forEach((note) => {
        this.createOscillator(note.freq, 'triangle', note.duration, time)
        time += note.duration
      })
    }

    playSequence()
    this.musicIntervalId = window.setInterval(playSequence, notes.reduce((sum, note) => sum + note.duration, 0) * 1000)
  }

  stopBackgroundMusic(): void {
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId)
      this.musicIntervalId = null
    }
  }
}

export const audioManager = new AudioManager()
