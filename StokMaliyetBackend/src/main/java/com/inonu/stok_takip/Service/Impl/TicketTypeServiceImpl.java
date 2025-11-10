package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.TicketType.TicketTypeNotFoundException;
import com.inonu.stok_takip.Repositoriy.TicketTypeRepository;
import com.inonu.stok_takip.Service.TicketTypeService;
import com.inonu.stok_takip.dto.Request.TicketTypeCreateRequest;
import com.inonu.stok_takip.dto.Request.TicketTypeUpdateRequest;
import com.inonu.stok_takip.dto.Response.TicketTypeResponse;
import com.inonu.stok_takip.entitiy.TicketType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketTypeServiceImpl implements TicketTypeService {

    private final TicketTypeRepository ticketTypeRepository;

    public TicketTypeServiceImpl(TicketTypeRepository ticketTypeRepository) {
        this.ticketTypeRepository = ticketTypeRepository;
    }

    @Override
    public List<TicketTypeResponse> getAllTicketTypes() {
        List<TicketType> ticketTypeList = this.ticketTypeRepository.findAll();
        return mapToResponseList(ticketTypeList);
    }

    @Override
    public TicketTypeResponse createTicketType(TicketTypeCreateRequest request) {
        TicketType ticketType = mapToEntity(request);
        TicketType toSave = ticketTypeRepository.save(ticketType);
        return mapToResponse(toSave);
    }

    @Override
    public TicketType getTicketTypeById(Long id) {
        return ticketTypeRepository.findById(id).orElseThrow(()-> new TicketTypeNotFoundException("Ticket Type Not Found"));
    }

    @Override
    public TicketTypeResponse updateTicketType(TicketTypeUpdateRequest request) {

        TicketType ticketType = getTicketTypeById(request.id());
        ticketType.setName(request.name());
        ticketType.setUnitPrice(request.unitPrice());

        TicketType toUpdate = ticketTypeRepository.save(ticketType);
        return mapToResponse(toUpdate);

    }

    @Override
    public TicketTypeResponse deleteTicketType(Long id) {
        TicketType ticketType = getTicketTypeById(id);
        ticketTypeRepository.delete(ticketType);
        return mapToResponse(ticketType);
    }

    private TicketTypeResponse mapToResponse(TicketType ticketType) {
        TicketTypeResponse ticketTypeResponse = new TicketTypeResponse(
                ticketType.getId(),
                ticketType.getName(),
                ticketType.getUnitPrice()
        );
        return ticketTypeResponse;
    }
    private List<TicketTypeResponse> mapToResponseList(List<TicketType> ticketTypeList) {
        List<TicketTypeResponse> ticketTypeResponseList = ticketTypeList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ticketTypeResponseList;
    }
    private TicketType mapToEntity(TicketTypeCreateRequest request){
        TicketType ticketType = new TicketType();
        ticketType.setName(request.name());
        ticketType.setUnitPrice(request.unitPrice());
        return ticketType;
    }
}
