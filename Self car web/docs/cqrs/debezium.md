# Debezium CDC alternative for Outbox

## Overview
Use Debezium (MySQL connector) to stream `outbox_events` changes to Kafka, removing the need for in-app schedulers.

## Steps
1. Enable MySQL binlog (ROW, GTID optional). Set `binlog_row_image=FULL`.
2. Deploy Kafka + Zookeeper (or KRaft) and Debezium Connect.
3. Register Debezium connector (example):
```json
{
  "name": "selfcar-outbox",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "*****",
    "database.server.id": "184054",
    "database.server.name": "selfcar",
    "database.include.list": "selfcar_db",
    "table.include.list": "selfcar_db.outbox_events",
    "include.schema.changes": "false",
    "tombstones.on.delete": "false",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.table.fields.additional.placement": "event_id:header:eventId,version:header:version,event_type:header:eventType,aggregate_id:header:listingId",
    "transforms.outbox.route.by.field": "event_type",
    "transforms.outbox.route.topic.replacement": "listing-events"
  }
}
```
4. Disable `ScheduledOutboxPublisher` when Debezium is active.

## Notes
- Idempotency: eventId header; external versioning used in ES consumer.
- Monitoring: Debezium MySQL connector lag, Kafka consumer lag, ES bulk failures.

