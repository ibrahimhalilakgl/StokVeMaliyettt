package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Enum.TenderType;
import com.inonu.stok_takip.Exception.DirectProcurement.DirectProcurementAlreadyIncreasedException;
import com.inonu.stok_takip.Exception.DirectProcurement.DirectProcurementNotFoundException;
import com.inonu.stok_takip.Repositoriy.DirectProcurementRepository;
import com.inonu.stok_takip.Service.*;
import com.inonu.stok_takip.dto.Request.DirectProcurementCreateRequest;
import com.inonu.stok_takip.dto.Response.DirectProcurementResponse;
import com.inonu.stok_takip.entitiy.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class DirectProcurementServiceImpl implements DirectProcurementService {

    private final DirectProcurementRepository directProcurementRepository;
    private final PurchasedUnitService purchasedUnitService;
    private final ProductService productService;

    public DirectProcurementServiceImpl(DirectProcurementRepository directProcurementRepository,
                                        PurchasedUnitService purchasedUnitService,
                                        ProductService productService) {
        this.directProcurementRepository = directProcurementRepository;
        this.purchasedUnitService = purchasedUnitService;
        this.productService = productService;
    }


    @Override
    @Transactional
    public DirectProcurementResponse createDirectProcurement(DirectProcurementCreateRequest request) {

        PurchasedUnit purchasedUnit = purchasedUnitService.getPurchasedUnitById(request.purchaseUnitId());
        Product product = productService.getProductById(request.productId());

        DirectProcurement directProcurement = mapToEntity(request);
        Double totalAmount = directProcurement.getUnitPrice() * directProcurement.getQuantity();
        directProcurement.setTotalAmount(totalAmount);
        directProcurement.setPurchasedUnit(purchasedUnit);
        directProcurement.setProduct(product);
        directProcurement.setPurchaseType(null); // Alım türü haftalık talep formunda belirlenecek
        directProcurement.setRemainingQuantity(request.quantity());
        directProcurement.setTenderType(TenderType.DIRECT_PROCUREMENT);

        DirectProcurement saved = directProcurementRepository.save(directProcurement);

        // Doğrudan temin oluşturulduğunda otomatik malzeme girişi yapılmaz
        // Ürün haftalık talep formunda onaylandıktan sonra stoğa eklenecek (ihale gibi)

        return mapToResponse(saved);
    }

    @Override
    public List<DirectProcurementResponse> getAllDirectProcurements() {
        List<DirectProcurement> directProcurements = directProcurementRepository.findAll();
        return mapToResponseList(directProcurements);
    }


    //doğrudan temin arttırımı
    @Transactional
    @Override
    public DirectProcurementResponse increaseDirectProcurementByTwentyPercent(Long directProcurementId, Double increasedQuantity) {
        DirectProcurement directProcurement = getDirectProcurementById(directProcurementId);


        if (directProcurement.isIncreased()) {
            throw new DirectProcurementAlreadyIncreasedException("Bu Kayıt  zaten artırıldı!");
        }

        // Yüzde 20 artırımı
        Double quantity = (increasedQuantity/100) +1 ;
        Double increased = increasedQuantity/100;

        directProcurement.setTotalAmount(directProcurement.getTotalAmount() * quantity);
        if (directProcurement.getQuantity() != null) {
            Double newValue = directProcurement.getQuantity() * increased;
            directProcurement.setQuantity(directProcurement.getQuantity() * quantity);
            directProcurement.setRemainingQuantity(directProcurement.getRemainingQuantity() + newValue);
        }

        directProcurement.setIncreased(true);
        DirectProcurement updatedDirectProcurement = directProcurementRepository.save(directProcurement);
        return mapToResponse(updatedDirectProcurement);
    }

    @Override
    public List<DirectProcurementResponse> getAllActiveDirectProcurements(){
        List<DirectProcurement> directProcurements = directProcurementRepository.findDirectProcurementByActiveTrue();
        return mapToResponseList(directProcurements);
    }

    //yıl bittiği için veya doğrudan temin  süresi dolmuş bütün doğrudan teminleri silen kod yapısı bu kod her saate bir tetikleniyor
    @Override
    @Scheduled(cron = "0 0 * * * ?")
    public void handleDirectProcurementsAtYearEnd() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        // 31 Aralık kontrolü
        boolean isYearEnd = today.getMonthValue() == 12 && today.getDayOfMonth() == 31;

        List<DirectProcurement> directProcurements = directProcurementRepository.findAll();

        for (DirectProcurement directProcurement : directProcurements) {
            // endDate null kontrolü
            boolean isExpired = false;
            if (directProcurement.getEndDate() != null) {
                isExpired = directProcurement.getEndDate().isBefore(today);
            }

            // Eğer ihale süresi dolmuşsa veya yılın son günündeysek
            if ((isExpired || isYearEnd) && directProcurement.isActive()) {
                directProcurement.setActive(false);
                directProcurementRepository.save(directProcurement);
            }
        }
    }


    @Override
    public DirectProcurement getDirectProcurementById(Long id) {

        return directProcurementRepository.findById(id)
                .orElseThrow(()-> new DirectProcurementNotFoundException("direct procurement not found by ıd: "+id));
    }

    @Override
    public DirectProcurementResponse updateRemainingQuantity(Long directProcurementId, Double quantity) {
        DirectProcurement directProcurement = getDirectProcurementById(directProcurementId);
        directProcurement.setRemainingQuantity(directProcurement.getRemainingQuantity()- quantity);
        DirectProcurement saved = directProcurementRepository.save(directProcurement);

        return mapToResponse(saved);
    }

    @Override
    public List<DirectProcurementResponse> getDirectProcurementsByProductAndCompany() {
        List<DirectProcurement> directProcurements = directProcurementRepository.findByRemainingQuantityGreaterThan(0.0);
        return mapToResponseList(directProcurements);
    }

    @Override
    @Transactional
    public DirectProcurementResponse updateDirectProcurement(Long id, DirectProcurementCreateRequest request) {
        DirectProcurement directProcurement = getDirectProcurementById(id);
        directProcurement.setQuantity(request.quantity());
        directProcurement.setStartDate(request.startDate());
        directProcurement.setEndDate(request.endDate());
        directProcurement.setCompanyName(request.companyName());
        directProcurement.setUnitPrice(request.unitPrice());
        // recalc totals and remaining respecting already consumed
        Double oldQuantity = directProcurement.getQuantity();
        Double oldRemaining = directProcurement.getRemainingQuantity();
        if (oldQuantity != null && oldRemaining != null && request.quantity() != null) {
            double consumed = oldQuantity - oldRemaining;
            double newRemaining = Math.max(0.0, request.quantity() - consumed);
            directProcurement.setRemainingQuantity(newRemaining);
        }
        directProcurement.setTotalAmount(directProcurement.getUnitPrice() * directProcurement.getQuantity());
        DirectProcurement saved = directProcurementRepository.save(directProcurement);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DirectProcurementResponse deleteDirectProcurement(Long id) {
        DirectProcurement directProcurement = getDirectProcurementById(id);
        directProcurementRepository.delete(directProcurement);
        return mapToResponse(directProcurement);
    }

    private DirectProcurementResponse mapToResponse(DirectProcurement directProcurement) {
        DirectProcurementResponse directProcurementResponse = new DirectProcurementResponse(
                directProcurement.getId(),
                directProcurement.getQuantity(),
                directProcurement.getRemainingQuantity(),
                directProcurement.getStartDate(),
                directProcurement.getEndDate(),
                directProcurement.isActive(),
                directProcurement.getUnitPrice(),
                directProcurement.isIncreased(),
                directProcurement.getTotalAmount(),
                directProcurement.getCompanyName(),
                directProcurement.getProduct().getId(),
                directProcurement.getProduct().getName(),
                directProcurement.getProduct().getMeasurementType().getName(),
                directProcurement.getPurchasedUnit().getName(),
                directProcurement.getPurchaseType() != null ? directProcurement.getPurchaseType().getName() : null,
                directProcurement.getTenderType().getDescription()
        );
        return directProcurementResponse;
    }
    private List<DirectProcurementResponse> mapToResponseList(List<DirectProcurement> directProcurementList) {
        List<DirectProcurementResponse> directProcurementResponseList = directProcurementList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return directProcurementResponseList;
    }
    private DirectProcurement mapToEntity(DirectProcurementCreateRequest request){
        DirectProcurement directProcurement = new DirectProcurement();
        directProcurement.setQuantity(request.quantity());
        directProcurement.setStartDate(request.startDate());
        directProcurement.setEndDate(request.endDate());
        directProcurement.setCompanyName(request.companyName());
        directProcurement.setUnitPrice(request.unitPrice());
        return directProcurement;
    }




}
