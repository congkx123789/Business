# Script to update repository imports after reorganization
param(
    [string]$BasePath = "D:\Business\Self car web\backend\src\main\java\com\selfcar",
    [switch]$WhatIf,
    [switch]$Backup
)

$basePath = $BasePath

# Repository import mappings
$repositoryImportMappings = @{
    # Auth
    "import com\.selfcar\.repository\.UserRepository;" = "import com.selfcar.repository.auth.UserRepository;"
    
    # Car
    "import com\.selfcar\.repository\.CarRepository;" = "import com.selfcar.repository.car.CarRepository;"
    "import com\.selfcar\.repository\.CarAdRepository;" = "import com.selfcar.repository.car.CarAdRepository;"
    "import com\.selfcar\.repository\.CarImageRepository;" = "import com.selfcar.repository.car.CarImageRepository;"
    "import com\.selfcar\.repository\.CarReviewRepository;" = "import com.selfcar.repository.car.CarReviewRepository;"
    "import com\.selfcar\.repository\.CarSKURepository;" = "import com.selfcar.repository.car.CarSKURepository;"
    "import com\.selfcar\.repository\.CarAnalyticsRepository;" = "import com.selfcar.repository.car.CarAnalyticsRepository;"
    "import com\.selfcar\.repository\.CarRecommendationRepository;" = "import com.selfcar.repository.car.CarRecommendationRepository;"
    "import com\.selfcar\.repository\.CarViewRepository;" = "import com.selfcar.repository.car.CarViewRepository;"
    "import com\.selfcar\.repository\.FlashSaleRepository;" = "import com.selfcar.repository.car.FlashSaleRepository;"
    
    # Booking
    "import com\.selfcar\.repository\.BookingRepository;" = "import com.selfcar.repository.booking.BookingRepository;"
    
    # Order
    "import com\.selfcar\.repository\.OrderRepository;" = "import com.selfcar.repository.order.OrderRepository;"
    "import com\.selfcar\.repository\.OrderWorkflowRepository;" = "import com.selfcar.repository.order.OrderWorkflowRepository;"
    
    # Payment
    "import com\.selfcar\.repository\.PaymentTransactionRepository;" = "import com.selfcar.repository.payment.PaymentTransactionRepository;"
    "import com\.selfcar\.repository\.WalletRepository;" = "import com.selfcar.repository.payment.WalletRepository;"
    "import com\.selfcar\.repository\.WalletLedgerEntryRepository;" = "import com.selfcar.repository.payment.WalletLedgerEntryRepository;"
    "import com\.selfcar\.repository\.WalletTransactionLogRepository;" = "import com.selfcar.repository.payment.WalletTransactionLogRepository;"
    "import com\.selfcar\.repository\.PayoutRepository;" = "import com.selfcar.repository.payment.PayoutRepository;"
    "import com\.selfcar\.repository\.PurchaseOrderRepository;" = "import com.selfcar.repository.payment.PurchaseOrderRepository;"
    "import com\.selfcar\.repository\.ReconciliationRepository;" = "import com.selfcar.repository.payment.ReconciliationRepository;"
    "import com\.selfcar\.repository\.RefundRequestRepository;" = "import com.selfcar.repository.payment.RefundRequestRepository;"
    "import com\.selfcar\.repository\.WebhookEventRepository;" = "import com.selfcar.repository.payment.WebhookEventRepository;"
    
    # Shop
    "import com\.selfcar\.repository\.ShopRepository;" = "import com.selfcar.repository.shop.ShopRepository;"
    "import com\.selfcar\.repository\.ShopReviewRepository;" = "import com.selfcar.repository.shop.ShopReviewRepository;"
    "import com\.selfcar\.repository\.VoucherRepository;" = "import com.selfcar.repository.shop.VoucherRepository;"
    "import com\.selfcar\.repository\.SellerVerificationRepository;" = "import com.selfcar.repository.shop.SellerVerificationRepository;"
    "import com\.selfcar\.repository\.SellerScoreRepository;" = "import com.selfcar.repository.shop.SellerScoreRepository;"
    
    # Analytics
    "import com\.selfcar\.repository\.FinancialReportRepository;" = "import com.selfcar.repository.analytics.FinancialReportRepository;"
    "import com\.selfcar\.repository\.FinancialSummaryRepository;" = "import com.selfcar.repository.analytics.FinancialSummaryRepository;"
    
    # Logistics
    "import com\.selfcar\.repository\.LogisticsRepository;" = "import com.selfcar.repository.logistics.LogisticsRepository;"
    "import com\.selfcar\.repository\.LogisticsTaskRepository;" = "import com.selfcar.repository.logistics.LogisticsTaskRepository;"
    
    # Common
    "import com\.selfcar\.repository\.AutomatedReplyRepository;" = "import com.selfcar.repository.common.AutomatedReplyRepository;"
    "import com\.selfcar\.repository\.NotificationRepository;" = "import com.selfcar.repository.common.NotificationRepository;"
    "import com\.selfcar\.repository\.ChatMessageRepository;" = "import com.selfcar.repository.common.ChatMessageRepository;"
    "import com\.selfcar\.repository\.CommentRepository;" = "import com.selfcar.repository.common.CommentRepository;"
    "import com\.selfcar\.repository\.ConversationParticipantRepository;" = "import com.selfcar.repository.common.ConversationParticipantRepository;"
    "import com\.selfcar\.repository\.MessageConversationRepository;" = "import com.selfcar.repository.common.MessageConversationRepository;"
}

Get-ChildItem -Path $basePath -Recurse -Filter "*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $false
    
    foreach ($oldImport in $repositoryImportMappings.Keys) {
        if ($content -match $oldImport) {
            $content = $content -replace $oldImport, $repositoryImportMappings[$oldImport]
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

Write-Host (if ($WhatIf) { "Repository import dry-run complete!" } else { "Repository import update complete!" })

