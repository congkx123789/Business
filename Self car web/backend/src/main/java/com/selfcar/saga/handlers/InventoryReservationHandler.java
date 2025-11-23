package com.selfcar.saga.handlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.saga.commands.Commands.ReserveCarCommand;
import com.selfcar.saga.events.Events.CarReserved;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryReservationHandler {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${kafka.topic.saga.events:booking-events}")
    private String eventsTopic;

    @KafkaListener(topics = "${kafka.topic.saga.reserve:reserve-car}")
    public void onReserve(String payload) {
        try {
            ReserveCarCommand cmd = mapper.readValue(payload, ReserveCarCommand.class);
            // TODO: call Inventory service to hold VIN; demo returns success
            CarReserved evt = new CarReserved(cmd.getSagaId(), cmd.getListingId(), true, null);
            kafkaTemplate.send(eventsTopic, cmd.getSagaId(), mapper.writeValueAsString(evt));
        } catch (Exception e) {
            log.error("ReserveCarCommand failed", e);
        }
    }
}


