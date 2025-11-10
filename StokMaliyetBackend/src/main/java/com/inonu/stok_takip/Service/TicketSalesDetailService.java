package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.DateRequest;
import com.inonu.stok_takip.dto.Request.TicketSalesDetailCreateRequest;
import com.inonu.stok_takip.dto.Response.TicketSalesDetailResponse;
import com.inonu.stok_takip.dto.Response.TicketSalesResponse;
import com.inonu.stok_takip.entitiy.TicketSalesDetail;

import java.time.LocalDate;
import java.util.List;

public interface TicketSalesDetailService {


    List<TicketSalesDetailResponse> getAll();
    List<TicketSalesDetailResponse> addTicket(TicketSalesDetailCreateRequest request);
    TicketSalesDetail getTicketSalesDetailById(Long id);
    List<TicketSalesResponse> getTicketByDate(DateRequest dateRequest);
  //  Double calculateTicketValue(List<TicketSalesDetailResponse> ticketResponseList);
    int calculateTicketQuantity(List<TicketSalesDetailResponse> ticketResponseList);
    Integer getTicketCountByDay(LocalDate dayDate);
    Integer getTicketCountByWeek(LocalDate dayDate);
    Integer getTicketCountByMonth(LocalDate monthDate);
    Integer getTicketCountByYear(LocalDate yearDate);

    // bundan sonrası bilet tutarları
    Double getTicketAmountByDay(LocalDate dayDate);
    Double getTicketAmountByWeek(LocalDate weekDate);
    Double getTicketAmountByMonth(LocalDate monthDate);
    Double getTicketAmountByYear(LocalDate yearDate);

}
