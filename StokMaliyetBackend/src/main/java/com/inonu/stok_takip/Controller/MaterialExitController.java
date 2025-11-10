package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.MaterialExitService;
import com.inonu.stok_takip.dto.Request.DateRequest;
import com.inonu.stok_takip.dto.Request.MaterialExitCreateRequest;
import com.inonu.stok_takip.dto.Response.MaterialExitDetailResponse;
import com.inonu.stok_takip.dto.Response.MaterialExitResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.entitiy.MaterialExit;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/materialExit")
@PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
public class MaterialExitController {

    private final MaterialExitService materialExitService;

    public MaterialExitController(MaterialExitService materialExitService) {
        this.materialExitService = materialExitService;
    }

    @PostMapping("/exit")
    public ResponseEntity<RestResponse<List<MaterialExitResponse>>> exitMaterials(
            @RequestBody MaterialExitCreateRequest materialExitCreateRequest) {

        List<MaterialExitResponse> materialExitResponses = materialExitService.exitMaterials(materialExitCreateRequest);
        return new ResponseEntity<>(RestResponse.of(materialExitResponses), HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<MaterialExitResponse>>> getAllMaterialExits() {
        List<MaterialExitResponse> materialExitResponses = materialExitService.getAllMaterialExits();
        return new ResponseEntity<>(RestResponse.of(materialExitResponses), HttpStatus.OK);
    }

    @PostMapping("/between-dates")
    public ResponseEntity<RestResponse<List<MaterialExitDetailResponse>>> getMaterialExitBetweenDates(
            @RequestBody DateRequest dateRequest) {

        List<MaterialExitDetailResponse> materialExitDetailResponses = materialExitService.getMaterialExitBetweenDates(dateRequest);
        return new ResponseEntity<>(RestResponse.of(materialExitDetailResponses), HttpStatus.OK);
    }

    @GetMapping("/total-amount")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Double>> calculateTotalAmount(@RequestBody DateRequest dateRequest) {
        Double totalAmount = materialExitService.calculateTotalAmount(dateRequest);
        return new ResponseEntity<>(RestResponse.of(totalAmount), HttpStatus.OK);
    }

    @PostMapping("/list-between-dates")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<List<MaterialExitResponse>>> getMaterialListBetweenDate(
            @RequestBody DateRequest dateRequest) {

        List<MaterialExitResponse> materialExitResponses = materialExitService.getMaterialListBetweenDate(dateRequest);
        return new ResponseEntity<>(RestResponse.of(materialExitResponses), HttpStatus.OK);
    }

    @GetMapping("/clean-material-price")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Double>> calculateCleanMaterialPrice(@RequestBody DateRequest dateRequest) {
        Double cleanMaterialPrice = materialExitService.calculateCleanMaterialPrice(dateRequest);
        return new ResponseEntity<>(RestResponse.of(cleanMaterialPrice), HttpStatus.OK);
    }

    // Günlük istatistikler
    @GetMapping("/daily-stats/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Double>> getNonCleaningMaterialExitsByDate(@PathVariable LocalDate date) {
        Double dailyStats = materialExitService.getNonCleaningMaterialExitsByDate(date);
        return new ResponseEntity<>(RestResponse.of(dailyStats), HttpStatus.OK);
    }

    @GetMapping("/meals-per-day/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Integer>> numberMealsInDay(@PathVariable LocalDate date) {
        Integer mealsCount = materialExitService.numberMealsInDay(date);
        return new ResponseEntity<>(RestResponse.of(mealsCount), HttpStatus.OK);
    }

    // Haftalık istatistikler
    @GetMapping("/weekly-stats/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Double>> getMaterialsByWeek(@PathVariable LocalDate date) {
        Double weeklyStats = materialExitService.getMaterialsByWeek(date);
        return new ResponseEntity<>(RestResponse.of(weeklyStats), HttpStatus.OK);
    }

    @GetMapping("/meals-per-week/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Integer>> numberMealsInWeek(@PathVariable LocalDate date) {
        Integer mealsCount = materialExitService.numberMealsInWeek(date);
        return new ResponseEntity<>(RestResponse.of(mealsCount), HttpStatus.OK);
    }

    // Aylık istatistikler
    @GetMapping("/monthly-stats/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Double>> getMaterialsByMonthAndYear(@PathVariable LocalDate date) {
        Double monthlyStats = materialExitService.getMaterialsByMonthAndYear(date);
        return new ResponseEntity<>(RestResponse.of(monthlyStats), HttpStatus.OK);
    }

    @GetMapping("/meals-per-month/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Integer>> numberMealsInMonth(@PathVariable LocalDate date) {
        Integer mealsCount = materialExitService.numberMealsInMonth(date);
        return new ResponseEntity<>(RestResponse.of(mealsCount), HttpStatus.OK);
    }

    // Yıllık istatistikler
    @GetMapping("/yearly-stats/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Double>> getMaterialsByYear(@PathVariable LocalDate date) {
        Double yearlyStats = materialExitService.getMaterialsByYear(date);
        return new ResponseEntity<>(RestResponse.of(yearlyStats), HttpStatus.OK);
    }

    @GetMapping("/meals-per-year/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE', 'DEPO')")
    public ResponseEntity<RestResponse<Integer>> numberMealsInYear(@PathVariable LocalDate date) {
        Integer mealsCount = materialExitService.numberMealsInYear(date);
        return new ResponseEntity<>(RestResponse.of(mealsCount), HttpStatus.OK);
    }

    @PutMapping("/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE')")
    public ResponseEntity<RestResponse<MaterialExitResponse>> updateMaterialExit(
            @RequestBody MaterialExitCreateRequest materialExitCreateRequest) {

        MaterialExitResponse materialExitResponse = materialExitService.updateMaterialExit(materialExitCreateRequest);
        return new ResponseEntity<>(RestResponse.of(materialExitResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<MaterialExitResponse>> deleteMaterialExit(@PathVariable("id") Long id) {
        MaterialExitResponse materialExitResponse = materialExitService.deleteMaterialExit(id);
        return new ResponseEntity<>(RestResponse.of(materialExitResponse), HttpStatus.OK);
    }
}
