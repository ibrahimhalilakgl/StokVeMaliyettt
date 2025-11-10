package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.MaterialDemandApprovedRequest;
import com.inonu.stok_takip.dto.Request.MaterialDemandCreateRequest;
import com.inonu.stok_takip.dto.Request.MaterialDemandUpdateRequest;
import com.inonu.stok_takip.dto.Response.MaterialDemandResponse;
import com.inonu.stok_takip.entitiy.MaterialDemand;

import java.util.List;

public interface MaterialDemandService {
    MaterialDemandResponse createMaterialDemandForTender(MaterialDemandCreateRequest request);
    MaterialDemand getMaterialDemandById(Long id);
    List<MaterialDemandResponse> getAllMaterialDemand();
    MaterialDemandResponse updateMaterialDemand(MaterialDemandUpdateRequest request);
    MaterialDemandResponse deleteMaterialDemand(Long id);
    MaterialDemandResponse rejectMaterialDemand(Long id, String rejectionReason);
    MaterialDemandResponse approveAndProcessMaterialDemand(MaterialDemandApprovedRequest request);
    MaterialDemandResponse createMaterialDemandForDirectProcurement(MaterialDemandCreateRequest request);
    void checkStockAvailabilityByProductInTender(Long productId, Double requestedQuantity);
}
