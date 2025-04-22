import React, { useRef, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';

const EditorCanvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stageRef.current && containerRef.current) {
      // Ajustement de la taille du canevas à son conteneur
      const resizeCanvas = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          const height = containerRef.current.offsetHeight;
          stageRef.current.width(width);
          stageRef.current.height(height);
          stageRef.current.batchDraw();
        }
      };

      // Ajustement initial
      resizeCanvas();

      // Ajustement lors du redimensionnement de la fenêtre
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="editor-area">
      <Stage ref={stageRef} width={800} height={600}>
        <Layer>
          {/* Les éléments de la carte VSM seront ajoutés ici */}
        </Layer>
      </Stage>
    </div>
  );
};

export default EditorCanvas;