package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Enum.TenderType;
import com.inonu.stok_takip.Exception.Tender.TenderNotFoundException;
import com.inonu.stok_takip.Repositoriy.TenderRepository;
import com.inonu.stok_takip.Service.ProductService;
import com.inonu.stok_takip.Service.PurchaseTypeService;
import com.inonu.stok_takip.Service.PurchasedUnitService;
import com.inonu.stok_takip.Service.TenderService;
import com.inonu.stok_takip.dto.Request.TenderCreateRequest;
import com.inonu.stok_takip.dto.Response.TenderResponse;
import com.inonu.stok_takip.entitiy.Product;
import com.inonu.stok_takip.entitiy.PurchaseType;
import com.inonu.stok_takip.entitiy.PurchasedUnit;
import com.inonu.stok_takip.entitiy.Tender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TenderServiceImpl implements TenderService {

    private final TenderRepository tenderRepository;
    private final PurchasedUnitService purchasedUnitService;
    private final PurchaseTypeService purchaseTypeService;
    private final ProductService productService;

    public TenderServiceImpl(TenderRepository tenderRepository,
                             PurchasedUnitService purchasedUnitService,
                             PurchaseTypeService purchaseTypeService,
                             ProductService productService) {
        this.tenderRepository = tenderRepository;
        this.purchasedUnitService = purchasedUnitService;
        this.purchaseTypeService = purchaseTypeService;
        this.productService = productService;
    }

    @Override
    public TenderResponse createTender(TenderCreateRequest request) {


        PurchaseType purchaseType = purchaseTypeService.getPurchaseTypeById(request.purchaseTypeId());
        PurchasedUnit purchasedUnit = purchasedUnitService.getPurchasedUnitById(request.purchasedUnitId());
        Product product = productService.getProductById(request.productId());

        Tender tender = mapToEntity(request);
        Double totalAmount = tender.getUnitPrice() * tender.getTenderQuantity();
        tender.setTotalAmount(totalAmount);
        tender.setProduct(product);
        tender.setPurchaseType(purchaseType);
        tender.setPurchasedUnit(purchasedUnit);
        tender.setRemainingQuantityInTender(tender.getTenderQuantity());
        tender.setTenderType(TenderType.OPEN_TENDER);

        Tender savedTender = tenderRepository.save(tender);

        return mapToResponse(savedTender);
    }

    @Override
    public TenderResponse updateTenderRemainingQuantity(Long tenderId, Double quantity){
        Tender tender = getTenderById(tenderId);
        tender.setRemainingQuantityInTender(tender.getRemainingQuantityInTender() - quantity);
        Tender savedTender = tenderRepository.save(tender);
        return mapToResponse(savedTender);
    }

    @Override
    public List<TenderResponse> getAllActiveTenders() {
        List<Tender> tenders = tenderRepository.findTenderByActiveTrue();
        return mapToResponseList(tenders);
    }
    @Override
    public List<TenderResponse> getAllTenders(){
        List<Tender> tenders = tenderRepository.findAll();
        return mapToResponseList(tenders);
    }


    //yıl bittiği için veya ihale süresi dolmuş bütün ihaleleri silen kod yapısı bu kod her saate bir tetikleniyor
    @Override
    @Scheduled(cron = "0 0 * * * ?")
    public void handleTendersAtYearEnd() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        // 31 Aralık kontrolü
        boolean isYearEnd = today.getMonthValue() == 12 && today.getDayOfMonth() == 31;

        List<Tender> tenders = tenderRepository.findAll();

        for (Tender tender : tenders) {
            boolean isExpired = tender.getEndDate().isBefore(today);

            // Eğer ihale süresi dolmuşsa veya yılın son günündeysek
            if ((isExpired || isYearEnd) && tender.isActive()) {
                tender.setActive(false);
                tenderRepository.save(tender);
            }
        }
    }


    //ihaleyi arttıran metot - ilk arttırma veya arttırma miktarını güncelleme (0 = arttırma iptal)
    @Transactional
    @Override
    public TenderResponse increaseTenderByTwentyPercent(Long tenderId,Double increasedQuantity) {
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new TenderNotFoundException("Tender not found"));

        // Eğer arttırma miktarı 0 ise, arttırmayı iptal et (orijinal değerlere dön)
        if (increasedQuantity == 0 || increasedQuantity == null) {
            if (tender.isIncreased() && tender.getIncreaseAmount() != null) {
                // Önceki arttırma miktarını kullanarak orijinal değerlere geri dön
                Double previousQuantity = (tender.getIncreaseAmount() / 100) + 1;
                Double previousIncreased = tender.getIncreaseAmount() / 100;
                
                // Orijinal değerlere geri dön (arttırmayı iptal et)
                Double originalTotalAmount = tender.getTotalAmount() / previousQuantity;
                
                if (tender.getTenderQuantity() != null) {
                    // Orijinal tenderQuantity'yi hesapla
                    Double originalTenderQuantity = tender.getTenderQuantity() / previousQuantity;
                    // Orijinal remainingQuantity'yi hesapla (önceki arttırma ile eklenen miktarı çıkar)
                    Double previousAddedQuantity = originalTenderQuantity * previousIncreased;
                    Double originalRemainingQuantity = tender.getRemainingQuantityInTender() - previousAddedQuantity;
                    
                    tender.setTenderQuantity(originalTenderQuantity);
                    tender.setRemainingQuantityInTender(originalRemainingQuantity);
                }
                
                tender.setTotalAmount(originalTotalAmount);
                tender.setIncreased(false);
                tender.setIncreaseAmount(0.0);
            }
            // Eğer zaten arttırılmamışsa, hiçbir şey yapma
        } else {
            // Eğer ihale zaten arttırılmışsa, önceki arttırmayı geri al, sonra yeni arttırma miktarını uygula
            if (tender.isIncreased() && tender.getIncreaseAmount() != null) {
                // Önceki arttırma miktarını kullanarak orijinal değerlere geri dön
                Double previousQuantity = (tender.getIncreaseAmount() / 100) + 1;
                Double previousIncreased = tender.getIncreaseAmount() / 100;
                
                // Orijinal değerlere geri dön (önceki arttırmayı geri al)
                Double originalTotalAmount = tender.getTotalAmount() / previousQuantity;
                Double originalTenderQuantity = null;
                Double originalRemainingQuantity = null;
                
                if (tender.getTenderQuantity() != null) {
                    // Orijinal tenderQuantity'yi hesapla
                    originalTenderQuantity = tender.getTenderQuantity() / previousQuantity;
                    // Orijinal remainingQuantity'yi hesapla (önceki arttırma ile eklenen miktarı çıkar)
                    Double previousAddedQuantity = originalTenderQuantity * previousIncreased;
                    originalRemainingQuantity = tender.getRemainingQuantityInTender() - previousAddedQuantity;
                }
                
                // Şimdi yeni arttırma miktarını uygula
                Double newQuantity = (increasedQuantity / 100) + 1;
                Double newIncreased = increasedQuantity / 100;
                
                tender.setTotalAmount(originalTotalAmount * newQuantity);
                if (originalTenderQuantity != null && originalRemainingQuantity != null) {
                    Double newAddedQuantity = originalTenderQuantity * newIncreased;
                    tender.setTenderQuantity(originalTenderQuantity * newQuantity);
                    tender.setRemainingQuantityInTender(originalRemainingQuantity + newAddedQuantity);
                }
                
                // Arttırma miktarını güncelle
                tender.setIncreaseAmount(increasedQuantity);
            } else {
                // İlk arttırma
                Double quantity = (increasedQuantity/100) + 1;
                Double increased = increasedQuantity/100;

                tender.setTotalAmount(tender.getTotalAmount() * quantity);
                if (tender.getTenderQuantity() != null) {
                    Double newValue = tender.getTenderQuantity() * increased;
                    tender.setTenderQuantity(tender.getTenderQuantity() * quantity);
                    tender.setRemainingQuantityInTender(tender.getRemainingQuantityInTender() + newValue);
                }
                tender.setIncreased(true);
                // Arttırma miktarını kaydet
                tender.setIncreaseAmount(increasedQuantity);
            }
        }

        Tender updatedTender = tenderRepository.save(tender);
        return mapToResponse(updatedTender);
    }

    @Override
    public Tender getTenderById(Long id) {
        return tenderRepository.findById(id).orElseThrow(()-> new TenderNotFoundException("tender not found"));
    }

    @Override
    public List<TenderResponse> getTenderByProductAndCompany(){
        List<Tender> tenders = tenderRepository.findTenderByActiveTrue();
        return mapToResponseList(tenders);
    }

    @Override
    @Transactional
    public TenderResponse updateTender(Long tenderId, TenderCreateRequest request) {
        Tender tender = getTenderById(tenderId);
        // allow updating core fields
        tender.setTenderQuantity(request.tenderQuantity());
        tender.setStartDate(request.startDate());
        tender.setEndDate(request.endDate());
        tender.setUnitPrice(request.unitPrice());
        tender.setCompanyName(request.companyName());
        // recalc totals and remaining if quantity changed
        Double oldQuantity = tender.getTenderQuantity();
        Double oldRemaining = tender.getRemainingQuantityInTender();
        if (oldQuantity != null && oldRemaining != null && request.tenderQuantity() != null) {
            double consumed = oldQuantity - oldRemaining;
            double newRemaining = Math.max(0.0, request.tenderQuantity() - consumed);
            tender.setRemainingQuantityInTender(newRemaining);
        }
        tender.setTotalAmount(tender.getUnitPrice() * tender.getTenderQuantity());
        Tender saved = tenderRepository.save(tender);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TenderResponse deleteTender(Long tenderId) {
        Tender tender = getTenderById(tenderId);
        tenderRepository.delete(tender);
        return mapToResponse(tender);
    }


    private TenderResponse mapToResponse(Tender tender) {
        TenderResponse tenderResponse = new TenderResponse(
                tender.getId(),
                tender.getTenderQuantity(),
                tender.getRemainingQuantityInTender(),
                tender.getStartDate(),
                tender.getEndDate(),
                tender.isIncreased(),
                tender.getIncreaseAmount(), // Arttırma miktarını ekle
                tender.isActive(),
                tender.getUnitPrice(),
                tender.getTotalAmount(),
                tender.getCompanyName(),
                tender.getProduct().getId(),
                tender.getProduct().getName(),
                tender.getProduct().getMeasurementType().getName(),
                tender.getPurchasedUnit().getName(),
                tender.getPurchaseType().getName(),
                tender.getTenderType().getDescription()
        );
        return tenderResponse;
    }
    private List<TenderResponse> mapToResponseList(List<Tender> tenderList) {
        List<TenderResponse> tenderResponseList = tenderList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return tenderResponseList;
    }
    private Tender mapToEntity(TenderCreateRequest request) {
        Tender tender = new Tender();
        tender.setTenderQuantity(request.tenderQuantity());
        tender.setStartDate(request.startDate());
        tender.setEndDate(request.endDate());
        tender.setUnitPrice(request.unitPrice());
        tender.setCompanyName(request.companyName());
        return tender;
    }

}
