// tests/pages/recipe-page.ts
import { Page, expect } from '@playwright/test';

export class RecipePage {
  constructor(private page: Page) { }

  async selectManualRecipe() {
    await this.page.getByRole('button', { name: 'more' }).click();
    await this.page.getByRole('menuitem', { name: 'Add Manually' }).click();
  }
  async focusTitleInput() {
    await this.page.getByRole('textbox').nth(1).click();
  }
  async expectError(text: string) {
    await expect(this.page.getByText(text)).toBeVisible()
  }
  async enterTitle(title: string) {
    await this.page.locator('input[type="text"]').click();
    await this.page.locator('input[type="text"]').fill(title);
  }
  async clearCookPrepTime() {
    await this.page.locator('div').filter({ hasText: /^Tags:000$/ }).getByRole('button').click();
    await this.page.getByRole('textbox').first().click();
    await this.page.getByRole('textbox').first().fill('');
    await this.page.getByRole('textbox').nth(1).click();
    await this.page.getByRole('textbox').nth(1).fill('');
    await this.page.getByRole('button', { name: 'Done' }).click();
  }
  async fillCookTime() {
    await this.page.locator('div').filter({ hasText: /^Tags:0$/ }).getByRole('button').click();
    await this.page.getByRole('textbox').first().click();
    await this.page.getByRole('textbox').first().fill('10');
    await this.page.getByRole('button', { name: 'Done' }).click();
  }
  async fillPrepTime() {
    await this.page.locator('div').filter({ hasText: /^Tags:1010$/ }).getByRole('button').click();    
    await this.page.getByRole('textbox').nth(1).click();
    await this.page.getByRole('textbox').nth(1).fill('10');
    await this.page.getByRole('button', { name: 'Done' }).click();
  }
  async clearMainIngredient() {
    await this.page.locator('div').filter({ hasText: /^Tags:Main Ingredient000$/ }).getByRole('button').click();
    await this.page.locator('#tags-outlined').click();
    await this.page.getByRole('button', { name: 'Clear' }).click();
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async addManualRecipe(title) {
    await this.page.getByRole('textbox').nth(1).fill(title);
    await this.page.locator('div', { hasText: /^Tags:Main Ingredient000$/ }).getByRole('button').click();
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
    await this.page.locator('#tags-outlined').fill('Pineapples');
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

  async selectRecipeByText(text: string) {
    await this.page.locator('div').filter({ hasText: new RegExp(`^${text}$`) }).first().click();
  }

  async openEditMenu() {
    await this.page.getByRole('button', { name: 'more' }).nth(1).click();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();
  }

  async editRecipeTitle(newTitle: string) {

    const titleInput = this.page.locator('[id="\\:r1r\\:"]');
    await titleInput.click();
    await titleInput.fill(newTitle);
  }

  async updateTag(tagText: string, newTag: string) {
    await this.page.locator('div').filter({ hasText: new RegExp(`^${tagText}$`) }).getByRole('button').click();
    await this.page.locator('#tags-outlined').click();
    await this.page.getByRole('option', { name: newTag }).click();
    await this.page.getByRole('textbox').first().click();
    await this.page.getByRole('textbox').first().fill('15');
    await this.page.getByRole('textbox').nth(1).click();
    await this.page.getByRole('textbox').nth(1).fill('13');
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async updateIngredient(index: number, quantity: string, name: string) {
    await this.page.getByRole('textbox').first().click();
    await this.page.getByRole('textbox').first().fill(quantity);
    await this.page.locator('#tags-outlined').first().click();
    await this.page.getByRole('option', { name }).click();
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async addIngredient(quantity: string, name: string) {
    await this.page.getByRole('button', { name: 'Add Ingredient' }).click();
    await this.updateIngredient(1, quantity, name);
  }

  async updateInstruction(index: number, text: string) {
    const textbox = this.page.locator('ol').getByRole('textbox').nth(index);
    await textbox.click();
    await textbox.fill(text);
  }

  async addInstruction(text: string, index = 1) {
    await this.page.getByRole('button', { name: 'Add Instruction' }).click();
    await this.updateInstruction(index, text);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async expectRecipeDetailsVisible(title: string, ingredient: string) {
    await expect(this.page.locator('span').filter({ hasText: title })).toBeVisible();
    await expect(this.page.getByText(ingredient)).toBeVisible();
  }
  async addMainIngredient(name: string, tags='000') {
    await this.page.locator('div')  .filter({ hasText: new RegExp(`^Tags:${tags}$`) }).getByRole('button').click();
    await this.page.locator('#tags-outlined').click();
    await this.page.getByRole('option', { name }).click();
    await this.page.getByRole('button', { name: 'Done' }).click();
  }
  async expectRecipeVisible(title: string, ingredient: string) {
    await expect(
      this.page.locator('div').filter({ hasText: new RegExp(`^${title}${ingredient}$`) }).first()
    ).toBeVisible();
  }

  async openMoreMenu(recipeIndex = 0) {
    await this.page.getByRole('button', { name: 'more' }).nth(recipeIndex).click();
  }

  async selectRecipes(indices: number[]) {
    await this.page.getByRole('menuitem', { name: 'Select' }).click();
    for (const index of indices) {
      await this.page.getByRole('checkbox').nth(index).check();
    }
  }

  async addToShoppingList() {
    await this.page.getByRole('button', { name: 'Add to Shopping List' }).click();
    await expect(this.page.getByText('Added to Shopping List!')).toBeVisible();
  }
}
