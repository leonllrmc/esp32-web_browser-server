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
        const frameBuffer = Array(128).fill(Array(160).fill(Array(3).fill(0)))
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
        })
        await page.waitForNetworkIdle()
        await page.waitForTimeout(500)
        await page.screenshot({
            path: process.cwd() + '/tmp/' + id + '.png'
        })
        await browser.close();

        const img = await Jimp.read('./tmp/' + id + '.png');
        img.resize(128, 160).scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
            // x, y is the position of this pixel on the image
            // idx is the position start position of this rgba tuple in the bitmap Buffer
            // this is the image

            var red = this.bitmap.data[idx + 0];
            var green = this.bitmap.data[idx + 1];
            var blue = this.bitmap.data[idx + 2];
            var alpha = this.bitmap.data[idx + 3];

            frameBuffer[x][y][0] = red;
            frameBuffer[x][y][0] = green;
            frameBuffer[x][y][0] = blue;
            // console.log(red, green, blue)
            // rgba values run from 0 - 255
            // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
        });
        fs.rmSync('./tmp/' + id + '.png')
        res.json(frameBuffer)
    } catch (e) {
        res.status(500).send('Internal Server Error: ' + e.message)
    }
})



app.listen(8080)
