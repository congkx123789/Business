# Comprehensive import update script
param(
    [string]$BasePath = "D:\Business\Self car web\backend\src\main\java\com\selfcar",
    [switch]$WhatIf,
    [switch]$Backup
)

$basePath = $BasePath

# More comprehensive import mappings
$importMappings = @{
    # Models
    "import com\.selfcar\.model\.LogisticsTask;" = "import com.selfcar.model.logistics.LogisticsTask;"
    "import com\.selfcar\.model\.Logistics;" = "import com.selfcar.model.logistics.Logistics;"
    "import com\.selfcar\.model\.CarAd;" = "import com.selfcar.model.car.CarAd;"
    "import com\.selfcar\.model\.CarImage;" = "import com.selfcar.model.car.CarImage;"
    "import com\.selfcar\.model\.CarReview;" = "import com.selfcar.model.car.CarReview;"
    "import com\.selfcar\.model\.FlashSale;" = "import com.selfcar.model.car.FlashSale;"
    "import com\.selfcar\.model\.AutomatedReply;" = "import com.selfcar.model.common.AutomatedReply;"
    "import com\.selfcar\.model\.ShopReview;" = "import com.selfcar.model.shop.ShopReview;"
    "import com\.selfcar\.model\.SellerVerification;" = "import com.selfcar.model.shop.SellerVerification;"
    "import com\.selfcar\.model\.FinancialReport;" = "import com.selfcar.model.analytics.FinancialReport;"
    "import com\.selfcar\.model\.WalletLedgerEntry;" = "import com.selfcar.model.payment.WalletLedgerEntry;"
    
    # Services
    "import com\.selfcar\.service\.LogisticsTaskService;" = "import com.selfcar.service.logistics.LogisticsTaskService;"
    "import com\.selfcar\.service\.CarAdService;" = "import com.selfcar.service.car.CarAdService;"
    "import com\.selfcar\.service\.CarReviewService;" = "import com.selfcar.service.car.CarReviewService;"
    "import com\.selfcar\.service\.FlashSaleService;" = "import com.selfcar.service.car.FlashSaleService;"
    "import com\.selfcar\.service\.AutomatedReplyService;" = "import com.selfcar.service.common.AutomatedReplyService;"
    "import com\.selfcar\.service\.NotificationService;" = "import com.selfcar.service.common.NotificationService;"
    "import com\.selfcar\.service\.BusinessInsightsService;" = "import com.selfcar.service.analytics.BusinessInsightsService;"
    "import com\.selfcar\.service\.FinancialDashboardService;" = "import com.selfcar.service.analytics.FinancialDashboardService;"
    "import com\.selfcar\.service\.RecommendationService;" = "import com.selfcar.service.analytics.RecommendationService;"
    "import com\.selfcar\.service\.SellerScoringService;" = "import com.selfcar.service.analytics.SellerScoringService;"
    "import com\.selfcar\.service\.PaymentGatewayService;" = "import com.selfcar.service.payment.PaymentGatewayService;"
    
    # DTOs
    "import com\.selfcar\.dto\.DemandPredictionDTO;" = "import com.selfcar.dto.analytics.DemandPredictionDTO;"
    "import com\.selfcar\.dto\.SellerOptimizationDTO;" = "import com.selfcar.dto.analytics.SellerOptimizationDTO;"
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

