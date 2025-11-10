package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.PurchaseTypeService;
import com.inonu.stok_takip.dto.Request.PurchaseTypeCreateRequest;
import com.inonu.stok_takip.dto.Response.PurchaseTypeResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.entitiy.PurchaseType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


import java.util.List;

@RestController
@RequestMapping("/v1/purchaseType")
@PreAuthorize("hasAnyRole('SATINALMA','ADMIN','DEPO','YEMEKHANE')")
public class PurchaseTypeController {

    private final PurchaseTypeService purchaseTypeService;

    public PurchaseTypeController(PurchaseTypeService purchaseTypeService) {
        this.purchaseTypeService = purchaseTypeService;
    }

    @PostMapping("/create")
    public ResponseEntity<RestResponse<PurchaseTypeResponse>> createPurchaseType(@RequestBody PurchaseTypeCreateRequest request) {
        PurchaseTypeResponse purchaseTypeResponse = purchaseTypeService.create(request);
        return new ResponseEntity<>(RestResponse.of(purchaseTypeResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<PurchaseType>> getPurchaseTypeById(@PathVariable Long id) {
        PurchaseType purchaseType = purchaseTypeService.getPurchaseTypeById(id);
        return new ResponseEntity<>(RestResponse.of(purchaseType),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<PurchaseTypeResponse>>> getAllPurchaseType() {
        List<PurchaseTypeResponse> purchaseTypeResponseList = purchaseTypeService.getAll();
        return new ResponseEntity<>(RestResponse.of(purchaseTypeResponseList), HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestResponse<PurchaseTypeResponse>> updatePurchaseTypeById(@PathVariable Long id, @RequestBody PurchaseTypeCreateRequest request) {
        PurchaseTypeResponse purchaseTypeResponse = purchaseTypeService.update(id,request);
        return new ResponseEntity<>(RestResponse.of(purchaseTypeResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<PurchaseTypeResponse>> deletePurchaseType(@PathVariable Long id) {
        PurchaseTypeResponse deletedPurchaseForm = purchaseTypeService.delete(id);
        return new ResponseEntity<>(RestResponse.of(deletedPurchaseForm), HttpStatus.OK);
    }
}
