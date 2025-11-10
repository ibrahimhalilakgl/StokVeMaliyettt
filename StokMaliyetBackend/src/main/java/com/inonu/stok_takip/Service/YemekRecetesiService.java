package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.YemekRecetesiCreateRequest;
import com.inonu.stok_takip.dto.Response.YemekRecetesiResponse;
import com.inonu.stok_takip.entitiy.YemekRecetesi;
import com.inonu.stok_takip.Enum.YemekTipi;

import java.util.List;

public interface YemekRecetesiService {
    List<YemekRecetesiResponse> getAllYemekReceteleri();
    List<YemekRecetesiResponse> getYemekReceteleriByTipi(YemekTipi tipi);
    YemekRecetesiResponse createYemekRecetesi(YemekRecetesiCreateRequest request);
    YemekRecetesiResponse updateYemekRecetesi(Long id, YemekRecetesiCreateRequest request);
    YemekRecetesiResponse deleteYemekRecetesi(Long id);
    YemekRecetesi getYemekRecetesiById(Long id);
}

