package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Repositoriy.*;
import com.inonu.stok_takip.Service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final MaterialEntryRepository materialEntryRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketSalesDetailRepository ticketSalesDetailRepository;
    private final TenderRepository tenderRepository;
    private final DirectProcurementRepository directProcurementRepository;

    public DashboardServiceImpl(
            UserRepository userRepository,
            MaterialEntryRepository materialEntryRepository,
            TicketTypeRepository ticketTypeRepository,
            TicketSalesDetailRepository ticketSalesDetailRepository,
            TenderRepository tenderRepository,
            DirectProcurementRepository directProcurementRepository) {
        this.userRepository = userRepository;
        this.materialEntryRepository = materialEntryRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.ticketSalesDetailRepository = ticketSalesDetailRepository;
        this.tenderRepository = tenderRepository;
        this.directProcurementRepository = directProcurementRepository;
    }

    @Override
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Sistem istatistikleri
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.count()); // Şimdilik aynı, sonra aktif kullanıcı sayısı eklenebilir
        stats.put("totalProducts", materialEntryRepository.count());
        
        // Düşük stok sayısı (örnek: 10'dan az stok)
        long lowStockItems = materialEntryRepository.findAll().stream()
                .filter(item -> item.getRemainingQuantity() != null && item.getRemainingQuantity() < 10)
                .count();
        stats.put("lowStockItems", lowStockItems);
        
        // Bekleyen onaylar (örnek: aktif ihaleler)
        stats.put("pendingApprovals", tenderRepository.count());
        
        // Sistem sağlığı
        stats.put("systemHealth", "Good");
        
        return stats;
    }

    @Override
    public Map<String, Object> getYemekhaneStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Fiş türleri
        stats.put("totalTicketTypes", ticketTypeRepository.count());
        
        // Bugünkü satışlar
        LocalDate today = LocalDate.now();
        var todaySales = ticketSalesDetailRepository.findBySaleDateBetween(today, today);
        
        int totalTicketsSold = todaySales.stream()
                .mapToInt(sale -> sale.getQuantity())
                .sum();
        stats.put("todayTicketsSold", totalTicketsSold);
        
        double totalRevenue = todaySales.stream()
                .mapToDouble(sale -> sale.getTotalPrice() != null ? sale.getTotalPrice() : 0.0)
                .sum();
        stats.put("todayRevenue", totalRevenue);
        
        // Ortalama fiyat
        double averagePrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0.0;
        stats.put("averagePrice", averagePrice);
        
        // Kritik stok uyarıları - sadece database'den
        stats.put("criticalStocks", new ArrayList<>());
        
        return stats;
    }

    @Override
    public Map<String, Object> getDepoStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Stok istatistikleri
        var allItems = materialEntryRepository.findAll();
        stats.put("totalProducts", allItems.size());
        
        // Düşük stok sayısı (örnek: 10'dan az stok)
        long lowStockProducts = allItems.stream()
                .filter(item -> item.getRemainingQuantity() != null && item.getRemainingQuantity() < 10)
                .count();
        stats.put("lowStockProducts", lowStockProducts);
        
        // Kritik stok sayısı (örnek: 5'ten az stok)
        long criticalItems = allItems.stream()
                .filter(item -> item.getRemainingQuantity() != null && item.getRemainingQuantity() < 5)
                .count();
        stats.put("criticalItems", criticalItems);
        
        // Toplam stok değeri
        double totalValue = allItems.stream()
                .mapToDouble(item -> {
                    if (item.getRemainingQuantity() != null && item.getUnitPrice() != null) {
                        return item.getRemainingQuantity() * item.getUnitPrice();
                    }
                    return 0.0;
                })
                .sum();
        stats.put("totalValue", totalValue);
        
        // Son kullanma tarihi yaklaşan ürünler - sadece database'den
        stats.put("expiringItems", new ArrayList<>());
        
        // Beklenen teslimatlar - sadece database'den
        stats.put("pendingDeliveries", new ArrayList<>());
        
        return stats;
    }

    @Override
    public Map<String, Object> getSatinalmaStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // İhale istatistikleri
        stats.put("totalTenders", tenderRepository.count());
        
        // Doğrudan temin sayısı
        stats.put("totalDirectProcurements", directProcurementRepository.count());
        
        // Bütçe bilgileri (örnek veriler)
        stats.put("totalBudget", 500000.0);
        stats.put("spentAmount", 250000.0);
        stats.put("remainingBudget", 250000.0);
        
        // Bekleyen onaylar
        stats.put("pendingApprovals", 3);
        
        // Tedarikçi performansı - sadece database'den
        stats.put("supplierPerformance", new ArrayList<>());
        
        return stats;
    }
}
