package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.TenderService;
import com.inonu.stok_takip.dto.Request.TenderCreateRequest;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.dto.Response.TenderResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/v1/tender")
@PreAuthorize("hasAnyRole('SATINALMA','ADMIN','YEMEKHANE')")
public class TenderController {

    private final TenderService tenderService;

    public TenderController(TenderService tenderService) {
        this.tenderService = tenderService;
    }

    @PostMapping("/create")
    public ResponseEntity<RestResponse<TenderResponse>> createTender(@RequestBody TenderCreateRequest request) {
        TenderResponse tenderResponse = tenderService.createTender(request);
        return new ResponseEntity<>(RestResponse.of(tenderResponse), HttpStatus.OK);
    }
    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<TenderResponse>>> getAllTender() {
        List<TenderResponse> tenderResponses = tenderService.getAllTenders();
        return new ResponseEntity<>(RestResponse.of(tenderResponses), HttpStatus.OK);
    }

    @GetMapping("/activeTender")
    public ResponseEntity<RestResponse<List<TenderResponse>>> getActiveTender() {
        List<TenderResponse> tenderResponses = tenderService.getAllActiveTenders();
        return new ResponseEntity<>(RestResponse.of(tenderResponses), HttpStatus.OK);
    }

    @PostMapping("/increaseTender/{tenderId}/{increasedQuantity}")
    public ResponseEntity<RestResponse<TenderResponse>> increaseTender(@PathVariable Long tenderId, @PathVariable Double increasedQuantity) {
        TenderResponse tenderResponse = tenderService.increaseTenderByTwentyPercent(tenderId,increasedQuantity);
        return new ResponseEntity<>(RestResponse.of(tenderResponse), HttpStatus.OK);
    }


    @GetMapping("/getTendersByProductsAndCompany")
    public ResponseEntity<RestResponse<List<TenderResponse>>> getTendersByProductAndCompany(){
        List<TenderResponse> tenderResponses = tenderService.getTenderByProductAndCompany();
        return new ResponseEntity<>(RestResponse.of(tenderResponses),HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestResponse<TenderResponse>> updateTender(@PathVariable("id") Long id,
                                                                     @RequestBody TenderCreateRequest request) {
        TenderResponse response = tenderService.updateTender(id, request);
        return new ResponseEntity<>(RestResponse.of(response), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<TenderResponse>> deleteTender(@PathVariable("id") Long id) {
        TenderResponse response = tenderService.deleteTender(id);
        return new ResponseEntity<>(RestResponse.of(response), HttpStatus.OK);
    }
}
