package com.selfcar.events;

import lombok.Value;

@Value
public class CarChangedEvent {
    public enum ChangeType { PRICE, AVAILABILITY, DETAILS }

    Long carId;
    ChangeType changeType;
}
