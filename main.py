import os
import time
from flask import Flask, send_file
from selenium import webdriver

import img_converter

app = Flask(__name__)


@app.route("/")
def default():
    return "<h1>Default server, connect to the esp wifi and goto <a " \
           "href=\"http://192.168.4.1/\">http://192.168.4.1/</a> in a web browser</h1> "


@app.route("/screen/<url>")
def screenshot_route(url=''):
    if url == '':
        return 'URL not present'
    img_name = get_screenshot(url)
    img_json = img_converter.convert(img_name)

    return img_json


def get_screenshot(url):
    t = time.time()
    options = webdriver.FirefoxProfile()
    options.set_preference('security.sandbox.content.level', 5)
    driver = webdriver.Firefox(firefox_profile=options)
    driver.set_window_position(0, 0)
    driver.get('http://' + url)
    time.sleep(5)
    driver.save_screenshot(f'./tmp-{t}.png')
    driver.quit()
    return f'tmp-{t}.png'

app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
