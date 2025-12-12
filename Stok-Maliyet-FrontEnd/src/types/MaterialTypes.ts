export interface EntryRecord {
  date: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  notes?: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  criticalLevel: number;
  minLevel: number;
  maxStockLimit: number;
  year: number;
  yearlyEntries: number;
  totalReceived: number;
  totalExited: number;
  expirationDate: string;
  exitHistory: ExitRecord[];
  entryHistory: EntryRecord[];
  entryDate: string;
  lastExitDate?: string;
  lastExitQuantity?: number;
  quantity: number;
  has20Percent: string;
}

export interface ExitRecord {
  date: string;
  quantity: number;
  remainingStock: number;
  customerName: string;
  explanation?: string;
}

export interface MaterialFormData {
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  criticalLevel: number;
  minLevel: number;
  maxStockLimit: number;
  expirationDate: string;
  entryDate: string;
  budget: string;
  purchaseMethod: string;
  purchaseType: string;
  purchaseUnit: string;
  budgetType: string;
  purchaseAmount: number;
  company: string;
  description: string;
  has20Percent: string;
}

export interface MaterialDetails {
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
}

export interface StockReport {
  daily: {
    date: string;
    entries: Material[];
    exits: ExitRecord[];
    remainingStock: number;
    totalValue: number;
    materials: MaterialDetails[];
  };
  monthly: {
    month: string;
    totalEntries: number;
    totalExits: number;
    remainingStock: number;
    totalValue: number;
    categoryTotals: Record<string, number>;
    materials: MaterialDetails[];
  };
  yearly: {
    year: number;
    totalEntries: number;
    totalExits: number;
    remainingStock: number;
    totalValue: number;
    categoryTotals: Record<string, number>;
    materials: MaterialDetails[];
  };
}

export const CATEGORIES = [
  '21F',
  '22D',
  '22A',
  '19. Madde'
] as const;

export interface MaterialEntryProps {
  materials: Material[];
  onSubmit: (formData: MaterialFormData) => void;
  setMaterials?: React.Dispatch<React.SetStateAction<Material[]>>;
}

export interface MaterialExitProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}

export interface StockMonitorProps {
  materials: Material[];
}

export interface YearEndTransferProps {
  materials: Material[];
  onTransfer: (updatedMaterials: Material[]) => void;
}

export interface StockReportProps {
  materials: Material[];
  startDate?: string;
  endDate?: string;
  reportType: 'daily' | 'monthly' | 'yearly';
}

export interface YearEndTransferType {
  materialId: string;
  transferQuantity: number;
}

export interface MaterialType {
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  criticalLevel: number;
  minLevel: number;
  maxStockLimit: number;
}

export const materialTypes: MaterialType[] = [
  {
    name: "Pilavlık Bulgur",
    category: "Kuru Gıdalar",
    unit: "kg",
    unitPrice: 45.50,
    criticalLevel: 100,
    minLevel: 30,
    maxStockLimit: 200
  },
  {
    name: "Ayçiçek Yağı",
    category: "Yağlar",
    unit: "lt",
    unitPrice: 89.90,
    criticalLevel: 50,
    minLevel: 15,
    maxStockLimit: 100
  },
  {
    name: "Makarna",
    category: "Kuru Gıdalar",
    unit: "kg",
    unitPrice: 35.90,
    criticalLevel: 100,
    minLevel: 30,
    maxStockLimit: 200
  },
  {
    name: "Şeker",
    category: "Kuru Gıdalar",
    unit: "kg",
    unitPrice: 42.90,
    criticalLevel: 100,
    minLevel: 30,
    maxStockLimit: 200
  },
  {
    name: "Tuz",
    category: "Baharatlar",
    unit: "kg",
    unitPrice: 15.90,
    criticalLevel: 100,
    minLevel: 30,
    maxStockLimit: 200
  }
]; 
