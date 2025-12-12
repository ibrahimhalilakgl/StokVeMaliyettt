package com.inonu.stok_takip.dto.Request;

public record TicketTypeUpdateRequest(
    Long id,
    String name,
    Double unitPrice
) {}
