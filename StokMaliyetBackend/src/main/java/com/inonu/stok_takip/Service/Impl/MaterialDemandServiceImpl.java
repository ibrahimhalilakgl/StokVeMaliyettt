package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Enum.DemandStatus;
import com.inonu.stok_takip.Enum.EntrySourceType;
import com.inonu.stok_takip.Enum.TenderType;
import com.inonu.stok_takip.Exception.MaterialDemand.DemandAlreadyApprovedException;
import com.inonu.stok_takip.Exception.MaterialDemand.InsufficientProductException;
import com.inonu.stok_takip.Exception.MaterialDemand.InvalidMaterialDemandOperationException;
import com.inonu.stok_takip.Exception.MaterialDemand.MaterialDemandNotFoundException;
import com.inonu.stok_takip.Exception.MaterialEntry.ProductOutOfStockException;
import com.inonu.stok_takip.Exception.MaterialEntry.StockNotAvailableException;
import com.inonu.stok_takip.Repositoriy.MaterialDemandRepository;
import com.inonu.stok_takip.Service.*;
import com.inonu.stok_takip.dto.Request.MaterialDemandApprovedRequest;
import com.inonu.stok_takip.dto.Request.MaterialDemandCreateRequest;
import com.inonu.stok_takip.dto.Request.MaterialDemandUpdateRequest;
import com.inonu.stok_takip.dto.Request.MaterialEntryCreateRequest;
import com.inonu.stok_takip.dto.Response.MaterialDemandResponse;
import com.inonu.stok_takip.entitiy.DirectProcurement;
import com.inonu.stok_takip.entitiy.MaterialDemand;
import com.inonu.stok_takip.entitiy.Product;
import com.inonu.stok_takip.entitiy.Tender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialDemandServiceImpl implements MaterialDemandService {

    private final MaterialDemandRepository materialDemandRepository;
    private final MaterialEntryService materialEntryService;
    private final TenderService tenderService;
    private final DirectProcurementService directProcurementService;

    public MaterialDemandServiceImpl(MaterialDemandRepository materialDemandRepository,
                                     MaterialEntryService materialEntryService,
                                     TenderService tenderService, DirectProcurementService directProcurementService) {
        this.materialDemandRepository = materialDemandRepository;
        this.materialEntryService = materialEntryService;
        this.tenderService = tenderService;
        this.directProcurementService = directProcurementService;
    }

    // bundan sonrası onaylama yapısı için eklendi

    @Override
    public void checkStockAvailabilityByProductInTender(Long productId, Double requestedQuantity) {
        Tender tender = getByProductIdOrderedByEntryDate(productId);

        if (tender == null) {
            throw new ProductOutOfStockException("Ürün stokta bulunamadı");
        }

        if (tender.getRemainingQuantityInTender() < requestedQuantity) {
            throw new StockNotAvailableException("Talep edilen miktar için Stok yetersiz");
        }
    }

    public Tender getByProductIdOrderedByEntryDate(Long productId) {
        return materialDemandRepository.findByProductIdOrderedByEntryDate(productId);

    }

    // bundan sonrası eski yapıdaki yapı
    @Override
    public MaterialDemandResponse createMaterialDemandForTender(MaterialDemandCreateRequest request) {

        Tender tender = tenderService.getTenderById(request.tenderId());

        Product product = tender.getProduct();

        MaterialDemand materialDemand = mapToEntity(request);
        materialDemand.setProduct(product);
        materialDemand.setCompanyName(tender.getCompanyName());
        materialDemand.setTenderType(TenderType.OPEN_TENDER);
        materialDemand.setTender(tender);
        materialDemand.setStatus(DemandStatus.PENDING);

        MaterialDemand savedDemand = materialDemandRepository.save(materialDemand);
        return mapToResponse(savedDemand);
    }

    @Override
    public MaterialDemandResponse createMaterialDemandForDirectProcurement(MaterialDemandCreateRequest request) {

        DirectProcurement directProcurement = directProcurementService.getDirectProcurementById(request.directProcurementId());

        Product product = directProcurement.getProduct();
        MaterialDemand materialDemand = mapToEntity(request);
        materialDemand.setProduct(product);
        materialDemand.setCompanyName(directProcurement.getCompanyName());
        materialDemand.setDirectProcurement(directProcurement);
        materialDemand.setTenderType(TenderType.DIRECT_PROCUREMENT);
        materialDemand.setStatus(DemandStatus.PENDING);

        MaterialDemand savedDemand = materialDemandRepository.save(materialDemand);
        return mapToResponse(savedDemand);

    }

    // talebin kabul edilmesi ve stoğa eklenmesi
    @Override
    @Transactional
    public MaterialDemandResponse approveAndProcessMaterialDemand(MaterialDemandApprovedRequest request) {

        MaterialDemand demand = materialDemandRepository.findById(request.materialDemandId())
                .orElseThrow(() -> new MaterialDemandNotFoundException("Talep bulunamadı"));

        if (demand.getStatus() != DemandStatus.PENDING) {
            throw new DemandAlreadyApprovedException("Talep " + demand.getStatus() + " edildiğinden dolayı işlem gerçekleştirilemedi.");
        }

        // Talebi onayla ve stoğa ürünün ekle
        // Onaylama sırasında miktar değiştirilebilir, yoksa talep edilen miktar kullanılır
        Double approvedQuantity = (request.quantity() != null && request.quantity() > 0) 
                ? request.quantity() 
                : demand.getQuantity();

        if(demand.getTender() != null){

            if(approvedQuantity > demand.getTender().getRemainingQuantityInTender()){
                throw new InsufficientProductException("İhalede veya doğrudan teminde yeterli ürün yok");
            }

            MaterialEntryCreateRequest materialEntryCreateRequest = new MaterialEntryCreateRequest(
                approvedQuantity, demand.getTender().getUnitPrice(),request.entryDate(),request.expiryDate(),
                demand.getCompanyName(), request.description(), demand.getTender().getProduct().getId(),
                request.budgetId(), EntrySourceType.IHALE,demand.getTender().getPurchasedUnit().getId(),
                demand.getTender().getPurchaseType().getId(),demand.getTender().getId(),null,
                demand.getTenderType());



            tenderService.updateTenderRemainingQuantity(demand.getTender().getId(), approvedQuantity);
            demand.setStatus(DemandStatus.APPROVED);
            demand.setApprovedQuantity(approvedQuantity); // Onaylanan miktarı kaydet
            materialEntryService.createMaterialEntry(materialEntryCreateRequest);

        }
        else{

            if(approvedQuantity > demand.getDirectProcurement().getRemainingQuantity()){
                throw new InsufficientProductException("İhalede veya doğrudan teminde yeterli ürün yok");
            }

            MaterialEntryCreateRequest materialEntryCreateRequest = new MaterialEntryCreateRequest(
                    approvedQuantity, demand.getDirectProcurement().getUnitPrice(),request.entryDate(),request.expiryDate(),
                    demand.getCompanyName(), request.description(), demand.getDirectProcurement().getProduct().getId(),
                    request.budgetId(), EntrySourceType.DOGRUDAN_TEMIN,demand.getDirectProcurement().getPurchasedUnit().getId(),
                    request.purchaseTypeId(),null,demand.getDirectProcurement().getId(),
                    demand.getTenderType());


            directProcurementService.updateRemainingQuantity(demand.getDirectProcurement().getId(), approvedQuantity);
            demand.setStatus(DemandStatus.APPROVED);
            demand.setApprovedQuantity(approvedQuantity); // Onaylanan miktarı kaydet
            materialEntryService.createMaterialEntry(materialEntryCreateRequest);
        }



        MaterialDemand savedDemand =  materialDemandRepository.save(demand);

        return mapToResponse(savedDemand);
    }

    @Override
    @Transactional
    public MaterialDemandResponse rejectMaterialDemand(Long id, String rejectionReason) {
        MaterialDemand demand = materialDemandRepository.findById(id)
                .orElseThrow(() -> new MaterialDemandNotFoundException("Talep bulunamadı"));

        if (demand.getStatus() == DemandStatus.APPROVED) {
            throw new DemandAlreadyApprovedException("Onaylanmış talep reddedilemez.");
        }

        demand.setStatus(DemandStatus.REJECTED);
        demand.setRejectionReason(rejectionReason);
        MaterialDemand savedMaterialDemand = materialDemandRepository.save(demand);

        return mapToResponse(savedMaterialDemand);
    }

    @Override
    public MaterialDemand getMaterialDemandById(Long id) {
        return materialDemandRepository.findById(id).orElseThrow(()->new MaterialDemandNotFoundException("Material demand not found"));
    }

    @Override
    public List<MaterialDemandResponse> getAllMaterialDemand() {
        List<MaterialDemand> materialDemandList = materialDemandRepository.findAll();
        return mapToResponseList(materialDemandList);
    }

    @Override
    public MaterialDemandResponse updateMaterialDemand(MaterialDemandUpdateRequest request) {
        MaterialDemand materialDemand = getMaterialDemandById(request.id());

        if (materialDemand.getStatus() == DemandStatus.APPROVED) {
            throw new InvalidMaterialDemandOperationException("Onaylanmış bir talep güncellenemez.");
        }

        if (materialDemand.getStatus() == DemandStatus.REJECTED) {
            throw new InvalidMaterialDemandOperationException("Reddedilmiş bir talep güncellenemez.");
        }

        checkStockAvailabilityByProductInTender(materialDemand.getProduct().getId(), request.quantity());

        materialDemand.setQuantity(request.quantity());
        materialDemand.setUserName(request.userName());

        MaterialDemand updatedDemand = materialDemandRepository.save(materialDemand);
        return mapToResponse(updatedDemand);
    }

    @Override
    public MaterialDemandResponse deleteMaterialDemand(Long id) {
        MaterialDemand materialDemand = getMaterialDemandById(id);

        if (materialDemand.getStatus() == DemandStatus.APPROVED) {
            throw new InvalidMaterialDemandOperationException("Talep zaten ONAYLANMIŞ. Bu nedenle silinemez.");
        }

        if (materialDemand.getStatus() == DemandStatus.REJECTED) {
            throw new InvalidMaterialDemandOperationException("Talep REDDEDİLMİŞ. Bu nedenle silinemez.");
        }

        materialDemandRepository.delete(materialDemand);
        return mapToResponse(materialDemand);
    }

    private MaterialDemandResponse mapToResponse(MaterialDemand materialDemand) {
        MaterialDemandResponse materialDemandResponse = new MaterialDemandResponse();
        materialDemandResponse.setId(materialDemand.getId());
        materialDemandResponse.setProductName(materialDemand.getProduct().getName());
        materialDemandResponse.setCompanyName(materialDemand.getCompanyName());
        materialDemandResponse.setUserName(materialDemand.getUserName());
        materialDemandResponse.setQuantity(materialDemand.getQuantity());
        materialDemandResponse.setApprovedQuantity(materialDemand.getApprovedQuantity());
        materialDemandResponse.setRequestDate(materialDemand.getRequestDate());
        materialDemandResponse.setProductId(materialDemand.getProduct().getId());
        materialDemandResponse.setDemandStatus(materialDemand.getStatus());
        materialDemandResponse.setRejectionReason(materialDemand.getRejectionReason());
        materialDemandResponse.setTenderType(materialDemand.getTenderType());

        return materialDemandResponse;
    }

    private List<MaterialDemandResponse> mapToResponseList(List<MaterialDemand> materialDemandList) {
        List<MaterialDemandResponse> materialDemandResponseList = materialDemandList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return materialDemandResponseList;
    }

    private MaterialDemand mapToEntity(MaterialDemandCreateRequest request) {
        MaterialDemand materialDemand = new MaterialDemand();
        materialDemand.setQuantity(request.quantity());
        materialDemand.setRequestDate(request.requestDate());
        materialDemand.setUserName(request.userName());
        return materialDemand;
    }
}
