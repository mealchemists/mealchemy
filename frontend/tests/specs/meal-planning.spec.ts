import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RecipePage } from '../pages/recipe-page';
import { MealPlanningPage } from '../pages/meal-planning-page';

let loginPage: LoginPage;
let recipePage: RecipePage;
let shoppingListPage: MealPlanningPage;
let mealPlanningPage: MealPlanningPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    recipePage = new RecipePage(page);
    mealPlanningPage = new MealPlanningPage(page);

    await loginPage.goto();
    await loginPage.login('test@email.com', 'password$');
    await mealPlanningPage.navigateToMealPlanning()
});

test('Meal Planning: Add slots ', async ({page}) => {
    await page.getByText('Meal Planning').click();
    await mealPlanningPage.selectMealNumber('1');

    await mealPlanningPage.dragRecipeToDay('Recipe1', 2); 
    
    await mealPlanningPage.selectMealNumber('2');
    await expect(page.locator('div:nth-child(2) > div:nth-child(2) > .rbc-event')).toBeVisible();

    await page.getByRole('button', { name: 'SAVE' }).click();
    await expect(page.getByText('Fill in all slots, or start')).toBeVisible();
});


test('Meal Planning: Delete slots ', async ({page}) => {
    await page.getByText('Meal Planning').click();
    await mealPlanningPage.selectMealNumber('3');
    await mealPlanningPage.assertMealEventsVisible();
    await mealPlanningPage.deleteAllMeals();
    await mealPlanningPage.assertNoMealsExist();    
});

test('Meal Planning: Decrease slots that have Recipe ', async ({page}) => {
    await page.getByText('Meal Planning').click();
    await mealPlanningPage.selectMealNumber('2');
    await mealPlanningPage.dragRecipeToDay('Recipe1', 2); 
    await mealPlanningPage.dragRecipeToDay('Recipe2', 2);
    await mealPlanningPage.selectMealNumber('1');
    await expect(page.locator('div:nth-child(2) > .MuiInputBase-root > .MuiSelect-select')).toHaveText('2');
});

test('Meal Planning: Ensure Persistency ', async ({page}) => {
    await page.getByText('Meal Planning').click();
    await mealPlanningPage.selectMealNumber('1');

    await mealPlanningPage.dragRecipeToDay('Recipe1', 2); 
    await page.getByRole('button', { name: 'SAVE' }).click();
    await expect(page.getByText('Your Meal-Plan has been saved')).toBeVisible();
    await page.goto('http://localhost:3000/#/MealPlanning');

    await expect(page.getByTitle('Recipe1').locator('div')).toBeVisible();

    // go to next week
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByTitle('Recipe1').locator('div')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByTitle('Recipe1').locator('div')).toBeVisible();
});