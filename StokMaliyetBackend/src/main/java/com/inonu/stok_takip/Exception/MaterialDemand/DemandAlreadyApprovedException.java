package com.inonu.stok_takip.Exception.MaterialDemand;

public class DemandAlreadyApprovedException extends RuntimeException {
    public DemandAlreadyApprovedException(String message) {
        super(message);
    }
}
