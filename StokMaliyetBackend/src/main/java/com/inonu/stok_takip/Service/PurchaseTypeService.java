package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.PurchaseTypeCreateRequest;
import com.inonu.stok_takip.dto.Response.PurchaseTypeResponse;
import com.inonu.stok_takip.entitiy.PurchaseType;

import java.util.List;

public interface PurchaseTypeService {
    List<PurchaseTypeResponse> getAll();
    PurchaseTypeResponse create(PurchaseTypeCreateRequest request);
    PurchaseTypeResponse update(Long id, PurchaseTypeCreateRequest request);
    PurchaseType getPurchaseTypeById(Long id);
    PurchaseTypeResponse delete(Long id);
}
