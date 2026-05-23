"""
Script to fetch and create all diet charts from Planet Ayurveda
"""
import requests
from bs4 import BeautifulSoup
import os
import re
import time

# Target directory
TARGET_DIR = r"E:\ayurvritta-ayurveda-hospital\knowledge\diet-charts"

# List of all diet chart URLs from the index page
DIET_CHART_URLS = [
    "https://www.planetayurveda.com/library/diet-chart-for-acidity-gastroesophageal-reflux-disease/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-adenomyosis/",
    "https://www.planetayurveda.com/library/diet-chart-for-adulthood/",
    "https://www.planetayurveda.com/library/diet-plan-for-allergy/",
    "https://www.planetayurveda.com/library/diet-plan-for-amenorrhea/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-amyloidosis/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-anal-fistula/",
    "https://www.planetayurveda.com/library/diet-plan-for-anemia/",
    "https://www.planetayurveda.com/library/diet-chart-for-arthritis/",
    "https://www.planetayurveda.com/library/diet-chart-for-ascites/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-asthma/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-with-back-pain/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-with-bells-palsy/",
    "https://www.planetayurveda.com/library/diet-plan-for-breast-development/",
    "https://www.planetayurveda.com/library/life-support-diet-for-cancer-patients/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-with-cataract/",
    "https://www.planetayurveda.com/library/diet-plan-for-celiac-disease-patients/",
    "https://www.planetayurveda.com/library/diet-chart-for-childhood-asthma/",
    "https://www.planetayurveda.com/library/diet-plan-for-chronic-kidney-disease-patients/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-common-cold/",
    "https://www.planetayurveda.com/library/diet-plan-for-constipation-problem/",
    "https://www.planetayurveda.com/library/diet-chart-for-dengue/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-depression/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-edema/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-fatty-liver-disease/",
    "https://www.planetayurveda.com/library/diet-chart-for-gout/",
    "https://www.planetayurveda.com/library/diet-plan-for-pregnant-women/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-infertility/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-kidney-stones/",
    "https://www.planetayurveda.com/library/diet-chart-for-jaundice/",
    "https://www.planetayurveda.com/library/diet-chart-for-migraine/",
    "https://www.planetayurveda.com/library/diet-plan-for-patients-of-obesity/",
]

def get_filename_from_url(url):
    """Extract filename from URL"""
    match = re.search(r'/library/(.*?)/', url)
    if match:
        return match.group(1)
    return None

def fetch_diet_chart(url):
    """Fetch diet chart content from URL"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print("  [ERROR] Error fetching {}: {}".format(url, e))
        return None

def extract_content(html):
    """Extract main content from HTML"""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Get title
    title_tag = soup.find('h1') or soup.find('title')
    title = title_tag.get_text().strip() if title_tag else "Diet Chart"
    
    # Remove script and style elements
    for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
        script.decompose()
    
    # Get main content
    main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='entry-content')
    
    if main_content:
        # Extract text content
        content = main_content.get_text(separator='\n', strip=True)
        # Clean up multiple newlines
        content = re.sub(r'\n\s*\n', '\n\n', content)
        return title, content
    else:
        return title, soup.get_text(separator='\n', strip=True)

def create_markdown(title, content, url):
    """Create markdown content"""
    markdown = """# {}

{}

---

**Source:** [{}]({})
""".format(title, content, url, url)
    return markdown

def main():
    """Main function"""
    print("=" * 60)
    print("Diet Chart Scraper - Planet Ayurveda")
    print("=" * 60)
    print("Target Directory: {}".format(TARGET_DIR))
    print("Total URLs to process: {}".format(len(DIET_CHART_URLS)))
    print()
    
    # Ensure target directory exists
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    success_count = 0
    error_count = 0
    
    for i, url in enumerate(DIET_CHART_URLS, 1):
        print("[{}/{}] Processing: {}".format(i, len(DIET_CHART_URLS), url))
        
        # Get filename
        filename = get_filename_from_url(url)
        if not filename:
            print("  [ERROR] Could not extract filename from URL")
            error_count += 1
            continue
        
        # Check if file already exists
        file_path = os.path.join(TARGET_DIR, "{}.md".format(filename))
        if os.path.exists(file_path):
            print("  [SKIP] File already exists: {}.md".format(filename))
            success_count += 1
            continue
        
        # Fetch content
        html = fetch_diet_chart(url)
        if not html:
            error_count += 1
            continue
        
        # Extract content
        title, content = extract_content(html)
        
        # Create markdown
        markdown = create_markdown(title, content, url)
        
        # Save to file
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(markdown)
            print("  [OK] Saved: {}.md".format(filename))
            success_count += 1
        except Exception as e:
            print("  [ERROR] Error saving file: {}".format(e))
            error_count += 1
        
        # Be polite to server
        time.sleep(0.5)
    
    print()
    print("=" * 60)
    print("Completed!")
    print("  Success: {}".format(success_count))
    print("  Errors: {}".format(error_count))
    print("=" * 60)

if __name__ == "__main__":
    main()
