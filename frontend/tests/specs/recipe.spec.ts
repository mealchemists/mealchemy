// tests/recipe.spec.ts
import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RecipePage } from '../pages/recipe-page';

let loginPage: LoginPage;
let recipePage: RecipePage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  recipePage = new RecipePage(page);

  await loginPage.goto();
  await loginPage.login('demo@email.com', 'password$');
});

test('Add Manual recipe', async () => {
  await recipePage.selectManualRecipe();
  await recipePage.addManualRecipe('Recipe1');
});

test('Edit Recipe', async ({ page }) => {
  await recipePage.selectRecipeByText('Recipe1Carrots101525');
  await recipePage.openEditMenu();
  await recipePage.editRecipeTitle('Recipe2');
  await recipePage.updateTag('Tags:Carrots101525', 'Green Onion');
  await recipePage.addIngredient('5', 'Broccoli');
  await recipePage.updateInstruction(0, 'Eat');
  await recipePage.addInstruction('abc');

  await recipePage.save();
  await recipePage.expectRecipeDetailsVisible('Recipe2', 'g Broccoli');
});

test('Create Recipe Validations', async ({ page }) => {
  await recipePage.selectManualRecipe();

  await recipePage.focusTitleInput();
  await recipePage.clearMainIngredient();
  await recipePage.save();
  await recipePage.expectError('Please enter a title');

  await recipePage.enterTitle('Title');
  await recipePage.save();
  await recipePage.expectError('Please enter a main');

  await recipePage.addMainIngredient('Beef Sirloin');
  await recipePage.save();

  await recipePage.expectRecipeVisible('Title', 'Beef Sirloin');
});

test('Delete Recipe', async ({ page }) => {
  await page.goto('http://localhost:3000/#/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('demo@email.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password$');
  await page.getByRole('button', { name: 'Login' }).click();
});
