const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')



describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('log in to application')
    await expect(locator).toBeVisible()
    
    await expect(await page.getByText('username')).toBeVisible()
    await expect(await page.getByTestId('username')).toBeVisible()

    await expect(await page.getByText('password')).toBeVisible()
    await expect(await page.getByTestId('password')).toBeVisible()

    await expect(await page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')
      
      const notifDiv = await page.locator('.notif')
      await expect(notifDiv).toContainText('wrong credentials')
      await expect(notifDiv).toHaveCSS('border-style', 'solid')
      await expect(notifDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'TestTitle', 'TestAuthor', 'TestUrl', true)
      await expect(page.getByText('TestTitle TestAuthor')).toBeVisible()    
      await expect(page.getByText('TestUrl')).not.toBeVisible()    
    })

    describe('A blog can be liked', () => {
      beforeEach(async ({ page }) => {  
        await createBlog(page, 'TestTitle', 'TestAuthor', 'TestUrl', true)
      })

      test('Liking a blog adds one like to its likes', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click()
        await expect(page.getByText('likes 0')).toBeVisible()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1')).toBeVisible()
      })
    })

    /* blogin poiston testaus, mutta ei toimi
    describe('A blog can be deleted by creator', () => {
      beforeEach(async ({ page }) => {  
        await createBlog(page, 'TestTitle', 'TestAuthor', 'TestUrl', true)
      })
  
      test('Deleting a blog and it does not show on blog list', async ({ page }) => {
        await expect(page.getByText('TestTitle TestAuthor')).toBeVisible()    
        await page.getByRole('button', { name: 'view' }).click()
        await page.getByRole('button', { name: 'remove' }).click()
        page.on('dialog', dialog => dialog.accept());
        await expect(page.getByText('TestTitle TestAuthor')).not.toBeVisible()    
      })
    })*/
    
  })
})
