import { expect, Page } from '@playwright/test';

export class MealPlanningPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToMealPlanning() {
        await this.page.getByRole('navigation').locator('li', { hasText: 'Meal Planning' }).click();
    }

    async selectMealNumber(mealNumber: string) {
        await this.page.locator('div:nth-child(2) > .MuiInputBase-root > .MuiSelect-select').click();
        await this.page.getByRole('option', { name: mealNumber }).click();
    }

    async dragRecipeToDay(recipeText: string, dayIndex: number) {
        const source = await this.page.getByText(recipeText);
        const target = await this.page.locator(`.rbc-row-bg > div:nth-child(${dayIndex})`);
        await source.dragTo(target);
    }

    async saveMealPlan() {
        await this.page.getByRole('button', { name: 'SAVE' }).click();
    }

    async addToShoppingListFromMealPlan() {
        await this.page.getByRole('button', { name: 'Add to Shopping List' }).click();
        await expect(this.page.getByText('Added to Shopping List!')).toBeVisible();
    }

    async assertMealEventsVisible() {
        await expect(this.page.locator('.rbc-event').first()).toBeVisible();
        await expect(this.page.locator('div:nth-child(2) > div:nth-child(2) > .rbc-event')).toBeVisible();
        await expect(this.page.locator('div:nth-child(3) > div:nth-child(2) > .rbc-event')).toBeVisible();
    }

    async deleteAllMeals() {
        const deleteRows = this.page.getByRole('row', { name: /Drag meal here/ });
        const deleteButtons = deleteRows.getByRole('button');
        const count = await deleteButtons.count();
        for (let i = count - 1; i >= 0; i--) {
            await deleteButtons.nth(i).click();
        }
    }
    
    async assertNoMealsExist() {
        await expect(this.page.locator('.rbc-event')).toHaveCount(0);
    }
}
