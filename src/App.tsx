import React, { useState } from 'react';
import CanvasContainer from './scenes/CanvasContainer';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import HeroOverlay from './sections/HeroOverlay';
import BlockchainTexture from './components/BlockchainTexture';

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <main className="app-root">
      {/* 1. Custom Interactive Cursor */}
      <CustomCursor />

      {/* 2. Initial Preloader */}
      <Preloader onComplete={() => setIsReady(true)} />

      {/* 3. Persistent 3D Canvas with Ambience, Chain, and Post-processing */}
      <CanvasContainer />

      {/* 4. Film Grain and Vignette Overlays */}
      <div className="grain-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />

      {/* 5. Faint Blockchain Hex Flank Streams */}
      <BlockchainTexture />

      {/* 6. Hero Overlay UI (active in phase === 'intro') */}
      <HeroOverlay isReady={isReady} />
    </main>
  );
};

export default App;
