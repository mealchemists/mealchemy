// tests/pages/recipe-page.ts
import { Page, expect } from '@playwright/test';

export class RecipePage {
  constructor(private page: Page) {}

  async addManualRecipe(title) {
    await this.page.getByRole('button', { name: 'more' }).click();
    await this.page.getByRole('menuitem', { name: 'Add Manually' }).click();
    await this.page.getByRole('textbox').nth(1).fill(title);
    await this.page.locator('#tags-outlined').click();
    await this.page.getByRole('option', { name: 'Carrots' }).click();
    await this.page.getByRole('textbox').first().fill('10');
    await this.page.getByRole('textbox').nth(1).fill('15');
    await this.page.getByRole('button', { name: 'Done' }).click();

    // Add Ingredient 1
    await this.page.getByRole('button', { name: 'Add Ingredient' }).click();
    await this.page.getByRole('textbox').first().fill('10');
    await this.page.locator('#tags-outlined').first().click();
    await this.page.getByRole('option', { name: 'Red Bell Pepper' }).click();
    await this.page.getByRole('button', { name: 'Done' }).click();

    // Add Ingredient 2
    await this.page.getByRole('button', { name: 'Add Ingredient' }).click();
    await this.page.getByRole('textbox').first().fill('20');
    await this.page.locator('#tags-outlined').fill('Strawberries');
    await this.page.locator('#tags-outlined').nth(1).fill('Produce');
    await this.page.getByRole('button', { name: 'Done' }).click();

    // Add instructions
    await this.page.locator('ol').getByRole('textbox').fill('Wash ingredients');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByRole('paragraph').getByText('Recipe1')).toBeVisible();
  }

  async verifyRecipeExists(name: string) {
    await expect(this.page.getByLabel(name)).toBeVisible();
  }
}
