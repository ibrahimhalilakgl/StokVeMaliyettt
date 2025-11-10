package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.Enum.ReportType;
import com.inonu.stok_takip.dto.Response.ReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    ReportResponse createReport(LocalDate date,ReportType reportType);
    List<ReportResponse> getAllReports();
    ReportResponse calculateDailyReport(LocalDate date);
    ReportResponse calculateWeeklyReport(LocalDate date);
    ReportResponse calculateMonthlyReport(LocalDate date);
    ReportResponse calculateYearlyReport(LocalDate date);
    ReportResponse getReportByDate(LocalDate date,ReportType reportType);
    List<ReportResponse> getReportsBetweenDate(LocalDate startDate, LocalDate endDate);

}
