package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Enum.ReportType;
import com.inonu.stok_takip.Exception.Report.ReportDataNotFoundException;
import com.inonu.stok_takip.Exception.TicketSalesDetails.TicketDetailsNotFoundException;
import com.inonu.stok_takip.Repositoriy.TicketSalesDetailRepository;
import com.inonu.stok_takip.Service.ReportService;
import com.inonu.stok_takip.Service.TicketSalesDetailService;
import com.inonu.stok_takip.Service.TicketTypeService;
import com.inonu.stok_takip.dto.Request.DateRequest;
import com.inonu.stok_takip.dto.Request.TicketSalesDetailCreateRequest;
import com.inonu.stok_takip.dto.Response.TicketSalesDetailResponse;
import com.inonu.stok_takip.dto.Response.TicketSalesResponse;
import com.inonu.stok_takip.entitiy.TicketSalesDetail;
import com.inonu.stok_takip.entitiy.TicketType;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TicketSalesDetailServiceImpl implements TicketSalesDetailService {

    private final TicketSalesDetailRepository ticketSalesDetailRepository;
    private final TicketTypeService ticketTypeService;
    private final ReportService reportService;

    public TicketSalesDetailServiceImpl(TicketSalesDetailRepository ticketSalesDetailRepository,
                                        TicketTypeService ticketTypeService,
                                        @Lazy ReportService reportService) {
        this.ticketSalesDetailRepository = ticketSalesDetailRepository;
        this.ticketTypeService = ticketTypeService;
        this.reportService = reportService;
    }


    @Override
    public List<TicketSalesDetailResponse> getAll() {
        List<TicketSalesDetail> ticketSalesDetails = ticketSalesDetailRepository.findAll();
        return mapToResponseList(ticketSalesDetails);
    }

    @Override
    public List<TicketSalesDetailResponse> addTicket(TicketSalesDetailCreateRequest request) {

        double totalAmount = 0;

        ArrayList<TicketSalesDetail> ticketSalesDetails = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : request.ticketMap().entrySet()) {
            Long ticketTypeId = entry.getKey();
            Integer quantity = entry.getValue();

            TicketType ticketType = ticketTypeService.getTicketTypeById(ticketTypeId);

            TicketSalesDetail ticketSalesDetail = new TicketSalesDetail();
            ticketSalesDetail.setQuantity(quantity);
            ticketSalesDetail.setTotalPrice(ticketType.getUnitPrice() * quantity);
            ticketSalesDetail.setTicketDate(request.ticketDate());
            ticketSalesDetail.setTicketType(ticketType);
            ticketSalesDetail.setTotalPerson(request.totalPerson()); // o gün için kaç kişilik yemek yapıldığı

            ticketSalesDetailRepository.save(ticketSalesDetail);
            ticketSalesDetails.add(ticketSalesDetail);

            totalAmount += ticketSalesDetail.getTotalPrice();
        }

        // Tüm fiş kayıtları kaydedildikten sonra flush yap
        ticketSalesDetailRepository.flush();

        // Fiş kaydı yapıldıktan sonra, o tarih için raporu güncelle veya oluştur
        try {
            LocalDate ticketDate = request.ticketDate();
            // Raporu güncelle veya oluştur (veri yeterli değilse exception fırlatır, sessizce geç)
            try {
                reportService.calculateDailyReport(ticketDate);
            } catch (ReportDataNotFoundException e) {
                // Veri yeterli değilse rapor oluşturulmaz, normal durum
            }
        } catch (Exception e) {
            // Rapor oluşturma hatası fiş kaydını etkilemez, sadece logla
            System.err.println("Rapor otomatik oluşturulurken hata: " + e.getMessage());
        }

        return mapToResponseList(ticketSalesDetails);
    }

    @Override
    public TicketSalesDetail getTicketSalesDetailById(Long id) {
        return ticketSalesDetailRepository.findById(id).orElseThrow(()-> new TicketDetailsNotFoundException("ticketSalesDetail not found"));
    }

    @Override
    public List<TicketSalesResponse> getTicketByDate(DateRequest dateRequest) {
        List<TicketSalesDetail> tickets = ticketSalesDetailRepository.findBySaleDateBetween(dateRequest.startDate(), dateRequest.endDate());

        Map<String, TicketSalesResponse> ticketMap = new HashMap<>();

        for (TicketSalesDetail ticketSalesDetail : tickets) {
            String ticketTypeName = ticketSalesDetail.getTicketType().getName();
            Double totalPrice = ticketSalesDetail.getTotalPrice();
            int quantity = ticketSalesDetail.getQuantity();
            Double unitPrice = ticketSalesDetail.getTicketType().getUnitPrice();

            if(ticketMap.containsKey(ticketTypeName)) {
                TicketSalesResponse ticketSalesResponse = ticketMap.get(ticketTypeName);
                ticketSalesResponse.setTotalSalesCount(ticketSalesResponse.getTotalSalesCount() + quantity);
                ticketSalesResponse.setTotalPrice(ticketSalesResponse.getTotalPrice() + totalPrice);


            }
            else {
                TicketSalesResponse response = new TicketSalesResponse(ticketTypeName,unitPrice,quantity,totalPrice);
                ticketMap.put(ticketTypeName, response);
            }

        }

        return ticketMap.values().stream().toList();
    }

   /* @Override
    public Double calculateTicketValue(List<TicketSalesDetailResponse> ticketResponseList) {
        Double totalPrice = 0.0;
        for (TicketSalesDetailResponse ticketResponse : ticketResponseList) {
            totalPrice += ticketResponse.getTotalPrice();
        }
        return totalPrice;
    }
*/
    @Override
    public int calculateTicketQuantity(List<TicketSalesDetailResponse> ticketResponseList) {
        int ticketQuantity = 0;
        for (TicketSalesDetailResponse ticketResponse : ticketResponseList) {
            ticketQuantity += ticketResponse.getQuantity();
        }
        return ticketQuantity;
    }

    @Override
    public Integer getTicketCountByDay(LocalDate dayDate) {
        Integer ticketCount = ticketSalesDetailRepository.findTotalTicketSalesByDate(dayDate);
        if (ticketCount == null) {
            return 0;
        }
        return ticketCount;

    }
    @Override
    public Integer getTicketCountByWeek(LocalDate weekDate){
        Integer ticketCount = ticketSalesDetailRepository.findTotalTicketSalesByWeek(weekDate);
        if (ticketCount == null) {
            return 0;
        }
        return ticketCount;
    }
    @Override
    public Integer getTicketCountByMonth(LocalDate monthDate) {
        Integer ticketCount = ticketSalesDetailRepository.findTotalTicketSalesByMonth(monthDate);
        if(ticketCount == null){
            return 0;
        }
        return ticketCount;
    }
    @Override
    public Integer getTicketCountByYear(LocalDate yearDate) {
        Integer ticketCount = ticketSalesDetailRepository.findTotalTicketSalesByYear(yearDate);
        if(ticketCount == null){
            return 0;
        }
        return ticketCount;
    }

    @Override
    public Double getTicketAmountByDay(LocalDate dayDate){
        Double ticketCount = ticketSalesDetailRepository.findTotalTicketSalesAmountByDate(dayDate);

        if(ticketCount == null){
            return null;
        }
        return ticketCount;
    }
    @Override
    public Double getTicketAmountByWeek(LocalDate weekDate){
        Double ticketCount = ticketSalesDetailRepository.findTotalTicketSalesAmountByWeek(weekDate);

        if(ticketCount == null){
            return null;
        }
        return ticketCount;
    }
    @Override
    public Double getTicketAmountByMonth(LocalDate monthDate){
        Double ticketCount = ticketSalesDetailRepository.findTotalTicketSalesAmountByMonth(monthDate);

        if(ticketCount == null){
            return null;
        }
        return ticketCount;
    }

    @Override
    public Double getTicketAmountByYear(LocalDate yearDate){
        Double ticketCount = ticketSalesDetailRepository.findTotalTicketSalesAmountByYear(yearDate);
        if(ticketCount == null){
            return null;
        }
        return ticketCount;
    }

    @Override
    public void deleteTicketsByDate(LocalDate ticketDate) {
        // Önce o tarih için raporu güncelle veya sil
        try {
            // Raporu güncelle (fiş kayıtları silindikten sonra)
            ticketSalesDetailRepository.deleteByTicketDate(ticketDate);
            ticketSalesDetailRepository.flush();
            
            // Raporu güncelle veya oluştur
            try {
                reportService.calculateDailyReport(ticketDate);
            } catch (ReportDataNotFoundException e) {
                // Veri yeterli değilse rapor oluşturulmaz, normal durum
            }
        } catch (Exception e) {
            System.err.println("Fiş kayıtları silinirken hata: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public Integer getTotalPersonByDay(LocalDate dayDate) {
        Integer totalPerson = ticketSalesDetailRepository.findTotalPersonByDate(dayDate);
        if (totalPerson == null) {
            return 0;
        }
        return totalPerson;
    }

    private TicketSalesDetailResponse mapToResponse (TicketSalesDetail ticketSalesDetail) {
        TicketSalesDetailResponse ticketSalesDetailResponse = new TicketSalesDetailResponse(
                ticketSalesDetail.getId(),
                ticketSalesDetail.getTotalPrice(),
                ticketSalesDetail.getQuantity(),
                ticketSalesDetail.getTicketDate(),
                ticketSalesDetail.getTicketType().getName()
        );
        return ticketSalesDetailResponse;
    }
    private List<TicketSalesDetailResponse> mapToResponseList (List<TicketSalesDetail> ticketSalesDetailList) {
        List<TicketSalesDetailResponse> ticketSalesDetailResponseList = ticketSalesDetailList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ticketSalesDetailResponseList;
    }
}
