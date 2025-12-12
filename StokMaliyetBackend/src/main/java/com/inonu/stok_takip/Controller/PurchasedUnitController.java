package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.PurchasedUnitService;
import com.inonu.stok_takip.dto.Request.ProductCreateRequest;
import com.inonu.stok_takip.dto.Request.ProductUpdateRequest;
import com.inonu.stok_takip.dto.Request.PurchasedUnitCreateRequest;
import com.inonu.stok_takip.dto.Response.ProductResponse;
import com.inonu.stok_takip.dto.Response.PurchasedUnitResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.entitiy.Product;
import com.inonu.stok_takip.entitiy.PurchasedUnit;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


import java.util.List;

@RestController
@RequestMapping("/v1/purchasedUnit")
@PreAuthorize("hasAnyRole('SATINALMA','ADMIN','DEPO','YEMEKHANE')")
public class PurchasedUnitController {

    private final PurchasedUnitService purchasedUnitService;

    public PurchasedUnitController(PurchasedUnitService purchasedUnitService) {
        this.purchasedUnitService = purchasedUnitService;
    }

    @PostMapping("/create")
    public ResponseEntity<RestResponse<PurchasedUnitResponse>> createPurchasedUnit(@RequestBody PurchasedUnitCreateRequest request) {
        PurchasedUnitResponse purchasedUnitResponse = purchasedUnitService.create(request);
        return new ResponseEntity<>(RestResponse.of(purchasedUnitResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<PurchasedUnit>> getPurchasedUnitById(@PathVariable("id") Long purchasedUnitId) {
        PurchasedUnit purchasedUnit = purchasedUnitService.getPurchasedUnitById(purchasedUnitId);
        return new ResponseEntity<>(RestResponse.of(purchasedUnit),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<PurchasedUnitResponse>>> GetAllProducts() {
        List<PurchasedUnitResponse> purchasedUnitResponseList = purchasedUnitService.getAll();
        return new ResponseEntity<>(RestResponse.of(purchasedUnitResponseList), HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestResponse<PurchasedUnitResponse>> updatePurchasedUnit(@PathVariable Long id, @RequestBody PurchasedUnitCreateRequest request) {
        PurchasedUnitResponse purchasedUnitResponse = purchasedUnitService.update(id,request);
        return new ResponseEntity<>(RestResponse.of(purchasedUnitResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<PurchasedUnitResponse>> deletePurchasedUnit(@PathVariable("id") Long id) {
        PurchasedUnitResponse purchasedUnitResponse = purchasedUnitService.delete(id);
        return new ResponseEntity<>(RestResponse.of(purchasedUnitResponse), HttpStatus.OK);
    }

}
