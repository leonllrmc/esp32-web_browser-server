import json
import os

from PIL import Image


def convert(filename):
    img = Image.open(filename).convert('RGB').reduce((160, 128))

    fb = [[() for y in range(0, img.size[1])] for x in range(0, img.size[0])]

    for x in range(0, img.size[0]):
        for y in range(0, img.size[1]):
            fb[x][y] = img.getpixel((x, y))

    os.remove(filename)

    return json.dumps(fb)
