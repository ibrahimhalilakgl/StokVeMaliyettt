package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.MaterialExit.InsufficientStockException;
import com.inonu.stok_takip.Exception.MaterialExit.MaterialExitNotFoundException;
import com.inonu.stok_takip.Exception.Report.ReportDataNotFoundException;
import com.inonu.stok_takip.Repositoriy.MaterialExitRepository;
import com.inonu.stok_takip.Service.MaterialEntryService;
import com.inonu.stok_takip.Service.MaterialExitService;
import com.inonu.stok_takip.Service.ReportService;
import com.inonu.stok_takip.Service.TicketSalesDetailService;
import com.inonu.stok_takip.dto.Request.DateRequest;
import com.inonu.stok_takip.dto.Request.MaterialExitCreateRequest;
import com.inonu.stok_takip.dto.Response.MaterialExitDetailResponse;
import com.inonu.stok_takip.dto.Response.MaterialExitResponse;
import com.inonu.stok_takip.dto.Response.ProductDetailResponse;
import com.inonu.stok_takip.entitiy.MaterialEntry;
import com.inonu.stok_takip.entitiy.MaterialExit;
import com.inonu.stok_takip.entitiy.Product;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronization;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
@Transactional
public class MaterialExitServiceImpl implements MaterialExitService {

    private final MaterialExitRepository materialExitRepository;
    private final MaterialEntryService materialEntryService;
    private final ReportService reportService;
    private final TicketSalesDetailService ticketSalesDetailService;

    public MaterialExitServiceImpl(MaterialExitRepository materialExitRepository,
                                   MaterialEntryService materialEntryService,
                                   @Lazy ReportService reportService,
                                   @Lazy TicketSalesDetailService ticketSalesDetailService) {
        this.materialExitRepository = materialExitRepository;
        this.materialEntryService = materialEntryService;
        this.reportService = reportService;
        this.ticketSalesDetailService = ticketSalesDetailService;
    }

    @Override
    public List<MaterialExitResponse> getAllMaterialExits() {
        List<MaterialExit> materialExits = materialExitRepository.findAll();
        return mapToResponseList(materialExits);
    }

    @Override
    public List<MaterialExitResponse> exitMaterials(MaterialExitCreateRequest request){
        Map<Long, Double> productQuantities = request.productQuantities();
        List<MaterialExitResponse> responses = new ArrayList<>();

        checkProductsInStock(productQuantities);

        for (Map.Entry<Long, Double> entry : productQuantities.entrySet()) {
            MaterialExit materialExit = createExitForSingleProduct(entry.getKey(), entry.getValue(), request);
            responses.add(mapToResponse(materialExit));
        }

        // Tüm MaterialExit kayıtları kaydedildikten sonra flush yap
        // Böylece transaction commit edildiğinde veriler görünür olur
        materialExitRepository.flush();

        // Transaction commit edildikten sonra rapor güncellemesi yapılacak
        // Bu işlem transaction commit edildikten sonra çalışacak
        LocalDate exitDate = request.exitDate();
        scheduleReportUpdateAfterCommit(exitDate);

        return responses;
    }

    // Transaction commit edildikten sonra rapor güncellemesi yapmak için
    // TransactionSynchronizationManager kullanarak commit sonrası callback kaydeder
    private void scheduleReportUpdateAfterCommit(LocalDate exitDate) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    updateReportAfterExit(exitDate);
                }
            });
        } else {
            // Eğer transaction yoksa direkt çağır
            updateReportAfterExit(exitDate);
        }
    }

    // Transaction dışında çalışan, rapor güncelleme metodu
    // Bu metod exitMaterials transaction'ı commit edildikten sonra çağrılır
    private void updateReportAfterExit(LocalDate exitDate) {
        try {
            // Eğer o gün için fiş kaydı varsa, raporu mutlaka oluştur/güncelle
            // Her çıkış yapıldığında rapor güncellenmeli
            Integer ticketQuantity = ticketSalesDetailService.getTicketCountByDay(exitDate);
            Integer totalPerson = ticketSalesDetailService.getTotalPersonByDay(exitDate);
            boolean hasTicketData = (ticketQuantity != null && ticketQuantity > 0) || 
                                   (totalPerson != null && totalPerson > 0);
            
            if (hasTicketData) {
                // O gün için fiş kaydı varsa, raporu mutlaka oluştur/güncelle
                try {
                    reportService.calculateDailyReport(exitDate);
                } catch (Exception e) {
                    // Rapor oluşturma hatası malzeme çıkışını etkilemez, sadece logla
                    System.err.println("Rapor güncellenirken hata (fiş kaydı var): " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                // Fiş kaydı yoksa, sadece malzeme çıkışı varsa rapor oluştur
                try {
                    reportService.calculateDailyReport(exitDate);
                } catch (ReportDataNotFoundException e) {
                    // Veri yeterli değilse rapor oluşturulmaz, normal durum
                } catch (Exception e) {
                    System.err.println("Rapor oluşturulurken hata: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            // Rapor oluşturma hatası malzeme çıkışını etkilemez, sadece logla
            System.err.println("Rapor otomatik oluşturulurken hata: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private MaterialExit createExitForSingleProduct(Long productId, Double quantity, MaterialExitCreateRequest request) {
        List<MaterialEntry> materialEntries = materialEntryService.getMaterialEntryByProductId(productId);

        // FIFO için tarih sırasına göre sırala (en eski önce)
        materialEntries.sort(Comparator.comparing(MaterialEntry::getCreateDate));

        List<MaterialEntry> entriesUsedForExit = new ArrayList<>();
        double remainingQuantityToDeduct = quantity;
        double productCost = 0.0;
        double productQuantity = 0.0;

        for (MaterialEntry materialEntry : materialEntries) {
            if (remainingQuantityToDeduct <= 0) {
                break;
            }

            // Sadece kalan miktarı olan entry'leri kullan
            if (materialEntry.getRemainingQuantity() <= 0) {
                continue;
            }

            double deductedQuantity = Math.min(remainingQuantityToDeduct, materialEntry.getRemainingQuantity());
            remainingQuantityToDeduct -= deductedQuantity;

            productCost += deductedQuantity * materialEntry.getUnitPriceIncludingVat();
            productQuantity += deductedQuantity;

            entriesUsedForExit.add(materialEntry);
        }

        // Eğer yeterli stok yoksa exception fırlat
        if (remainingQuantityToDeduct > 0) {
            throw new InsufficientStockException("Yetersiz stok: " + productId + 
                ". Gereken: " + quantity + ", Mevcut: " + (quantity - remainingQuantityToDeduct));
        }

        double averageUnitPrice = (productQuantity > 0) ? (productCost / productQuantity) : 0.0;

        MaterialExit materialExit = buildMaterialExit(entriesUsedForExit.get(0).getProduct(), averageUnitPrice, productQuantity, productCost, request);

        MaterialExit savedExit = materialExitRepository.save(materialExit);

        updateMaterialEntriesStock(entriesUsedForExit, quantity);

        return savedExit;
    }

    private MaterialExit buildMaterialExit(Product product, Double unitPrice, Double quantity,
                                           Double totalPrice, MaterialExitCreateRequest request) {
        MaterialExit materialExit = new MaterialExit();
        materialExit.setProduct(product);
        materialExit.setUnitPrice(unitPrice);
        materialExit.setQuantity(quantity);
        materialExit.setTotalPrice(totalPrice);
        materialExit.setExitDate(request.exitDate());
        materialExit.setRecipient(request.recipient());
        materialExit.setDescription(request.description());
        return materialExit;
    }
    private void updateMaterialEntriesStock(List<MaterialEntry> entriesUsedForExit, double totalQuantity) {
        double remainingToDeduct = totalQuantity;

        for (MaterialEntry materialEntry : entriesUsedForExit) {
            if (remainingToDeduct <= 0) {
                break;
            }

            double deducted = Math.min(materialEntry.getRemainingQuantity(), remainingToDeduct);
            materialEntryService.updateRemainingQuantity(materialEntry.getId(), deducted);
            remainingToDeduct -= deducted;
        }
    }

    private void checkProductsInStock(Map<Long, Double> productQuantities) {
        for (Map.Entry<Long, Double> entry : productQuantities.entrySet()) {
            Long productId = entry.getKey();
            Double quantity = entry.getValue();

            Double stock = materialEntryService.getTotalRemainingQuantity(productId);
            if (stock == null || stock < quantity) {
                throw new InsufficientStockException("Stok yetersiz ");
            }
        }
    }


    @Override
    public MaterialExitResponse updateMaterialExit(MaterialExitCreateRequest request) {
        return null;
    }

    @Override
    public MaterialExitResponse deleteMaterialExit(Long id) {
        MaterialExit toDelete = getMaterialExitById(id);
        materialExitRepository.delete(toDelete);
        return mapToResponse(toDelete);

    }


    // bundan sonrası fiş ve rapor yapısı için eklenmiştir deneme amaçlı

    // bir günlük toplam depodan çıkan ürünlerin toplam fiyatı temizlik malzemeleri dışında olanlar tek
    @Override
    public Double getNonCleaningMaterialExitsByDate(LocalDate date) {

        Double totalAmount = materialExitRepository.findNonCleaningTotalByExitDate(date);
        if (totalAmount == null) {
            return null;
        }
        return totalAmount;
    }

    //bir haftalık depodan çıkan toplam mazlzeme tutarları
    public Double getMaterialsByWeek(LocalDate date){
        Double totalAmount = materialExitRepository.findTotalByWeek(date);
        if (totalAmount == null) {
            return null;
        }
        return totalAmount;
    }

    // bir aylık toplam depodan çıkan ürünlerin toplam fiyatı
    @Override
    public Double getMaterialsByMonthAndYear(LocalDate monthDate) {
        Double totalAmount = materialExitRepository.findTotalByMonth(monthDate);;
        if (totalAmount == null) {
            return null;
        }
        return totalAmount;
    }

    // bir yıllık toplam depodan çıkan ürünlerin toplam fiyatı
    @Override
    public Double getMaterialsByYear(LocalDate yearDate) {
        Double totalAmount = materialExitRepository.findTotalByYear(yearDate);
        if (totalAmount == null) {
            return null;
        }
        return totalAmount;
    }

    // bundan öncesi ayrı

    @Override
    public Integer numberMealsInDay(LocalDate dayDate){
        Integer totalPerson = materialExitRepository.findTotalPersonsByDay(dayDate);
        if (totalPerson == null) {
            return 0;
        }
        return totalPerson;
    }
    @Override
    public Integer numberMealsInWeek(LocalDate weekDate){
        Integer totalPerson = materialExitRepository.findTotalPersonsByWeek(weekDate);
        if (totalPerson == null) {
            return 0;
        }
        return totalPerson;
    }
    @Override
    public Integer numberMealsInMonth(LocalDate monthDate){
        Integer totalPerson = materialExitRepository.findTotalPersonsByMonth(monthDate);
        if (totalPerson == null) {
            return 0;
        }
        return totalPerson;
    }
    @Override
    public Integer numberMealsInYear(LocalDate yearDate){
        Integer totalPerson = materialExitRepository.findTotalPersonsByYear(yearDate);
        if (totalPerson == null) {
            return 0;
        }
        return totalPerson;
    }


    @Override
    public List<MaterialExitDetailResponse> getMaterialExitBetweenDates(DateRequest dateRequest){
        List<MaterialExit> materialExits = materialExitRepository.findByExitDateBetween(
                dateRequest.startDate(), dateRequest.endDate());

        List<MaterialExitDetailResponse> materialExitDetailResponses = new ArrayList<>();

        for (MaterialExit materialExit : materialExits) {
            Product product = materialExit.getProduct();

            ProductDetailResponse productDetailResponse = new ProductDetailResponse(
                    product.getName(),
                    product.getVatAmount(),
                    product.getCriticalLevel(),
                    product.getMeasurementType().getName(),
                    product.getCategory().getName()
            );

            MaterialExitDetailResponse response = new MaterialExitDetailResponse(
                    productDetailResponse,
                    materialExit.getQuantity(),
                    materialExit.getUnitPrice(),
                    materialExit.getTotalPrice(),
                    materialExit.getExitDate()
            );

            materialExitDetailResponses.add(response);
        }

        return materialExitDetailResponses;
    }


    @Override
    public Double calculateTotalAmount(DateRequest dateRequest) {
        List<MaterialExitResponse> materialExitResponses = getMaterialListBetweenDate(dateRequest);

        Double totalAmount = 0.0;
        for(MaterialExitResponse materialExitResponse : materialExitResponses){
            totalAmount += materialExitResponse.getTotalPrice();
        }
        return totalAmount;
    }

    @Override
    public List<MaterialExitResponse> getMaterialListBetweenDate(DateRequest dateRequest) {
        List<MaterialExit> materialExits = materialExitRepository.findByMaterialDateBetween(dateRequest.startDate(), dateRequest.endDate());
        return mapToResponseList(materialExits);
    }

    @Override
    public Double calculateCleanMaterialPrice(DateRequest dateRequest){
        return materialExitRepository.findTotalPriceForCleaningCategoryBetweenDates(dateRequest.startDate(), dateRequest.endDate());
    }

    // bundan öncesi tamamen rapor ve fiş yapısını denemek için yapılmıştır

    @Override
    public MaterialExit getMaterialExitById(Long id) {
        return materialExitRepository.findById(id).orElseThrow(()-> new MaterialExitNotFoundException("Material exit not found with id: " + id));
    }

    private MaterialExitResponse mapToResponse(MaterialExit materialExit) {
        MaterialExitResponse response = new MaterialExitResponse(
                materialExit.getUnitPrice(),
                materialExit.getQuantity(),
                materialExit.getDescription(),
                materialExit.getTotalPrice(),
                materialExit.getExitDate(),
                materialExit.getRecipient(),
                materialExit.getProduct().getId());
        return response;

    }
    private List<MaterialExitResponse> mapToResponseList(List<MaterialExit> materialExits) {
        List<MaterialExitResponse> responseList = materialExits.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return responseList;
    }

}
