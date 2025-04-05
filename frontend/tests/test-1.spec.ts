import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Check login
  await page.goto('http://localhost:3000/#/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('demo@email.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password$');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();

  // Check logout
  await page.getByRole('navigation').getByRole('button').click();
  await expect(page.getByText('demo@email.com')).toBeVisible();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

  // Check signup
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('test1@email.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password$');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password$');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).click();

  // Login to new user
  await page.getByRole('textbox', { name: 'Email' }).fill('test1@email.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password$');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.getByText('Create a recipe or select a').click();

  // update password
  await page.getByRole('navigation').getByRole('button').click();
  await page.getByRole('button', { name: 'Change Password' }).click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('password!');
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).click();
  // login with new password
  await page.getByRole('textbox', { name: 'Email' }).fill('test1@email.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();

  // Manually add recipe
  await page.getByRole('button', { name: 'more' }).click();
  await page.getByRole('menuitem', { name: 'Add Manually' }).click();
  await page.getByRole('textbox').nth(1).click();
  await page.getByRole('textbox').nth(1).fill('Recipe1');
  await page.locator('div').filter({ hasText: /^Tags:Main Ingredient000$/ }).getByRole('button').click();
  await page.locator('#tags-outlined').click();
  await page.getByRole('option', { name: 'Carrots' }).click();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('10');
  await page.getByRole('textbox').nth(1).click();
  await page.getByRole('textbox').nth(1).fill('15');
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: 'Add Ingredient' }).click();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('10');
  await page.locator('#tags-outlined').first().click();
  await page.getByRole('option', { name: 'Red Bell Pepper' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: 'Add Ingredient' }).click();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('20');
  await page.locator('#tags-outlined').click();
  await page.locator('#tags-outlined').fill('Strawberries');
  await expect(page.getByText('Grocery Aisle')).toBeVisible();
  await page.locator('#tags-outlined').nth(1).click();
  await page.locator('#tags-outlined').nth(1).fill('Produce');
  await page.getByRole('button', { name: 'Done' }).click();
  await page.locator('ol').getByRole('textbox').click();
  await page.locator('ol').getByRole('textbox').fill('Wash ingredients');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('paragraph').getByText('Recipe1')).toBeVisible();

  // Edit Recipe
  await page.getByRole('button', { name: 'more' }).nth(1).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Add Ingredient' }).click();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('30');
  await page.locator('#tags-outlined').first().click();
  await page.getByRole('option', { name: 'Beef Sirloin' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.locator('[id="\\:r6l\\:"]').click();
  await page.locator('[id="\\:r6l\\:"]').press('ArrowRight');
  await page.locator('[id="\\:r6l\\:"]').fill('Mangoes');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('g Mangoes')).toBeVisible();
  await page.getByText('g Beef Sirloin').click();
});

