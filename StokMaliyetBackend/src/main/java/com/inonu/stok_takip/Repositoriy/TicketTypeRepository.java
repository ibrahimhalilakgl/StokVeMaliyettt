package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
}
