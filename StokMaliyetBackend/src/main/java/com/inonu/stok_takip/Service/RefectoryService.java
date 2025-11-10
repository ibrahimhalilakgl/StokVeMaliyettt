package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.RefectoryCreateRequest;
import com.inonu.stok_takip.dto.Response.RefectoryResponse;
import com.inonu.stok_takip.entitiy.Refectory;

import java.util.List;

public interface RefectoryService {
    List<RefectoryResponse> getAllRefectories();
    RefectoryResponse createRefectory(RefectoryCreateRequest request);
    RefectoryResponse updateRefectory(RefectoryCreateRequest request);
    Refectory getRefectoryById(Long id);
    RefectoryResponse deleteRefectory(Long id);
}
