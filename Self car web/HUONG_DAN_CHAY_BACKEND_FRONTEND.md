# Hướng Dẫn Chạy Backend và Frontend

## Vấn đề hiện tại
Backend chưa chạy trên port 8080, nên frontend không thể kết nối được.

## Cách khắc phục

### Bước 1: Chạy Backend

Mở terminal mới và chạy:

```powershell
cd "D:\Business\Self car web\backend"
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
```

Hoặc nếu không có mvnw.cmd:

```powershell
cd "D:\Business\Self car web\backend"
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

**Đợi backend khởi động hoàn tất** (thường mất 30-60 giây). Bạn sẽ thấy dòng log:
```
Started SelfcarBackendApplication in X.XXX seconds
```

### Bước 2: Kiểm tra Backend đã chạy

Mở trình duyệt và truy cập:
```
http://localhost:8080/api/health
```

Nếu thấy JSON response như:
```json
{"status":"UP","application":"selfcar-backend","profile":"h2","timestamp":"..."}
```
Thì backend đã chạy thành công!

### Bước 3: Chạy Frontend

Mở terminal mới (giữ terminal backend đang chạy) và chạy:

```powershell
cd "D:\Business\Self car web\frontend"
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:5173`

### Bước 4: Kiểm tra kết nối

1. Mở trình duyệt: `http://localhost:5173/register`
2. Mở DevTools (F12) → Tab **Network**
3. Điền form đăng ký và bấm "Create Account"
4. Xem request `POST /api/auth/register`:
   - **Status 200/201**: ✅ Thành công!
   - **Status 4xx/5xx**: Xem Response để biết lỗi gì
   - **Failed/Network Error**: Backend chưa chạy hoặc CORS issue

## Lưu ý

1. **Backend phải chạy trước** frontend
2. **Không đóng terminal** khi backend/frontend đang chạy
3. Nếu port 8080 đã bị chiếm, đổi port trong `backend/src/main/resources/application-h2.properties`:
   ```
   server.port=8081
   ```
   Và cập nhật `frontend/.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

## Troubleshooting

### Backend không khởi động được
- Kiểm tra Java version: `java -version` (cần Java 17+)
- Kiểm tra Maven: `mvn -version`
- Xem log lỗi trong terminal backend

### Frontend không kết nối được backend
- Kiểm tra `frontend/.env` có `VITE_API_BASE_URL=http://localhost:8080/api`
- Kiểm tra backend đã chạy: `http://localhost:8080/api/health`
- Kiểm tra CORS trong DevTools → Console (nếu có lỗi CORS)

### Lỗi đăng ký
- Xem Response trong DevTools → Network tab
- Kiểm tra backend log để xem lỗi chi tiết

