import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import java.io.IOException;

public class LoginRedirectTest {
  private String baseUrl;
  private WebDriver driver;

  @Before
  public void openBrowser() {
    baseUrl = System.getProperty("webdriver.base.url");
    driver = new ChromeDriver();
    driver.get(baseUrl);
  }

  @After
  public void closeBrowser() {
    driver.close();
  }

  @Test
  public void testStartPageDoesntWorkWithoutLogin() throws IOException {
    String start_url = baseUrl + "/anfang/start";
    driver.get(start_url);
    String final_url = driver.getCurrentUrl();
    assertEquals("Was not redirected to login page from start page url!", final_url, baseUrl + "/account/login/");
  }
}
