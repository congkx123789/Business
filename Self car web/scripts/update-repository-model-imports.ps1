# Script to update model imports in repository files
param(
    [string]$BasePath = "D:\Business\Self car web\backend\src\main\java\com\selfcar\repository",
    [switch]$WhatIf,
    [switch]$Backup
)

$basePath = $BasePath

# Model import mappings
$modelImportMappings = @{
    # Car models
    "import com\.selfcar\.model\.CarAnalytics;" = "import com.selfcar.model.car.CarAnalytics;"
    "import com\.selfcar\.model\.CarRecommendation;" = "import com.selfcar.model.car.CarRecommendation;"
    "import com\.selfcar\.model\.CarView;" = "import com.selfcar.model.car.CarView;"
    "import com\.selfcar\.model\.CarSKU;" = "import com.selfcar.model.car.CarSKU;"
    
    # Shop models
    "import com\.selfcar\.model\.SellerScore;" = "import com.selfcar.model.shop.SellerScore;"
    
    # Payment models
    "import com\.selfcar\.model\.WebhookEvent;" = "import com.selfcar.model.payment.WebhookEvent;"
    "import com\.selfcar\.model\.WalletTransactionLog;" = "import com.selfcar.model.payment.WalletTransactionLog;"
    "import com\.selfcar\.model\.RefundRequest;" = "import com.selfcar.model.payment.RefundRequest;"
    "import com\.selfcar\.model\.Reconciliation;" = "import com.selfcar.model.payment.Reconciliation;"
    "import com\.selfcar\.model\.PurchaseOrder;" = "import com.selfcar.model.payment.PurchaseOrder;"
    "import com\.selfcar\.model\.Payout;" = "import com.selfcar.model.payment.Payout;"
    
    # Order models
    "import com\.selfcar\.model\.OrderWorkflow;" = "import com.selfcar.model.order.OrderWorkflow;"
    
    # Common models
    "import com\.selfcar\.model\.MessageConversation;" = "import com.selfcar.model.common.MessageConversation;"
    "import com\.selfcar\.model\.ConversationParticipant;" = "import com.selfcar.model.common.ConversationParticipant;"
    "import com\.selfcar\.model\.Comment;" = "import com.selfcar.model.common.Comment;"
    "import com\.selfcar\.model\.ChatMessage;" = "import com.selfcar.model.common.ChatMessage;"
    
    # Analytics models
    "import com\.selfcar\.model\.FinancialSummary;" = "import com.selfcar.model.analytics.FinancialSummary;"
}

Get-ChildItem -Path $basePath -Recurse -Filter "*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $false
    
    foreach ($oldImport in $modelImportMappings.Keys) {
        if ($content -match $oldImport) {
            $content = $content -replace $oldImport, $modelImportMappings[$oldImport]
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

Write-Host (if ($WhatIf) { "Model import dry-run complete!" } else { "Model import update in repositories complete!" })

