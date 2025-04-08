// tests/pages/recipe-page.ts
import { Page, expect } from '@playwright/test';

export class RecipePage {
  constructor(private page: Page) { }

  async selectManualRecipe() {
    await this.page.locator('div.searchContainer').getByRole('button', { name: 'more' }).click();
    await this.page.getByRole('menuitem', { name: 'Add Manually' }).click();
  }

  async expectError(text: string) {
    await expect(this.page.getByText(text)).toBeVisible()
  }

  async openEditTagModal(){
    await this.page.locator('div.tagContainer').filter({ hasText: /Tags:/ }).getByRole('button').click();
  }

  async closeEditTagModal(){
    await this.page.getByRole('button', { name: 'Done' }).click();
  }
  async clearCookPrepTime() {
    await this.fillCookTime('');
    await this.fillPrepTime('');
    await this.closeEditTagModal();
  }
  async fillCookTime(cookTime:string) {

    await this.page.getByRole('textbox').first().click();
    await this.page.getByRole('textbox').first().fill(cookTime);
  }
  async fillPrepTime(prepTime:string) {
    await this.page.getByRole('textbox').nth(1).click();
    await this.page.getByRole('textbox').nth(1).fill(prepTime);
  }
  async clearMainIngredient() {
    await this.page.locator('#tags-outlined').click();
    await this.page.getByRole('button', { name: 'Clear' }).click();
  }

  async addManualRecipe(title:string, mainIngredient:string, is_new:boolean) {
    await this.page.getByRole('textbox').nth(1).fill(title);
    await this.openEditTagModal();
    await this.addMainIngredient(mainIngredient, is_new);
    await this.fillCookTime('10');
    await this.fillPrepTime('10');
    await this.closeEditTagModal();
    await this.addIngredient('10', mainIngredient, is_new);
    // Add instructions
    await this.page.locator('ol').getByRole('textbox').fill('Wash ingredients');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByRole('paragraph').getByText(title)).toBeVisible();
  }

  async verifyRecipeExists(name: string) {
    await expect(this.page.getByLabel(name)).toBeVisible();
  }

  async selectRecipeByText(title: string) {
    await this.page.getByRole('paragraph').getByText(title).first().click();
  }

  async openEditMenu() {
    await this.page.getByRole('button', { name: 'more' }).nth(1).click();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();
  }

  async editRecipeTitle(newTitle: string) {
    await this.page.locator('input[type="text"]').first().click();
    await this.page.locator('input[type="text"]').first().fill(newTitle);
  }

  async updateTag(newTag: string, is_new:boolean) {
    await this.openEditTagModal();
    await this.page.locator('#tags-outlined').click();
    await this.addMainIngredient(newTag, is_new);
    await this.fillCookTime('20');
    await this.fillPrepTime('20');
    await this.closeEditTagModal();
  }

  async updateIngredient(quantity: string, name: string,is_new:boolean) {
    await this.page.getByRole('textbox').first().click();
    await this.page.getByRole('textbox').first().fill(quantity);
    await this.page.locator('#tags-outlined').first().click();
    if (is_new){
      await this.page.locator('#tags-outlined').first().fill(name);
      await this.page.locator('#tags-outlined').nth(1).click();
      await this.page.locator('#tags-outlined').nth(1).fill('TestAisle1');
    }else{
      await this.page.getByRole('option', { name }).click();
    }
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async addIngredient(quantity: string, name: string, is_new:boolean) {
    await this.page.getByRole('button', { name: 'Add Ingredient' }).click();
    await this.updateIngredient(quantity, name, is_new);
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


  async addMainIngredient(name: string, is_new: boolean) {
    await this.page.locator('#tags-outlined').click();
    if (is_new){
        await this.page.locator('#tags-outlined').fill(name);
    }else{
      await this.page.getByRole('option', { name }).click();
    }
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
