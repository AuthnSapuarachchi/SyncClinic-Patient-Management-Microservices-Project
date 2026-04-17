# Test script for Payment Notification Events

$RABBITMQ_HOST = "localhost"
$RABBITMQ_PORT = 15672
$RABBITMQ_USER = "guest"
$RABBITMQ_PASS = "guest"
$EXCHANGE = "healthcare.exchange"

function Publish-Event {
    param($routingKey, $payload)
    $url = "http://$RABBITMQ_USER`:$RABBITMQ_PASS@$RABBITMQ_HOST`:$RABBITMQ_PORT/api/exchanges/%2F/$EXCHANGE/publish"
    
    $bodyObj = @{
        properties = @{ content_type = "application/json"; delivery_mode = 2 }
        routing_key = $routingKey
        payload = ($payload | ConvertTo-Json -Compress)
        payload_encoding = "string"
    }

    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body ($bodyObj | ConvertTo-Json) -ContentType "application/json"
        Write-Host "✅ Published '$routingKey' event successfully."
    } catch {
        Write-Host "❌ Failed to publish: $_"
    }
}

# 1. Test payment.success
Write-Host "`nOuting Test: payment.success"
$successPayload = @{
    paymentId = "PAY_TEST_$(Get-Date -Format 'HHmmss')"
    appointmentId = "APT_001"
    patientId = "1"
    patientEmail = "patient@example.com"
    doctorId = "1"
    doctorName = "John Smith"
    amount = "150.00"
    currency = "USD"
    paidAt = (Get-Date).ToString("o")
    paymentMethod = "credit_card"
}
Publish-Event "payment.success" $successPayload

# 2. Test payment.failed
Start-Sleep -Seconds 2
Write-Host "`nOuting Test: payment.failed"
$failedPayload = @{
    paymentId = "PAY_ERR_$(Get-Date -Format 'HHmmss')"
    appointmentId = "APT_002"
    patientId = "1"
    patientEmail = "patient@example.com"
    doctorId = "1"
    amount = "200.00"
    currency = "USD"
    failureReason = "Insufficient funds"
    failedAt = (Get-Date).ToString("o")
}
Publish-Event "payment.failed" $failedPayload

Write-Host "`nEvents published! Now check the notification service logs:"
Write-Host "docker logs syncclinic-notification --tail 50"

Write-Host "`nOr check the MongoDB logs directly:"
Write-Host "docker exec syncclinic-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin notification_db --eval `"db.notification_logs.find().sort({createdAt: -1}).limit(5).pretty()`""
