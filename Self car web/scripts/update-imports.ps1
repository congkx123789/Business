# Script to update imports after reorganization
param(
    [string]$BasePath = "D:\Business\Self car web\backend\src\main\java\com\selfcar",
    [switch]$WhatIf,
    [switch]$Backup
)

$basePath = $BasePath

# Import mappings
$importMappings = @{
    # Controllers
    "import com\.selfcar\.dto\.ApiResponse;" = "import com.selfcar.dto.common.ApiResponse;"
    "import com\.selfcar\.dto\.AuthResponse;" = "import com.selfcar.dto.auth.AuthResponse;"
    "import com\.selfcar\.dto\.LoginRequest;" = "import com.selfcar.dto.auth.LoginRequest;"
    "import com\.selfcar\.dto\.RegisterRequest;" = "import com.selfcar.dto.auth.RegisterRequest;"
    "import com\.selfcar\.dto\.BookingRequest;" = "import com.selfcar.dto.booking.BookingRequest;"
    "import com\.selfcar\.dto\.PaymentRequestDTO;" = "import com.selfcar.dto.payment.PaymentRequestDTO;"
    "import com\.selfcar\.dto\.PaymentResponseDTO;" = "import com.selfcar.dto.payment.PaymentResponseDTO;"
    "import com\.selfcar\.dto\.WalletBalanceDTO;" = "import com.selfcar.dto.payment.WalletBalanceDTO;"
    "import com\.selfcar\.dto\.BusinessInsightsDTO;" = "import com.selfcar.dto.analytics.BusinessInsightsDTO;"
    "import com\.selfcar\.dto\.FinancialDashboardDTO;" = "import com.selfcar.dto.analytics.FinancialDashboardDTO;"
    "import com\.selfcar\.dto\.SellerScoreDTO;" = "import com.selfcar.dto.analytics.SellerScoreDTO;"
    "import com\.selfcar\.dto\.CarRecommendationDTO;" = "import com.selfcar.dto.car.CarRecommendationDTO;"
    
    # Models
    "import com\.selfcar\.model\.User;" = "import com.selfcar.model.auth.User;"
    "import com\.selfcar\.model\.Car;" = "import com.selfcar.model.car.Car;"
    "import com\.selfcar\.model\.Booking;" = "import com.selfcar.model.booking.Booking;"
    "import com\.selfcar\.model\.Order;" = "import com.selfcar.model.order.Order;"
    "import com\.selfcar\.model\.PaymentTransaction;" = "import com.selfcar.model.payment.PaymentTransaction;"
    "import com\.selfcar\.model\.Wallet;" = "import com.selfcar.model.payment.Wallet;"
    "import com\.selfcar\.model\.Shop;" = "import com.selfcar.model.shop.Shop;"
    "import com\.selfcar\.model\.Voucher;" = "import com.selfcar.model.shop.Voucher;"
    "import com\.selfcar\.model\.Notification;" = "import com.selfcar.model.common.Notification;"
    
    # Services
    "import com\.selfcar\.service\.AuthService;" = "import com.selfcar.service.auth.AuthService;"
    "import com\.selfcar\.service\.BookingService;" = "import com.selfcar.service.booking.BookingService;"
    "import com\.selfcar\.service\.CarService;" = "import com.selfcar.service.car.CarService;"
    "import com\.selfcar\.service\.OrderService;" = "import com.selfcar.service.order.OrderService;"
    "import com\.selfcar\.service\.PaymentService;" = "import com.selfcar.service.payment.PaymentService;"
    "import com\.selfcar\.service\.WalletService;" = "import com.selfcar.service.payment.WalletService;"
    "import com\.selfcar\.service\.ShopService;" = "import com.selfcar.service.shop.ShopService;"
    "import com\.selfcar\.service\.AnalyticsService;" = "import com.selfcar.service.analytics.AnalyticsService;"
}

Get-ChildItem -Path $basePath -Recurse -Filter "*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $false
    
    foreach ($oldImport in $importMappings.Keys) {
        if ($content -match $oldImport) {
            $content = $content -replace $oldImport, $importMappings[$oldImport]
            $updated = $true
        }
    }
    
    if ($updated) {
        if ($WhatIf) {
            Write-Host "Would update imports: $($_.FullName)"
        }
        else {
            if ($Backup) {
                $backupPath = "{0}.bak" -f $_.FullName
                if (-not (Test-Path $backupPath)) {
                    Copy-Item -Path $_.FullName -Destination $backupPath -Force
                }
            }
            Set-Content -Path $_.FullName -Value $content -NoNewline
            Write-Host "Updated imports: $($_.Name)"
        }
    }
}

Write-Host (if ($WhatIf) { "Import dry-run complete!" } else { "Import update complete!" })

