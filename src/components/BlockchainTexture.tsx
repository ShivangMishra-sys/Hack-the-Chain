import React from 'react';
import { useAppStore } from '../store/useAppStore';

const HEX_STREAM_LEFT = [
  '0x7f3a8b...c91b',
  'blk #192084 [sync]',
  'sig: ed25519_vrf',
  'root: 0x9b2a...31e0',
  '0x41e0ff...d8a2',
  'tx_cnt: 2,410/s',
  'state_root: 0x8a...4b',
  'diff: 38.41 TH/s',
  '0x10ac49...fe72',
  'merkle_path: [valid]',
  '0x3d82a1...009c',
  'gas_target: 30.0M',
];

const HEX_STREAM_RIGHT = [
  '0xda73b9...55c2',
  'zk-snark [verified]',
  'block: 0x82b9...1a',
  'epoch: 41829 // OK',
  '0x2e8f10...bb39',
  'hash: 00000000000...',
  'val_set: 100/100',
  '0xfe8901...39ab',
  'chain_id: 0x485443',
  'peer_pool: 64 active',
  '0x6c19a4...de81',
  'finality: 2 slots',
];

export const BlockchainTexture: React.FC = () => {
  const ambienceIntensity = useAppStore((state) => state.ambienceIntensity);

  return (
    <div
      className="blockchain-texture-container"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: ambienceIntensity,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Left flank stream */}
      <div className="hex-column hex-col-left">
        <div className="hex-stream">
          {[...HEX_STREAM_LEFT, ...HEX_STREAM_LEFT].map((str, idx) => (
            <div key={idx} className="hex-row">
              {str}
            </div>
          ))}
        </div>
      </div>

      {/* Right flank stream */}
      <div className="hex-column hex-col-right">
        <div className="hex-stream hex-stream-reverse">
          {[...HEX_STREAM_RIGHT, ...HEX_STREAM_RIGHT].map((str, idx) => (
            <div key={idx} className="hex-row">
              {str}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlockchainTexture;

