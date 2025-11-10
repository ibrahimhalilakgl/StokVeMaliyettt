package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.PurchaseType.PurchaseTypeAlreadyExistsException;
import com.inonu.stok_takip.Exception.PurchasedUnit.PurchasedUnitAlreadyExistsException;
import com.inonu.stok_takip.Exception.PurchasedUnit.PurchasedUnitNotFoundException;
import com.inonu.stok_takip.Repositoriy.PurchasedUnitRepository;
import com.inonu.stok_takip.Service.PurchasedUnitService;
import com.inonu.stok_takip.dto.Request.PurchasedUnitCreateRequest;
import com.inonu.stok_takip.dto.Response.PurchasedUnitResponse;
import com.inonu.stok_takip.entitiy.PurchaseType;
import com.inonu.stok_takip.entitiy.PurchasedUnit;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchasedUnitServiceImpl implements PurchasedUnitService {

    private final PurchasedUnitRepository repository;
    private final PurchasedUnitRepository purchasedUnitRepository;

    public PurchasedUnitServiceImpl(PurchasedUnitRepository repository, PurchasedUnitRepository purchasedUnitRepository) {
        this.repository = repository;
        this.purchasedUnitRepository = purchasedUnitRepository;
    }

    @Override
    public List<PurchasedUnitResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public PurchasedUnitResponse create(PurchasedUnitCreateRequest request) {
        PurchasedUnit existing = getPurchasedUnitByName(request.name());
        if (existing != null) {
            throw new PurchasedUnitAlreadyExistsException("Bu isimde bir alım birimi zaten mevcut: " + request.name());
        }
        PurchasedUnit unit = new PurchasedUnit();
        unit.setName(request.name());
        return mapToResponse(repository.save(unit));
    }
    private PurchasedUnit getPurchasedUnitByName(String name) {
        return purchasedUnitRepository.findByName(name);
    }

    @Override
    public PurchasedUnitResponse update(Long id, PurchasedUnitCreateRequest request) {
        PurchasedUnit unit = getPurchasedUnitById(id);
        unit.setName(request.name());
        return mapToResponse(repository.save(unit));
    }

    @Override
    public PurchasedUnit getPurchasedUnitById(Long id) {
        return repository.findById(id).orElseThrow(() -> new PurchasedUnitNotFoundException("PurchasedUnit not found: " + id));
    }

    @Override
    public PurchasedUnitResponse delete(Long id) {
        PurchasedUnit unit = getPurchasedUnitById(id);
        repository.delete(unit);
        return mapToResponse(unit);
    }

    private PurchasedUnitResponse mapToResponse(PurchasedUnit unit) {
        return new PurchasedUnitResponse(unit.getId(), unit.getName());
    }
}
