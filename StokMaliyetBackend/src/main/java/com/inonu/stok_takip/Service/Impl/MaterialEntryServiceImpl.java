package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Enum.EntrySourceType;
import com.inonu.stok_takip.Enum.TenderType;
import com.inonu.stok_takip.Exception.MaterialEntry.MaterialEntryNotFoundException;
import com.inonu.stok_takip.Repositoriy.MaterialEntryRepository;
import com.inonu.stok_takip.Repositoriy.ProductRepository;
import com.inonu.stok_takip.Service.*;
import com.inonu.stok_takip.dto.Request.MaterialEntryCreateRequest;
import com.inonu.stok_takip.dto.Request.MaterialEntryUpdateRequest;
import com.inonu.stok_takip.dto.Response.*;
import com.inonu.stok_takip.entitiy.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaterialEntryServiceImpl implements MaterialEntryService {

    private final MaterialEntryRepository materialEntryRepository;
    private final ProductRepository productRepository;
    private final PurchaseTypeService purchaseTypeService;
    private final ProductService productService;
    private final PurchasedUnitService purchasedUnitService;
    private final BudgetService budgetService;
    private final TenderService tenderService;
    private final DirectProcurementService directProcurementService;


    public MaterialEntryServiceImpl(MaterialEntryRepository materialEntryRepository,
                                    ProductRepository productRepository,
                                    PurchaseTypeService purchaseTypeService,
                                    ProductService productService,
                                    PurchasedUnitService purchasedUnitService,
                                    BudgetService budgetService,
                                    TenderService tenderService,
                                    @Lazy DirectProcurementService directProcurementService) {
        this.materialEntryRepository = materialEntryRepository;
        this.productRepository = productRepository;
        this.purchaseTypeService = purchaseTypeService;
        this.productService = productService;
        this.purchasedUnitService = purchasedUnitService;
        this.budgetService = budgetService;
        this.tenderService = tenderService;
        this.directProcurementService = directProcurementService;
    }

    @Override
    public List<MaterialEntryResponse> getAllMaterialEntryList() {
        List<MaterialEntry> materialEntryList = materialEntryRepository.findNonZeroRemainingQuantityEntries();
        return mapToResponseList(materialEntryList);
    }

    @Override
    public MaterialEntryResponse createMaterialEntry(MaterialEntryCreateRequest request) {

        Product product = productService.getProductById(request.productId());
        PurchasedUnit purchasedUnit = purchasedUnitService.getPurchasedUnitById(request.purchaseUnitId());
        PurchaseType purchaseType = purchaseTypeService.getPurchaseTypeById(request.purchaseTypeId());
        Budget budget = budgetService.getBudgetById(request.budgetId());

        Double totalPrice = request.unitPrice() * request.quantity(); // ürünün toplam fiyatı kdv dahil değil
        Double totalVat = totalPrice * product.getVatAmount(); // toplam fiyat üzerinden toplam kdv tutarı
        Double totalPriceIncludingVat = totalPrice + totalVat; // kdv eklenmiş hali ile toplam tutar
        Double unitPriceIncludingVat = totalPriceIncludingVat / request.quantity();

        MaterialEntry materialEntry = mapToEntity(request);

        if (request.tenderId() != null) { // ihale için tender id değeri seçilen tenderden gelecek şekilde burada kontrol ediliyor
            Tender tender = tenderService.getTenderById(request.tenderId());
            materialEntry.setTender(tender);
        } else if (request.directProcurementId() != null){
            DirectProcurement directProcurement = directProcurementService.getDirectProcurementById(request.directProcurementId());
            materialEntry.setDirectProcurement(directProcurement);
             // doğrudan alımda tender yoksa NULL atanır
        }else {
            materialEntry.setTender(null);
            materialEntry.setDirectProcurement(null);
        }

        materialEntry.setTotalPrice(totalPrice);
        materialEntry.setUnitPriceIncludingVat(unitPriceIncludingVat);
        materialEntry.setRemainingQuantity(request.quantity());
        materialEntry.setTotalPriceIncludingVat(totalPriceIncludingVat);
        materialEntry.setEntrySourceType(request.entrySourceType());
        materialEntry.setProduct(product);
        materialEntry.setPurchaseType(purchaseType);
        materialEntry.setPurchasedUnit(purchasedUnit);
        // TenderType null kontrolü - DEPO rolü için varsayılan değer ata
        if (request.tenderType() != null) {
            materialEntry.setTenderType(request.tenderType());
        } else {
            // Varsayılan olarak DIRECT_PROCUREMENT ata (DEPO için uygun)
            materialEntry.setTenderType(TenderType.DIRECT_PROCUREMENT);
        }

        budgetService.updateBudgetValue(budget.getId(),totalPriceIncludingVat);

        materialEntry.setBudget(budget);

        MaterialEntry toSave = materialEntryRepository.save(materialEntry);
        return mapToResponse(toSave);
    }

    @Override
    public MaterialEntryResponse updateMaterialEntry(MaterialEntryUpdateRequest request) {
        MaterialEntry materialEntry = getMaterialEntryById(request.id());

        materialEntry.setQuantity(request.quantity());
        materialEntry.setRemainingQuantity(request.quantity());

        MaterialEntry saved = materialEntryRepository.save(materialEntry);
        return mapToResponse(saved);
    }

    @Override
    public Double getTotalRemainingQuantity(Long productId) {
        return materialEntryRepository.sumRemainingQuantityByProductId(productId);
    }

    // bu metot dashboardda bulunan verielri gönderiyor
    @Override
    public List<GroupMaterialEntryResponse> getGroupedMaterialEntries() {
        List<MaterialEntry> entries = materialEntryRepository.findAllExcludingEntrySourceType(EntrySourceType.DEVIR);

        Map<String, Map<Long, List<MaterialEntry>>> grouped = entries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getTenderType().getDescription(),
                        Collectors.groupingBy(e -> e.getProduct().getId())
                ));

        List<GroupMaterialEntryResponse> result = new ArrayList<>();

        for (Map.Entry<String, Map<Long, List<MaterialEntry>>> TenderTypeEntry : grouped.entrySet()) {
            String tenderTypeName = TenderTypeEntry.getKey();
            List<MaterialEntryProductResponse> products = new ArrayList<>();
            double totalFormAmount = 0;

            for (List<MaterialEntry> productEntries : TenderTypeEntry.getValue().values()) {
                MaterialEntry sample = productEntries.get(0);
                double totalQuantity = productEntries.stream().mapToDouble(MaterialEntry::getQuantity).sum();
                double totalPrice = productEntries.stream().mapToDouble(MaterialEntry::getTotalPrice).sum();
                double averagePrice = totalQuantity != 0 ? totalPrice / totalQuantity : 0;
                LocalDate lastDate = null;

                for (int i = 0; i < productEntries.size(); i++) {
                    LocalDate a = productEntries.get(i).getEntryDate();
                    if(a==null){
                        continue;
                    }
                    if(lastDate==null){
                        lastDate=a;
                    }else if(a.isAfter(lastDate)){
                        lastDate=a;
                    }
                }

                MaterialEntryProductDetailResponse detail = new MaterialEntryProductDetailResponse(
                        sample.getProduct().getCriticalLevel(),
                        lastDate,
                        sample.getProduct().getVatAmount(),
                        productEntries.size(),
                        totalPrice
                );

                MaterialEntryProductResponse productDTO = new MaterialEntryProductResponse(
                        sample.getProduct().getName(),
                        sample.getProduct().getCategory().getName(),
                        sample.getProduct().getMeasurementType().getName(),
                        averagePrice,
                        totalQuantity,
                        detail
                );

                products.add(productDTO);
                totalFormAmount += totalPrice;
            }

            GroupMaterialEntryResponse dto = new GroupMaterialEntryResponse(
                    tenderTypeName,
                    totalFormAmount,
                    products
            );

            result.add(dto);
        }

        return result;
    }


    // bu metot yıl içinde depoya giren tüm malzemeler ve nasıl girdikleri ile ilgili bilgileir döndürür
    @Override
    public List<MaterialEntryDetailResponse> getMaterialEntryDetails() {
        List<MaterialEntry> allEntries = materialEntryRepository.findNonZeroRemainingQuantityEntries();

        Map<Long, List<MaterialEntry>> entriesGroupedByProductId = allEntries.stream()
                .collect(Collectors.groupingBy(entry -> entry.getProduct().getId()));

        List<MaterialEntryDetailResponse> responseList = new ArrayList<>();

        for (Map.Entry<Long, List<MaterialEntry>> entry : entriesGroupedByProductId.entrySet()) {
            List<MaterialEntry> productEntries = entry.getValue();

            double totalCarryOver = productEntries.stream()
                    .filter(e -> e.getEntrySourceType() == EntrySourceType.DEVIR)
                    .mapToDouble(MaterialEntry::getQuantity)
                    .sum();

            double totalTender = productEntries.stream()
                    .filter(e -> e.getEntrySourceType() == EntrySourceType.IHALE)
                    .mapToDouble(MaterialEntry::getQuantity)
                    .sum();

            double totalDirectProcurement = productEntries.stream()
                    .filter(e -> e.getEntrySourceType() == EntrySourceType.DOGRUDAN_TEMIN)
                    .mapToDouble(MaterialEntry::getQuantity)
                    .sum();


            // Çıkış miktarını hesapla
            double totalExit = productEntries.stream()
                    .mapToDouble(e ->e.getQuantity() - e.getRemainingQuantity())
                    .sum();


            // Kalan miktarı hesapla
            double remainingQuantity = productEntries.stream()
                    .mapToDouble(e -> e.getRemainingQuantity())
                    .sum();


            ProductDetailResponse productDetailResponse =
                     new ProductDetailResponse(
                             productEntries.get(0).getProduct().getName(),
                             productEntries.get(0).getProduct().getVatAmount(),
                             productEntries.get(0).getProduct().getCriticalLevel(),
                             productEntries.get(0).getProduct().getMeasurementType().getName(),
                             productEntries.get(0).getProduct().getCategory().getName()
                     );

            // DTO'ya ekle
            MaterialEntryDetailResponse response = new MaterialEntryDetailResponse(
                    productDetailResponse,
                    totalCarryOver,
                    totalTender,
                    totalDirectProcurement,
                    totalExit,
                    remainingQuantity
            );

            responseList.add(response);
        }

        return responseList;
    }

    // burada yıl içinde hangi bütçeden ne kadar harcanmş gruplayan kod yapısı
    @Override
    public List<MaterialEntrySpendResponse> getTotalSpentGroupedByBudget() {
        List<MaterialEntry> entries = materialEntryRepository.findAll();

        int currentYear = LocalDate.now().getYear();

        Map<String, Double> spendingMap = entries.stream()
                .filter(me -> me.getEntrySourceType() != null && !me.getEntrySourceType().equals(EntrySourceType.DEVIR))
                .filter(me -> me.getEntryDate() != null && me.getEntryDate().getYear() == currentYear)
                .filter(me -> me.getBudget() != null && me.getBudget().getBudgetName() != null)
                .collect(Collectors.groupingBy(
                        me -> me.getBudget().getBudgetName(),
                        Collectors.summingDouble(me -> me.getTotalPrice() != null ? me.getTotalPrice() : 0.0)
                ));

        return spendingMap.entrySet().stream()
                .map(entry -> new MaterialEntrySpendResponse(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }



    @Override
    public MaterialEntry getMaterialEntryById(Long id) {
        return materialEntryRepository.findById(id).orElseThrow(()-> new MaterialEntryNotFoundException("Material Entry Not Found"));
    }

    @Override
    public MaterialEntryResponse deleteMaterialEntry(Long id) {

        MaterialEntry materialEntry = getMaterialEntryById(id);
        materialEntryRepository.delete(materialEntry);
        return mapToResponse(materialEntry);

    }

    private void deleteMaterial(MaterialEntry materialEntry) {
        materialEntryRepository.delete(materialEntry);
    }

    // bu metot bir üründen stokta toplamda ne kadar var kaç kalem var onu getiriyor
    @Override
    public List<MaterialEntry> getMaterialEntryByProductId(Long productId) {
        List<MaterialEntry> materialEntries = materialEntryRepository.findByProductIdOrderByEntryDateAsc(productId);
        return materialEntries;
    }

    @Override
    public List<MaterialEntryProductsForMaterialExitResponse> getMaterialEntriesForExit() {
        return materialEntryRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        me -> me.getProduct(),
                        Collectors.summingDouble(me -> me.getRemainingQuantity())
                ))
                .entrySet().stream()
                .map(entry -> new MaterialEntryProductsForMaterialExitResponse(
                        entry.getKey().getId(),
                        entry.getKey().getName(),
                        entry.getKey().getCategory().getName(),
                        entry.getKey().getMeasurementType().getName(),
                        entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    // depodan ürün çıkışı olduktan sonra depodaki kalan ürün miktarını günceller
    @Override
    public Double updateRemainingQuantity(Long materialEntryId, Double exitQuantity) {
        MaterialEntry materialEntry = getMaterialEntryById(materialEntryId);
        Double remainingQuantity = materialEntry.getRemainingQuantity();
        Double newValue = remainingQuantity - exitQuantity;
        materialEntry.setRemainingQuantity(newValue);
        materialEntryRepository.save(materialEntry);
        return newValue;
    }

    // devir işlemerini yapan metot  31 aralık ta saat 23.59 da tüm kalan ürünler devir ediyor
    @Override
    @Scheduled(cron = "0 59 23 31 12 ?") // Her yıl 31 Aralık 23:59'da çalışır
    public List<MaterialEntryResponse> carryOverEntriesToNextYear() {

        int currentYear = LocalDate.now().getYear();
        LocalDate startDate = LocalDate.of(currentYear, 1, 1);
        LocalDate endDate = LocalDate.of(currentYear, 12, 31);

        List<MaterialEntry> entriesToCarryOver = materialEntryRepository.findEntriesWithinPeriod(startDate, endDate);

        List<MaterialEntry> materialEntryList = new ArrayList<>();
        LocalDate nextYearFirstDay = LocalDate.of(currentYear + 1, 1, 1);

        for (MaterialEntry oldEntry : entriesToCarryOver) {
            if (oldEntry.getRemainingQuantity() > 0) { // Sadece kalan miktarı olanları devret
                MaterialEntry newEntry = new MaterialEntry();

                Double totalPrice = oldEntry.getUnitPrice() * oldEntry.getRemainingQuantity();

                newEntry.setProduct(oldEntry.getProduct());
                newEntry.setQuantity(oldEntry.getRemainingQuantity());
                newEntry.setRemainingQuantity(oldEntry.getRemainingQuantity());
                newEntry.setExpiryDate(oldEntry.getExpiryDate());
                newEntry.setEntryDate(nextYearFirstDay);
                newEntry.setBudget(oldEntry.getBudget());
                newEntry.setCompanyName(oldEntry.getCompanyName());
                newEntry.setEntrySourceType(EntrySourceType.DEVIR);
                newEntry.setTotalPriceIncludingVat(oldEntry.getTotalPriceIncludingVat());
                newEntry.setDescription(oldEntry.getDescription());
                newEntry.setPurchaseType(oldEntry.getPurchaseType());
                newEntry.setPurchasedUnit(oldEntry.getPurchasedUnit());
                newEntry.setTender(oldEntry.getTender());
                newEntry.setTenderType(oldEntry.getTenderType());

                newEntry.setUnitPrice(oldEntry.getUnitPrice());
                newEntry.setUnitPriceIncludingVat(oldEntry.getUnitPriceIncludingVat());
                newEntry.setTotalPrice(totalPrice);
                materialEntryList.add(newEntry);
                oldEntry.setRemainingQuantity(0.0);


                materialEntryRepository.save(newEntry);
                materialEntryRepository.save(oldEntry);
            }
        }
        return mapToResponseList(materialEntryList);
    }

    private MaterialEntry mapToEntity(MaterialEntryCreateRequest request) {
        MaterialEntry materialEntry = new MaterialEntry();
        materialEntry.setQuantity(request.quantity());
        materialEntry.setUnitPrice(request.unitPrice());
        materialEntry.setDescription(request.description());
        materialEntry.setCompanyName(request.companyName());
        materialEntry.setExpiryDate(request.expiryDate());
        materialEntry.setEntryDate(request.entryDate());
        return materialEntry;
    }

    private MaterialEntryResponse mapToResponse(MaterialEntry materialEntry) {
        // ProductDetailResponse nesnesini oluştur
        ProductDetailResponse productResponse = new ProductDetailResponse(
                materialEntry.getProduct().getName(),
                materialEntry.getProduct().getVatAmount(),
                materialEntry.getProduct().getCriticalLevel(),
                materialEntry.getProduct().getMeasurementType().getName(),
                materialEntry.getProduct().getCategory().getName()
        );

        // MaterialEntryResponse nesnesini oluştur
        MaterialEntryResponse materialEntryResponse = new MaterialEntryResponse(
                materialEntry.getQuantity(),
                materialEntry.getUnitPrice(),
                materialEntry.getEntryDate(),
                materialEntry.getExpiryDate(),
                materialEntry.getCompanyName(),
                materialEntry.getDescription(),
                materialEntry.getTotalPrice(),
                materialEntry.getTotalPriceIncludingVat(),
                productResponse,
                materialEntry.getPurchaseType().getName(),
                materialEntry.getPurchasedUnit().getName(),
                materialEntry.getEntrySourceType(),
                materialEntry.getTenderType().getDescription()
        );

        return materialEntryResponse;
    }

    private List<MaterialEntryResponse> mapToResponseList(List<MaterialEntry> materialEntryList) {
        List<MaterialEntryResponse> materialEntryResponseList = materialEntryList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return materialEntryResponseList;
    }

    @Override
    public List<Object> getAllProductDetail() {
        try {
            // Önce tüm ürünleri çek
            List<Product> allProducts = productRepository.findAll();
            
            // Tüm malzeme girişlerini çek
            List<MaterialEntry> allEntries = materialEntryRepository.findAll();
            
            // Product bazında grupla ve stok hesapla
            Map<Long, Map<String, Object>> productStockMap = new HashMap<>();
            
            // Önce tüm ürünleri map'e ekle (stok 0 ile)
            for (Product product : allProducts) {
                Map<String, Object> productInfo = new HashMap<>();
                productInfo.put("productId", product.getId());
                productInfo.put("productName", product.getName());
                productInfo.put("criticalLevel", product.getCriticalLevel());
                productInfo.put("measurementUnitName", product.getMeasurementType() != null ? 
                    product.getMeasurementType().getName() : "Adet");
                productInfo.put("productCategoryName", product.getCategory() != null ? 
                    product.getCategory().getName() : "Bilinmiyor");
                productInfo.put("totalStockQuantity", 0.0);
                productInfo.put("totalValue", 0.0);
                productInfo.put("averageUnitPrice", 0.0);
                productStockMap.put(product.getId(), productInfo);
            }
            
            // Sonra malzeme girişlerini işle
            for (MaterialEntry entry : allEntries) {
                if (entry.getProduct() != null) {
                    Long productId = entry.getProduct().getId();
                    
                    if (productStockMap.containsKey(productId)) {
                        Map<String, Object> productInfo = productStockMap.get(productId);
                        Double currentStock = (Double) productInfo.get("totalStockQuantity");
                        Double currentValue = (Double) productInfo.get("totalValue");
                        
                        productInfo.put("totalStockQuantity", currentStock + (entry.getRemainingQuantity() != null ? entry.getRemainingQuantity() : 0));
                        productInfo.put("totalValue", currentValue + (entry.getTotalPrice() != null ? entry.getTotalPrice() : 0));
                        
                        // Ortalama birim fiyat hesapla
                        Double totalStock = (Double) productInfo.get("totalStockQuantity");
                        Double totalValue = (Double) productInfo.get("totalValue");
                        if (totalStock > 0) {
                            productInfo.put("averageUnitPrice", totalValue / totalStock);
                        }
                    }
                }
            }
            
            return new ArrayList<>(productStockMap.values());
            
        } catch (Exception e) {
            System.err.println("getAllProductDetail hatası: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Object> getBudgetsGroup() {
        // HomePage için bütçe gruplarını döndür - sadece database'den
        List<Object> result = new ArrayList<>();
        
        // TODO: Gerçek implementasyon - database'den veri çekilecek
        // Şimdilik boş liste döndürüyoruz
        return result;
    }


}
