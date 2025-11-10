package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.GunlukMenu.GunlukMenuAlreadyExistsException;
import com.inonu.stok_takip.Exception.GunlukMenu.GunlukMenuNotFoundException;
import com.inonu.stok_takip.Exception.YemekRecetesi.YemekRecetesiNotFoundException;
import com.inonu.stok_takip.Repositoriy.GunlukMenuRepository;
import com.inonu.stok_takip.Repositoriy.YemekRecetesiRepository;
import com.inonu.stok_takip.Service.GunlukMenuService;
import com.inonu.stok_takip.Service.YemekRecetesiService;
import com.inonu.stok_takip.dto.Request.GunlukMenuCreateRequest;
import com.inonu.stok_takip.dto.Response.GunlukMenuResponse;
import com.inonu.stok_takip.dto.Response.MenuRaporResponse;
import com.inonu.stok_takip.dto.Response.YemekRecetesiResponse;
import com.inonu.stok_takip.entitiy.GunlukMenu;
import com.inonu.stok_takip.entitiy.YemekRecetesi;
import com.inonu.stok_takip.Enum.YemekTipi;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GunlukMenuServiceImpl implements GunlukMenuService {

    private final GunlukMenuRepository gunlukMenuRepository;
    private final YemekRecetesiRepository yemekRecetesiRepository;

    public GunlukMenuServiceImpl(GunlukMenuRepository gunlukMenuRepository,
                                 YemekRecetesiRepository yemekRecetesiRepository) {
        this.gunlukMenuRepository = gunlukMenuRepository;
        this.yemekRecetesiRepository = yemekRecetesiRepository;
    }

    @Override
    public List<GunlukMenuResponse> getAllGunlukMenuler() {
        List<GunlukMenu> menuler = gunlukMenuRepository.findAll();
        return mapToResponseList(menuler);
    }

    @Override
    public GunlukMenuResponse getGunlukMenuByTarih(LocalDate tarih) {
        GunlukMenu menu = gunlukMenuRepository.findByTarih(tarih)
                .orElseThrow(() -> new GunlukMenuNotFoundException("Bu tarih için menü bulunamadı: " + tarih));
        return mapToResponse(menu);
    }

    @Override
    public GunlukMenuResponse createGunlukMenu(GunlukMenuCreateRequest request) {
        // Aynı tarih için menü var mı kontrol et
        Optional<GunlukMenu> existing = gunlukMenuRepository.findByTarih(request.tarih());
        if (existing.isPresent()) {
            throw new GunlukMenuAlreadyExistsException("Bu tarih için zaten bir menü mevcut: " + request.tarih());
        }

        // Ana yemeği kontrol et
        YemekRecetesi anaYemek = yemekRecetesiRepository.findById(request.anaYemekId())
                .orElseThrow(() -> new YemekRecetesiNotFoundException("Ana yemek bulunamadı: " + request.anaYemekId()));
        
        if (anaYemek.getTipi() != YemekTipi.ANA_YEMEK) {
            throw new IllegalArgumentException("Seçilen yemek ana yemek tipinde değil");
        }

        // Yardımcı yemekleri kontrol et
        List<YemekRecetesi> yardimciYemekler = new ArrayList<>();
        if (request.yardimciYemekIdleri() != null && !request.yardimciYemekIdleri().isEmpty()) {
            for (Long yardimciYemekId : request.yardimciYemekIdleri()) {
                YemekRecetesi yardimciYemek = yemekRecetesiRepository.findById(yardimciYemekId)
                        .orElseThrow(() -> new YemekRecetesiNotFoundException("Yardımcı yemek bulunamadı: " + yardimciYemekId));
                
                if (yardimciYemek.getTipi() != YemekTipi.YARDIMCI_YEMEK) {
                    throw new IllegalArgumentException("Seçilen yemek yardımcı yemek tipinde değil: " + yardimciYemek.getAdi());
                }
                
                yardimciYemekler.add(yardimciYemek);
            }
        }

        GunlukMenu menu = new GunlukMenu();
        menu.setTarih(request.tarih());
        menu.setAnaYemek(anaYemek);
        menu.setYardimciYemekler(yardimciYemekler);

        GunlukMenu saved = gunlukMenuRepository.save(menu);
        return mapToResponse(saved);
    }

    @Override
    public GunlukMenuResponse updateGunlukMenu(Long id, GunlukMenuCreateRequest request) {
        GunlukMenu menu = gunlukMenuRepository.findById(id)
                .orElseThrow(() -> new GunlukMenuNotFoundException("Menü bulunamadı: " + id));

        // Tarih değiştiyse ve yeni tarih için başka bir menü varsa kontrol et
        if (!menu.getTarih().equals(request.tarih())) {
            Optional<GunlukMenu> existing = gunlukMenuRepository.findByTarih(request.tarih());
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new GunlukMenuAlreadyExistsException("Bu tarih için zaten bir menü mevcut: " + request.tarih());
            }
        }

        // Ana yemeği kontrol et
        YemekRecetesi anaYemek = yemekRecetesiRepository.findById(request.anaYemekId())
                .orElseThrow(() -> new YemekRecetesiNotFoundException("Ana yemek bulunamadı: " + request.anaYemekId()));
        
        if (anaYemek.getTipi() != YemekTipi.ANA_YEMEK) {
            throw new IllegalArgumentException("Seçilen yemek ana yemek tipinde değil");
        }

        // Yardımcı yemekleri kontrol et
        List<YemekRecetesi> yardimciYemekler = new ArrayList<>();
        if (request.yardimciYemekIdleri() != null && !request.yardimciYemekIdleri().isEmpty()) {
            for (Long yardimciYemekId : request.yardimciYemekIdleri()) {
                YemekRecetesi yardimciYemek = yemekRecetesiRepository.findById(yardimciYemekId)
                        .orElseThrow(() -> new YemekRecetesiNotFoundException("Yardımcı yemek bulunamadı: " + yardimciYemekId));
                
                if (yardimciYemek.getTipi() != YemekTipi.YARDIMCI_YEMEK) {
                    throw new IllegalArgumentException("Seçilen yemek yardımcı yemek tipinde değil: " + yardimciYemek.getAdi());
                }
                
                yardimciYemekler.add(yardimciYemek);
            }
        }

        menu.setTarih(request.tarih());
        menu.setAnaYemek(anaYemek);
        menu.setYardimciYemekler(yardimciYemekler);

        GunlukMenu updated = gunlukMenuRepository.save(menu);
        return mapToResponse(updated);
    }

    @Override
    public GunlukMenuResponse deleteGunlukMenu(Long id) {
        GunlukMenu menu = gunlukMenuRepository.findById(id)
                .orElseThrow(() -> new GunlukMenuNotFoundException("Menü bulunamadı: " + id));
        gunlukMenuRepository.delete(menu);
        return mapToResponse(menu);
    }

    @Override
    public MenuRaporResponse getYillikRapor(int yil) {
        List<GunlukMenu> menuler = gunlukMenuRepository.findByYear(yil);
        
        // Ana yemek kullanım sayıları
        Map<Long, Long> anaYemekKullanimSayilari = new HashMap<>();
        Set<Long> farkliAnaYemekler = new HashSet<>();
        
        // Yardımcı yemek kullanım sayıları
        Map<Long, Long> yardimciYemekKullanimSayilari = new HashMap<>();
        Set<Long> farkliYardimciYemekler = new HashSet<>();
        
        for (GunlukMenu menu : menuler) {
            // Ana yemek
            Long anaYemekId = menu.getAnaYemek().getId();
            anaYemekKullanimSayilari.put(anaYemekId, 
                    anaYemekKullanimSayilari.getOrDefault(anaYemekId, 0L) + 1);
            farkliAnaYemekler.add(anaYemekId);
            
            // Yardımcı yemekler
            for (YemekRecetesi yardimciYemek : menu.getYardimciYemekler()) {
                Long yardimciYemekId = yardimciYemek.getId();
                yardimciYemekKullanimSayilari.put(yardimciYemekId, 
                        yardimciYemekKullanimSayilari.getOrDefault(yardimciYemekId, 0L) + 1);
                farkliYardimciYemekler.add(yardimciYemekId);
            }
        }
        
        // En çok kullanılan ana yemekler (top 10)
        List<MenuRaporResponse.YemekKullanimSayisi> enCokKullanilanAnaYemekler = anaYemekKullanimSayilari.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    YemekRecetesi yemek = yemekRecetesiRepository.findById(entry.getKey())
                            .orElseThrow(() -> new YemekRecetesiNotFoundException("Yemek bulunamadı: " + entry.getKey()));
                    return new MenuRaporResponse.YemekKullanimSayisi(
                            entry.getKey(),
                            yemek.getAdi(),
                            entry.getValue()
                    );
                })
                .collect(Collectors.toList());
        
        // En çok kullanılan yardımcı yemekler (top 10)
        List<MenuRaporResponse.YemekKullanimSayisi> enCokKullanilanYardimciYemekler = yardimciYemekKullanimSayilari.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    YemekRecetesi yemek = yemekRecetesiRepository.findById(entry.getKey())
                            .orElseThrow(() -> new YemekRecetesiNotFoundException("Yemek bulunamadı: " + entry.getKey()));
                    return new MenuRaporResponse.YemekKullanimSayisi(
                            entry.getKey(),
                            yemek.getAdi(),
                            entry.getValue()
                    );
                })
                .collect(Collectors.toList());
        
        return new MenuRaporResponse(
                yil,
                enCokKullanilanAnaYemekler,
                enCokKullanilanYardimciYemekler,
                menuler.size(),
                farkliAnaYemekler.size(),
                farkliYardimciYemekler.size()
        );
    }

    @Override
    public GunlukMenu getGunlukMenuEntityByTarih(LocalDate tarih) {
        return gunlukMenuRepository.findByTarih(tarih)
                .orElse(null); // Bulunamazsa null döndür
    }

    private GunlukMenuResponse mapToResponse(GunlukMenu menu) {
        YemekRecetesi anaYemek = menu.getAnaYemek();
        YemekRecetesiResponse anaYemekResponse = new YemekRecetesiResponse(
                anaYemek.getId(),
                anaYemek.getAdi(),
                anaYemek.getAciklama(),
                anaYemek.getReceteDetaylari(),
                anaYemek.getTipi()
        );
        
        List<YemekRecetesiResponse> yardimciYemeklerResponse = menu.getYardimciYemekler().stream()
                .map(yemek -> new YemekRecetesiResponse(
                        yemek.getId(),
                        yemek.getAdi(),
                        yemek.getAciklama(),
                        yemek.getReceteDetaylari(),
                        yemek.getTipi()
                ))
                .collect(Collectors.toList());
        
        return new GunlukMenuResponse(
                menu.getId(),
                menu.getTarih(),
                anaYemekResponse,
                yardimciYemeklerResponse
        );
    }

    private List<GunlukMenuResponse> mapToResponseList(List<GunlukMenu> menuList) {
        return menuList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}

