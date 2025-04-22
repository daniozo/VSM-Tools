import React from 'react';

const PropertiesPanel: React.FC = () => {
  return (
    <div className="bg-background-secondary h-full border-l border-border-subtle">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-gray-100">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-text-primary">Propriétés</h3>
      </div>
      <div className="p-3">
        <p className="text-text-secondary italic text-sm">Sélectionnez un élément pour voir ses propriétés</p>

        {/* Ces champs seront affichés dynamiquement selon l'élément sélectionné */}
        <div className="mt-4 hidden">
          <div className="mb-3">
            <label className="block text-sm font-medium text-text-primary mb-1">Nom:</label>
            <input type="text" className="w-full p-2 border border-border-subtle rounded-md bg-white text-text-primary" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-text-primary mb-1">Largeur:</label>
            <input type="number" className="w-full p-2 border border-border-subtle rounded-md bg-white text-text-primary" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-text-primary mb-1">Hauteur:</label>
            <input type="number" className="w-full p-2 border border-border-subtle rounded-md bg-white text-text-primary" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-text-primary mb-1">Couleur:</label>
            <input type="color" className="w-full h-8 border border-border-subtle rounded-md bg-white" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-text-primary mb-1">Notes:</label>
            <textarea className="w-full p-2 border border-border-subtle rounded-md bg-white text-text-primary min-h-[100px]"></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;