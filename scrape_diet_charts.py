import requests
from bs4 import BeautifulSoup
import re
import os
import time

URLS = [
    ("https://www.planetayurveda.com/library/acne/", "diet-chart-for-acne-and-pimples.md"),
    ("https://www.planetayurveda.com/library/diet-chart-for-ibs/", "diet-chart-for-ibs.md"),
    ("https://www.planetayurveda.com/library/diet-chart-for-gout/", "diet-chart-for-gout.md"),
    ("https://www.planetayurveda.com/library/diet-chart-for-fatty-liver/", "diet-chart-for-fatty-liver.md"),
    ("https://www.planetayurveda.com/library/diet-plan-for-bad-cholesterol/", "diet-chart-for-high-cholesterol.md"),
    ("https://www.planetayurveda.com/library/diet-chart-for-hypertension/", "diet-chart-for-hypertensionhigh-blood-pressure.md"),
    ("https://www.planetayurveda.com/library/diet-chart-for-diabetes/", "diet-chart-for-diabetes.md"),
    ("https://www.planetayurveda.com/library/diet-chart-for-acidity/", "diet-chart-for-acidity.md"),
]

OUTPUT_DIR = "knowledge/diet-charts"

def scrape_page(url, output_file, retries=3, delay=5):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=headers, timeout=30)
            if r.status_code == 503:
                print(f"  503 attempt {attempt+1}/{retries}, waiting {delay}s...")
                time.sleep(delay)
                continue
            if r.status_code != 200:
                print(f"HTTP {r.status_code}: {url}")
                return False
            soup = BeautifulSoup(r.text, 'html.parser')
            article = (
                soup.find('article') or
                soup.find('main') or
                soup.find('div', class_='entry-content') or
                soup.find('div', class_='post-content') or
                soup.find('div', class_='content') or
                soup.find('div', id='content') or
                soup.find('div', class_='post-entry') or
                soup.find('div', class_='article-content')
            )
            if article:
                for tag in article.find_all(['nav', 'footer', 'script', 'style', 'aside']):
                    tag.decompose()
                for tag in article.find_all('div', class_=re.compile(r'sidebar|comment|related|share|nav|footer', re.I)):
                    tag.decompose()
                text = article.get_text(separator='\n', strip=True)
                text = re.sub(r'\n{3,}', '\n\n', text)
                text = re.sub(r' +', ' ', text)
                out_path = os.path.join(OUTPUT_DIR, output_file)
                with open(out_path, 'w', encoding='utf-8') as f:
                    f.write(text)
                print(f"OK {len(text):>5} chars -> {output_file}")
                return True
            else:
                print(f"FAIL: No article found in {url}")
                return False
        except Exception as e:
            print(f"  Error: {e}, retry {attempt+1}/{retries}...")
            time.sleep(delay)
    return False

if __name__ == '__main__':
    results = []
    for url, filename in URLS:
        print(f"Scraping: {url}")
        ok = scrape_page(url, filename)
        results.append((url, filename, ok))
        time.sleep(3)
    print("\n--- SUMMARY ---")
    for url, filename, ok in results:
        status = "OK" if ok else "FAIL"
        print(f"{status}: {filename}")