import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertTrue;
import static junit.framework.Assert.fail;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.By.ById;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.IOException;
import org.openqa.selenium.NoSuchElementException;

public class SettingsClickTest {
  private static String baseUrl;
  private static WebDriver driver;
  private static WebElement settingsIcon;
  private static WebElement cancelButton;

  @BeforeClass
  public static void openBrowserAndLogin() {
    baseUrl = System.getProperty("webdriver.base.url");
    driver = new ChromeDriver();
    driver.get(baseUrl);
    WebElement usernameBox = (new WebDriverWait(driver, 10))
                             .until(ExpectedConditions.presenceOfElementLocated(By.id("id_username")));
    usernameBox.sendKeys("user35");
    WebElement passwordBox = (new WebDriverWait(driver, 10))
                             .until(ExpectedConditions.presenceOfElementLocated(By.id("id_password")));
    passwordBox.sendKeys("test");
    passwordBox.submit();
    settingsIcon = (new WebDriverWait(driver, 10))
                    .until(ExpectedConditions.presenceOfElementLocated(By.id("settings-icon")));
  }

  @Before
  public void clickSettings() {
    settingsIcon.click();
    cancelButton = (new WebDriverWait(driver, 10))
        .until(ExpectedConditions.presenceOfElementLocated(By.id("cancel-settings")));
  }

  @Test
  public void testSettingsCancel() throws IOException {
    cancelButton.click();
    (new WebDriverWait(driver, 3))
        .until(ExpectedConditions.invisibilityOfElementLocated(By.id("cancel-settings")));
  }
}
