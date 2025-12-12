import React, { useState, useEffect } from 'react';
import { Material, StockReportProps, StockReport as IStockReport } from '../types/MaterialTypes';
import './StockReport.css';

const StockReport: React.FC<StockReportProps> = ({ materials, startDate, endDate, reportType }) => {
  const [report, setReport] = useState<IStockReport | null>(null);

  useEffect(() => {
    generateReport();
  }, [materials, startDate, endDate, reportType]);

  const generateReport = () => {
    const currentDate = new Date();
    const start = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : currentDate;

    const dailyReport = {
      date: currentDate.toISOString().split('T')[0],
      entries: materials.filter(m => m.entryDate === currentDate.toISOString().split('T')[0]),
      exits: materials.flatMap(m => m.exitHistory || [])
        .filter(exit => exit.date === currentDate.toISOString().split('T')[0]),
      remainingStock: materials.reduce((sum, m) => sum + m.currentStock, 0),
      totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0),
      materials: materials.map(m => ({
        name: m.name,
        category: m.category,
        currentStock: m.currentStock,
        unit: m.unit,
        unitPrice: m.unitPrice,
        totalValue: m.currentStock * m.unitPrice
      }))
    };

    const monthlyReport = {
      month: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
      totalEntries: materials.filter(m => {
        const entryDate = new Date(m.entryDate);
        return entryDate.getMonth() === currentDate.getMonth() &&
               entryDate.getFullYear() === currentDate.getFullYear();
      }).reduce((sum, m) => sum + m.quantity, 0),
      totalExits: materials.flatMap(m => m.exitHistory || [])
        .filter(exit => {
          const exitDate = new Date(exit.date);
          return exitDate.getMonth() === currentDate.getMonth() &&
                 exitDate.getFullYear() === currentDate.getFullYear();
        })
        .reduce((sum, exit) => sum + exit.quantity, 0),
      remainingStock: materials.reduce((sum, m) => sum + m.currentStock, 0),
      totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0),
      categoryTotals: materials.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + m.currentStock;
        return acc;
      }, {} as Record<string, number>),
      materials: materials.map(m => ({
        name: m.name,
        category: m.category,
        currentStock: m.currentStock,
        unit: m.unit,
        unitPrice: m.unitPrice,
        totalValue: m.currentStock * m.unitPrice
      }))
    };

    const yearlyReport = {
      year: currentDate.getFullYear(),
      totalEntries: materials.filter(m => {
        const entryDate = new Date(m.entryDate);
        return entryDate.getFullYear() === currentDate.getFullYear();
      }).reduce((sum, m) => sum + m.quantity, 0),
      totalExits: materials.flatMap(m => m.exitHistory || [])
        .filter(exit => new Date(exit.date).getFullYear() === currentDate.getFullYear())
        .reduce((sum, exit) => sum + exit.quantity, 0),
      remainingStock: materials.reduce((sum, m) => sum + m.currentStock, 0),
      totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0),
      categoryTotals: materials.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + m.currentStock;
        return acc;
      }, {} as Record<string, number>),
      materials: materials.map(m => ({
        name: m.name,
        category: m.category,
        currentStock: m.currentStock,
        unit: m.unit,
        unitPrice: m.unitPrice,
        totalValue: m.currentStock * m.unitPrice
      }))
    };

    setReport({
      daily: dailyReport,
      monthly: monthlyReport,
      yearly: yearlyReport
    });
  };

  if (!report) return <div>Rapor yükleniyor...</div>;

  const renderMaterialTable = (materials: any[]) => (
    <div className="material-details">
      <h4>Malzeme Detayları</h4>
      <table>
        <thead>
          <tr>
            <th>Malzeme Adı</th>
            <th>Kategori</th>
            <th>Mevcut Stok</th>
            <th>Birim</th>
            <th>Birim Fiyat</th>
            <th>Toplam Değer</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material, index) => (
            <tr key={index}>
              <td>{material.name}</td>
              <td>{material.category}</td>
              <td>{material.currentStock}</td>
              <td>{material.unit}</td>
              <td>{material.unitPrice.toFixed(2)} TL</td>
              <td>{material.totalValue.toFixed(2)} TL</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="stock-report">
      <h2>Depo Stok Raporu</h2>
      
      {reportType === 'daily' && (
        <div className="report-section">
          <h3>Günlük Rapor ({report.daily.date})</h3>
          <div className="report-summary">
            <div className="summary-item">
              <span>Giriş Yapılan Malzeme Sayısı:</span>
              <span>{report.daily.entries.length}</span>
            </div>
            <div className="summary-item">
              <span>Çıkış Yapılan İşlem Sayısı:</span>
              <span>{report.daily.exits.length}</span>
            </div>
            <div className="summary-item">
              <span>Mevcut Toplam Stok:</span>
              <span>{report.daily.remainingStock}</span>
            </div>
            <div className="summary-item">
              <span>Toplam Stok Değeri:</span>
              <span>{report.daily.totalValue.toFixed(2)} TL</span>
            </div>
          </div>
          {renderMaterialTable(report.daily.materials)}
        </div>
      )}

      {reportType === 'monthly' && (
        <div className="report-section">
          <h3>Aylık Rapor ({report.monthly.month})</h3>
          <div className="report-summary">
            <div className="summary-item">
              <span>Toplam Giriş:</span>
              <span>{report.monthly.totalEntries}</span>
            </div>
            <div className="summary-item">
              <span>Toplam Çıkış:</span>
              <span>{report.monthly.totalExits}</span>
            </div>
            <div className="summary-item">
              <span>Mevcut Stok:</span>
              <span>{report.monthly.remainingStock}</span>
            </div>
            <div className="summary-item">
              <span>Toplam Stok Değeri:</span>
              <span>{report.monthly.totalValue.toFixed(2)} TL</span>
            </div>
          </div>
          
          <div className="category-summary">
            <h4>Kategori Bazlı Stok Durumu</h4>
            <table>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Toplam Stok</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.monthly.categoryTotals).map(([category, total]) => (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderMaterialTable(report.monthly.materials)}
        </div>
      )}

      {reportType === 'yearly' && (
        <div className="report-section">
          <h3>Yıllık Rapor ({report.yearly.year})</h3>
          <div className="report-summary">
            <div className="summary-item">
              <span>Toplam Giriş:</span>
              <span>{report.yearly.totalEntries}</span>
            </div>
            <div className="summary-item">
              <span>Toplam Çıkış:</span>
              <span>{report.yearly.totalExits}</span>
            </div>
            <div className="summary-item">
              <span>Mevcut Stok:</span>
              <span>{report.yearly.remainingStock}</span>
            </div>
            <div className="summary-item">
              <span>Toplam Stok Değeri:</span>
              <span>{report.yearly.totalValue.toFixed(2)} TL</span>
            </div>
          </div>
          
          <div className="category-summary">
            <h4>Kategori Bazlı Stok Durumu</h4>
            <table>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Toplam Stok</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.yearly.categoryTotals).map(([category, total]) => (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderMaterialTable(report.yearly.materials)}
        </div>
      )}
    </div>
  );
};

export default StockReport; 
