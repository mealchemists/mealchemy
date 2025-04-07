// tests/recipe.spec.ts
import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RecipePage } from '../pages/recipe-page';
import {jwtToken} from '../../src/api/recipes';

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
  await recipePage.clearCookPrepTime();
  await recipePage.save();

  await recipePage.expectError('Please enter a title');
  await recipePage.enterTitle('Title');
  await recipePage.save();

  await recipePage.expectError('Please enter a cook time');
  await recipePage.fillCookTime();
  await recipePage.save();

  await recipePage.expectError('Please enter a prep time');

  await recipePage.fillPrepTime();
  await recipePage.save();

  await recipePage.expectError('Please enter steps');
  await recipePage.addInstruction('abc', 0);
  await recipePage.save();

  await recipePage.expectError('Please enter ingredients');
  await recipePage.addIngredient('5', 'Broccoli');
  await recipePage.save();

  await recipePage.expectError('Please enter a Main Ingredient Tag');
  await recipePage.addMainIngredient('Beef Sirloin', '101020');
  await recipePage.save();
  await expect(page.locator('span').filter({ hasText: 'Title' })).toBeVisible();
});

test('Delete Recipe', async ({ page }) => {
  await recipePage.openMoreMenu();
  await recipePage.selectRecipes([2]);
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Recipe2')).toHaveCount(0);
});

test('Filters', async ({ page }) => {
  await page.locator('.searchMiddle').getByRole('textbox').click();
  await page.getByRole('textbox').fill('beef');
  await expect(page.getByText('Beef Stirfry')).toBeVisible();
  await page.getByText('Title').click();
  await page.getByRole('button').nth(2).click();
  await page.getByRole('radio', { name: 'Cooking Time' }).check();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await expect(page.getByRole('paragraph').getByText('Title')).toBeVisible();
  await page.getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Reset Filters' }).click();
  await page.locator('a').click();
  await expect(page.getByText('Beef Stirfry')).toBeVisible();
  await page.getByRole('button').nth(2).click();
  await page.getByRole('combobox', { name: 'Search...' }).click();
  await page.getByRole('option', { name: 'beef', exact: true }).click();
  await page.locator('.MuiSlider-rail').click();
  await page.locator('span').filter({ hasText: '50' }).nth(1).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await expect(page.getByText('Beef Stirfry')).toBeVisible();
})

test('Post request invalid cook_time', async ({ page, request }) => {
  const body = {
    "recipe": {
      "name": "Oven Roasted Red Potatoes and Asparagus",
      "description": "These garlicky roasted potatoes and asparagus are easy and delicious served either hot or cold. Rosemary and thyme give it a sophisticated flavor. Try adding a little chopped red pepper too \u2014 yum!",
      "main_ingredient": "asparagus",
      "source_url": "https://www.allrecipes.com/recipe/60924/oven-roasted-red-potatoes-and-asparagus/",
      "cook_time": null,
      "prep_time": 15,
      "total_time": 55
    },
    "ingredients": [
      { "name": "red potatoes", "quantity": 1.5, "unit": "lb" },
      ],
    "steps": [{"step_number":"1", "description":"wash"}],
    "added_by_extractor": true
  }
  // TODO: ADD a delay to allow user to login
  await page.waitForTimeout(2000);

  const tokenResponse = await page.request.get(
    'http://localhost:8000/api/get-jwt-token/5'
  );
  const token = await tokenResponse.json(); 
  const accessToken = token.access_token; 

  // Send request to the endpoint
  const response = await request.post(
    'http://localhost:8000/api/save-scraped-data/', 
    {
      data: body,
      headers: {
        "Authorization": `Bearer ${accessToken}`,  
      },
    }
  );
  await expect(page.getByText('Cannot add malformed recipes')).toBeVisible();

  // Now navigate to the recipe page and check that it's displayed
  await page.goto('http://localhost:3000/#/Recipes');

  await page.getByRole('button', { name: 'more' }).click();
  await page.getByRole('menuitem', { name: 'Select' }).click();
  await page.getByRole('checkbox').nth(4).check();
  await page.getByRole('button', { name: 'Add to Shopping List' }).click();
  await expect(page.getByText('Cannot add malformed recipes')).toBeVisible();
  await expect(page.getByTestId('WarningAmberIcon').locator('path').first()).toBeVisible();
  await page.getByText('Meal Planning').click();
  await expect(page.getByLabel('Oven Roasted Red Potatoes and')).not.toBeVisible();
  
})