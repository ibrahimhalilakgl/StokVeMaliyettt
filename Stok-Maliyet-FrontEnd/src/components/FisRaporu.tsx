import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/tr';
import localeData from 'dayjs/plugin/localeData';

dayjs.locale('tr');
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(localeData);

interface TicketData {
  ticketTypeName: string;
  unitPrice: number;
  totalSalesCount: number;
  totalPrice: number;
}

type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const FisRaporu: React.FC = () => {
  const today = dayjs();
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(today.year());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.month());
  const [selectedDay, setSelectedDay] = useState<number>(today.date());
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);

 
  useEffect(() => {
    if (reportType === 'daily') {
      const daysInMonth = dayjs(`${selectedYear}-${selectedMonth + 1}-01`).daysInMonth();
      let days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      
  
      if (selectedYear === today.year() && selectedMonth === today.month()) {
        days = days.filter(day => day <= today.date());
      }
      
      setAvailableDays(days);
      if (!days.includes(selectedDay)) {
        setSelectedDay(days.length > 0 ? days[days.length - 1] : 1);
      }
    } else if (reportType === 'weekly') {
      const weeks = generateWeeks(selectedYear, selectedMonth)
        .filter(week => {
          const [start] = week.split(' - ');
          const startDay = parseInt(start.split(' ')[0]);
          const monthName = start.split(' ')[1];
          const monthIndex = dayjs.months().indexOf(monthName);
          const weekDate = dayjs(new Date(selectedYear, monthIndex, startDay));
          return weekDate.isBefore(today) || weekDate.isSame(today, 'day');
        });
      
      setAvailableWeeks(weeks);
      if (weeks.length > 0 && !weeks.includes(selectedWeek)) {
        setSelectedWeek(weeks[weeks.length - 1]);
      } else if (weeks.length === 0) {
        setSelectedWeek('');
      }
    }
  }, [selectedYear, selectedMonth, reportType]);

  const generateWeeks = (year: number, month: number) => {
    const weeks: string[] = [];
    let current = dayjs(new Date(year, month, 1)).startOf('isoWeek');
    const endOfMonth = dayjs(new Date(year, month, 1)).endOf('month');

    while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, 'month')) {
      const start = current.format('D MMMM');
      const end = current.add(6, 'day').format('D MMMM');
      weeks.push(`${start} - ${end}`);
      current = current.add(1, 'week');
    }

    return weeks;
  };

  // Get available months based on selected year (filter out future months)
  const getAvailableMonths = () => {
    let months = Array.from({ length: 12 }, (_, i) => i);
    if (selectedYear === today.year()) {
      months = months.filter(month => month <= today.month());
    }
    return months;
  };

  // Get available years (filter out future years)
  const getAvailableYears = () => {
    return Array.from({ length: today.year() - 2020 + 1 }, (_, i) => today.year() - i);
  };

  useEffect(() => {
    let startDate = dayjs();
    let endDate = dayjs();

    if (reportType === 'daily') {
      startDate = dayjs(new Date(selectedYear, selectedMonth, selectedDay));
      endDate = startDate;
    } else if (reportType === 'weekly' && selectedWeek) {
      const [start, end] = selectedWeek.split(' - ');
      const startParts = start.split(' ');
      const endParts = end.split(' ');
      
      const startDay = parseInt(startParts[0]);
      const startMonth = dayjs.months().indexOf(startParts[1]);
      const endDay = parseInt(endParts[0]);
      const endMonth = dayjs.months().indexOf(endParts[1]);
      
      startDate = dayjs(new Date(selectedYear, startMonth, startDay));
      endDate = dayjs(new Date(selectedYear, endMonth, endDay));
    } else if (reportType === 'monthly') {
      startDate = dayjs(`${selectedYear}-${selectedMonth + 1}-01`);
      endDate = startDate.endOf('month');
    } else if (reportType === 'yearly') {
      startDate = dayjs(`${selectedYear}-01-01`);
      endDate = dayjs(`${selectedYear}-12-31`);
    }

    if (startDate.isAfter(today)) return;

    axios.get('/v1/ticketSalesDetail/getTicketByDate', {
      params: {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      },
    })
    .then((response) => {
      setTicketData(response.data.data || []);
    })
    .catch((error) => {
      console.error('Veri alınırken hata oluştu:', error);
    });
  }, [selectedYear, selectedMonth, selectedDay, selectedWeek, reportType]);

  const availableYears = getAvailableYears();
  const availableMonths = getAvailableMonths();

  const totalSalesCount = ticketData.reduce((acc, item) => acc + item.totalSalesCount, 0);
  const totalPrice = ticketData.reduce((acc, item) => acc + item.totalPrice, 0);

   const formatQuantity = (number: number) =>
      number.toLocaleString('tr-TR', {
        maximumFractionDigits: 0,
      })
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Fiş Raporu
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth sx={{ 
              '& .MuiInputLabel-root': { 
                backgroundColor: 'background.paper', 
                px: 1 
              } 
            }}>
              <InputLabel>Rapor Türü</InputLabel>
              <Select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value as ReportType)}
              >
                <MenuItem value="daily">Günlük</MenuItem>
                <MenuItem value="weekly">Haftalık</MenuItem>
                <MenuItem value="monthly">Aylık</MenuItem>
                <MenuItem value="yearly">Yıllık</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {reportType === 'yearly' && (
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ 
                '& .MuiInputLabel-root': { 
                  backgroundColor: 'background.paper', 
                  px: 1 
                } 
              }}>
                <InputLabel>Yıl Seçin</InputLabel>
                <Select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {(reportType === 'daily' || reportType === 'weekly' || reportType === 'monthly') && (
            <>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth sx={{ 
                  '& .MuiInputLabel-root': { 
                    backgroundColor: 'background.paper', 
                    px: 1 
                  } 
                }}>
                  <InputLabel>Yıl Seçin</InputLabel>
                  <Select 
                    value={selectedYear} 
                    onChange={(e) => {
                      const newYear = Number(e.target.value);
                      setSelectedYear(newYear);
                      
                      // Reset month if new year is current year and selected month is in future
                      if (newYear === today.year() && selectedMonth > today.month()) {
                        setSelectedMonth(today.month());
                      }
                      
                      // Reset day/week when year changes
                      if (reportType === 'daily') {
                        setSelectedDay(1);
                      } else if (reportType === 'weekly') {
                        const weeks = generateWeeks(newYear, selectedMonth)
                          .filter(week => {
                            const [start] = week.split(' - ');
                            const startDay = parseInt(start.split(' ')[0]);
                            const monthName = start.split(' ')[1];
                            const monthIndex = dayjs.months().indexOf(monthName);
                            const weekDate = dayjs(new Date(newYear, monthIndex, startDay));
                            return weekDate.isBefore(today) || weekDate.isSame(today, 'day');
                          });
                        setAvailableWeeks(weeks);
                        setSelectedWeek(weeks.length > 0 ? weeks[weeks.length - 1] : '');
                      }
                    }}
                  >
                    {availableYears.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth sx={{ 
                  '& .MuiInputLabel-root': { 
                    backgroundColor: 'background.paper', 
                    px: 1 
                  } 
                }}>
                  <InputLabel>Ay Seçin</InputLabel>
                  <Select 
                    value={selectedMonth} 
                    onChange={(e) => {
                      const newMonth = Number(e.target.value);
                      setSelectedMonth(newMonth);
                      
                      // Reset day/week when month changes
                      if (reportType === 'daily') {
                        setSelectedDay(1);
                      } else if (reportType === 'weekly') {
                        const weeks = generateWeeks(selectedYear, newMonth)
                          .filter(week => {
                            const [start] = week.split(' - ');
                            const startDay = parseInt(start.split(' ')[0]);
                            const monthName = start.split(' ')[1];
                            const monthIndex = dayjs.months().indexOf(monthName);
                            const weekDate = dayjs(new Date(selectedYear, monthIndex, startDay));
                            return weekDate.isBefore(today) || weekDate.isSame(today, 'day');
                          });
                        setAvailableWeeks(weeks);
                        setSelectedWeek(weeks.length > 0 ? weeks[weeks.length - 1] : '');
                      }
                    }}
                  >
                    {availableMonths.map((month) => (
                      <MenuItem key={month} value={month}>
                        {dayjs().month(month).format('MMMM')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {reportType === 'daily' && (
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ 
                '& .MuiInputLabel-root': { 
                  backgroundColor: 'background.paper', 
                  px: 1 
                } 
              }}>
                <InputLabel>Gün Seçin</InputLabel>
                <Select 
                  value={selectedDay} 
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                >
                  {availableDays.map((day) => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {reportType === 'weekly' && (
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ 
                '& .MuiInputLabel-root': { 
                  backgroundColor: 'background.paper', 
                  px: 1 
                } 
              }}>
                <InputLabel>Hafta Seçin</InputLabel>
                <Select 
                  value={selectedWeek} 
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  disabled={availableWeeks.length === 0}
                >
                  {availableWeeks.map((week) => (
                    <MenuItem key={week} value={week}>{week}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:'bold',fontSize:'22px'}}>Bilet Türü</TableCell>
              <TableCell align="right" sx={{fontWeight:'bold',fontSize:'22px'}}> Birim Fiyat</TableCell>
              <TableCell align="right" sx={{fontWeight:'bold',fontSize:'22px'}}>Adet</TableCell>
              <TableCell align="right" sx={{fontWeight:'bold',fontSize:'22px'}}>Toplam</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketData.map((item, index) => (
              <TableRow key={index}>
                <TableCell sx={{fontSize:'17.5px'}}>{item.ticketTypeName}</TableCell>
                <TableCell align="right" sx={{fontSize:'17.5px'}}>{item.unitPrice.toFixed(2)} ₺</TableCell>
                <TableCell align="right" sx={{fontSize:'17.5px'}}>{formatQuantity(item.totalSalesCount)}</TableCell>
                <TableCell align="right" sx={{fontSize:'17.5px'}}>{item.totalPrice.toLocaleString('tr-TR')} ₺</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{fontSize:'22px'}}><strong>Toplam</strong></TableCell>
              <TableCell></TableCell>
              <TableCell sx={{fontSize:'20px'}} align="right"><strong>{formatQuantity(totalSalesCount)}</strong></TableCell>
              <TableCell sx={{fontSize:'20px'}} align="right"><strong>{totalPrice.toLocaleString('tr-TR')} ₺</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default FisRaporu;