import React from 'react';

const PropertiesPanel: React.FC = () => {
  return (
    <div className="side-panel side-panel-right">
      <h3 className="panel-title">Propriétés</h3>
      <div className="properties-container">
        <p className="empty-message">Sélectionnez un élément pour voir ses propriétés</p>

        {/* Ces champs seront affichés dynamiquement selon l'élément sélectionné */}
        <div className="property-group hidden">
          <div className="property-item">
            <label>Nom:</label>
            <input type="text" className="property-input" />
          </div>

          <div className="property-item">
            <label>Largeur:</label>
            <input type="number" className="property-input" />
          </div>

          <div className="property-item">
            <label>Hauteur:</label>
            <input type="number" className="property-input" />
          </div>

          <div className="property-item">
            <label>Couleur:</label>
            <input type="color" className="property-input" />
          </div>

          <div className="property-item">
            <label>Notes:</label>
            <textarea className="property-textarea"></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;