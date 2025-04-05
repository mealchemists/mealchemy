// tests/recipe.spec.ts
import { test } from '@playwright/test';
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

test('Can add a manual recipe', async () => {
  await recipePage.addManualRecipe('Recipe1');
});

test('Can view specific recipe', async () => {
  await recipePage.verifyRecipeExists('Honey Garlic Pork Chops');
});


