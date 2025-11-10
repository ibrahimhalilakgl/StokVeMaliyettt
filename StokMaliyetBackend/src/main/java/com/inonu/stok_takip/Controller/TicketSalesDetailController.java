package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.TicketSalesDetailService;
import com.inonu.stok_takip.dto.Request.DateRequest;
import com.inonu.stok_takip.dto.Request.TicketSalesDetailCreateRequest;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.dto.Response.TicketSalesDetailResponse;
import com.inonu.stok_takip.dto.Response.TicketSalesResponse;
import com.inonu.stok_takip.entitiy.TicketSalesDetail;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

@RestController
@RequestMapping("/v1/ticketSalesDetail")
@PreAuthorize("hasAnyRole('YEMEKHANE','ADMIN')")
public class TicketSalesDetailController {

 private final TicketSalesDetailService ticketSalesDetailService;

    public TicketSalesDetailController(TicketSalesDetailService ticketSalesDetailService) {
        this.ticketSalesDetailService = ticketSalesDetailService;
    }

    @PostMapping("/create")
    public ResponseEntity<RestResponse<List<TicketSalesDetailResponse>>> createTicketSalesDetail(@RequestBody TicketSalesDetailCreateRequest request) {
        List<TicketSalesDetailResponse> ticketSalesDetailResponse = ticketSalesDetailService.addTicket(request);
        return new ResponseEntity<>(RestResponse.of(ticketSalesDetailResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<TicketSalesDetail>> getTicketSalesDetailById(@PathVariable Long id) {
        TicketSalesDetail ticketSalesDetail = ticketSalesDetailService.getTicketSalesDetailById(id);
        return new ResponseEntity<>(RestResponse.of(ticketSalesDetail),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<TicketSalesDetailResponse>>> getAllTicketSalesDetails() {
        List<TicketSalesDetailResponse> ticketSalesDetailResponseList = ticketSalesDetailService.getAll();
        return new ResponseEntity<>(RestResponse.of(ticketSalesDetailResponseList), HttpStatus.OK);
    }

    @GetMapping("/ticketByDate")
    public ResponseEntity<RestResponse<Integer>> getTicketSalesDetailByDate(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        Integer count = ticketSalesDetailService.getTicketCountByDay(date);
        return new ResponseEntity<>(RestResponse.of(count), HttpStatus.OK);
    }
    @GetMapping("/ticketCountByMonth")
    public ResponseEntity<RestResponse<Integer>> getTicketCountByMonth(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        Integer count = ticketSalesDetailService.getTicketCountByMonth(date);
        return new ResponseEntity<>(RestResponse.of(count), HttpStatus.OK);
    }

    @GetMapping("/ticketCountByYear")
    public ResponseEntity<RestResponse<Integer>> getTicketCountByYear(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        Integer count = ticketSalesDetailService.getTicketCountByYear(date);
        return new ResponseEntity<>(RestResponse.of(count), HttpStatus.OK);
    }

    @GetMapping("/getTicketByDate")
    public ResponseEntity<RestResponse<List<TicketSalesResponse>>> getTicketByDate(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                                                                   @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        DateRequest dateRequest = new DateRequest(startDate,endDate);
        List<TicketSalesResponse> ticketSalesDetailResponseList = ticketSalesDetailService.getTicketByDate(dateRequest);
        return new ResponseEntity<>(RestResponse.of(ticketSalesDetailResponseList), HttpStatus.OK);
    }




/*
    @PutMapping("/update/{id}")
    public ResponseEntity<RestResponse<TicketSalesDetailResponse>> updateTicketSalesDetail(@PathVariable Long id, @RequestBody TicketSalesDetailCreateRequest request) {
        TicketSalesDetailResponse ticketSalesDetailResponse = ticketSalesDetailService.updateTicketSalesDetail(request);
        return new ResponseEntity<>(RestResponse.of(ticketSalesDetailResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<TicketSalesDetailResponse>> deleteTicketSalesDetail(@PathVariable Long id) {
        TicketSalesDetailResponse ticketSalesDetailResponse = ticketSalesDetailService.deleteTicketSalesDetail(id);
        return new ResponseEntity<>(RestResponse.of(ticketSalesDetailResponse), HttpStatus.OK);
    }*/
}
