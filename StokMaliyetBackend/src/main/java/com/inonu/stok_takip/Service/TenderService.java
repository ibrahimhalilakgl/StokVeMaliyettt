package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.TenderCreateRequest;
import com.inonu.stok_takip.dto.Response.TenderResponse;
import com.inonu.stok_takip.entitiy.Tender;

import java.util.List;

public interface TenderService {

    TenderResponse createTender(TenderCreateRequest request);
    List<TenderResponse> getAllTenders();
    List<TenderResponse> getAllActiveTenders();
    TenderResponse updateTenderRemainingQuantity(Long tenderId, Double quantity);
    Tender getTenderById(Long id);
    TenderResponse increaseTenderByTwentyPercent(Long tenderId,Double increasedQuantity);
    void handleTendersAtYearEnd();

    List<TenderResponse> getTenderByProductAndCompany();

    // added for full edit/delete support
    TenderResponse updateTender(Long tenderId, TenderCreateRequest request);
    TenderResponse deleteTender(Long tenderId);
}
