# Port Management System

Hệ thống quản lý port tự động để tránh xung đột port trong monorepo.

## Tổng quan

Hệ thống này cung cấp:
- **File cấu hình tập trung**: Tất cả các port được định nghĩa trong `packages/7-shared/src/constants/ports.ts`
- **Script kiểm tra**: Tự động phát hiện xung đột port và hardcoded ports
- **Script tự động sửa**: Tự động sửa các xung đột port và hardcoded ports

## Cấu hình Port

### HTTP/REST API Ports
- **Gateway**: 3000
- **Users Service**: 3001
- **Stories Service**: 3002
- **Comments Service**: 3003
- **Search Service**: 3004
- **AI Service**: 3005
- **Notification Service**: 3006
- **WebSocket Service**: 3007
- **Social Service**: 3008
- **Community Service**: 3009
- **Monetization Service**: 3010
- **Web Frontend (Next.js dev server)**: 3000

### gRPC Ports
- **Users Service**: 50051
- **Stories Service**: 50052
- **Comments Service**: 50053
- **Search Service**: 50054
- **AI Service**: 50055
- **Notification Service**: 50056
- **WebSocket Service**: 50057
- **Social Service**: 50058
- **Community Service**: 50059
- **Monetization Service**: 50060

### Infrastructure Ports
- **SQL Server**: 1433
- **PostgreSQL**: 5433 (host) / 5432 (container)
- **Redis**: 6379
- **MeiliSearch**: 7700

## Sử dụng

### Kiểm tra Port Conflicts

```bash
# Sử dụng PowerShell script (khuyến nghị cho Windows)
pnpm run check:ports

# Hoặc sử dụng TypeScript script (yêu cầu bun)
pnpm run check:ports:ts
```

Script này sẽ:
- Kiểm tra xem có port nào bị trùng lặp không
- Tìm các hardcoded ports trong source code
- Kiểm tra xem port nào đang được sử dụng trên hệ thống

### Tự động Sửa Port Conflicts

```bash
# Sử dụng PowerShell script (khuyến nghị cho Windows)
pnpm run fix:ports

# Hoặc sử dụng TypeScript script (yêu cầu bun)
pnpm run fix:ports:ts
```

Script này sẽ:
- Thay thế hardcoded ports bằng `configService.get()`
- Đảm bảo tất cả services sử dụng port từ file cấu hình tập trung
- Cập nhật các file `main.ts` và `configuration.ts`

## Quy tắc

1. **KHÔNG hardcode port**: Luôn sử dụng `configService.get()` với default value từ file cấu hình
2. **Sử dụng file cấu hình tập trung**: Import port từ `7-shared/src/constants/ports.ts`
3. **Kiểm tra trước khi commit**: Chạy `pnpm run check:ports` trước khi commit code

## Ví dụ

### ❌ Sai - Hardcoded Port

```typescript
await app.listen(3002);
```

### ✅ Đúng - Sử dụng ConfigService

```typescript
const port = configService.get<number>("app.port", 3002);
await app.listen(port);
```

### ✅ Đúng - Sử dụng từ file cấu hình tập trung

```typescript
import { SERVICE_PORTS } from "7-shared";

const port = configService.get<number>("app.port", SERVICE_PORTS.USERS_SERVICE);
await app.listen(port);
```

## Thêm Port Mới

Khi thêm service mới:

1. Thêm port vào `packages/7-shared/src/constants/ports.ts`
2. Cập nhật `PORT_METADATA` trong file đó
3. Chạy `pnpm run check:ports` để verify
4. Cập nhật script `check-ports.ps1` và `fix-ports.ps1` nếu cần

## Troubleshooting

### Port đang được sử dụng

Nếu script báo port đang được sử dụng:
1. Kiểm tra xem có service nào đang chạy không: `pnpm run check:services`
2. Dừng service: `pnpm run kill:services`
3. Hoặc thay đổi port trong file cấu hình

### Port conflict

Nếu có port conflict:
1. Chạy `pnpm run fix:ports` để tự động sửa
2. Hoặc thủ công cập nhật port trong file cấu hình tập trung

