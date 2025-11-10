package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;
import java.util.Map;

public record TicketSalesDetailCreateRequest(
    //Deneme Amaclı
    Map<Long, Integer> ticketMap,
    LocalDate ticketDate
) {
    
}
