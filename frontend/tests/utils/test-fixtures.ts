export async function loginUser(page) {
    await page.goto('/login');
    await page.fill('#username', 'test');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
  }