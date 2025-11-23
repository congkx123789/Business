package com.selfcar.saga.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Events {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarReserved {
        private String sagaId;
        private Long listingId;
        private boolean success;
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentCharged {
        private String sagaId;
        private String transactionId;
        private boolean success;
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingConfirmed {
        private String sagaId;
        private Long bookingId;
        private boolean success;
        private String reason;
    }
}


