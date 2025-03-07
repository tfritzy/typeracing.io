# IndexNow URL Submission Script

# Replace these values with your actual domain and API key
$domain = "typeracing.io"
$apiKey = "3726d553fb47427e97b84d8377c6fcdd"

# Path to your sitemap file (local copy)
$sitemapPath = "sitemap.xml"

# Create key file if it doesn't exist
$keyFilePath = "$apiKey.txt"
if (-not (Test-Path $keyFilePath)) {
    Set-Content -Path $keyFilePath -Value $apiKey
    Write-Host "Key file created: $keyFilePath"
    Write-Host "Make sure to upload this file to your website at: https://$domain/$apiKey.txt"
}

# Function to extract URLs from sitemap
function Get-SitemapUrls {
    param (
        [string]$XmlContent
    )
    
    try {
        $xml = [xml]$XmlContent
        $namespace = $xml.urlset.xmlns
        $nsManager = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $nsManager.AddNamespace("sm", $namespace)
        
        $urls = $xml.SelectNodes("//sm:url/sm:loc", $nsManager) | ForEach-Object { $_.InnerText }
        return $urls
    }
    catch {
        Write-Error "Error parsing sitemap: $_"
        return @()
    }
}

# Read sitemap content
$sitemapContent = Get-Content -Path $sitemapPath -Raw

# Extract URLs from sitemap
$urlList = Get-SitemapUrls -XmlContent $sitemapContent

if ($urlList.Count -eq 0) {
    Write-Error "No URLs found in sitemap."
    exit
}

Write-Host "Found $($urlList.Count) URLs in sitemap."

# Prepare the request body
$body = @{
    host        = $domain
    key         = $apiKey
    keyLocation = "https://$domain/$apiKey.txt"
    urlList     = $urlList
} | ConvertTo-Json

# Set API endpoint
$apiEndpoint = "https://api.indexnow.org/IndexNow"

# Display submission details
Write-Host "Preparing to submit $($urlList.Count) URLs to IndexNow..."
Write-Host "Domain: $domain"
Write-Host "Key location: https://$domain/$apiKey.txt"

# Make the API request
try {
    $response = Invoke-RestMethod -Uri $apiEndpoint -Method Post -Body $body -ContentType "application/json; charset=utf-8"
    Write-Host "Submission successful!" -ForegroundColor Green
    Write-Host "Response: $response"
}
catch {
    Write-Host "Error submitting URLs to IndexNow:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)"
    }
}