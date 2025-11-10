package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
