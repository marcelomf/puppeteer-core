/**
 * @license
 * Copyright 2017 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import {existsSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';

import {
  Browser as InstalledBrowser,
  CDP_WEBSOCKET_ENDPOINT_REGEX,
  launch,
  TimeoutError as BrowsersTimeoutError,
  WEBDRIVER_BIDI_WEBSOCKET_ENDPOINT_REGEX,
  computeExecutablePath,
} from '@puppeteer/browsers';

import {
  firstValueFrom,
  from,
  map,
  race,
  timer,
} from '../../third_party/rxjs/rxjs.js';
import type {Browser, BrowserCloseCallback} from '../api/Browser.js';
import {CdpBrowser} from '../cdp/Browser.js';
import {Connection} from '../cdp/Connection.js';
import {TimeoutError} from '../common/Errors.js';
import type {Product} from '../common/Product.js';
import {debugError, DEFAULT_VIEWPORT} from '../common/util.js';
import type {Viewport} from '../common/Viewport.js';

import type {
  BrowserLaunchArgumentOptions,
  ChromeReleaseChannel,
  PuppeteerNodeLaunchOptions,
} from './LaunchOptions.js';
import {NodeWebSocketTransport as WebSocketTransport} from './NodeWebSocketTransport.js';
import {PipeTransport} from './PipeTransport.js';
import type {PuppeteerNode} from './PuppeteerNode.js';

/**
 * @internal
 */
export interface ResolvedLaunchArgs {
  isTempUserDataDir: boolean;
  userDataDir: string;
  executablePath: string;
  args: string[];
}

/**
 * Describes a launcher - a class that is able to create and launch a browser instance.
 *
 * @public
 */
export abstract class ProductLauncher {
  #product: Product;

  /**
   * @internal
   */
  puppeteer: PuppeteerNode;

  /**
   * @internal
   */
  protected actualBrowserRevision?: string;

  /**
   * @internal
   */
  constructor(puppeteer: PuppeteerNode, product: Product) {
    this.puppeteer = puppeteer;
    this.#product = product;
  }

  get product(): Product {
    return this.#product;
  }

  async launch(options: PuppeteerNodeLaunchOptions = {}): Promise<Browser> {
    const {
      dumpio = false,
      env = process.env,
      handleSIGINT = true,
      handleSIGTERM = true,
      handleSIGHUP = true,
      ignoreHTTPSErrors = false,
      defaultViewport = DEFAULT_VIEWPORT,
      slowMo = 0,
      timeout = 30000,
      waitForInitialPage = true,
      protocolTimeout,
      protocol,
    } = options;

    const launchArgs = await this.computeLaunchArguments(options);

    if (!existsSync(launchArgs.executablePath)) {
      throw new Error(
        `Browser was not found at the configured executablePath (${launchArgs.executablePath})`
      );
    }

    const usePipe = launchArgs.args.includes('--remote-debugging-pipe');

    const onProcessExit = async () => {
      await this.cleanUserDataDir(launchArgs.userDataDir, {
        isTemp: launchArgs.isTempUserDataDir,
      });
    };

    if (
      this.#product === 'firefox' &&
      protocol !== 'webDriverBiDi' &&
      this.puppeteer.configuration.logLevel === 'warn'
    ) {
      console.warn(
        `Chrome DevTools Protocol (CDP) support for Firefox is deprecated in Puppeteer ` +
          `and it will be eventually removed. ` +
          `Use WebDriver BiDi instead (see https://pptr.dev/webdriver-bidi#get-started).`
      );
    }

    const browserProcess = launch({
      executablePath: launchArgs.executablePath,
      args: launchArgs.args,
      handleSIGHUP,
      handleSIGTERM,
      handleSIGINT,
      dumpio,
      env,
      pipe: usePipe,
      onExit: onProcessExit,
    });

    let browser: Browser;
    let cdpConnection: Connection;
    let closing = false;

    const browserCloseCallback: BrowserCloseCallback = async () => {
      if (closing) {
        return;
      }
      closing = true;
      await this.closeBrowser(browserProcess, cdpConnection);
    };

    try {
      if (this.#product === 'firefox' && protocol === 'webDriverBiDi') {

        console.log("CREATE CDP");

        cdpConnection = await this.createCdpSocketConnection(browserProcess, {
          timeout,
          protocolTimeout,
          slowMo,
        });

        console.log("URL CDP CONNECTION: ", cdpConnection.url());

        let PORT_DEBUG;
        try {
          PORT_DEBUG = cdpConnection.url();
          if(PORT_DEBUG) PORT_DEBUG = PORT_DEBUG.split(":")[2];
          if(PORT_DEBUG) PORT_DEBUG = PORT_DEBUG.split("/")[0];
        } catch(e) {
          //PORT_DEBUG = '9222';
        }

        console.log("CREATE BIDI");
       browser = await this.createBiDiBrowser(
          browserProcess,
          browserCloseCallback,
          {
            timeout,
            protocolTimeout,
            slowMo,
            defaultViewport,
            ignoreHTTPSErrors,
            port: PORT_DEBUG
          }
        );

      // DA PROBLEMA DE CONTEXTO
      // browser = await this.createBiDiOverCdpBrowser(
      //   browserProcess,
      //   cdpConnection,
      //   browserCloseCallback,
      //   {
      //     timeout,
      //     protocolTimeout,
      //     slowMo,
      //     defaultViewport,
      //     ignoreHTTPSErrors,
      //     port: PORT_DEBUG
      //   }
      // );



        browser.cdpConnection = {} //cdpConnection;        
      } else {
        if (usePipe) {
          cdpConnection = await this.createCdpPipeConnection(browserProcess, {
            timeout,
            protocolTimeout,
            slowMo,
          });
        } else {
          cdpConnection = await this.createCdpSocketConnection(browserProcess, {
            timeout,
            protocolTimeout,
            slowMo,
          });
        }
        if (protocol === 'webDriverBiDi') {
          browser = await this.createBiDiOverCdpBrowser(
            browserProcess,
            cdpConnection,
            browserCloseCallback,
            {
              timeout,
              protocolTimeout,
              slowMo,
              defaultViewport,
              ignoreHTTPSErrors,
            }
          );
        } else {
          browser = await CdpBrowser._create(
            this.product,
            cdpConnection,
            [],
            ignoreHTTPSErrors,
            defaultViewport,
            browserProcess.nodeProcess,
            browserCloseCallback,
            options.targetFilter
          );
        }
      }
    } catch (error) {
      void browserCloseCallback();
      if (error instanceof BrowsersTimeoutError) {
        throw new TimeoutError(error.message);
      }
      throw error;
    }

    if (waitForInitialPage && protocol !== 'webDriverBiDi') {
      await this.waitForPageTarget(browser, timeout);
    }

    // if(protocol == "webDriverBiDi" && this.product == "firefox") {
    //   console.log("ESPERA1");
    //   await this.waitForPageTarget(browser, timeout);
    //   console.log("ESPERA2");
    // }

    return browser;
  }

  abstract executablePath(channel?: ChromeReleaseChannel): string;

  abstract defaultArgs(object: BrowserLaunchArgumentOptions): string[];

  /**
   * Set only for Firefox, after the launcher resolves the `latest` revision to
   * the actual revision.
   * @internal
   */
  getActualBrowserRevision(): string | undefined {
    return this.actualBrowserRevision;
  }

  /**
   * @internal
   */
  protected abstract computeLaunchArguments(
    options: PuppeteerNodeLaunchOptions
  ): Promise<ResolvedLaunchArgs>;

  /**
   * @internal
   */
  protected abstract cleanUserDataDir(
    path: string,
    opts: {isTemp: boolean}
  ): Promise<void>;

  /**
   * @internal
   */
  protected async closeBrowser(
    browserProcess: ReturnType<typeof launch>,
    cdpConnection?: Connection
  ): Promise<void> {
    if (cdpConnection) {
      // Attempt to close the browser gracefully
      try {
        await cdpConnection.closeBrowser();
        await browserProcess.hasClosed();
      } catch (error) {
        debugError(error);
        await browserProcess.close();
      }
    } else {
      // Wait for a possible graceful shutdown.
      await firstValueFrom(
        race(
          from(browserProcess.hasClosed()),
          timer(5000).pipe(
            map(() => {
              return from(browserProcess.close());
            })
          )
        )
      );
    }
  }

  /**
   * @internal
   */
  protected async waitForPageTarget(
    browser: Browser,
    timeout: number
  ): Promise<void> {
    try {
      await browser.waitForTarget(
        t => {
          return t.type() === 'page';
        },
        {timeout}
      );
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * @internal
   */
  protected async createCdpSocketConnection(
    browserProcess: ReturnType<typeof launch>,
    opts: {timeout: number; protocolTimeout: number | undefined; slowMo: number}
  ): Promise<Connection> {
    console.log("VEIO CREATE CDP");
    const browserWSEndpoint = await browserProcess.waitForLineOutput(
      CDP_WEBSOCKET_ENDPOINT_REGEX,
      opts.timeout
    );
    console.log("VEIO CREATE TRANSPORT");
    const transport = await WebSocketTransport.create(browserWSEndpoint);
    console.log("VEIO RETORNOCREATE TRANSPORT");
    return new Connection(
      browserWSEndpoint,
      transport,
      opts.slowMo,
      opts.protocolTimeout
    );
  }

  /**
   * @internal
   */
  protected async createCdpPipeConnection(
    browserProcess: ReturnType<typeof launch>,
    opts: {timeout: number; protocolTimeout: number | undefined; slowMo: number}
  ): Promise<Connection> {
    // stdio was assigned during start(), and the 'pipe' option there adds the
    // 4th and 5th items to stdio array
    const {3: pipeWrite, 4: pipeRead} = browserProcess.nodeProcess.stdio;
    const transport = new PipeTransport(
      pipeWrite as NodeJS.WritableStream,
      pipeRead as NodeJS.ReadableStream
    );
    return new Connection('', transport, opts.slowMo, opts.protocolTimeout);
  }

  /**
   * @internal
   */
  protected async createBiDiOverCdpBrowser(
    browserProcess: ReturnType<typeof launch>,
    connection: Connection,
    closeCallback: BrowserCloseCallback,
    opts: {
      timeout: number;
      protocolTimeout: number | undefined;
      slowMo: number;
      defaultViewport: Viewport | null;
      ignoreHTTPSErrors?: boolean;
      port?: string;
    }
  ): Promise<Browser> {
    // TODO: use other options too.
    const BiDi = await import(/* webpackIgnore: true */ '../bidi/bidi.js');
    const bidiConnection = await BiDi.connectBidiOverCdp(connection, {
      acceptInsecureCerts: opts.ignoreHTTPSErrors ?? false,
    });
    return await BiDi.BidiBrowser.create({
      connection: bidiConnection,
      closeCallback,
      process: browserProcess.nodeProcess,
      defaultViewport: opts.defaultViewport,
      ignoreHTTPSErrors: opts.ignoreHTTPSErrors,
    });
  }

  /**
   * @internal
   */
  protected async createBiDiBrowser(
    browserProcess: ReturnType<typeof launch>,
    closeCallback: BrowserCloseCallback,
    opts: {
      timeout: number;
      protocolTimeout: number | undefined;
      slowMo: number;
      defaultViewport: Viewport | null;
      ignoreHTTPSErrors?: boolean;
      port?: string;
    }
  ): Promise<Browser> {
    let browserWSEndpoint;
    if(opts.port) {
      browserWSEndpoint = `ws://127.0.0.1:${opts.port}/session`;
    } else {
      browserWSEndpoint =
      (await browserProcess.waitForLineOutput(
        WEBDRIVER_BIDI_WEBSOCKET_ENDPOINT_REGEX,
        opts.timeout
      )) + '/session';
    }

    const transport = await WebSocketTransport.create(browserWSEndpoint);
    const BiDi = await import(/* webpackIgnore: true */ '../bidi/bidi.js');
    const bidiConnection = new BiDi.BidiConnection(
      browserWSEndpoint,
      transport,
      opts.slowMo,
      opts.protocolTimeout
    );
    // TODO: use other options too.
    return await BiDi.BidiBrowser.create({
      connection: bidiConnection,
      closeCallback,
      process: browserProcess.nodeProcess,
      defaultViewport: opts.defaultViewport,
      ignoreHTTPSErrors: opts.ignoreHTTPSErrors,
    });
  }

  /**
   * @internal
   */
  protected getProfilePath(): string {
    return join(
      this.puppeteer.configuration.temporaryDirectory ?? tmpdir(),
      `puppeteer_dev_${this.product}_profile-`
    );
  }

  /**
   * @internal
   */
  protected resolveExecutablePath(headless?: boolean | 'shell'): string {
    let executablePath = this.puppeteer.configuration.executablePath;
    if (executablePath) {
      if (!existsSync(executablePath)) {
        throw new Error(
          `Tried to find the browser at the configured path (${executablePath}), but no executable was found.`
        );
      }
      return executablePath;
    }

    function productToBrowser(product?: Product, headless?: boolean | 'shell') {
      switch (product) {
        case 'chrome':
          if (headless === 'shell') {
            return InstalledBrowser.CHROMEHEADLESSSHELL;
          }
          return InstalledBrowser.CHROME;
        case 'firefox':
          return InstalledBrowser.FIREFOX;
      }
      return InstalledBrowser.CHROME;
    }

    executablePath = computeExecutablePath({
      cacheDir: this.puppeteer.defaultDownloadPath!,
      browser: productToBrowser(this.product, headless),
      buildId: this.puppeteer.browserRevision,
    });

    if (!existsSync(executablePath)) {
      if (this.puppeteer.configuration.browserRevision) {
        throw new Error(
          `Tried to find the browser at the configured path (${executablePath}) for revision ${this.puppeteer.browserRevision}, but no executable was found.`
        );
      }
      switch (this.product) {
        case 'chrome':
          throw new Error(
            `Could not find Chrome (ver. ${this.puppeteer.browserRevision}). This can occur if either\n` +
              ' 1. you did not perform an installation before running the script (e.g. `npx puppeteer browsers install chrome`) or\n' +
              ` 2. your cache path is incorrectly configured (which is: ${this.puppeteer.configuration.cacheDirectory}).\n` +
              'For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.'
          );
        case 'firefox':
          throw new Error(
            `Could not find Firefox (rev. ${this.puppeteer.browserRevision}). This can occur if either\n` +
              ' 1. you did not perform an installation for Firefox before running the script (e.g. `npx puppeteer browsers install firefox`) or\n' +
              ` 2. your cache path is incorrectly configured (which is: ${this.puppeteer.configuration.cacheDirectory}).\n` +
              'For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.'
          );
      }
    }
    return executablePath;
  }
}
