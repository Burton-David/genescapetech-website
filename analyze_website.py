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

# Viewports to test (Width, Height, Name)
VIEWPORTS = [
    (1440, 900, "desktop"),
    (390, 844, "mobile") # iPhone 12/13 Pro dimensions
]

# Selenium Wait Time (seconds)
WAIT_TIMEOUT = 10 # Increase if animations/transitions take longer

# --- Helper Functions ---

def setup_driver():
    """Sets up and returns a Chrome WebDriver instance."""
    print("Setting up Chrome WebDriver...")
    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless") # Run in headless mode (no visible browser window)
        options.add_argument("--no-sandbox") # Often needed in CI/server environments
        options.add_argument("--disable-dev-shm-usage") # Overcome limited resource problems
        options.add_argument("--window-size=1920,1080") # Start with a decent size
        options.add_argument('--log-level=3') # Suppress unnecessary logs from webdrivermanager/selenium
        options.add_experimental_option('excludeSwitches', ['enable-logging']) # Suppress DevTools listening message

        # Use webdriver-manager to automatically handle driver download/updates
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        print("WebDriver setup complete.")
        return driver
    except Exception as e:
        print(f"Error setting up WebDriver: {e}", file=sys.stderr)
        print("Please ensure Google Chrome is installed and accessible.", file=sys.stderr)
        print("Try running: pip install selenium webdriver-manager", file=sys.stderr)
        sys.exit(1)

def capture_screenshot(driver, filename_prefix):
    """Captures a full-page screenshot."""
    # Create screenshot directory if it doesn't exist
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    # Get dimensions for screenshot (might need adjustment for true full page in headless)
    width = driver.execute_script("return Math.max( document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth );")
    height = driver.execute_script("return Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );")

    # Set window size to capture full page (may not be perfect in headless)
    # driver.set_window_size(width, height)
    # time.sleep(0.5) # Give time to resize

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{filename_prefix}_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_DIR, filename)
    relative_path = os.path.relpath(filepath, OUTPUT_DIR).replace(os.sep, '/') # Path relative to report

    try:
        print(f"  Capturing screenshot: {filename}...")
        # Use save_screenshot for the visible part, or execute CDP command for full page if needed (more complex)
        driver.save_screenshot(filepath)
        print(f"  Screenshot saved to {filepath}")
        return filename, relative_path
    except Exception as e:
        print(f"  Error capturing screenshot: {e}", file=sys.stderr)
        return None, None

def get_console_logs(driver):
    """Retrieves browser console logs (Errors and Warnings)."""
    print("  Retrieving console logs...")
    try:
        # SEVERE typically corresponds to errors, WARNING to warnings
        log_levels = ['SEVERE', 'WARNING']
        logs = []
        for level in log_levels:
            try:
                # Note: Browser logs might need specific capabilities enabled if empty
                entries = driver.get_log('browser')
                for entry in entries:
                    if entry.get('level') == level:
                        # Format timestamp if available
                        ts = entry.get('timestamp')
                        timestamp_str = datetime.datetime.fromtimestamp(ts / 1000).strftime('%H:%M:%S') if ts else 'N/A'
                        log_line = f"[{entry.get('level')}@{timestamp_str}] {entry.get('message')}"
                        # Avoid duplicate messages often logged by browser/extensions
                        if log_line not in logs:
                             logs.append(log_line)
            except Exception as log_err:
                print(f"    Could not retrieve {level} logs: {log_err}", file=sys.stderr)
        print(f"  Retrieved {len(logs)} console log entries.")
        return logs if logs else ["  (No significant console errors or warnings found)"]
    except Exception as e:
        print(f"  Error retrieving console logs: {e}", file=sys.stderr)
        return [f"  Error retrieving console logs: {e}"]

def format_report(report_data):
    """Formats the collected data into a Markdown report."""
    print("Generating Markdown report...")
    lines = []
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines.append(f"# Website Analysis Report")
    lines.append(f"**Generated:** {timestamp}")
    lines.append(f"**URL Tested:** {report_data.get('url', 'N/A')}")
    lines.append("\n---\n")

    for viewport_name, data in report_data.get('viewports', {}).items():
        lines.append(f"## Analysis for Viewport: {viewport_name.capitalize()} ({data.get('width')}x{data.get('height')})")
        lines.append("\n### Initial Load State")
        if data.get('initial_screenshot_relative_path'):
            lines.append(f"![Initial Load Screenshot ({viewport_name})]({data['initial_screenshot_relative_path']})")
            lines.append(f"*[View Full Screenshot: {data['initial_screenshot_filename']}]*")
        else:
            lines.append("*Screenshot capture failed.*")
        lines.append("\n**Console Logs (Initial Load):**")
        lines.append("```log")
        lines.extend(data.get('initial_logs', ["*No logs captured.*"]))
        lines.append("```")

        if data.get('interaction_attempted'):
            lines.append("\n### State After Entrance Interaction")
            if data.get('interaction_success'):
                lines.append("*Entrance interaction (title click) simulated successfully.*")
                if data.get('post_interaction_screenshot_relative_path'):
                    lines.append(f"![Post Interaction Screenshot ({viewport_name})]({data['post_interaction_screenshot_relative_path']})")
                    lines.append(f"*[View Full Screenshot: {data['post_interaction_screenshot_filename']}]*")
                else:
                    lines.append("*Post-interaction screenshot capture failed.*")
                lines.append("\n**Console Logs (Post Interaction):**")
                lines.append("```log")
                lines.extend(data.get('post_interaction_logs', ["*No logs captured.*"]))
                lines.append("```")
            else:
                lines.append(f"*Entrance interaction simulation failed: {data.get('interaction_error', 'Unknown reason')}*")
                # Include logs captured *before* the interaction failed, if any
                lines.append("\n**Console Logs (Before Interaction Failure):**")
                lines.append("```log")
                lines.extend(data.get('initial_logs', ["*No logs captured.*"])) # Repeat initial logs for context
                lines.append("```")
        else:
             lines.append("\n*Entrance interaction was not attempted for this viewport.*")


        lines.append("\n---\n")

    # --- Write Report File ---
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    try:
        with open(REPORT_FILENAME, 'w', encoding='utf-8') as f:
            f.write("\n".join(lines))
        print(f"Markdown report saved successfully to: {REPORT_FILENAME}")
    except Exception as e:
        print(f"Error writing report file '{REPORT_FILENAME}': {e}", file=sys.stderr)

# --- Main Execution Logic ---
if __name__ == "__main__":
    print(f"Starting website analysis for: {TARGET_URL}")
    driver = setup_driver()
    report_data = {'url': TARGET_URL, 'viewports': {}}

    if not driver:
        sys.exit(1)

    try:
        for width, height, name in VIEWPORTS:
            print(f"\n--- Testing Viewport: {name} ({width}x{height}) ---")
            viewport_results = {'width': width, 'height': height, 'interaction_attempted': False, 'interaction_success': False}
            report_data['viewports'][name] = viewport_results

            try:
                print(f"  Resizing window to {width}x{height}")
                driver.set_window_size(width, height)
                time.sleep(1) # Allow resize to settle

                print(f"  Navigating to {TARGET_URL}...")
                driver.get(TARGET_URL)

                # Wait for a key element of the entrance screen to be visible
                print("  Waiting for entrance screen title container...")
                WebDriverWait(driver, WAIT_TIMEOUT).until(
                    EC.visibility_of_element_located((By.ID, "title-container"))
                )
                print("  Entrance screen loaded.")
                time.sleep(2) # Extra wait for initial animations/video load

                # Initial state capture
                filename, rel_path = capture_screenshot(driver, f"initial_{name}")
                viewport_results['initial_screenshot_filename'] = filename
                viewport_results['initial_screenshot_relative_path'] = rel_path
                viewport_results['initial_logs'] = get_console_logs(driver)

                # --- Simulate Interaction (Only on Desktop for now, can add mobile tap later) ---
                if name == "desktop":
                    viewport_results['interaction_attempted'] = True
                    try:
                        print("  Attempting to click title container...")
                        title_container = WebDriverWait(driver, WAIT_TIMEOUT).until(
                            EC.element_to_be_clickable((By.ID, "title-container"))
                        )
                        title_container.click()
                        print("  Title container clicked. Waiting for transition...")

                        # Wait for main content area to become visible (opacity transition)
                        WebDriverWait(driver, WAIT_TIMEOUT).until(
                            EC.visibility_of_element_located((By.CSS_SELECTOR, "#main-content.visible"))
                        )
                        print("  Main content detected after transition.")
                        time.sleep(1.5) # Allow scroll and post-transition effects to settle

                        # Post-interaction state capture
                        filename, rel_path = capture_screenshot(driver, f"post_interaction_{name}")
                        viewport_results['post_interaction_screenshot_filename'] = filename
                        viewport_results['post_interaction_screenshot_relative_path'] = rel_path
                        viewport_results['post_interaction_logs'] = get_console_logs(driver)
                        viewport_results['interaction_success'] = True

                    except TimeoutException:
                        error_msg = "Timeout waiting for element or transition after click."
                        print(f"  Interaction Error: {error_msg}", file=sys.stderr)
                        viewport_results['interaction_error'] = error_msg
                        # Capture screenshot even if interaction failed mid-way
                        filename, rel_path = capture_screenshot(driver, f"interaction_fail_{name}")
                    except NoSuchElementException:
                         error_msg = "Could not find title container element to click."
                         print(f"  Interaction Error: {error_msg}", file=sys.stderr)
                         viewport_results['interaction_error'] = error_msg
                    except Exception as e:
                         error_msg = f"An unexpected error occurred during interaction: {e}"
                         print(f"  Interaction Error: {error_msg}", file=sys.stderr)
                         viewport_results['interaction_error'] = error_msg

            except TimeoutException:
                print(f"  Timeout waiting for initial page load elements on {name} viewport.", file=sys.stderr)
                viewport_results['initial_logs'] = get_console_logs(driver) # Get logs even on timeout
            except Exception as e:
                print(f"  An error occurred during testing {name} viewport: {e}", file=sys.stderr)
                try:
                    viewport_results['initial_logs'] = get_console_logs(driver) # Try to get logs
                except: pass


    finally:
        print("\n--- Analysis Complete ---")
        if driver:
            print("Closing WebDriver...")
            driver.quit()
            print("WebDriver closed.")

        # Format and save the final report
        format_report(report_data)