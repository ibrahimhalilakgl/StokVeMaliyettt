const XLSX = require('xlsx');

// Dosyayı oku
const workbook = XLSX.readFile('depo.xlsx', {
    cellStyles: true,
    cellDates: true,
    cellNF: true,
    cellFormula: true
});

// Mevcut sayfaları listele
console.log("Mevcut sayfalar:", workbook.SheetNames);

// Ana Sayfa depo modülü ve Mali Tablo Modülü sayfalarını al
const depoModulu = workbook.Sheets[' Ana Sayfa depo modülü'];
const maliTablo = workbook.Sheets['Mali Tablo Modülü '];

// Depo modülündeki veriyi al
const depoData = XLSX.utils.sheet_to_json(depoModulu, {header: 1, raw: false});
console.log("\nDepo modülü verisi:", depoData);

// Mali tablo verisini al
const maliData = XLSX.utils.sheet_to_json(maliTablo, {header: 1, raw: false});
console.log("\nMali tablo verisi:", maliData);

// Mali tabloya depo modülü verisini ekle
const combinedData = [...maliData];
// Boş bir satır ekle
combinedData.push([]);
// Depo modülü verisini ekle
combinedData.push(...depoData);

// Yeni mali tablo sayfası oluştur
const newMaliTablo = XLSX.utils.aoa_to_sheet(combinedData);

// Grafik verilerini hazırla
const chartData = {
    labels: ['Geçen Yıldan Devir', 'Yıl İçinde Alınan', '22(d) Bendi', 'Toplam', 'Depodan Çıkan', 'Depoda Kalan'],
    values: [200, 200, 100, 500, 400, 100] // Örnek veriden alınan değerler
};

// Grafik oluştur (Sütun grafiği)
const chart = {
    type: 'column',
    data: {
        labels: chartData.labels,
        datasets: [{
            data: chartData.values,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Depo Durumu'
        },
        legend: {
            display: false
        }
    }
};

// Grafiği Excel'e ekle
if (!newMaliTablo.drawings) newMaliTablo.drawings = [];
newMaliTablo.drawings.push({
    type: 'chart',
    properties: {
        type: 'column',
        chartData: chart,
        position: {
            type: 'absolute',
            x: 0,
            y: combinedData.length + 2 // Verilerin altına ekle
        }
    }
});

// Stil ve format özelliklerini kopyala
if (depoModulu['!cols']) newMaliTablo['!cols'] = depoModulu['!cols'];
if (depoModulu['!rows']) newMaliTablo['!rows'] = depoModulu['!rows'];
if (depoModulu['!merges']) newMaliTablo['!merges'] = depoModulu['!merges'];

// Yeni workbook oluştur
const newWorkbook = XLSX.utils.book_new();

// Mali tabloyu ilk sayfa olarak ekle
XLSX.utils.book_append_sheet(newWorkbook, newMaliTablo, 'Mali Tablo Modülü ');

// Diğer sayfaları ekle
workbook.SheetNames.forEach(sheetName => {
    if (sheetName !== 'Mali Tablo Modülü ') {
        const sheet = workbook.Sheets[sheetName];
        XLSX.utils.book_append_sheet(newWorkbook, sheet, sheetName);
    }
});

// Dosyayı kaydet
XLSX.writeFile(newWorkbook, 'depo_updated.xlsx', {
    cellStyles: true,
    cellDates: true,
    cellNF: true,
    cellFormula: true,
    bookSST: true,
    compression: true
});

// Hangi sayfaların eklendiğini göster
console.log("\nSon durumdaki sayfalar:", newWorkbook.SheetNames); 