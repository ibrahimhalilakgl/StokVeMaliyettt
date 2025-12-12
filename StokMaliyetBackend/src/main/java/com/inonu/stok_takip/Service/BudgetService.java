package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.BudgetCreateRequest;
import com.inonu.stok_takip.dto.Response.BudgetResponse;
import com.inonu.stok_takip.entitiy.Budget;

import java.util.List;

public interface BudgetService {
    List<BudgetResponse> getAllBudgets();
    BudgetResponse createBudget(BudgetCreateRequest request);
    BudgetResponse updateBudget(Long id, BudgetCreateRequest request);
    Budget getBudgetById(Long id);
    BudgetResponse deleteBudget(Long id);
    BudgetResponse updateBudgetValue(Long budgetId, Double value);
}
