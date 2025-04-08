// tests/recipe.spec.ts
import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RecipePage } from '../pages/recipe-page';
import {jwtToken} from '../../src/api/recipes';
import {useAuth} from '../../src/api/useAuth';

let loginPage: LoginPage;
let recipePage: RecipePage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  recipePage = new RecipePage(page);

  await loginPage.goto();
  await loginPage.login('test@email.com', 'password$');
});

test('Add Manual recipe', async () => {
  await recipePage.selectManualRecipe();
  await recipePage.addManualRecipe('Recipe1', 'Oranges',true);
});

test('Edit Recipe', async ({ page }) => {
  await recipePage.selectRecipeByText('Recipe1');
  await recipePage.openEditMenu();
  await recipePage.editRecipeTitle('Recipe2');
  await recipePage.updateTag('Broccoli',true);
  await recipePage.addIngredient('5', 'Broccoli',true);
  await recipePage.updateInstruction(0, 'Eat');
  await recipePage.addInstruction('abc');

  await recipePage.save();
  await expect(page.getByRole('paragraph').getByText('Recipe2')).toBeVisible();
});

test('Create Recipe Validations', async ({ page }) => {
  await recipePage.selectManualRecipe();

  await recipePage.editRecipeTitle(' ');
  await recipePage.openEditTagModal();
  await recipePage.clearMainIngredient();
  await page.getByRole('heading', { name: 'Edit Tags' }).click();
  await recipePage.clearCookPrepTime();
  await recipePage.save();

  await recipePage.expectError('Please enter a title');
  await recipePage.editRecipeTitle('Recipe3');
  await recipePage.save();

  await recipePage.expectError('Please enter a Main Ingredient Tag');
  await recipePage.openEditTagModal();
  await recipePage.addMainIngredient('Beef Sirloin', true);
  await recipePage.closeEditTagModal();
  await recipePage.save();

  await recipePage.expectError('Please enter a cook time');
  await recipePage.openEditTagModal();
  await recipePage.fillCookTime('10');
  await recipePage.closeEditTagModal();
  await recipePage.save();

  await recipePage.expectError('Please enter a prep time');
  await recipePage.openEditTagModal();
  await recipePage.fillPrepTime('10');
  await recipePage.closeEditTagModal();
  await recipePage.save();

  await recipePage.expectError('Please enter steps');
  await recipePage.addInstruction('abc', 0);
  await recipePage.save();

  await recipePage.expectError('Please enter ingredients');
  await recipePage.addIngredient('5', 'Broccoli', false);
  await recipePage.save();

  await expect(page.locator('span').filter({ hasText: 'Recipe3' })).toBeVisible();
});

test('Delete Recipe', async ({ page }) => {
  await recipePage.openMoreMenu();
  await recipePage.selectRecipes([0]);
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Recipe2')).toHaveCount(0);

  await recipePage.openMoreMenu();
  await recipePage.selectRecipes([0]);
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Recipe3')).toHaveCount(0);
});
test('Add Emoji', async({page})=>{
  await recipePage.selectManualRecipe();
  await recipePage.addManualRecipe('🍔', '🍔', true);

})
test('Delete All Recipes', async ({ page }) => {
  await recipePage.selectManualRecipe();
  await recipePage.addManualRecipe('Recipe1', 'Water', true);
  await recipePage.selectManualRecipe();
  await recipePage.addManualRecipe('Recipe2', 'Lemon', true);

  await recipePage.openMoreMenu();
  await recipePage.selectRecipes([0,1,2]);
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Recipe1')).toHaveCount(0);
  await expect(page.getByText('Recipe2')).toHaveCount(0);

});

test('Filters', async ({ page }) => {
  await recipePage.selectManualRecipe();
  await recipePage.addManualRecipe('Recipe1', 'Water', false);
  await recipePage.selectManualRecipe();
  await recipePage.addManualRecipe('Recipe2', 'Lemon', false);

  // filter by name
  await page.locator('div.searchContainer').getByRole('textbox').click();
  await page.getByRole('textbox').fill('Recipe1');
  await expect(page.locator('div.itemContainer:has-text("Recipe2")')).toHaveCount(0);

  // clear searchbox
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('');

  await page.waitForTimeout(2000);

  // open filter box
  await page.getByRole('button').nth(2).click();
  await page.getByRole('combobox', { name: 'Search...' }).click();

  await page.getByRole('option', { name: 'Water' }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();

  await expect(page.locator('div').filter({ hasText: /^Main Ingredient: Water$/ })).toBeVisible();

  // open filter box
  await page.getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Reset Filters' }).click();

  await page.locator('a').click();
  await page.getByRole('button').nth(2).click();
 
  const thumbs = page.locator('.MuiSlider-thumb');

    // Move RIGHT thumb to the left by 50px
    const rightBox = await thumbs.last().boundingBox();
    if (rightBox) {
      const startX = rightBox.x + rightBox.width / 2;
      const startY = rightBox.y + rightBox.height / 2;
    
      await page.mouse.move(startX+10, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 80, startY); // drag left by 50px
      await page.mouse.up();
    }

  const leftBox = await thumbs.first().boundingBox();
  if (leftBox) {
    const startX = leftBox.x + leftBox.width / 2;
    const startY = leftBox.y + leftBox.height / 2;
  
    await page.mouse.move(startX+10, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY); // drag right by 50px
    await page.mouse.up();
  }
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(2000);
  const hasChildren = await page.locator('.recipeListContainer > *').count();
  
  expect(hasChildren).toBe(0);

  })

test('Post request invalid', async ({ page, request }) => {
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
  // delay to allow user to login
  await page.waitForTimeout(2000);

  let email = 'test@email.com';
  const url = `http://localhost:8000/api/get-jwt-token/${encodeURIComponent(email)}`;

  const tokenResponse = await page.request.get(
   url
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
  // Now navigate to the recipe page and check that it's displayed
  await page.reload();
  await expect(page.getByTestId('WarningAmberIcon').locator('path').first()).toBeVisible();

  await page.getByRole('button', { name: 'more' }).click();
  await page.getByRole('menuitem', { name: 'Select' }).click();
  await page.getByRole('checkbox').nth(2).check();
  // add to Shopping List
  await page.getByRole('button', { name: 'Add to Shopping List' }).click();
  await expect(page.getByText('Cannot add malformed recipes')).toBeVisible();

  // Check Meal Planning
  await page.getByText('Meal Planning').click();
  await expect(page.getByLabel('Oven Roasted Red Potatoes and')).not.toBeVisible();
  
})
