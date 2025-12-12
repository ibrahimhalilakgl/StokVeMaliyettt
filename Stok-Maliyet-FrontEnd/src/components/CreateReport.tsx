import React, { useState, useEffect } from "react"; 
import { Container, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from "@mui/material";
import axios from "axios";

interface Report {
  id: number;
  reportType: string;
  reportCreateDate: string;
  ticketQuantity: number;
  totalTicketPrice: number;
  totalPersonQuantity: number;
  totalMaterialPrice: number;
  averagePersonCost: number;
  averageTicketCost: number;
  leftoverMealCount: number;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
};

const formatNumber = (number: number) =>
  number.toLocaleString('tr-TR', { minimumFractionDigits: 2 });

const formatQuantity = (number: number) =>
  number.toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  });

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTab, setSelectedTab] = useState("ALL");

  useEffect(() => {
    axios
      .get("/report/all")
      .then((response) => setReports(response.data.data))
      .catch((error) => console.error("Error fetching reports:", error));
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };
  const reportTypeMap: Record<string, string> = {
  DAILY: "Günlük",
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
  ALL: "Tümü",
};

  const filteredReports = selectedTab === "ALL" ? reports : reports.filter((report) => report.reportType === selectedTab);

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '35px' }}>
        Rapor Listesi
      </Typography>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3, fontWeight: "600" }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Tümü" value="ALL" sx={{ fontWeight: selectedTab === "ALL" ? "bold" : "normal" }} />
        <Tab label="Günlük" value="DAILY" sx={{ fontWeight: selectedTab === "DAILY" ? "bold" : "normal" }} />
        <Tab label="Haftalık" value="WEEKLY" sx={{ fontWeight: selectedTab === "WEEKLY" ? "bold" : "normal" }} />
        <Tab label="Aylık" value="MONTHLY" sx={{ fontWeight: selectedTab === "MONTHLY" ? "bold" : "normal" }} />
        <Tab label="Yıllık" value="YEARLY" sx={{ fontWeight: selectedTab === "YEARLY" ? "bold" : "normal" }} />
      </Tabs>

      <TableContainer component={Paper} sx={{ boxShadow: 3, maxHeight: '70vh', overflow: 'auto' }}>
        <Table sx={{ minWidth: 750 }} stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Rapor Oluşturulma Tarihi</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Rapor Türü</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Satılan Toplam Yemek Sayısı</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Yapılan Yemek Sayısı</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Toplam Malzeme Tutarı (₺)</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Toplam Fiş Tutarı (₺)</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Yapılan Yemeğe göre 1 Porsiyon Maliyeti (₺)</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Satılan Fişe göre 1 Porsiyon Maliyeti (₺)</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>Artan Yemek Sayısı</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box textAlign="center" py={3} color="text.secondary">
                    Seçili filtreye ait rapor bulunamadı.
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell  align="center">{formatDate(report.reportCreateDate)}</TableCell>
                  <TableCell  align="center" sx={{ textTransform: "capitalize" }}>{reportTypeMap[report.reportType] || report.reportType}</TableCell>
                  <TableCell  align="center" >{formatQuantity(report.ticketQuantity)}</TableCell>
                  <TableCell  align="center" >{formatQuantity(report.totalPersonQuantity)}</TableCell>
                  <TableCell  align="center" >{formatNumber(report.totalMaterialPrice)} ₺</TableCell>
                  <TableCell  align="center" >{formatNumber(report.totalTicketPrice)} ₺</TableCell>
                  <TableCell  align="center" >{report.averagePersonCost.toFixed(2)} ₺</TableCell>
                  <TableCell  align="center" >{report.averageTicketCost.toFixed(2)} ₺</TableCell>
                  <TableCell  align="center" >{report.leftoverMealCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReportList;
