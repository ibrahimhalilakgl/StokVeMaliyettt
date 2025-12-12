package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.MaterialEntryService;
import com.inonu.stok_takip.dto.Request.MaterialEntryCreateRequest;
import com.inonu.stok_takip.dto.Request.MaterialEntryUpdateRequest;
import com.inonu.stok_takip.dto.Response.*;
import com.inonu.stok_takip.dto.Response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/materialEntry")
@PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA', 'DEPO')")
public class MaterialEntryController {

    private final MaterialEntryService materialEntryService;

    public MaterialEntryController(MaterialEntryService materialEntryService) {
        this.materialEntryService = materialEntryService;
    }

    @PostMapping(value = "/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA', 'DEPO')")
    public ResponseEntity<RestResponse<MaterialEntryResponse>> createMaterialEntry(
            @RequestBody MaterialEntryCreateRequest materialEntryCreateRequest) {

        MaterialEntryResponse materialEntryResponse = materialEntryService.createMaterialEntry(materialEntryCreateRequest);
        return new ResponseEntity<>(RestResponse.of(materialEntryResponse), HttpStatus.OK);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA', 'DEPO')")
    public ResponseEntity<RestResponse<List<MaterialEntryResponse>>> getAllMaterialEntryList() {
        List<MaterialEntryResponse> materialEntryList = materialEntryService.getAllMaterialEntryList();
        return new ResponseEntity<>(RestResponse.of(materialEntryList), HttpStatus.OK);
    }

    @GetMapping("/grouped")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA', 'DEPO')")
    public ResponseEntity<RestResponse<List<GroupMaterialEntryResponse>>> getGroupedMaterialEntries() {
        List<GroupMaterialEntryResponse> groupedEntries = materialEntryService.getGroupedMaterialEntries();
        return new ResponseEntity<>(RestResponse.of(groupedEntries), HttpStatus.OK);
    }

    @GetMapping("/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA', 'DEPO', 'YEMEKHANE')")
    public ResponseEntity<RestResponse<List<MaterialEntryDetailResponse>>> getMaterialEntryDetails() {
        List<MaterialEntryDetailResponse> details = materialEntryService.getMaterialEntryDetails();
        return new ResponseEntity<>(RestResponse.of(details), HttpStatus.OK);
    }

    @GetMapping("/spend-by-budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA')")
    public ResponseEntity<RestResponse<List<MaterialEntrySpendResponse>>> getTotalSpentGroupedByBudget() {
        List<MaterialEntrySpendResponse> spendData = materialEntryService.getTotalSpentGroupedByBudget();
        return new ResponseEntity<>(RestResponse.of(spendData), HttpStatus.OK);
    }

    @GetMapping("/for-exit")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<List<MaterialEntryProductsForMaterialExitResponse>>> getMaterialEntriesForExit() {
        List<MaterialEntryProductsForMaterialExitResponse> entriesForExit = materialEntryService.getMaterialEntriesForExit();
        return new ResponseEntity<>(RestResponse.of(entriesForExit), HttpStatus.OK);
    }

    @PutMapping("/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA')")
    public ResponseEntity<RestResponse<MaterialEntryResponse>> updateMaterialEntry(
            @RequestBody MaterialEntryUpdateRequest materialEntryUpdateRequest) {

        MaterialEntryResponse materialEntryResponse = materialEntryService.updateMaterialEntry(materialEntryUpdateRequest);
        return new ResponseEntity<>(RestResponse.of(materialEntryResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<MaterialEntryResponse>> deleteMaterialEntry(@PathVariable("id") Long id) {
        MaterialEntryResponse materialEntryResponse = materialEntryService.deleteMaterialEntry(id);
        return new ResponseEntity<>(RestResponse.of(materialEntryResponse), HttpStatus.OK);
    }

    @GetMapping("/getAllProductDetail")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA', 'DEPO', 'YEMEKHANE')")
    public ResponseEntity<RestResponse<List<Object>>> getAllProductDetail() {
        List<Object> productDetails = materialEntryService.getAllProductDetail();
        return new ResponseEntity<>(RestResponse.of(productDetails), HttpStatus.OK);
    }

    @GetMapping("/getBudgetsGroup")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA')")
    public ResponseEntity<RestResponse<List<Object>>> getBudgetsGroup() {
        List<Object> budgetsGroup = materialEntryService.getBudgetsGroup();
        return new ResponseEntity<>(RestResponse.of(budgetsGroup), HttpStatus.OK);
    }
}
