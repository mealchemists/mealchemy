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
    await loginPage.login('demo@email.com', 'password$');
});

test('Recipes: Add To Shopping List ', async ({ page }) => {
    await recipePage.openMoreMenu();
    await recipePage.selectRecipes([0, 1]);
    await recipePage.addToShoppingList();

    await shoppingListPage.navigateToShoppingList();

    // Go to Shopping List and verify
    await shoppingListPage.assertRecipeVisible('Beef Stirfry');
    await shoppingListPage.assertRecipeVisible('Honey Garlic Pork Chops');
});

test('Recipes: EditToExistingAisle ', async ({ page }) => {
    await shoppingListPage.navigateToShoppingList();
    // Move 'ketchup' from Dairy to Snacks
    await shoppingListPage.openCategory('Dairy');
    await shoppingListPage.editIngredientCategory('ketchup', 'Snacks');
    await shoppingListPage.openCategory('Snacks');
    await shoppingListPage.assertIngredientVisible('ketchup');

    // Move 'ketchup' from Snacks to Condiments
    await shoppingListPage.editIngredientCategory('ketchup', 'Condiments');
    await shoppingListPage.openCategory('Condiments');
    await shoppingListPage.assertIngredientVisible('ketchup');
});

test('Delete Recipes', async ({ page }) => {
    const shoppingListPage = new ShoppingListPage(page);
    await page.getByRole('navigation').locator('li', { hasText: 'Shopping List' }).click();
    // Move 'ketchup' from Dairy to Snacks
    await page.getByRole('listitem').filter({ hasText: 'Beef Stirfry' }).getByRole('checkbox').check();
    await page.getByRole('listitem').filter({ hasText: 'Honey Garlic Pork Chops' }).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByRole('list').filter({ hasText: /^$/ })).toBeVisible();
});

test('Meal Planning: Add To Shopping List ', async ({ page }) => {

    await mealPlanningPage.navigateToMealPlanning();
    await mealPlanningPage.selectMealNumber('2');

    await mealPlanningPage.dragRecipeToDay('Beef Stirfrybeef321951', 2); 
    await mealPlanningPage.dragRecipeToDay('Honey Garlic Pork Chopspork441357', 2); 

    await mealPlanningPage.saveMealPlan();
    await expect(page.getByText('Your Meal-Plan has been saved')).toBeVisible();
    await mealPlanningPage.addToShoppingListFromMealPlan();

    await shoppingListPage.navigateToShoppingList();
    await shoppingListPage.assertRecipeVisible('Beef Stirfry');
    await shoppingListPage.assertRecipeVisible('Honey Garlic Pork Chops');

});
