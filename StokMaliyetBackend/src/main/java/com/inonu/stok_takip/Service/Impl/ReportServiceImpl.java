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
        List<Report> reports = reportRepository.findAll();
        return mapToResponseList(reports);
    }

    @Override
    public ReportResponse calculateDailyReport(LocalDate date) {
        Integer totalPerson = materialExitService.numberMealsInDay(date);
        Integer ticketQuantity = ticketSalesDetailService.getTicketCountByDay(date);
        Double totalAmount = materialExitService.getNonCleaningMaterialExitsByDate(date);
        Double totalTicketAmount = ticketSalesDetailService.getTicketAmountByDay(date);

        if (totalPerson == null || totalPerson == 0) {
            throw new ReportDataNotFoundException("Daily Report Error: Total person is null or zero for date " + date);
        }
        if (ticketQuantity == null || ticketQuantity == 0) {
            throw new ReportDataNotFoundException("Daily Report Error: Ticket quantity is null or zero for date " + date);
        }
        if (totalAmount == null || totalAmount == 0) {
            throw new ReportDataNotFoundException("Daily Report Error: Total amount is null or zero for date " + date);
        }

        Double personCost = totalAmount / totalPerson;
        Double ticketCost = totalAmount / ticketQuantity;
        int leftoverMealCount = totalPerson - ticketQuantity;

        Report report = new Report();
        report.setReportType(ReportType.DAILY);
        report.setTicketQuantity(ticketQuantity);
        report.setReportCreateDate(LocalDate.now());
        report.setTotalPersonQuantity(totalPerson);
        report.setTotalMaterialPrice(totalAmount);
        report.setTotalCleanPrice(0.0);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setTotalTicketPrice(totalTicketAmount);

        Report savedReport = reportRepository.save(report);
        return mapToResponse(savedReport);
    }
    
    @Override
    public ReportResponse calculateWeeklyReport(LocalDate date){

        Integer totalPerson = materialExitService.numberMealsInWeek(date);
        Integer ticketCount = ticketSalesDetailService.getTicketCountByWeek(date);
        Double totalMaterialPrice = materialExitService.getMaterialsByWeek(date);
        Double totalTicketPrice = ticketSalesDetailService.getTicketAmountByWeek(date);

        if (totalPerson == null || totalPerson == 0) {
            throw new ReportDataNotFoundException("Weekly Report Error: Total person is null or zero for week of date " + date);
        }
        if (ticketCount == null || ticketCount == 0) {
            throw new ReportDataNotFoundException("Weekly Report Error: Ticket quantity is null or zero for week of date " + date);
        }
        if (totalMaterialPrice == null || totalMaterialPrice == 0) {
            throw new ReportDataNotFoundException("Weekly Report Error: Total amount is null or zero for week of date " + date);
        }
        Double personCost = totalMaterialPrice / totalPerson;
        Double ticketCost = totalMaterialPrice / ticketCount;
        int leftoverMealCount = totalPerson - ticketCount;


        Report report = new Report();
        report.setReportType(ReportType.WEEKLY);
        report.setTicketQuantity(ticketCount);
        report.setReportCreateDate(LocalDate.now());
        report.setTotalPersonQuantity(totalPerson);
        report.setTotalMaterialPrice(totalMaterialPrice);
        report.setTotalCleanPrice(0.0);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setTotalTicketPrice(totalTicketPrice);
        Report savedReport = reportRepository.save(report);


        return mapToResponse(savedReport);
    }

    @Override
    public ReportResponse calculateMonthlyReport(LocalDate date){
        Integer totalPerson = materialExitService.numberMealsInMonth(date);
        Integer ticketCount = ticketSalesDetailService.getTicketCountByMonth(date);
        Double totalMaterialPrice = materialExitService.getMaterialsByMonthAndYear(date);
        Double totalTicketPrice = ticketSalesDetailService.getTicketAmountByMonth(date);

        if (totalPerson == null || totalPerson == 0) {
            throw new ReportDataNotFoundException("Monthly Report Error: Total person is null or zero for month of date " + date);
        }
        if (ticketCount == null || ticketCount == 0) {
            throw new ReportDataNotFoundException("Monthly Report Error: Ticket quantity is null or zero for month of date " + date);
        }
        if (totalMaterialPrice == null || totalMaterialPrice == 0) {
            throw new ReportDataNotFoundException("Monthly Report Error: Total amount is null or zero for month of date " + date);
        }
        Double personCost = totalMaterialPrice / totalPerson;
        Double ticketCost = totalMaterialPrice / ticketCount;
        int leftoverMealCount = totalPerson - ticketCount;


        Report report = new Report();
        report.setReportType(ReportType.MONTHLY);
        report.setTicketQuantity(ticketCount);
        report.setReportCreateDate(LocalDate.now().minusDays(1));
        report.setTotalPersonQuantity(totalPerson);
        report.setTotalMaterialPrice(totalMaterialPrice);
        report.setTotalCleanPrice(0.0);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setTotalTicketPrice(totalTicketPrice);

        Report savedReport = reportRepository.save(report);


        return mapToResponse(savedReport);
    }

    @Override
    public ReportResponse calculateYearlyReport(LocalDate date) {
        Integer totalPerson = materialExitService.numberMealsInYear(date);
        Integer ticketCount = ticketSalesDetailService.getTicketCountByYear(date);
        Double totalMaterialPrice = materialExitService.getMaterialsByYear(date);
        Double totalTicketAmount = ticketSalesDetailService.getTicketAmountByYear(date);

        if (totalPerson == null || totalPerson == 0) {
            throw new ReportDataNotFoundException("Yearly Report Error: Total person is null or zero for year of date " + date);
        }
        if (ticketCount == null || ticketCount == 0) {
            throw new ReportDataNotFoundException("Yearly Report Error: Ticket quantity is null or zero for year of date " + date);
        }
        if (totalMaterialPrice == null || totalMaterialPrice == 0) {
            throw new ReportDataNotFoundException("Yearly Report Error: Total amount is null or zero for year of date " + date);
        }

        Double personCost = totalMaterialPrice / totalPerson;
        Double ticketCost = totalMaterialPrice / ticketCount;
        int leftoverMealCount = totalPerson - ticketCount;


        Report report = new Report();
        report.setReportType(ReportType.YEARLY);
        report.setTicketQuantity(ticketCount);
        report.setReportCreateDate(LocalDate.now());
        report.setTotalPersonQuantity(totalPerson);
        report.setTotalMaterialPrice(totalMaterialPrice);
        report.setTotalCleanPrice(0.0);
        report.setLeftoverMealCount(leftoverMealCount);
        report.setAveragePersonCost(personCost);
        report.setAverageTicketCost(ticketCost);
        report.setTotalTicketPrice(totalTicketAmount);

        Report savedReport = reportRepository.save(report);

        return mapToResponse(savedReport);
    }



    @Scheduled(cron = "0 0 1 * * *")  // Her gün 01:00'da çalışır
    public void generateDailyReport() {
        LocalDate reportDate = LocalDate.now().minusDays(1);  // Bir önceki günün tarihi
        try {
            calculateDailyReport(reportDate);

        } catch (ReportDataNotFoundException e) {
            System.out.println("DAİLY report not generated: " + e.getMessage());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Her pazartesi saat 01:00'da çalışır (haftalık rapor)
    @Scheduled(cron = "0 0 1 * * MON")
    public void generateWeeklyReport() {
        LocalDate reportDate = LocalDate.now().minusWeeks(1);
        try {
            calculateWeeklyReport(reportDate);

        } catch (ReportDataNotFoundException e) {

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Her ayın son günü saat 01:00'da çalışır
    @Scheduled(cron = "0 0 1 L * *")
    public void generateMonthlyReport() {
        LocalDate reportDate = LocalDate.now().minusMonths(1);
        try {
            calculateMonthlyReport(reportDate);

        } catch (ReportDataNotFoundException e) {

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Her yılın 31 Aralık günü saat 01:00'da çalışır
    @Scheduled(cron = "0 0 1 31 12 *")
    public void generateYearlyReport() {
        LocalDate reportDate = LocalDate.now();
        try {
            calculateYearlyReport(reportDate);

        } catch (ReportDataNotFoundException e) {

        } catch (Exception e) {
            e.printStackTrace();
        }
    }




    @Override
    public ReportResponse getReportByDate(LocalDate date,ReportType reportType){
        return reportRepository.findByReportCreateDateAndReportType(date,reportType)
                .map(this::mapToResponse)
                .orElse(null); // Rapor bulunamazsa null döndür
    }
    @Override
    public List<ReportResponse> getReportsBetweenDate(LocalDate startDate, LocalDate endDate){
        List<Report> reports = reportRepository.findByReportCreateDateBetween(startDate,endDate);
        return mapToResponseList(reports);
    }

    private ReportResponse mapToResponse(Report report){
        ReportResponse response = new ReportResponse();
        response.setId(report.getId());
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
