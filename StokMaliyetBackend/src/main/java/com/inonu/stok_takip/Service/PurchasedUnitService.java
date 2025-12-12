package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.PurchasedUnitCreateRequest;
import com.inonu.stok_takip.dto.Response.PurchasedUnitResponse;
import com.inonu.stok_takip.entitiy.PurchasedUnit;

import java.util.List;

public interface PurchasedUnitService {
    List<PurchasedUnitResponse> getAll();
    PurchasedUnitResponse create(PurchasedUnitCreateRequest request);
    PurchasedUnitResponse update(Long id, PurchasedUnitCreateRequest request);
    PurchasedUnit getPurchasedUnitById(Long id);
    PurchasedUnitResponse delete(Long id);
}
