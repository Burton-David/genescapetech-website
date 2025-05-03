import os
import sys
import datetime
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuration ---
TARGET_URL = "https://dancing-tanuki-278450.netlify.app/" # <<< Your Netlify URL
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "analysis_report")
REPORT_FILENAME = os.path.join(OUTPUT_DIR, "website_analysis_report.md")
SCREENSHOT_DIR = os.path.join(OUTPUT_DIR, "screenshots")

VIEWPORTS = [
    (1440, 900, "desktop"),
    (390, 844, "mobile")
]
WAIT_TIMEOUT = 12 # Increased timeout slightly to 12 seconds

# Directories/Files to exclude from tree
EXCLUDED_ITEMS = {'.git', '__pycache__', 'node_modules', '.vscode', 'analysis_report', 'inspect_project.py', 'project_inspection_report.txt', 'analyze_website.py', '.DS_Store', 'Thumbs.db', 'genescapetech_website_env', '.qodo'}
# File extensions to list
LIST_EXTENSIONS = {'.html', '.css', '.js', '.json', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.otf', '.eot'}


# --- Helper Functions ---
def setup_driver():
    # ... (setup_driver remains the same) ...
    print("Setting up Chrome WebDriver...")
    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        options.add_argument('--log-level=3')
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        # Enable performance logging to potentially capture more console data
        options.set_capability('goog:loggingPrefs', {'browser': 'SEVERE'}) # Capture SEVERE browser logs

        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        print("WebDriver setup complete.")
        return driver
    except Exception as e:
        print(f"Error setting up WebDriver: {e}", file=sys.stderr); sys.exit(1)

def capture_screenshot(driver, filename_prefix):
    # ... (capture_screenshot remains the same) ...
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{filename_prefix}_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_DIR, filename)
    relative_path = os.path.relpath(filepath, OUTPUT_DIR).replace(os.sep, '/')
    try:
        print(f"  Capturing screenshot: {filename}...")
        driver.save_screenshot(filepath)
        print(f"  Screenshot saved to {filepath}")
        return filename, relative_path
    except Exception as e:
        print(f"  Error capturing screenshot: {e}", file=sys.stderr); return None, None

def get_console_logs(driver):
    # ... (get_console_logs remains the same) ...
     print("  Retrieving console logs...")
     try:
         log_levels = ['SEVERE', 'WARNING']
         logs = []
         browser_logs = driver.get_log('browser') # Get logs based on capabilities
         for entry in browser_logs:
             level = entry.get('level')
             if level in log_levels:
                 ts = entry.get('timestamp')
                 timestamp_str = datetime.datetime.fromtimestamp(ts / 1000).strftime('%H:%M:%S') if ts else 'N/A'
                 # Clean up common irrelevant messages
                 message = entry.get('message', '')
                 if 'favicon.ico' in message and '404' in message: continue # Ignore favicon 404
                 log_line = f"[{level}@{timestamp_str}] {message}"
                 if log_line not in logs: logs.append(log_line)

         print(f"  Retrieved {len(logs)} console log entries.")
         return logs if logs else ["  (No significant console errors or warnings found)"]
     except Exception as e:
         print(f"  Error retrieving console logs: {e}", file=sys.stderr); return [f"  Error retrieving console logs: {e}"]

def generate_directory_tree(startpath, indent=''):
    """Generates directory tree lines, excluding specified items."""
    tree_lines = []
    try:
        items = sorted(os.listdir(startpath))
    except FileNotFoundError:
        return tree_lines # Return empty if path doesn't exist

    for item in items:
        path = os.path.join(startpath, item)
        if item in EXCLUDED_ITEMS:
            continue

        if os.path.isdir(path):
            tree_lines.append(f"{indent}├── {item}/")
            tree_lines.extend(generate_directory_tree(path, indent + '│   '))
        elif os.path.isfile(path):
            _, ext = os.path.splitext(item)
            if ext.lower() in LIST_EXTENSIONS:
                tree_lines.append(f"{indent}├── {item}")

    # Adjust connector for the last item
    if tree_lines:
        last_line = tree_lines[-1]
        if last_line.startswith(f"{indent}├──"):
            tree_lines[-1] = f"{indent}└──" + last_line[len(f"{indent}├──"):]

    return tree_lines


def format_report(report_data):
    """Formats the collected data into a Markdown report."""
    # ... (Formatting logic remains mostly the same, adding tree) ...
    print("Generating Markdown report...")
    lines = []
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines.append(f"# Website Analysis Report")
    lines.append(f"**Generated:** {timestamp}")
    lines.append(f"**URL Tested:** {report_data.get('url', 'N/A')}")
    lines.append("\n---\n")

    lines.append("## Project Structure")
    lines.append("```")
    lines.append(f"./{os.path.basename(PROJECT_ROOT)}/")
    lines.extend(report_data.get('directory_tree', ["(Could not generate tree)"]))
    lines.append("```")
    lines.append("\n---\n")


    for viewport_name, data in report_data.get('viewports', {}).items():
        lines.append(f"## Analysis for Viewport: {viewport_name.capitalize()} ({data.get('width')}x{data.get('height')})")
        # ... (rest of viewport formatting) ...
        lines.append("\n### Initial Load State")
        if data.get('initial_screenshot_relative_path'):
            lines.append(f"![Initial Load Screenshot ({viewport_name})]({data['initial_screenshot_relative_path']})")
            lines.append(f"*[View Full Screenshot: {data['initial_screenshot_filename']}]*")
        else: lines.append("*Screenshot capture failed.*")
        lines.append("\n**Console Logs (Initial Load):**")
        lines.append("```log"); lines.extend(data.get('initial_logs', ["*No logs captured.*"])); lines.append("```")

        if data.get('interaction_attempted'):
            lines.append("\n### State After Entrance Interaction")
            if data.get('interaction_success'):
                lines.append("*Entrance interaction (title click) simulated successfully.*")
                if data.get('post_interaction_screenshot_relative_path'):
                    lines.append(f"![Post Interaction Screenshot ({viewport_name})]({data['post_interaction_screenshot_relative_path']})")
                    lines.append(f"*[View Full Screenshot: {data['post_interaction_screenshot_filename']}]*")
                else: lines.append("*Post-interaction screenshot capture failed.*")
                lines.append("\n**Console Logs (Post Interaction):**")
                lines.append("```log"); lines.extend(data.get('post_interaction_logs', ["*No logs captured.*"])); lines.append("```")
            else:
                lines.append(f"*Entrance interaction simulation failed: {data.get('interaction_error', 'Unknown reason')}*")
                lines.append("\n**Console Logs (Before Interaction Failure):**")
                lines.append("```log"); lines.extend(data.get('initial_logs', ["*No logs captured.*"])); lines.append("```")
        else: lines.append("\n*Entrance interaction was not attempted for this viewport.*")
        lines.append("\n---\n")

    # --- Write Report File ---
    # ... (Writing logic remains the same) ...
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    try:
        with open(REPORT_FILENAME, 'w', encoding='utf-8') as f: f.write("\n".join(lines))
        print(f"Markdown report saved successfully to: {REPORT_FILENAME}")
    except Exception as e: print(f"Error writing report file '{REPORT_FILENAME}': {e}", file=sys.stderr)


# --- Main Execution Logic ---
if __name__ == "__main__":
    print(f"Starting website analysis for: {TARGET_URL}")
    driver = setup_driver()
    report_data = {'url': TARGET_URL, 'viewports': {}}

    if not driver: sys.exit(1)

    try:
        # Generate directory tree once
        print("Generating directory tree...")
        report_data['directory_tree'] = generate_directory_tree(PROJECT_ROOT)

        for width, height, name in VIEWPORTS:
            # ... (Viewport testing logic remains the same, uses increased WAIT_TIMEOUT) ...
            print(f"\n--- Testing Viewport: {name} ({width}x{height}) ---")
            viewport_results = {'width': width, 'height': height, 'interaction_attempted': False, 'interaction_success': False}
            report_data['viewports'][name] = viewport_results
            try:
                print(f"  Resizing window to {width}x{height}"); driver.set_window_size(width, height); time.sleep(1)
                print(f"  Navigating to {TARGET_URL}..."); driver.get(TARGET_URL)
                print("  Waiting for entrance screen title container..."); WebDriverWait(driver, WAIT_TIMEOUT).until(EC.visibility_of_element_located((By.ID, "title-container"))); print("  Entrance screen loaded."); time.sleep(2) # Wait for animations
                filename, rel_path = capture_screenshot(driver, f"initial_{name}"); viewport_results['initial_screenshot_filename'] = filename; viewport_results['initial_screenshot_relative_path'] = rel_path; viewport_results['initial_logs'] = get_console_logs(driver)

                if name == "desktop": # Simulate click only on desktop for now
                    viewport_results['interaction_attempted'] = True
                    try:
                        print("  Attempting to click title container..."); title_container = WebDriverWait(driver, WAIT_TIMEOUT).until(EC.element_to_be_clickable((By.ID, "title-container"))); title_container.click(); print("  Title container clicked. Waiting for transition...")
                        # Wait for main content to be visible via class AND opacity (more robust)
                        WebDriverWait(driver, WAIT_TIMEOUT).until(
                            EC.visibility_of_element_located((By.CSS_SELECTOR, "#main-content.visible"))
                        ); print("  Main content detected after transition."); time.sleep(1.5)
                        filename, rel_path = capture_screenshot(driver, f"post_interaction_{name}"); viewport_results['post_interaction_screenshot_filename'] = filename; viewport_results['post_interaction_screenshot_relative_path'] = rel_path; viewport_results['post_interaction_logs'] = get_console_logs(driver); viewport_results['interaction_success'] = True
                    except TimeoutException: error_msg = "Timeout waiting for element or transition after click."; print(f"  Interaction Error: {error_msg}", file=sys.stderr); viewport_results['interaction_error'] = error_msg; filename, rel_path = capture_screenshot(driver, f"interaction_fail_{name}")
                    except NoSuchElementException: error_msg = "Could not find title container element to click."; print(f"  Interaction Error: {error_msg}", file=sys.stderr); viewport_results['interaction_error'] = error_msg
                    except Exception as e: error_msg = f"An unexpected error occurred during interaction: {e}"; print(f"  Interaction Error: {error_msg}", file=sys.stderr); viewport_results['interaction_error'] = error_msg
            except TimeoutException: print(f"  Timeout waiting for initial page load elements on {name} viewport.", file=sys.stderr); viewport_results['initial_logs'] = get_console_logs(driver)
            except Exception as e:
                print(f"  An error occurred during testing {name} viewport: {e}", file=sys.stderr)
                try:
                    viewport_results['initial_logs'] = get_console_logs(driver)
                except Exception as log_error:
                    print(f"  An error occurred while retrieving logs: {log_error}", file=sys.stderr)

    finally:
        print("\n--- Analysis Complete ---")
        if driver: print("Closing WebDriver..."); driver.quit(); print("WebDriver closed.")
        format_report(report_data) # Generate report after closing driver