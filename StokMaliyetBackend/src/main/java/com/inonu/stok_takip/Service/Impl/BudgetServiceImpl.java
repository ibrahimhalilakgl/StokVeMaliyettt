package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.Budget.BudgetNotFoundException;
import com.inonu.stok_takip.Repositoriy.BudgetRepository;
import com.inonu.stok_takip.Service.BudgetService;
import com.inonu.stok_takip.dto.Request.BudgetCreateRequest;
import com.inonu.stok_takip.dto.Response.BudgetResponse;
import com.inonu.stok_takip.entitiy.Budget;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @Override
    public List<BudgetResponse> getAllBudgets() {
        List<Budget> budgetList = budgetRepository.findAll();
        return mapToResponseList(budgetList);
        //return budgetRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public BudgetResponse createBudget(BudgetCreateRequest request) {
        Budget budget = mapToEntity(request);
        budget.setBudgetAmount(0.0);
        Budget toSave = budgetRepository.save(budget);
        return mapToResponse(toSave);
    }

    @Override
    public BudgetResponse updateBudget(Long id, BudgetCreateRequest request) {
        Budget budget = getBudgetById(id);
        budget = mapToEntity(request);
        Budget toUpdate = budgetRepository.save(budget);
        return mapToResponse(toUpdate);
    }

    @Override
    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id).orElseThrow(() -> new BudgetNotFoundException("Budget not found with id: " + id));
    }

    @Override
    public BudgetResponse deleteBudget(Long id) {
        Budget budget = getBudgetById(id);
        budgetRepository.delete(budget);
        return mapToResponse(budget);
    }

    // depoya malzeme girişi yapıldıktan sonra bütçede kalan tutarın güncellenmesini yapan metot
    @Override
    public BudgetResponse updateBudgetValue(Long budgetId, Double value) {

        Budget budget = getBudgetById(budgetId);
        Double remainingValue = budget.getBudgetAmount();
        Double newRemainingValue = remainingValue + value;
        budget.setBudgetAmount(newRemainingValue);
        Budget toUpdate = budgetRepository.save(budget);
        return mapToResponse(toUpdate);

    }

    private BudgetResponse mapToResponse(Budget budget) {
        return new BudgetResponse(
            budget.getId(),
            budget.getBudgetName(),
            budget.getBudgetAmount(),
            budget.getStartDate(),
            budget.getEndDate()
        );
    }

    private List<BudgetResponse> mapToResponseList(List<Budget> budgets) {
        List<BudgetResponse> budgetResponse = budgets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return budgetResponse;
    }

    private Budget mapToEntity(BudgetCreateRequest request){
        Budget budget = new Budget();
        budget.setBudgetName(request.budgetName());
        budget.setStartDate(request.startDate());
        budget.setEndDate(request.endDate());
        return budget;
    }
}
