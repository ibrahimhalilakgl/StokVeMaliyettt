package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.TicketTypeCreateRequest;
import com.inonu.stok_takip.dto.Request.TicketTypeUpdateRequest;
import com.inonu.stok_takip.dto.Response.TicketTypeResponse;
import com.inonu.stok_takip.entitiy.TicketType;

import java.util.List;

public interface TicketTypeService {

    List<TicketTypeResponse> getAllTicketTypes();
    TicketTypeResponse createTicketType(TicketTypeCreateRequest request);
    TicketType getTicketTypeById(Long id);
    TicketTypeResponse updateTicketType(TicketTypeUpdateRequest request);
    TicketTypeResponse deleteTicketType(Long id);
}
