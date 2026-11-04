import React, { useState } from 'react';
import CanvasContainer from './scenes/CanvasContainer';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import HeroOverlay from './sections/HeroOverlay';
import BlockchainTexture from './components/BlockchainTexture';

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <>
      {/*
       * Cursor lives OUTSIDE the shake wrapper.
       * Any CSS transform on its ancestor breaks position:fixed,
       * so it must be a direct child of the React root / body.
       */}
      <CustomCursor />

      {/*
       * Everything else sits inside #shake-wrapper.
       * The break timeline applies screenShake to this div,
       * NOT to document.body, so the cursor is never affected.
       */}
      <div id="shake-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* White flash overlay */}
        <div className="break-flash" aria-hidden="true" />

        {/* Preloader */}
        <Preloader onComplete={() => setIsReady(true)} />

        {/* Persistent 3D Canvas */}
        <CanvasContainer />

        {/* Film grain + vignette */}
        <div className="grain-overlay" aria-hidden="true" />
        <div className="vignette-overlay" aria-hidden="true" />

        {/* Faint hex data streams */}
        <BlockchainTexture />

        {/* Hero overlay */}
        <HeroOverlay isReady={isReady} />
      </div>
    </>
  );
};

export default App;
