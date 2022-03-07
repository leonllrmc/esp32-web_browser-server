const express = require('express');
const path = require('path');
const logger = require('morgan');
const puppeteer = require('puppeteer');
const Jimp = require('jimp');
const fs = require('fs');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/screen', async function(req, res) {
    try {
        const frameBuffer = Array(128);
        for(let y = 0;y < 160; y++) {
            frameBuffer[y] = Array(160);
        }
        const id = Date.now() + "-" + Math.random().toString(36).substring(2, 5);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.emulate(puppeteer.devices['Galaxy Note 3'])
        await page.goto(req.query.url.toString());
        await page.waitForSelector('body', {
            visible: true
        });
        await page.waitForNetworkIdle();
        await page.waitForTimeout(500);
        const img_buf = await page.screenshot();
        await browser.close();

        const img = await Jimp.read(img_buf);
        img.resize(128, 160).scan(0, 0, 128, 160, function (x, y, idx) {
            // x, y is the position of this pixel on the image
            // idx is the position start position of this rgba tuple in the bitmap Buffer
            // this is the image

            let red = this.bitmap.data[idx + 0];
            let green = this.bitmap.data[idx + 1];
            let blue = this.bitmap.data[idx + 2];
            let alpha = this.bitmap.data[idx + 3];

            frameBuffer[x][y] = [red, green, blue];
            // console.log(frameBuffer[x][y], frameBuffer[5][5])
            // console.log(red, green, blue)
            // rgba values run from 0 - 255
            // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
        });
        res.json(frameBuffer)
    } catch (e) {
        res.status(500).send('Internal Server Error: ' + e.message)
    }
})



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
