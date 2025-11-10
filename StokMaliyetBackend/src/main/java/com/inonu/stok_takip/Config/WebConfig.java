package com.inonu.stok_takip.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Şimdilik burada CORS yapılandırmasına gerek yok.
    // Gerekirse başka WebMvc ayarları (interceptor, resource handler vs.) buraya eklenebilir.
}
