import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './AdminPanel.css';

interface ExcelData {
  [key: string]: string | number;
}

interface DebtSummary {
  daily: number;
  weekly: number;
  monthly: number;
}

interface AdminPanelProps {
  onDebtSummaryUpdate: (summary: DebtSummary) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onDebtSummaryUpdate }) => {
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExcelFile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Excel dosyasını oku
        const response = await fetch('/depo.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        const workbook = XLSX.read(data, { type: 'array' });
        if (!workbook.SheetNames.length) {
          throw new Error('Excel dosyasında sayfa bulunamadı');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelData[];

        if (jsonData.length === 0) {
          throw new Error('Excel dosyasında veri bulunamadı');
        }

        const firstRow = jsonData[0];
        const excelHeaders = Object.keys(firstRow);
        
        if (excelHeaders.length === 0) {
          throw new Error('Excel dosyasında başlık bulunamadı');
        }

        setHeaders(excelHeaders);
        setExcelData(jsonData);

        // Eksi para özetini hesapla
        const today = new Date();
        const dailyDebt = calculateDebtForPeriod(jsonData, today, 1);
        const weeklyDebt = calculateDebtForPeriod(jsonData, today, 7);
        const monthlyDebt = calculateDebtForPeriod(jsonData, today, 30);

        onDebtSummaryUpdate({
          daily: dailyDebt,
          weekly: weeklyDebt,
          monthly: monthlyDebt
        });

      } catch (err) {
        console.error('Excel okuma hatası:', err);
        setError(err instanceof Error ? err.message : 'Excel dosyası okunurken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadExcelFile();
  }, [onDebtSummaryUpdate]);

  const calculateDebtForPeriod = (data: ExcelData[], endDate: Date, days: number): number => {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    return data.reduce((total, row) => {
      const date = new Date(row['Tarih'] as string);
      if (date >= startDate && date <= endDate) {
        return total + (Number(row['Eksi Para']) || 0);
      }
      return total;
    }, 0);
  };

  return (
    <div className="admin-panel">
      <h2>Depo Verileri</h2>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Veriler yükleniyor...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {headers.length > 0 && (
        <div className="headers-section">
          <h3>Excel Başlıkları</h3>
          <div className="headers-grid">
            {headers.map((header, index) => (
              <div key={index} className="header-item">
                {header}
              </div>
            ))}
          </div>
        </div>
      )}

      {excelData.length > 0 && (
        <div className="data-table">
          <h3>Depo Tablosu</h3>
          <table>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 
