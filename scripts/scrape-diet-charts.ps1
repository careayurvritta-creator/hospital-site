# Diet Chart Scraper for Planet Ayurveda
# This script scrapes diet charts from planetayurveda.com and saves them as markdown files

$targetDir = "E:\ayurvritta-ayurveda-hospital\knowledge\diet-charts"

# List of all 48 diet chart URLs from Planet Ayurveda
$dietCharts = @(
    @{Name="acidity-gerd"; Url="https://www.planetayurveda.com/library/diet-chart-for-gerd-acidity/"},
    @{Name="adenomyosis"; Url="https://www.planetayurveda.com/library/diet-chart-for-adenomyosis/"},
    @{Name="adulthood"; Url="https://www.planetayurveda.com/library/diet-chart-for-adulthood/"},
    @{Name="allergy"; Url="https://www.planetayurveda.com/library/diet-chart-for-allergy/"},
    @{Name="amenorrhea"; Url="https://www.planetayurveda.com/library/diet-chart-for-amenorrhea/"},
    @{Name="amyloidosis"; Url="https://www.planetayurveda.com/library/diet-chart-for-amyloidosis/"},
    @{Name="anal-fistula"; Url="https://www.planetayurveda.com/library/diet-chart-for-anal-fistula/"},
    @{Name="anemia"; Url="https://www.planetayurveda.com/library/diet-chart-for-anemia/"},
    @{Name="arthritis"; Url="https://www.planetayurveda.com/library/diet-chart-for-arthritis/"},
    @{Name="ascites"; Url="https://www.planetayurveda.com/library/diet-chart-for-ascites/"},
    @{Name="asthma"; Url="https://www.planetayurveda.com/library/diet-chart-for-asthma/"},
    @{Name="back-pain"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-with-back-pain/"},
    @{Name="bells-palsy"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-with-bells-palsy/"},
    @{Name="breast-development"; Url="https://www.planetayurveda.com/library/diet-plan-for-breast-development/"},
    @{Name="cancer-patients"; Url="https://www.planetayurveda.com/library/life-support-diet-for-cancer-patients/"},
    @{Name="cataract"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-with-cataract/"},
    @{Name="celiac-disease"; Url="https://www.planetayurveda.com/library/diet-plan-for-celiac-disease-patients/"},
    @{Name="childhood-asthma"; Url="https://www.planetayurveda.com/library/diet-chart-for-childhood-asthma/"},
    @{Name="chronic-kidney-disease"; Url="https://www.planetayurveda.com/library/diet-plan-for-chronic-kidney-disease-patients/"},
    @{Name="common-cold"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-common-cold/"},
    @{Name="constipation"; Url="https://www.planetayurveda.com/library/diet-plan-for-constipation-problem/"},
    @{Name="dengue"; Url="https://www.planetayurveda.com/library/diet-chart-for-dengue/"},
    @{Name="depression"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-depression/"},
    @{Name="edema"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-edema/"},
    @{Name="fatty-liver"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-fatty-liver-disease/"},
    @{Name="gout"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-gout/"},
    @{Name="pregnant-women"; Url="https://www.planetayurveda.com/library/diet-plan-for-pregnant-women/"},
    @{Name="infertility"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-infertility/"},
    @{Name="kidney-stones"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-kidney-stones/"},
    @{Name="jaundice"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-jaundice/"},
    @{Name="migraine"; Url="https://www.planetayurveda.com/library/diet-chart-for-migraine/"},
    @{Name="obesity"; Url="https://www.planetayurveda.com/library/diet-plan-for-patients-of-obesity/"}
)

# Function to fetch and save diet chart
function Save-DietChart {
    param(
        [string]$name,
        [string]$url
    )
    
    try {
        Write-Host "Fetching: $name" -ForegroundColor Cyan
        
        # Fetch the page
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $content = $response.Content
        
        # Extract title
        $titleMatch = [regex]::Match($content, '<title[^>]*>([^<]+)</title>')
        $title = $titleMatch.Success ? $titleMatch.Groups[1].Value.Trim() : "Diet Chart"
        
        # Extract main content (looking for diet chart sections)
        $mainContent = $response.RawContent
        
        # Create markdown content
        $markdown = @"
# $title

$mainContent

---

**Source:** [$url]($url)
"@
        
        # Save to file
        $filePath = Join-Path $targetDir "$name.md"
        $markdown | Out-File -FilePath $filePath -Encoding UTF8
        
        Write-Host "  ✓ Saved: $name.md" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
Write-Host "Starting Diet Chart Scraper" -ForegroundColor Yellow
Write-Host "Target Directory: $targetDir" -ForegroundColor Yellow
Write-Host "Total Charts to Process: $($dietCharts.Count)" -ForegroundColor Yellow
Write-Host ""

# Ensure target directory exists
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
    Write-Host "Created directory: $targetDir" -ForegroundColor Green
}

# Process each diet chart
foreach ($chart in $dietCharts) {
    Save-DietChart -name $chart.Name -url $chart.Url
    Start-Sleep -Milliseconds 500  # Be polite to the server
}

Write-Host ""
Write-Host "Completed!" -ForegroundColor Yellow
Write-Host "Files created: $((Get-ChildItem $targetDir -Filter '*.md').Count)" -ForegroundColor Cyan
