package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.MeasurementTypeCreateRequest;
import com.inonu.stok_takip.dto.Response.MeasurementTypeResponse;
import com.inonu.stok_takip.entitiy.MeasurementType;

import java.util.List;

public interface MeasurementTypeService {

    MeasurementTypeResponse createMeasurementType(MeasurementTypeCreateRequest measurementTypeCreateRequest);
    MeasurementType getMeasurementTypeById(Long id);
    List<MeasurementTypeResponse> getAllMeasurementTypes();
    MeasurementTypeResponse updateMeasurementType(Long id, MeasurementTypeCreateRequest measurementTypeCreateRequest);
    MeasurementTypeResponse deleteMeasurementType(Long id);
}
