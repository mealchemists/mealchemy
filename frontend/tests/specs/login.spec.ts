// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RecipePage } from '../pages/recipe-page';

let loginPage: LoginPage;
let recipePage: RecipePage;

// test.beforeEach(async ({ page }) => {
//     loginPage = new LoginPage(page);
//     recipePage = new RecipePage(page);

//     await loginPage.goto();
//     await loginPage.login('demo@email.com', 'password$');
//   });
test('SignUp', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signup("test@email.com", "password!", "password!");
    await page.waitForTimeout(3000);

});

test('SignInNew', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login("test@email.com", "password!");
});

test('loginLogout', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Login
    await loginPage.login("test@email.com", "password!");
    await expect(page.getByRole('navigation')).toBeVisible();
    // Logout
    await loginPage.logout();
});

test('notEmailLogin', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('fake', 'password$');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

})
test('noAccountLogin', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('fake@email.com', 'password$');
    await expect(page.getByText('Invalid credentials')).toBeVisible();
});

test('Invalid password: too short', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.signup('newUser@email.com', 'short', 'short');
    await expect(page.getByText('Password must be at least 6')).toBeVisible();
});

test('Invalid password: mismatch', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.signup('newUser@email.com', 'password1', 'password2');
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
});

test('Invalid password: too long', async ({ page }) => {
    const longPassword = 'a'.repeat(51);
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.signup('newUser@email.com', longPassword, longPassword);
    await expect(page.getByText('Password cannot exceed 50')).toBeVisible();
});

test('Signup: blank inputs', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.signup('', "", "");
    await expect(page.getByText('Email is required.')).toBeVisible();
});

test('Invalid password: special character', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.signup('newUser@email.com', "Password", "Password");
    await expect(page.getByText('Password must contain at')).toBeVisible();
});


test('changePassword', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("test@email.com", "password!");
    await expect(page.getByRole('navigation')).toBeVisible();

    // check we can login with new password
    await loginPage.changePassword('password$');
    await loginPage.login('test@email.com', 'password$');
})

test('changePasswordShort', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("test@email.com", "password$");
    await expect(page.getByRole('navigation')).toBeVisible();

    // check we can login with new password
    await loginPage.changePassword('pass');
    await expect(page.getByText('Password must be at least 6')).toBeVisible();
})

test('changePasswordLong', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("test@email.com", "password$");
    await expect(page.getByRole('navigation')).toBeVisible();

    const longPassword = 'a'.repeat(51);
    await loginPage.changePassword(longPassword);
    await expect(page.getByText('Password cannot exceed 50')).toBeVisible();
})

test('changePasswordSpecialCharacter', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("test@email.com", "password$");
    await expect(page.getByRole('navigation')).toBeVisible();

    await loginPage.changePassword("Password");
    await expect(page.getByText('Password must contain at')).toBeVisible();
})

test('changePasswordBlank', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("test@email.com", "password$");
    await expect(page.getByRole('navigation')).toBeVisible();

    await loginPage.changePassword("");
    await expect(page.getByText('Password must be at least 6')).toBeVisible();
})
test('forgotPasswordUI', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.getByRole('button', { name: 'Forgot Password?' }).click();
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Password Reset Link' })).toBeVisible();
    await page.getByRole('button', { name: 'Forgot Password?' }).click();
    await page.getByRole('button', { name: 'Send Password Reset Link' }).click();
    await expect(page.getByText('Email is required.')).toBeVisible();
    await page.getByRole('button', { name: 'Back to Login' }).click();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
})