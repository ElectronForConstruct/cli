import { Module, Plugin } from '@cyn/utils';
import puppeteer from 'puppeteer';

interface Input {
  wait: number;
  message: string;
}

interface Output {
  message: string;
}

class Export extends Module<Input, Output> {
  description = 'Export your construct project'

  inputs = {
    message: '',
    wait: 1000
  }

  override async run(task: Input) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 640, height: 600 })

    await page.goto('https://editor.construct.net/')

    await page.waitForSelector('.noThanksLink')
    await page.click('.noThanksLink')

    await page.waitForTimeout(1000);

    await page.waitForSelector('#userAccountWrap')
    await page.click('#userAccountWrap')

    await page.waitForTimeout(1000);

    await page.waitForSelector('body > ui-menu > ui-menuitem:nth-child(2)')
    await page.click('body > ui-menu > ui-menuitem:nth-child(2)')

    await page.waitForTimeout(2000);

    await page.waitForSelector('#username')
    await page.type('#username', 'armaldio')

    await page.waitForSelector('#password')
    await page.type('#password', 'geekdxp8hqw9')

    await page.waitForSelector('#login')
    await page.click('#login')


    // await browser.close();


    return {
      message: task.message
    }
  }
}

export const projectExport = Export

export default {
  'construct/export': Export
} as Plugin