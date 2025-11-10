package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.Refectory.RefectoryAlreadyExistsException;
import com.inonu.stok_takip.Exception.Refectory.RefectoryNotFoundException;
import com.inonu.stok_takip.Repositoriy.RefectoryRepository;
import com.inonu.stok_takip.Service.RefectoryService;
import com.inonu.stok_takip.dto.Request.RefectoryCreateRequest;
import com.inonu.stok_takip.dto.Response.RefectoryResponse;
import com.inonu.stok_takip.entitiy.Refectory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RefectoryServiceImpl implements RefectoryService {

    private final RefectoryRepository RefectoryRepository;

    public RefectoryServiceImpl(RefectoryRepository RefectoryRepository) {
        this.RefectoryRepository = RefectoryRepository;
    }

    @Override
    public List<RefectoryResponse> getAllRefectories() {
        List<Refectory> categories = RefectoryRepository.findAll();
        return mapToResponseList(categories);
    }

    @Override
    public RefectoryResponse createRefectory(RefectoryCreateRequest RefectoryCreateRequest) {

        Refectory existing = getRefectoryByName(RefectoryCreateRequest.name());
        if (existing != null) {
            throw new RefectoryAlreadyExistsException("Bu isimde bir Kategori zaten mevcut: " + RefectoryCreateRequest.name());
        }

        Refectory Refectory = new Refectory();
        Refectory.setName(RefectoryCreateRequest.name());
        Refectory toSave = RefectoryRepository.save(Refectory);

        return mapToResponse(toSave);
    }

    private Refectory getRefectoryByName(String name) {
        return RefectoryRepository.findByName(name);
    }

    @Override
    public RefectoryResponse updateRefectory(RefectoryCreateRequest RefectoryCreateRequest) {
        return null;
    }

    @Override
    public Refectory getRefectoryById(Long RefectoryId) {
        return RefectoryRepository.findById(RefectoryId).orElseThrow(()-> new RefectoryNotFoundException("Refectory Not Found by id: " + RefectoryId));
    }

    @Override
    public RefectoryResponse deleteRefectory(Long RefectoryId) {
        Refectory Refectory = getRefectoryById(RefectoryId);
        RefectoryRepository.delete(Refectory);
        return mapToResponse(Refectory);
    }

    private RefectoryResponse mapToResponse(Refectory Refectory) {
        RefectoryResponse RefectoryResponse = new RefectoryResponse(
                Refectory.getId(),
                Refectory.getName()
        );
        return RefectoryResponse;
    }

    private List<RefectoryResponse> mapToResponseList(List<Refectory> RefectoryList) {
        List<RefectoryResponse> RefectoryResponseList = RefectoryList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return  RefectoryResponseList;
    }
}
