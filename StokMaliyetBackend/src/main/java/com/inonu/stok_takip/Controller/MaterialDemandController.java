package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.MaterialDemandService;
import com.inonu.stok_takip.dto.Request.MaterialDemandApprovedRequest;
import com.inonu.stok_takip.dto.Request.MaterialDemandCreateRequest;
import com.inonu.stok_takip.dto.Request.MaterialDemandUpdateRequest;
import com.inonu.stok_takip.dto.Response.MaterialDemandResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.entitiy.MaterialDemand;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/v1/materialDemand")
@PreAuthorize("hasAnyRole('ADMIN','YEMEKHANE','DEPO')")
public class MaterialDemandController {

    private final MaterialDemandService materialDemandService;

    public MaterialDemandController(MaterialDemandService materialDemandService) {
        this.materialDemandService = materialDemandService;
    }

    // talep onaylama metodu
    @PostMapping("/approve")
    public ResponseEntity<RestResponse<MaterialDemandResponse>> approveMaterialDemand(@RequestBody MaterialDemandApprovedRequest request) {
        MaterialDemandResponse materialDemandResponse =  materialDemandService.approveAndProcessMaterialDemand(request);
        return new ResponseEntity<>(RestResponse.of(materialDemandResponse), HttpStatus.OK);
    }


    // talep reddetme metodu
    @PostMapping("/reject/{id}")
    public ResponseEntity<RestResponse<MaterialDemandResponse>> updateDemandStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String rejectionReason
    ) {
        MaterialDemandResponse materialDemandResponse =  materialDemandService.rejectMaterialDemand(id, rejectionReason);
        return new ResponseEntity<>(RestResponse.of(materialDemandResponse),HttpStatus.OK);
    }

    // İhaleden talep olulturma metodu
    @PostMapping("/create")
    public ResponseEntity<RestResponse<MaterialDemandResponse>> createMaterialDemand(@RequestBody MaterialDemandCreateRequest request) {
        MaterialDemandResponse materialDemandResponse = materialDemandService.createMaterialDemandForTender(request);
        return new ResponseEntity<>(RestResponse.of(materialDemandResponse), HttpStatus.OK);
    }
    // doğrudan teminden talep oluşturma metodu
    @PostMapping("/create/directProcurement")
    public ResponseEntity<RestResponse<MaterialDemandResponse>> createDirectProcurement(@RequestBody MaterialDemandCreateRequest request) {
        MaterialDemandResponse materialDemandResponse = materialDemandService.createMaterialDemandForDirectProcurement(request);
        return new ResponseEntity<>(RestResponse.of(materialDemandResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<MaterialDemand>> getMaterialDemandById(@PathVariable Long id) {
        MaterialDemand materialDemand = materialDemandService.getMaterialDemandById(id);
        return new ResponseEntity<>(RestResponse.of(materialDemand),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<MaterialDemandResponse>>> getAllMaterialDemandList() {
        List<MaterialDemandResponse> materialDemandResponses = materialDemandService.getAllMaterialDemand();
        return new ResponseEntity<>(RestResponse.of(materialDemandResponses), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<RestResponse<MaterialDemandResponse>> updateMaterialDemand( @RequestBody MaterialDemandUpdateRequest request) {
        MaterialDemandResponse materialDemandResponse = materialDemandService.updateMaterialDemand(request);
        return new ResponseEntity<>(RestResponse.of(materialDemandResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<MaterialDemandResponse>> deleteMaterialDemand(@PathVariable Long id) {
        MaterialDemandResponse materialDemandResponse = materialDemandService.deleteMaterialDemand(id);
        return new ResponseEntity<>(RestResponse.of(materialDemandResponse), HttpStatus.OK);
    }

}
