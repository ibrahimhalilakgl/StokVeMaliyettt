package com.inonu.stok_takip.Service;

import java.util.Map;

public interface DashboardService {
    Map<String, Object> getAdminStats();
    Map<String, Object> getYemekhaneStats();
    Map<String, Object> getDepoStats();
    Map<String, Object> getSatinalmaStats();
}


