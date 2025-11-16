import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  TablePagination,
  Box,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import dayjs from "dayjs";

interface ProductResponse {
  name: string;
  vatAmount: number;
  criticalLevel: number;
  measurementType: string;
  category: string;
}

interface Material {
  quantity: number;
  unitPrice: number;
  entryDate: string;
  expiryDate: string;
  companyName: string;
  description: string;
  totalPrice: number;
  entrySourceType: string;
  totalPriceIncludingVat: number;
  productResponse: ProductResponse;
  purchaseTypeName: string;
  purchasedUnitName: string;
}

const MaterialList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  useEffect(() => {
    axios
      .get("/v1/materialEntry/all")
      .then((response) => {
        setMaterials(response.data.data);
      })
      .catch((error) => {
        console.error("Malzeme verileri alınamadı:", error);
      });
  }, []);

  const uniqueCategories = Array.from(
    new Set(materials.map((m) => m.productResponse.category))
  );

  const uniqueUnits = Array.from(
    new Set(materials.map((m) => m.purchasedUnitName))
  );

    const calculateDaysToExpiry = (expiryDate: string): number => {
    const today = dayjs();
    const expiry = dayjs(expiryDate);
    return expiry.diff(today, "day");
  };

  const filteredMaterials = materials.filter((material) => {
    const nameMatch = material.productResponse.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter
      ? material.productResponse.category === categoryFilter
      : true;
    const unitMatch = unitFilter
      ? material.purchasedUnitName === unitFilter
      : true;
    return nameMatch && categoryMatch && unitMatch;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    const daysA = calculateDaysToExpiry(a.expiryDate);
    const daysB = calculateDaysToExpiry(b.expiryDate);
    
    // 1. Süresi geçmişler öne
    if (daysA < 0 && daysB >= 0) return -1;
    if (daysB < 0 && daysA >= 0) return 1;

    // 2. Son kullanma tarihi daha yakın olan öne gelsin
    return daysA - daysB;
  });



  const formatNumber = (value: number) =>
    value.toLocaleString("tr-TR", { minimumFractionDigits: 2 });

  const formatDate = (dateStr: string) => {
    const date = dayjs(dateStr);
    return date.isValid() ? date.format("DD-MM-YYYY") : "-";
  };

 const paginatedMaterials = sortedMaterials.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);

  const nearExpiryCount = filteredMaterials.filter((mat) => {
    const days = calculateDaysToExpiry(mat.expiryDate);
    return days <= 10 && days >= 0;
  }).length;

  const expiredCount = filteredMaterials.filter(
    (mat) => calculateDaysToExpiry(mat.expiryDate) < 0
  ).length;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Malzeme Listesi
      </Typography>

      {(nearExpiryCount > 0 || expiredCount > 0) && (
        <Box mb={2}>
          {expiredCount > 0 && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {expiredCount} malzemenin son kullanma tarihi geçmiştir!
            </Alert>
          )}
          {nearExpiryCount > 0 && (
            <Alert severity="warning">
              {nearExpiryCount} malzemenin son kullanma tarihi yaklaşmaktadır!
            </Alert>
          )}
        </Box>
      )}

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Malzeme Ara"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: "250px", flex: 1 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={categoryFilter}
            label="Kategori"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">Tümü</MenuItem>
            {uniqueCategories.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Alım Yapılan Birim</InputLabel>
          <Select
            value={unitFilter}
            label="Alım Yapılan Birim"
            onChange={(e) => setUnitFilter(e.target.value)}
          >
            <MenuItem value="">Tümü</MenuItem>
            {uniqueUnits.map((unit, index) => (
              <MenuItem key={index} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead style={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              {[
                "Sıra No",
                "Malzeme Adı",
                "Kategori",
                "Miktar",
                "Birim",
                "Birim Fiyat (TL)",
                "Toplam (TL)",
                "KDV Dahil Tutar (TL)",
                "Durum",
                "Son Kullanma Tarihi",
                "Firma",
                "Alım Yapılan Birim",
              ].map((header, i) => (
                <TableCell
                  key={i}
                  style={{
                    color: "black",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMaterials.map((material, index) => {
              const daysToExpiry = calculateDaysToExpiry(material.expiryDate);
              const isExpired = daysToExpiry < 0;
              const isNearExpiry = daysToExpiry >= 0 && daysToExpiry <= 10;

              // Öncelik sırası: Süresi Geçmiş > Yaklaşan > Normal
              const rowStyle = {
                backgroundColor: isExpired
                  ? "#ffebee"
                  : isNearExpiry
                  ? "#fff8e1"
                  : "inherit",
              };

              const textColor = isExpired 
                ? "red" 
                : isNearExpiry 
                ? "#f57c00" 
                : "inherit";

              return (
                <TableRow key={index} style={rowStyle}>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {material.productResponse.name}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {material.productResponse.category}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {formatNumber(material.quantity)}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {material.productResponse.measurementType}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {formatNumber(material.unitPrice)}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {formatNumber(material.totalPrice)}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {formatNumber(material.totalPriceIncludingVat)}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {material.productResponse.criticalLevel}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "center",
                      color: textColor,
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    {formatDate(material.expiryDate)}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {material.companyName}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", fontSize: "15px" }}>
                    {material.purchasedUnitName}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center">
        <TablePagination
          component="div"
          count={filteredMaterials.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Box>
    </Box>
  );
};

export default MaterialList;
