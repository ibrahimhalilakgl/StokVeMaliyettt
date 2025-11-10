package com.inonu.stok_takip.dto.Request;

public record TicketTypeCreateRequest(
    String name,
    Double unitPrice
) {
    
}
