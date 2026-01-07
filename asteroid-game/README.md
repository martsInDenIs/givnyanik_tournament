# Asteroid Game

A classic arcade-style asteroid game built with React, TypeScript, and HTML5 Canvas.

## Features

- **Classic Gameplay**: Navigate your spaceship through an asteroid field
- **Responsive Controls**: Steer with WASD or Arrow keys, shoot with Space
- **Progressive Difficulty**: Asteroids spawn faster as the game progresses
- **Sound Effects**: Procedurally generated sounds using Web Audio API
  - Shooting sounds
  - Explosion effects
  - Background music (can be toggled)
- **Score Tracking**: Earn points by destroying asteroids
- **Vector Graphics**: Retro arcade-style visuals
- **90s Arcade Cabinet Design**: Nostalgic arcade machine aesthetic with:
  - Neon marquee with glowing title
  - Bezel around the game screen
  - Physical-looking control panel with arcade buttons
  - Purple gradient background with atmospheric lighting
- **Pause Functionality**: Pause and resume the game anytime

## Controls

### Keyboard
- **WASD** or **Arrow Keys**: Control spaceship movement
  - W/Up: Accelerate forward
  - A/Left: Rotate left
  - D/Right: Rotate right
- **Space**: Shoot bullets
- **P** or **ESC**: Pause/Resume game
- **Enter**: Restart game (when game over)

### Arcade Buttons
- **Music Button** (Blue): Toggle background music on/off
- **Pause Button** (Red): Pause/Resume the game

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Technical Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **HTML5 Canvas** for rendering
- **Web Audio API** for procedural sound generation

## Game Mechanics

- Ship wraps around screen edges
- Bullets have limited lifetime
- Collision detection between:
  - Ship and asteroids (game over)
  - Bullets and asteroids (destroy + score)
- **Progressive Difficulty System**:
  - Starts with max 3 asteroids on screen
  - Scales up to max 15 asteroids at 1000 points
  - Spawn rate increases with score (slower → faster)
  - Smooth difficulty curve based on player performance
- **Asteroid Splitting System**:
  - Three sizes: Large (50px), Medium (30px), Small (15px)
  - Large asteroids split into 2 medium asteroids
  - Medium asteroids split into 2 small asteroids
  - Small asteroids are destroyed completely
  - Spawn frequency: Medium (70%), Large (20%), Small (10%)
- **Dynamic Scoring**:
  - Large asteroids: +10 points
  - Medium asteroids: +20 points
  - Small asteroids: +30 points (harder to hit!)
- **Enemy Spaceships**:
  - Appear every 300 points
  - Star-shaped red enemies that chase the player
  - Shoot at player's current position every 2 seconds
  - Have 2 health points (color changes when damaged)
  - Worth +100 points when destroyed

## Project Structure

```
src/
├── components/
│   └── Game.tsx           # Main game component
├── hooks/
│   └── useKeyboard.ts     # Keyboard input handling
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   ├── audio.ts           # Sound effects manager
│   ├── physics.ts         # Game physics and collision detection
│   └── renderer.ts        # Canvas rendering functions
├── App.tsx                # Root component
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## License

MIT
