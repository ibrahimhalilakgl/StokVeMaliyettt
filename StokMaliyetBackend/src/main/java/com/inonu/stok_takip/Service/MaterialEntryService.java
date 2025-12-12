package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.MaterialEntryCreateRequest;
import com.inonu.stok_takip.dto.Request.MaterialEntryUpdateRequest;
import com.inonu.stok_takip.dto.Response.*;
import com.inonu.stok_takip.entitiy.MaterialEntry;

import java.util.List;

public interface MaterialEntryService {

    List<MaterialEntryResponse> getAllMaterialEntryList();
    MaterialEntryResponse createMaterialEntry(MaterialEntryCreateRequest request);
    MaterialEntryResponse updateMaterialEntry(MaterialEntryUpdateRequest request);
    MaterialEntry getMaterialEntryById(Long id);
    MaterialEntryResponse deleteMaterialEntry(Long id);
    List<MaterialEntry> getMaterialEntryByProductId(Long productId);
    Double updateRemainingQuantity(Long materialEntryId, Double exitQuantity);
    List<MaterialEntryResponse> carryOverEntriesToNextYear();

    // bundan sonrası stok çıkışı için yazılmış
    Double getTotalRemainingQuantity(Long productId);

    List<MaterialEntryDetailResponse> getMaterialEntryDetails();

    List<GroupMaterialEntryResponse> getGroupedMaterialEntries();
    List<MaterialEntrySpendResponse> getTotalSpentGroupedByBudget();
    List<MaterialEntryProductsForMaterialExitResponse> getMaterialEntriesForExit();
    
    // HomePage için ek metodlar
    List<Object> getAllProductDetail();
    List<Object> getBudgetsGroup();
}

