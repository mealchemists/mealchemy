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
  await recipePage.addManualRecipe('Recipe1');
});

test('Edit Recipe', async({page})=>{
  await page.goto('http://localhost:3000/#/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('demo@email.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password$');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('div').filter({ hasText: /^Recipe1Carrots101525$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Recipe1' })).toBeVisible();
  await page.getByRole('button', { name: 'more' }).nth(1).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.locator('[id="\\:r1r\\:"]').click();
  await page.locator('[id="\\:r1r\\:"]').press('ArrowRight');
  await page.locator('[id="\\:r1r\\:"]').press('ArrowRight');
  await page.locator('[id="\\:r1r\\:"]').press('ArrowRight');
  await page.locator('[id="\\:r1r\\:"]').press('ArrowRight');
  await page.locator('[id="\\:r1r\\:"]').press('ArrowRight');
  await page.locator('[id="\\:r1r\\:"]').fill('Recipe2');
  await page.locator('div').filter({ hasText: /^Tags:Carrots101525$/ }).getByRole('button').click();
  await page.locator('#tags-outlined').click();
  await page.locator('#tags-outlined').fill('Carros');
  await page.locator('#tags-outlined').click();
  await page.locator('#tags-outlined').press('ArrowRight');
  await page.locator('#tags-outlined').fill('');
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: 'Add Ingredient' }).click();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('');
  await page.getByRole('textbox').nth(1).click();
  await page.getByRole('textbox').nth(1).fill('');
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: 'Add Instruction' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.locator('div').filter({ hasText: /^Recipe1Carrots101525$/ }).first().click();
  await page.locator('div').filter({ hasText: /^Recipe1Carrots101525$/ }).first().click();
})


