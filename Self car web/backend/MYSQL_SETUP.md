# Hướng Dẫn Tích Hợp MySQL

## Bước 1: Cài Đặt MySQL

### Cách 1: Cài MySQL Server (Khuyến nghị cho Production)
1. Download MySQL từ: https://dev.mysql.com/downloads/mysql/
2. Cài đặt và ghi nhớ password cho user `root`
3. Đảm bảo MySQL service đang chạy

### Cách 2: Dùng Docker (Nhanh cho Development)
```powershell
docker run -d `
  --name mysql-selfcar `
  -p 3306:3306 `
  -e MYSQL_ROOT_PASSWORD=root `
  -e MYSQL_DATABASE=selfcar_db `
  mysql:8.0
```

## Bước 2: Tạo Database

### Tự động (Dùng script):
```powershell
cd backend
.\setup-mysql.ps1
```

### Thủ công:
```sql
CREATE DATABASE selfcar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Bước 3: Chạy Migration Scripts

```powershell
cd database

# Chạy các script theo thứ tự:
mysql -u root -p selfcar_db < schema.sql
mysql -u root -p selfcar_db < seed_data.sql
mysql -u root -p selfcar_db < phase3_schema.sql
mysql -u root -p selfcar_db < phase5_schema.sql
mysql -u root -p selfcar_db < phase6_schema.sql
```

Hoặc dùng script tự động:
```powershell
.\run-migrations.ps1
```

## Bước 4: Cấu Hình Backend

File `application-dev.properties` đã được cấu hình sẵn với:
- Database: `selfcar_db`
- Host: `localhost:3306`
- User: `root`
- Password: `root` (hoặc password bạn đã đặt)

Nếu cần thay đổi, sửa file `backend/src/main/resources/application-dev.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/selfcar_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password_here
```

## Bước 5: Khởi Động Backend với MySQL

```powershell
cd backend
.\run-backend-mysql.ps1
```

Hoặc build và chạy thủ công:
```powershell
cd backend
mvn clean package -DskipTests
java -jar target\selfcar-backend-1.0.0.jar --spring.profiles.active=dev
```

## Kiểm Tra

1. Backend chạy thành công: http://localhost:8080/api/health
2. Kết nối database: Kiểm tra log backend, không có lỗi database connection
3. Xem dữ liệu: Dùng MySQL Workbench hoặc command line:
   ```sql
   mysql -u root -p
   USE selfcar_db;
   SHOW TABLES;
   ```

## Troubleshooting

### Lỗi: "Access denied for user"
- Kiểm tra username/password trong `application-dev.properties`
- Đảm bảo user có quyền truy cập database

### Lỗi: "Unknown database 'selfcar_db'"
- Chạy script tạo database: `.\setup-mysql.ps1`
- Hoặc tạo thủ công: `CREATE DATABASE selfcar_db;`

### Lỗi: "Table doesn't exist"
- Chạy migration scripts từ thư mục `database/`
- Hoặc để Spring Boot tự tạo: `spring.jpa.hibernate.ddl-auto=update`

### MySQL không chạy
- Windows: Kiểm tra Services → MySQL
- Docker: `docker ps` để xem container có chạy không
- Khởi động lại: `docker start mysql-selfcar`

## So Sánh H2 vs MySQL

| Tính năng | H2 (In-Memory) | H2 (File) | MySQL |
|-----------|----------------|-----------|-------|
| Tốc độ | ⚡ Rất nhanh | ⚡ Nhanh | ✅ Nhanh |
| Lưu trữ | ❌ Mất khi dừng | ✅ File | ✅ Database server |
| Production | ❌ Không | ❌ Không | ✅ Có |
| Backup | ❌ Không | ✅ Copy file | ✅ mysqldump |
| Multi-user | ❌ Không | ❌ Không | ✅ Có |
| Phức tạp | ✅ Đơn giản | ✅ Đơn giản | ⚠️ Cần setup |

## Backup MySQL

```powershell
# Backup database
mysqldump -u root -p selfcar_db > backup_$(Get-Date -Format "yyyy-MM-dd").sql

# Restore database
mysql -u root -p selfcar_db < backup_2025-11-07.sql
```

