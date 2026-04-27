const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
    await page.type('input[type="email"]', 'test@gmail.com');
    await page.type('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // go to sessions
    await page.goto('http://localhost:3000/sessions/5954ede6-1f84-447b-a136-367239d0df40');
    
    // wait for connection
    await page.waitForTimeout(1000);
    
    await page.type('input', 'mkdir testing');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    await page.type('input', 'cd testing');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    await page.screenshot({path: 'test_terminal.png'});
    
    await browser.close();
})();
