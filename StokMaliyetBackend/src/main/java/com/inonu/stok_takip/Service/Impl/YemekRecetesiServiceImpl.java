package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.YemekRecetesi.YemekRecetesiAlreadyExistsException;
import com.inonu.stok_takip.Exception.YemekRecetesi.YemekRecetesiNotFoundException;
import com.inonu.stok_takip.Repositoriy.YemekRecetesiRepository;
import com.inonu.stok_takip.Service.YemekRecetesiService;
import com.inonu.stok_takip.dto.Request.YemekRecetesiCreateRequest;
import com.inonu.stok_takip.dto.Response.YemekRecetesiResponse;
import com.inonu.stok_takip.entitiy.YemekRecetesi;
import com.inonu.stok_takip.Enum.YemekTipi;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class YemekRecetesiServiceImpl implements YemekRecetesiService {

    private final YemekRecetesiRepository yemekRecetesiRepository;

    public YemekRecetesiServiceImpl(YemekRecetesiRepository yemekRecetesiRepository) {
        this.yemekRecetesiRepository = yemekRecetesiRepository;
    }

    @Override
    public List<YemekRecetesiResponse> getAllYemekReceteleri() {
        List<YemekRecetesi> receteler = yemekRecetesiRepository.findAll();
        return mapToResponseList(receteler);
    }

    @Override
    public List<YemekRecetesiResponse> getYemekReceteleriByTipi(YemekTipi tipi) {
        List<YemekRecetesi> receteler = yemekRecetesiRepository.findByTipi(tipi);
        return mapToResponseList(receteler);
    }

    @Override
    public YemekRecetesiResponse createYemekRecetesi(YemekRecetesiCreateRequest request) {
        YemekRecetesi existing = yemekRecetesiRepository.findByAdi(request.adi());
        if (existing != null) {
            throw new YemekRecetesiAlreadyExistsException("Bu isimde bir yemek reçetesi zaten mevcut: " + request.adi());
        }

        YemekRecetesi yemekRecetesi = new YemekRecetesi();
        yemekRecetesi.setAdi(request.adi());
        yemekRecetesi.setAciklama(request.aciklama());
        yemekRecetesi.setReceteDetaylari(request.receteDetaylari());
        yemekRecetesi.setTipi(request.tipi());

        YemekRecetesi saved = yemekRecetesiRepository.save(yemekRecetesi);
        return mapToResponse(saved);
    }

    @Override
    public YemekRecetesiResponse updateYemekRecetesi(Long id, YemekRecetesiCreateRequest request) {
        YemekRecetesi yemekRecetesi = getYemekRecetesiById(id);
        
        // Aynı isimde başka bir reçete varsa kontrol et
        YemekRecetesi existing = yemekRecetesiRepository.findByAdi(request.adi());
        if (existing != null && !existing.getId().equals(id)) {
            throw new YemekRecetesiAlreadyExistsException("Bu isimde bir yemek reçetesi zaten mevcut: " + request.adi());
        }

        yemekRecetesi.setAdi(request.adi());
        yemekRecetesi.setAciklama(request.aciklama());
        yemekRecetesi.setReceteDetaylari(request.receteDetaylari());
        yemekRecetesi.setTipi(request.tipi());

        YemekRecetesi updated = yemekRecetesiRepository.save(yemekRecetesi);
        return mapToResponse(updated);
    }

    @Override
    public YemekRecetesiResponse deleteYemekRecetesi(Long id) {
        YemekRecetesi yemekRecetesi = getYemekRecetesiById(id);
        yemekRecetesiRepository.delete(yemekRecetesi);
        return mapToResponse(yemekRecetesi);
    }

    @Override
    public YemekRecetesi getYemekRecetesiById(Long id) {
        return yemekRecetesiRepository.findById(id)
                .orElseThrow(() -> new YemekRecetesiNotFoundException("Yemek reçetesi bulunamadı: " + id));
    }

    private YemekRecetesiResponse mapToResponse(YemekRecetesi yemekRecetesi) {
        return new YemekRecetesiResponse(
                yemekRecetesi.getId(),
                yemekRecetesi.getAdi(),
                yemekRecetesi.getAciklama(),
                yemekRecetesi.getReceteDetaylari(),
                yemekRecetesi.getTipi()
        );
    }

    private List<YemekRecetesiResponse> mapToResponseList(List<YemekRecetesi> yemekRecetesiList) {
        return yemekRecetesiList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}

