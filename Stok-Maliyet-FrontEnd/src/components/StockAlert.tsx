import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockAlert.css';
import { Material } from '../types/MaterialTypes';

interface StockAlertProps {
  materials: Material[];
}

const StockAlert: React.FC<StockAlertProps> = ({ materials }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const criticalItems = materials.filter(
    material => material.currentStock <= material.criticalLevel
  );

  // Son kullanma tarihine 30 gün veya daha az kalan ürünleri filtrele
  const expiringItems = materials.filter(material => {
    if (!material.expirationDate) return false;
    const expirationDate = new Date(material.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
  });

  const handleNavigateToList = () => {
    navigate('/malzeme-listesi');
    setIsVisible(false);
  };

  if (criticalItems.length === 0 && expiringItems.length === 0) {
    return (
      <div className="stock-alerts-container">
        <div className="notification-container">
          <div className="clock">
            <span>🕒</span>
            {currentTime.toLocaleTimeString('tr-TR')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-alerts-container">
      <div className="notification-container">
        <div className="clock">
          <span>🕒</span>
          {currentTime.toLocaleTimeString('tr-TR')}
        </div>
        {!isVisible && (hasUnreadAlerts || criticalItems.length > 0 || expiringItems.length > 0) && (
          <button className="notification-toggle" onClick={() => setIsVisible(true)}>
            <span className="notification-icon">🔔</span>
            {(criticalItems.length + expiringItems.length) > 0 && (
              <span className="notification-badge">{criticalItems.length + expiringItems.length}</span>
            )}
          </button>
        )}
      </div>

      {isVisible && (
        <div className="stock-alerts-container">
          <button className="close-alerts" onClick={() => setIsVisible(false)}>×</button>
          {criticalItems.length > 0 && (
            <div className="stock-alert critical-alert" onClick={handleNavigateToList} style={{ cursor: 'pointer' }}>
              <div className="alert-header">
                <span className="alert-icon">⚠️</span>
                <span>Kritik Stok Uyarısı</span>
              </div>
              <div className="alert-content">
                {criticalItems.map((item) => (
                  <div key={item.id} className="alert-item">
                    <strong>{item.name}</strong>
                    <span className="alert-details">
                      Mevcut: {item.currentStock} {item.unit}
                      (Kritik Seviye: {item.criticalLevel} {item.unit})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiringItems.length > 0 && (
            <div className="stock-alert expiring-alert" onClick={handleNavigateToList} style={{ cursor: 'pointer' }}>
              <div className="alert-header">
                <span className="alert-icon">⏰</span>
                <span>Son Kullanma Tarihi Yaklaşanlar</span>
              </div>
              <div className="alert-content">
                {expiringItems.map((item) => {
                  const daysUntilExpiration = Math.ceil(
                    (new Date(item.expirationDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={item.id} className="alert-item">
                      <strong>{item.name}</strong>
                      <span className="alert-details">
                        Son Kullanma: {new Date(item.expirationDate!).toLocaleDateString('tr-TR')}
                        <br />
                        <span className="days-remaining">
                          {daysUntilExpiration} gün kaldı
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockAlert; 