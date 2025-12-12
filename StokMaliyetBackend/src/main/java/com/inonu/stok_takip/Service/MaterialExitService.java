package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.DateRequest;
import com.inonu.stok_takip.dto.Request.MaterialExitCreateRequest;
import com.inonu.stok_takip.dto.Response.MaterialExitDetailResponse;
import com.inonu.stok_takip.dto.Response.MaterialExitResponse;
import com.inonu.stok_takip.entitiy.MaterialExit;

import java.time.LocalDate;
import java.util.List;

public interface MaterialExitService {

    List<MaterialExitResponse> getAllMaterialExits();
   // List<MaterialExitResponse> createMaterialExit(MaterialExitCreateRequest request);
    MaterialExitResponse updateMaterialExit(MaterialExitCreateRequest request);
    MaterialExitResponse deleteMaterialExit(Long id);
    MaterialExit getMaterialExitById(Long id);

    // bundan sonrası rapor ve fiş yapısını kntrol etmek ve denemek için eklnmiştir
    List<MaterialExitResponse> getMaterialListBetweenDate(DateRequest dateRequest);
    Integer numberMealsInDay(LocalDate dayDate);
    Integer numberMealsInWeek(LocalDate weekDate);
    Integer numberMealsInMonth(LocalDate monthDate);
    Integer numberMealsInYear(LocalDate yearDate);
    Double calculateTotalAmount(DateRequest dateRequest);
    Double calculateCleanMaterialPrice(DateRequest dateRequest);
    List<MaterialExitResponse> exitMaterials(MaterialExitCreateRequest request);



    Double getNonCleaningMaterialExitsByDate(LocalDate date);
    Double getMaterialsByWeek(LocalDate weekDate);
    Double getMaterialsByMonthAndYear(LocalDate monthDate);
    Double getMaterialsByYear(LocalDate yearDate);

    List<MaterialExitDetailResponse> getMaterialExitBetweenDates(DateRequest dateRequest);
}
