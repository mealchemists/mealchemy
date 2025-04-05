// tests/pages/login-page.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000/#/login');
  }

  async login(email: string, password: string) {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
    
  }

  async logout() {
    await this.page.getByRole('navigation').getByRole('button').click();
    await this.page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
  }

  async changePassword(newPassword: string) {
    await this.page.getByRole('navigation').getByRole('button').click();
    await this.page.getByRole('button', { name: 'Change Password' }).click();
    await this.page.getByRole('textbox').fill(newPassword);
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async signup(email: string, password: string, confirmPassword: string) {
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await this.page.getByRole('textbox', { name: 'Confirm Password' }).fill(confirmPassword);
    await this.page.getByRole('button', { name: 'Register' }).click();
  }
}
