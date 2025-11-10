import React, { useState } from 'react';
import { MaterialFormData } from '../types/MaterialTypes';
import './MaterialEntryForm.css';

interface MaterialEntryFormProps {
  onSubmit: (formData: MaterialFormData) => void;
}

const MaterialEntryForm: React.FC<MaterialEntryFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    category: '',
    quantity: 0,
    unit: 'adet',
    unitPrice: 0,
    entryDate: new Date().toISOString().split('T')[0],
    criticalLevel: 0,
    minLevel: 0,
    maxStockLimit: 0,
    expirationDate: '',
    budget: '',
    purchaseMethod: '',
    purchaseType: '',
    purchaseUnit: '',
    budgetType: '',
    purchaseAmount: 0,
    company: '',
    description: '',
    has20Percent: 'Yok'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: 'adet',
      unitPrice: 0,
      entryDate: new Date().toISOString().split('T')[0],
      criticalLevel: 0,
      minLevel: 0,
      maxStockLimit: 0,
      expirationDate: '',
      budget: '',
      purchaseMethod: '',
      purchaseType: '',
      purchaseUnit: '',
      budgetType: '',
      purchaseAmount: 0,
      company: '',
      description: '',
      has20Percent: 'Yok'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'quantity' || name === 'unitPrice') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="material-entry-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Malzeme Adı:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Kategori:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Seçiniz...</option>
            <option value="Kuru Gıdalar">Kuru Gıdalar</option>
            <option value="Yağlar">Yağlar</option>
            <option value="İçecekler">İçecekler</option>
            <option value="Temizlik">Temizlik</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Miktar:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="unit">Birim:</label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
          >
            <option value="adet">Adet</option>
            <option value="kg">Kilogram</option>
            <option value="lt">Litre</option>
            <option value="paket">Paket</option>
            <option value="kutu">Kutu</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="unitPrice">Birim Fiyat (TL):</label>
          <input
            type="number"
            id="unitPrice"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="entryDate">Giriş Tarihi:</label>
          <input
            type="date"
            id="entryDate"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Malzeme Girişi Yap
        </button>
      </form>
    </div>
  );
};

export default MaterialEntryForm; 