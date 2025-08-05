# Shiny Hunter

A modern Pokemon shiny hunting tracker built with Next.js, React, and TypeScript. Track your progress through the Paldea Pokedex, mark Pokemon as caught or shiny, and monitor your completion statistics.

## Features

- **Pokemon Tracking**: Mark Pokemon as caught or shiny with a simple checkbox system
- **Search Functionality**: Search Pokemon by name or Pokedex number
- **Progress Statistics**: View your completion percentage and shiny count
- **Version Exclusives**: Visual indicators for Scarlet and Violet exclusive Pokemon
- **Persistent Storage**: Your progress is saved locally in your browser
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pixelasticity/shinyhunter.git
cd shinyhunter
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Tracking Pokemon

- **Click the checkbox** next to any Pokemon to cycle through states:
  - Empty: Not caught
  - Checkmark: Caught (regular)
  - Star: Caught (shiny)

### Searching

- Use the search bar to find Pokemon by:
  - **Name**: Type any part of the Pokemon's name (e.g., "pika" for Pikachu)
  - **Number**: Enter the Pokedex number (e.g., "25" for Pikachu)
  - **Padded Number**: Use leading zeros (e.g., "025")

### Progress Tracking

- View your completion statistics at the top of the page
- See total caught Pokemon and shiny count
- Monitor your progress with the visual progress bar
- Check recently caught Pokemon in the stats section

### Version Exclusives

Pokemon exclusive to specific versions are marked with colored tags:
- **Red tag**: Scarlet exclusive
- **Purple tag**: Violet exclusive

## Technical Details

### Built With

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **SWR** - Data fetching and caching
- **CSS Modules** - Scoped styling
- **PokeAPI** - Pokemon data source

### Data Storage

- Pokemon states are stored in browser localStorage
- Data persists between sessions
- No server or account required

### API Integration

- Fetches Pokemon data from [PokeAPI](https://pokeapi.co/)
- Uses the Paldea Pokedex (ID: 31) containing 400 Pokemon
- Loads high-quality sprites from Pokemon HOME

## Project Structure

```
src/
├── app/
│   ├── components/          # React components
│   │   ├── CaughtManager.tsx    # Pokemon state management
│   │   ├── list.tsx             # Main Pokemon list
│   │   ├── Stats.tsx            # Progress statistics
│   │   ├── search.tsx           # Search functionality
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   └── usePokemonState.ts   # Pokemon state hook
│   ├── lib/                 # Utility functions
│   └── font/                # Custom fonts
└── public/                  # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

The app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended): Connect your GitHub repository
- **Netlify**: Use the Next.js build settings
- **Self-hosted**: Build and serve the static files

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Pokemon data provided by [PokeAPI](https://pokeapi.co/)
- Pokemon sprites from [PokeAPI Sprites](https://github.com/PokeAPI/sprites)
- Built with [Next.js](https://nextjs.org/)
