package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Enum.ReportType;
import com.inonu.stok_takip.Exception.Report.ReportDataNotFoundException;
import com.inonu.stok_takip.Repositoriy.ReportRepository;
import com.inonu.stok_takip.Service.MaterialExitService;
import com.inonu.stok_takip.Service.ReportService;
import com.inonu.stok_takip.Service.TicketSalesDetailService;
import com.inonu.stok_takip.dto.Response.ReportResponse;
import com.inonu.stok_takip.entitiy.Report;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {


    private final ReportRepository reportRepository;
    private final TicketSalesDetailService ticketSalesDetailService;
    private final MaterialExitService materialExitService;

    public ReportServiceImpl(ReportRepository reportRepository,
                             TicketSalesDetailService ticketSalesDetailService,
                             MaterialExitService materialExitService) {
        this.reportRepository = reportRepository;
        this.ticketSalesDetailService = ticketSalesDetailService;
        this.materialExitService = materialExitService;
    }


    @Override
    public ReportResponse createReport(LocalDate date, ReportType reportType) {

        switch (reportType){
            case DAILY:
                return calculateDailyReport(date);
                case WEEKLY:
                    return  calculateWeeklyReport(date);
            case MONTHLY:
                return calculateMonthlyReport(date);
            case YEARLY:
                return calculateYearlyReport(date);
            default:
                throw new IllegalArgumentException("Geçersiz report type");
        }

    }

    @Override
    public List<ReportResponse> getAllReports() {
        // Sadece günlük raporları getir
        List<Report> reports = reportRepository.findByReportType(ReportType.DAILY);
        return mapToResponseList(reports);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReportResponse calculateDailyReport(LocalDate date) {
        // totalPerson artık TicketSalesDetail'den alınıyor, MaterialExit'ten değil
        Integer totalPerson = ticketSalesDetailService.getTotalPersonByDay(date);
        Integer ticketQuantity = ticketSalesDetailService.getTicketCountByDay(date);
        Double totalAmount = materialExitService.getNonCleaningMaterialExitsByDate(date);
        Double totalTicketAmount = ticketSalesDetailService.getTicketAmountByDay(date);

        // Rapor için gerekli verilerden en az 1'i geldiğinde hesaplansın
        boolean hasData = (totalPerson != null && totalPerson > 0) || 
                         (ticketQuantity != null && ticketQuantity > 0) || 
                         (totalAmount != null && totalAmount > 0);

        if (!hasData) {
            throw new ReportDataNotFoundException("Daily Report Error: No data available for date " + date);
        }

        // Null değerleri 0 olarak kabul et
        int safeTotalPerson = (totalPerson != null) ? totalPerson : 0;
        int safeTicketQuantity = (ticketQuantity != null) ? ticketQuantity : 0;
        double safeTotalAmount = (totalAmount != null) ? totalAmount : 0.0;
        double safeTotalTicketAmount = (totalTicketAmount != null) ? totalTicketAmount : 0.0;

        // Hesaplamalar - sıfıra bölme kontrolü
        Double personCost = (safeTotalPerson > 0) ? safeTotalAmount / safeTotalPerson : 0.0;
        Double ticketCost = (safeTicketQuantity > 0) ? safeTotalAmount / safeTicketQuantity : 0.0;
        int leftoverMealCount = safeTotalPerson - safeTicketQuantity;

        // Mevcut raporu kontrol et, varsa güncelle, yoksa yeni oluştur
        Report report = reportRepository.findByReportCreateDateAndReportType(date, ReportType.DAILY)
                .orElse(new Report());

        report.setReportType(ReportType.DAILY);
        report.setTicketQuantity(safeTicketQuantity);
        report.setReportCreateDate(date); // Rapor tarihi, oluşturulma tarihi değil
        report.setTotalPersonQuantity(safeTotalPerson);
        report.setTotalMaterialPrice(safeTotalAmount);
        report.setTotalCleanPrice(0.0);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setTotalTicketPrice(safeTotalTicketAmount);

        // Sadece günlük raporlar veritabanına kaydedilir
        Report savedReport = reportRepository.save(report);
        return mapToResponse(savedReport);
    }
    
    @Override
    public ReportResponse calculateWeeklyReport(LocalDate date){
        // Haftalık rapor sadece hesaplanır, veritabanına kaydedilmez
        // Frontend'de günlük raporlardan hesaplanacak
        Integer totalPerson = materialExitService.numberMealsInWeek(date);
        Integer ticketCount = ticketSalesDetailService.getTicketCountByWeek(date);
        Double totalMaterialPrice = materialExitService.getMaterialsByWeek(date);
        Double totalTicketPrice = ticketSalesDetailService.getTicketAmountByWeek(date);

        // Null değerleri 0 olarak kabul et
        int safeTotalPerson = (totalPerson != null) ? totalPerson : 0;
        int safeTicketCount = (ticketCount != null) ? ticketCount : 0;
        double safeTotalMaterialPrice = (totalMaterialPrice != null) ? totalMaterialPrice : 0.0;
        double safeTotalTicketPrice = (totalTicketPrice != null) ? totalTicketPrice : 0.0;

        // Hesaplamalar - sıfıra bölme kontrolü
        Double personCost = (safeTotalPerson > 0) ? safeTotalMaterialPrice / safeTotalPerson : 0.0;
        Double ticketCost = (safeTicketCount > 0) ? safeTotalMaterialPrice / safeTicketCount : 0.0;
        int leftoverMealCount = safeTotalPerson - safeTicketCount;

        // Rapor oluştur ama veritabanına kaydetme
        Report report = new Report();
        report.setReportType(ReportType.WEEKLY);
        report.setTicketQuantity(safeTicketCount);
        report.setReportCreateDate(date);
        report.setTotalPersonQuantity(safeTotalPerson);
        report.setTotalMaterialPrice(safeTotalMaterialPrice);
        report.setTotalCleanPrice(0.0);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setTotalTicketPrice(safeTotalTicketPrice);

        // Veritabanına kaydetmeden response döndür
        return mapToResponse(report);
    }

    @Override
    public ReportResponse calculateMonthlyReport(LocalDate date){
        // Aylık rapor sadece hesaplanır, veritabanına kaydedilmez
        // Frontend'de günlük raporlardan hesaplanacak
        Integer totalPerson = materialExitService.numberMealsInMonth(date);
        Integer ticketCount = ticketSalesDetailService.getTicketCountByMonth(date);
        Double totalMaterialPrice = materialExitService.getMaterialsByMonthAndYear(date);
        Double totalTicketPrice = ticketSalesDetailService.getTicketAmountByMonth(date);

        // Null değerleri 0 olarak kabul et
        int safeTotalPerson = (totalPerson != null) ? totalPerson : 0;
        int safeTicketCount = (ticketCount != null) ? ticketCount : 0;
        double safeTotalMaterialPrice = (totalMaterialPrice != null) ? totalMaterialPrice : 0.0;
        double safeTotalTicketPrice = (totalTicketPrice != null) ? totalTicketPrice : 0.0;

        // Hesaplamalar - sıfıra bölme kontrolü
        Double personCost = (safeTotalPerson > 0) ? safeTotalMaterialPrice / safeTotalPerson : 0.0;
        Double ticketCost = (safeTicketCount > 0) ? safeTotalMaterialPrice / safeTicketCount : 0.0;
        int leftoverMealCount = safeTotalPerson - safeTicketCount;

        // Rapor oluştur ama veritabanına kaydetme
        Report report = new Report();
        report.setReportType(ReportType.MONTHLY);
        report.setTicketQuantity(safeTicketCount);
        report.setReportCreateDate(date);
        report.setTotalPersonQuantity(safeTotalPerson);
        report.setTotalMaterialPrice(safeTotalMaterialPrice);
        report.setTotalCleanPrice(0.0);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setTotalTicketPrice(safeTotalTicketPrice);

        // Veritabanına kaydetmeden response döndür
        return mapToResponse(report);
    }

    @Override
    public ReportResponse calculateYearlyReport(LocalDate date) {
        // Yıllık rapor sadece hesaplanır, veritabanına kaydedilmez
        // Frontend'de günlük raporlardan hesaplanacak
        Integer totalPerson = materialExitService.numberMealsInYear(date);
        Integer ticketCount = ticketSalesDetailService.getTicketCountByYear(date);
        Double totalMaterialPrice = materialExitService.getMaterialsByYear(date);
        Double totalTicketAmount = ticketSalesDetailService.getTicketAmountByYear(date);

        // Null değerleri 0 olarak kabul et
        int safeTotalPerson = (totalPerson != null) ? totalPerson : 0;
        int safeTicketCount = (ticketCount != null) ? ticketCount : 0;
        double safeTotalMaterialPrice = (totalMaterialPrice != null) ? totalMaterialPrice : 0.0;
        double safeTotalTicketAmount = (totalTicketAmount != null) ? totalTicketAmount : 0.0;

        // Hesaplamalar - sıfıra bölme kontrolü
        Double personCost = (safeTotalPerson > 0) ? safeTotalMaterialPrice / safeTotalPerson : 0.0;
        Double ticketCost = (safeTicketCount > 0) ? safeTotalMaterialPrice / safeTicketCount : 0.0;
        int leftoverMealCount = safeTotalPerson - safeTicketCount;

        // Rapor oluştur ama veritabanına kaydetme
        Report report = new Report();
        report.setReportType(ReportType.YEARLY);
        report.setTicketQuantity(safeTicketCount);
        report.setReportCreateDate(date);
        report.setTotalPersonQuantity(safeTotalPerson);
        report.setTotalMaterialPrice(safeTotalMaterialPrice);
        report.setTotalCleanPrice(0.0);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setTotalTicketPrice(safeTotalTicketAmount);

        // Veritabanına kaydetmeden response döndür
        return mapToResponse(report);
    }



    // Sadece günlük raporlar otomatik oluşturulur
    @Scheduled(cron = "0 0 1 * * *")  // Her gün 01:00'da çalışır
    public void generateDailyReport() {
        LocalDate reportDate = LocalDate.now().minusDays(1);  // Bir önceki günün tarihi
        try {
            calculateDailyReport(reportDate);
        } catch (ReportDataNotFoundException e) {
            System.out.println("DAILY report not generated: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    // Haftalık, aylık ve yıllık raporlar frontend'de hesaplanacak, 
    // bu yüzden scheduled task'lar kaldırıldı




    @Override
    public ReportResponse getReportByDate(LocalDate date,ReportType reportType){
        // Sadece günlük raporlar veritabanında tutulur
        if (reportType != ReportType.DAILY) {
            // Haftalık, aylık, yıllık raporlar frontend'de hesaplanacak
            return null;
        }
        return reportRepository.findByReportCreateDateAndReportType(date, reportType)
                .map(this::mapToResponse)
                .orElse(null); // Rapor bulunamazsa null döndür
    }
    @Override
    public List<ReportResponse> getReportsBetweenDate(LocalDate startDate, LocalDate endDate){
        // Sadece günlük raporları getir
        List<Report> reports = reportRepository.findByReportCreateDateBetweenAndReportType(startDate, endDate, ReportType.DAILY);
        return mapToResponseList(reports);
    }

    private ReportResponse mapToResponse(Report report){
        ReportResponse response = new ReportResponse();
        // ID null olabilir (haftalık, aylık, yıllık raporlar veritabanına kaydedilmez)
        if (report.getId() != null) {
            response.setId(report.getId());
        }
        response.setReportType(report.getReportType());
        response.setAveragePersonCost(report.getAveragePersonCost());
        response.setTicketQuantity(report.getTicketQuantity());
        response.setReportCreateDate(report.getReportCreateDate());
        response.setAverageTicketCost(report.getAverageTicketCost());
        response.setTotalPersonQuantity(report.getTotalPersonQuantity());
        response.setTotalMaterialPrice(report.getTotalMaterialPrice());
        response.setTotalTicketPrice(report.getTotalTicketPrice());
        response.setLeftoverMealCount(report.getLeftoverMealCount());

        return response;
    }

    private List<ReportResponse> mapToResponseList(List<Report> reports) {
        List<ReportResponse> responseList = reports.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return responseList;
    }
}
