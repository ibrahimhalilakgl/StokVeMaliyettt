package com.inonu.stok_takip.Config;

import com.inonu.stok_takip.filter.JwtFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:8080}")
    private String corsAllowedOrigins;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // ==== /v1 endpoint grupları (kısa ve okunabilir) ====
        String[] v1AdminSatinalma = {
                "/v1/budget/**",              // Bütçe yönetimi
                "/v1/report/**",              // Raporlama
                "/v1/category/**",            // Kategori
                "/v1/measurementType/**",     // Ölçü birimi tipi
                "/v1/purchaseType/**",        // Satın alma tipi
                "/v1/purchasedUnit/**",       // Satın alınan birim
                "/v1/tender/**",              // İhale
                "/v1/directProcurement/**"    // Doğrudan temin
        };

        String[] v1AdminSatinalmaDepo = {
                "/v1/product/**",             // Ürün (stok)
                "/v1/materialEntry/**",       // Malzeme giriş
                "/v1/materialExit/**",        // Malzeme çıkış - DEPO için eklendi
                "/v1/materialDemand/**",      // Malzeme talep - DEPO için eklendi
                "/v1/report/**",              // Raporlama - DEPO için eklendi
                "/v1/budget/**",              // Bütçe yönetimi
                "/v1/purchaseType/**",        // Satın alma tipi
                "/v1/purchasedUnit/**",       // Satın alınan birim
                "/v1/category/**",            // Kategori
                "/v1/measurementType/**",     // Ölçü birimi tipi
                "/v1/tender/**",              // İhale
                "/v1/directProcurement/**"    // Doğrudan temin
        };

        String[] v1AdminYemekhane = {
                "/v1/ticketType/**",          // Bilet tipi
                "/v1/ticketSalesDetail/**",   // Bilet satış detay
                "/v1/refectory/**",           // Yemekhane
                "/v1/product/**",             // Ürün (stok) - yemekhane için
                "/v1/materialEntry/**",       // Malzeme giriş - yemekhane için
                "/v1/materialExit/**",        // Malzeme çıkış - YEMEKHANE için eklendi
                "/v1/materialDemand/**",      // Malzeme talep - YEMEKHANE için eklendi
                "/v1/report/**",              // Raporlama - YEMEKHANE için eklendi
                "/v1/budget/**"               // Bütçe - yemekhane için
        };

        String[] v1AdminYemekhaneOnly = {
                "/v1/materialExit/**",        // Malzeme çıkış & istatistikler (Yemekhane)
                "/v1/materialDemand/**"       // Malzeme talep (Yemekhane tarafı)
        };

        String[] v1Dashboard = {
                "/v1/dashboard/**"            // Dashboard istatistikleri
        };

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ===== AÇIK ALANLAR =====
                        .requestMatchers("/api/auth/login").permitAll()          // sadece login açık
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        
                        // ===== DEVELOPMENT: Basic data endpoints for initial setup =====
                        .requestMatchers("/v1/category/all").permitAll()         // Allow category list for initial setup
                        .requestMatchers("/v1/measurementType/all").permitAll()  // Allow measurement types for initial setup
                        .requestMatchers("/v1/budget/all").permitAll()           // Allow budget list for initial setup
                        .requestMatchers("/v1/purchasedUnit/all").permitAll()    // Allow purchased unit list for initial setup
                        .requestMatchers("/v1/purchaseType/all").permitAll()     // Allow purchase type list for initial setup
                        .requestMatchers("/v1/product/all").permitAll()          // Allow product list for initial setup
                        .requestMatchers("/v1/malzeme-giris").permitAll()        // Allow malzeme-giris endpoint
                        .requestMatchers("/v1/report/all").permitAll()           // Allow report list for DEPO role

                        // ===== SADECE ADMIN =====
                        .requestMatchers("/api/auth/register").hasRole("ADMIN")  // register artık ADMIN'e kısıtlı
                        .requestMatchers("/api/auth/delete/**").hasRole("ADMIN")  // delete sadece ADMIN'e kısıtlı
                        
                        // ===== ADMIN TÜM ENDPOINT'LERE ERİŞEBİLİR =====
                        .requestMatchers("/v1/**").hasAnyRole("ADMIN", "SATINALMA", "YEMEKHANE", "DEPO")  // Admin tüm /v1 endpoint'lerine erişebilir
                        .requestMatchers("/api/**").hasAnyRole("ADMIN", "SATINALMA", "YEMEKHANE", "DEPO")  // Admin tüm /api endpoint'lerine erişebilir

                        // ===== 4 ANA ALAN / ROLE =====
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/satinalma/**").hasAnyRole("SATINALMA", "ADMIN")
                        .requestMatchers("/api/yemekhane/**").hasAnyRole("YEMEKHANE", "ADMIN")
                        .requestMatchers("/api/depo/**").hasAnyRole("DEPO", "ADMIN")

                        // ===== MATERIAL-DEMANDS (tüm roller; token zorunlu) =====
                        .requestMatchers("/api/material-demands/**")
                        .hasAnyRole("ADMIN","SATINALMA","YEMEKHANE","DEPO")

                        // ===== /v1 TARAFI (token + rol kontrolü, gruplanmış) =====
                        .requestMatchers(v1AdminSatinalma).hasAnyRole("ADMIN", "SATINALMA")
                        .requestMatchers(v1AdminSatinalmaDepo).hasAnyRole("ADMIN", "SATINALMA", "DEPO")
                        .requestMatchers(v1AdminYemekhane).hasAnyRole("ADMIN", "YEMEKHANE")
                        .requestMatchers(v1AdminYemekhaneOnly).hasAnyRole("ADMIN", "YEMEKHANE")
                        .requestMatchers(v1Dashboard).hasAnyRole("ADMIN", "YEMEKHANE", "DEPO", "SATINALMA")

                        // ===== DİĞER HER ŞEY: token zorunlu (authenticated), ek rol kuralı yok =====
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"Forbidden\"}");
                        })
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        cfg.setAllowedOrigins(origins);
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        // Gerekirse:
        // cfg.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
