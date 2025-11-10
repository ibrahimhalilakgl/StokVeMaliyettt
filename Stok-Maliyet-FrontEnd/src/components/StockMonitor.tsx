import React, { useEffect, useState } from 'react';
import { Material } from '../types/MaterialTypes';
import './StockMonitor.css';

interface StockMonitorProps {
  materials: Material[];
}

const StockMonitor: React.FC<StockMonitorProps> = ({ materials }) => {
  const [alerts, setAlerts] = useState<Material[]>([]);

  // Stok durumunu kontrol et ve uyarıları güncelle
  useEffect(() => {
    const checkStockLevels = () => {
      const criticalItems = materials.filter(material => 
        material.currentStock <= material.criticalLevel
      );
      setAlerts(criticalItems);
    };

    // İlk kontrol
    checkStockLevels();

    // Her 5 dakikada bir kontrol et
    const interval = setInterval(checkStockLevels, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [materials]);

  // Stok durumuna göre renk sınıfı belirle
  const getStockStatusClass = (material: Material): string => {
    if (material.currentStock <= material.criticalLevel) {
      return 'stock-critical';
    } else if (material.currentStock <= material.minLevel) {
      return 'stock-warning';
    }
    return 'stock-normal';
  };

  // Stok durumuna göre durum metni
  const getStockStatusText = (material: Material): string => {
    if (material.currentStock <= material.criticalLevel) {
      return 'KRİTİK';
    } else if (material.currentStock <= material.minLevel) {
      return 'DÜŞÜK';
    }
    return 'NORMAL';
  };

  return (
    <div className="stock-monitor">
      <h2>Stok Takip</h2>
      
      {alerts.length > 0 && (
        <div className="stock-alerts">
          <h3>Kritik Stok Uyarıları</h3>
          <div className="alert-list">
            {alerts.map(material => (
              <div key={material.id} className="alert-item">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">
                  {material.name} stok seviyesi kritik! 
                  (Mevcut: {material.currentStock} {material.unit})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stock-table">
        <h3>Stok Durumu</h3>
        <table>
          <thead>
            <tr>
              <th>Malzeme Adı</th>
              <th>Mevcut Stok</th>
              <th>Birim</th>
              <th>Minimum Seviye</th>
              <th>Kritik Seviye</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id} className={getStockStatusClass(material)}>
                <td>{material.name}</td>
                <td>{material.currentStock}</td>
                <td>{material.unit}</td>
                <td>{material.minLevel}</td>
                <td>{material.criticalLevel}</td>
                <td className="status-cell">{getStockStatusText(material)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMonitor; 