package com.selfcar.saga.commands;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Commands {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReserveCarCommand {
        private String sagaId;
        private Long listingId;
        private Long userId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChargePaymentCommand {
        private String sagaId;
        private String transactionId;
        private Long amountMinor;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfirmBookingCommand {
        private String sagaId;
        private Long bookingId;
    }
}


