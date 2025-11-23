# Project Reorganization Plan

## New Structure

```
backend/src/main/java/com/selfcar/
├── core/
│   ├── config/
│   ├── exception/
│   └── SelfCarApplication.java
├── domain/
│   ├── auth/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   ├── repository/
│   │   └── dto/
│   ├── car/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   ├── repository/
│   │   └── dto/
│   ├── order/
│   ├── payment/
│   ├── booking/
│   ├── shop/
│   ├── analytics/
│   ├── logistics/
│   ├── notification/
│   └── common/
│       ├── controller/
│       ├── service/
│       ├── model/
│       └── repository/
└── shared/
    ├── security/
    └── dto/
```

## Simplified Structure (Better for Spring Boot)

```
backend/src/main/java/com/selfcar/
├── config/
├── exception/
├── security/
├── controller/
│   ├── auth/
│   ├── car/
│   ├── order/
│   ├── payment/
│   ├── booking/
│   ├── shop/
│   ├── analytics/
│   ├── logistics/
│   └── common/
├── service/
│   ├── auth/
│   ├── car/
│   ├── order/
│   ├── payment/
│   ├── booking/
│   ├── shop/
│   ├── analytics/
│   ├── logistics/
│   └── common/
├── model/
│   ├── auth/
│   ├── car/
│   ├── order/
│   ├── payment/
│   ├── booking/
│   ├── shop/
│   ├── analytics/
│   ├── logistics/
│   └── common/
├── repository/
│   ├── auth/
│   ├── car/
│   ├── order/
│   ├── payment/
│   ├── booking/
│   ├── shop/
│   ├── analytics/
│   ├── logistics/
│   └── common/
└── dto/
    ├── auth/
    ├── car/
    ├── order/
    ├── payment/
    ├── booking/
    ├── shop/
    ├── analytics/
    └── common/
```

