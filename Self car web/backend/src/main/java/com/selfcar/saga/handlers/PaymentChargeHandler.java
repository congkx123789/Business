package com.selfcar.saga.handlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.saga.commands.Commands.ChargePaymentCommand;
import com.selfcar.saga.events.Events.PaymentCharged;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentChargeHandler {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${kafka.topic.saga.events:booking-events}")
    private String eventsTopic;

    @KafkaListener(topics = "${kafka.topic.saga.charge:charge-payment}")
    public void onCharge(String payload) {
        try {
            ChargePaymentCommand cmd = mapper.readValue(payload, ChargePaymentCommand.class);
            // TODO: call Payments service to charge; demo success
            PaymentCharged evt = new PaymentCharged(cmd.getSagaId(), cmd.getTransactionId(), true, null);
            kafkaTemplate.send(eventsTopic, cmd.getSagaId(), mapper.writeValueAsString(evt));
        } catch (Exception e) {
            log.error("ChargePaymentCommand failed", e);
        }
    }
}


