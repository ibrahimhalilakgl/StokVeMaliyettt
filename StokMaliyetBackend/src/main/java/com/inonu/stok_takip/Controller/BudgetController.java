package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.BudgetService;
import com.inonu.stok_takip.entitiy.Budget;
import com.inonu.stok_takip.dto.Request.BudgetCreateRequest;
import com.inonu.stok_takip.dto.Response.BudgetResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/v1/budget")
@PreAuthorize("hasAnyRole('SATINALMA','ADMIN','DEPO','YEMEKHANE')")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping("/create")
    public ResponseEntity<RestResponse<BudgetResponse>> createBudget(@RequestBody BudgetCreateRequest request) {
        BudgetResponse budgetResponse = budgetService.createBudget(request);
        return new ResponseEntity<>(RestResponse.of(budgetResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<Budget>> getBudgetById(@PathVariable Long id) {
        Budget budget = budgetService.getBudgetById(id);
        return new ResponseEntity<>(RestResponse.of(budget),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<BudgetResponse>>> getAllBudgets() {
        List<BudgetResponse> budgets = budgetService.getAllBudgets();
        return new ResponseEntity<>(RestResponse.of(budgets), HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestResponse<BudgetResponse>> updateBudget(@PathVariable Long id, @RequestBody BudgetCreateRequest budgetCreateRequest) {
        BudgetResponse budgetResponse = budgetService.updateBudget(id, budgetCreateRequest);
        return new ResponseEntity<>(RestResponse.of(budgetResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<BudgetResponse>> deleteBudget(@PathVariable Long id) {
        BudgetResponse budgetResponse = budgetService.deleteBudget(id);
        return new ResponseEntity<>(RestResponse.of(budgetResponse), HttpStatus.OK);
    }

}
