import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RecipePage } from '../pages/recipe-page';
import { ShoppingListPage } from '../pages/shopping-list-page';
import { MealPlanningPage } from '../pages/meal-planning-page';

let loginPage: LoginPage;
let recipePage: RecipePage;
let shoppingListPage: ShoppingListPage;
let mealPlanningPage: MealPlanningPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    recipePage = new RecipePage(page);
    shoppingListPage = new ShoppingListPage(page);
    mealPlanningPage = new MealPlanningPage(page);
    await loginPage.goto();
    await loginPage.login('test@email.com', 'password$');
});

test('Recipes: Add To Shopping List ', async ({ page }) => {
    await recipePage.openMoreMenu();
    await recipePage.selectRecipes([0, 1]);
    await recipePage.addToShoppingList();

    await shoppingListPage.navigateToShoppingList();

    // Go to Shopping List and verify
    await shoppingListPage.assertRecipeVisible('Recipe1');
    await shoppingListPage.assertRecipeVisible('Recipe2');
});
test('Shopping List: Cross Off ', async ({ page }) => {
    await shoppingListPage.navigateToShoppingList();
    await page.locator('div').filter({ hasText: /^Water10 gMove$/ }).getByRole('checkbox').check();
    await page.locator('div').filter({ hasText: /^Water10 gMove$/ }).getByRole('checkbox').uncheck();

});
test('Shopping List: EditToExistingAisle ', async ({ page }) => {
    await shoppingListPage.navigateToShoppingList();
    // Move 'TestAisle1' from TestAisle1 to Snacks
    await shoppingListPage.openCategory('TestAisle1');
    await shoppingListPage.editIngredientCategory('Water', 'Beverages');
    await page.waitForTimeout(1500);
    await shoppingListPage.assertIngredientVisible('Water');

});

test('Shopping List: EditToNewAisle ', async ({ page }) => {
    await shoppingListPage.navigateToShoppingList();
    // Move 'TestAisle1' from TestAisle1 to Snacks
    await shoppingListPage.openCategory('Beverages');
    await shoppingListPage.editIngredientCategory('Water', 'TestAisle1');
    await page.waitForTimeout(1500);
    await shoppingListPage.assertIngredientVisible('Water');

});

test('Shopping List: Delete Recipes', async ({ page }) => {
    await page.getByRole('navigation').locator('li', { hasText: 'Shopping List' }).click();
    await page.getByRole('listitem').filter({ hasText: 'Recipe1' }).getByRole('checkbox').check();
    await page.getByRole('listitem').filter({ hasText: 'Recipe2' }).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByRole('list').filter({ hasText: /^$/ })).toBeVisible();
});

test('Meal Planning: Add To Shopping List ', async ({ page }) => {

    await mealPlanningPage.navigateToMealPlanning();
    await mealPlanningPage.selectMealNumber('2');

    await mealPlanningPage.dragRecipeToDay('Recipe1', 2); 
    await mealPlanningPage.dragRecipeToDay('Recipe2', 2); 

    await mealPlanningPage.saveMealPlan();
    await expect(page.getByText('Your Meal-Plan has been saved')).toBeVisible();
    await mealPlanningPage.addToShoppingListFromMealPlan();

    await shoppingListPage.navigateToShoppingList();
    await shoppingListPage.assertRecipeVisible('Recipe1');
    await shoppingListPage.assertRecipeVisible('Recipe2');

});
