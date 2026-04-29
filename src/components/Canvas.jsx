import { useRef } from 'react';
import Scene from './Scene';

function Canvas() {
  const mountRef = useRef(null);

  return (
    <>
      <div
        ref={mountRef}
        className="canvas-stage"
        aria-label="3D roller coaster simulation canvas"
      />
      <Scene mountRef={mountRef} />
    </>
  );
}

export default Canvas;
