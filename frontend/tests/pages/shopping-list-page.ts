// recipe-page.ts
import { expect, Page } from '@playwright/test';

export class ShoppingListPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToShoppingList() {
        await this.page.getByText('Shopping List').click();
    }

    async assertRecipeVisible(recipeName: string) {
        await expect(this.page.getByText(recipeName)).toBeVisible();
    }
    async openCategory(categoryName: string) {
        await this.page.getByRole('button', { name: categoryName }).click();
    }

    async editIngredientCategory(ingredientName: string, newCategory: string) {
        await this.page.locator('div').filter({
            hasText: new RegExp(`^${ingredientName}\\d+\\s\\w+Move$`)
        }).getByRole('button').click();

        await this.page.locator('#tags-outlined').click();
        await this.page.locator('#tags-outlined').fill(newCategory);
        await this.page.getByRole('button', { name: 'Done' }).click();
    }

    async assertIngredientVisible(ingredientName: string) {
        await expect(this.page.getByText(ingredientName)).toBeVisible();
    }
}
