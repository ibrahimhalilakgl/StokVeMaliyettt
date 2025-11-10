package com.inonu.stok_takip.Repositoriy;


import com.inonu.stok_takip.entitiy.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
}
