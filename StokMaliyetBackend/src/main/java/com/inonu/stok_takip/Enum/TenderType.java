package com.inonu.stok_takip.Enum;

public enum TenderType { // alım şekli için yapılmış ekstra eklenip kullanılabilir
    OPEN_TENDER,
    DIRECT_PROCUREMENT;

    public String getDescription() {
        switch (this) {
            case OPEN_TENDER:
                return "19. Madde ile Açık İhale";
            case DIRECT_PROCUREMENT:
                return "22. Madde ile Doğrudan Temin";
            default:
                return this.name(); // Yedek
        }
    }
}