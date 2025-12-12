/**
 * Webpack Module System Test
 * 
 * Loads and executes webpack bundles from app.js and ServiceSearchModule.js
 * to test encryption modules and API calls.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// =============================================================================
// Webpack Runtime
// =============================================================================

class WebpackRuntime {
    constructor() {
        this.modules = {};
        this.installedModules = {};
    }

    // Load modules from a webpack bundle file
    loadBundle(filePath) {
        const bundleName = path.basename(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const sizeMB = (content.length / 1024 / 1024).toFixed(2);

        let newModules = {};

        // Chunk format: (window.webpackJsonp = ...).push([["ChunkName"], { modules }])
        if (content.startsWith('(window.webpackJsonp')) {
            const start = content.indexOf('], {');
            if (start !== -1) {
                let modulesPart = content.substring(start + 3).replace(/\}\s*\]\s*\)\s*;?\s*$/, '}');
                newModules = eval('(' + modulesPart + ')');
            }
        }
        // Main bundle format: !function(e) { ... }({ modules })
        else {
            const match = content.match(/\}\(\{/);
            if (match) {
                let modulesPart = content.substring(match.index + 2).replace(/\);\s*$/, '');
                newModules = eval('(' + modulesPart + ')');
            }
        }

        const count = Object.keys(newModules).length;
        Object.assign(this.modules, newModules);
        console.log(`  ${bundleName}: ${sizeMB} MB, ${count} modules`);
        return count;
    }

    // Webpack require function
    require(moduleId) {
        if (this.installedModules[moduleId]) {
            return this.installedModules[moduleId].exports;
        }

        if (!this.modules[moduleId]) {
            throw new Error(`Module "${moduleId}" not found`);
        }

        const module = this.installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        const __webpack_require__ = this.require.bind(this);
        __webpack_require__.r = (exports) => {
            if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
            }
            Object.defineProperty(exports, '__esModule', { value: true });
        };
        __webpack_require__.d = (exports, name, getter) => {
            if (!Object.prototype.hasOwnProperty.call(exports, name)) {
                Object.defineProperty(exports, name, { enumerable: true, get: getter });
            }
        };
        __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
        __webpack_require__.n = (module) => {
            const getter = module && module.__esModule ? () => module['default'] : () => module;
            __webpack_require__.d(getter, 'a', getter);
            return getter;
        };
        __webpack_require__.m = this.modules;
        __webpack_require__.c = this.installedModules;
        __webpack_require__.p = '';

        this.modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports;
    }

    get totalModules() {
        return Object.keys(this.modules).length;
    }
}

// =============================================================================
// NHSA API Client
// =============================================================================

class NHSAApiClient {
    constructor(webpackRuntime) {
        this.runtime = webpackRuntime;
        this.encryptModule = null;
        this.baseUrl = 'https://fuwu.nhsa.gov.cn/ebus/fuwu/api';
    }

    init() {
        this.encryptModule = this.runtime.require('7d92');
        return this;
    }

    encryptRequest(endpoint, data) {
        const config = {
            url: endpoint,
            method: 'POST',
            headers: {},
            data: data
        };
        return this.encryptModule.a(config);
    }

    decryptResponse(responseData) {
        if (responseData.data && responseData.data.appCode) {
            return this.encryptModule.b('SM4', responseData);
        }
        return responseData.data;
    }

    async post(endpoint, data) {
        const encrypted = this.encryptRequest(endpoint, data);

        // Filter undefined headers
        const headers = Object.fromEntries(
            Object.entries(encrypted.headers).filter(([_, v]) => v != null)
        );

        const url = new URL(this.baseUrl + endpoint);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Referer': 'https://fuwu.nhsa.gov.cn/nationalHallSt/',
                'Origin': 'https://fuwu.nhsa.gov.cn'
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body);
                        resolve({
                            status: res.statusCode,
                            code: json.code,
                            message: json.message,
                            data: this.decryptResponse(json)
                        });
                    } catch (e) {
                        reject(new Error(`Parse error: ${e.message}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(encrypted.data);
            req.end();
        });
    }

    // High-level API methods
    async queryServiceFacilities(params = {}) {
        return this.post('/nthl/api/CommQuery/queryServiceFacilities', {
            pageNum: 1,
            pageSize: 10,
            fixedInHos: '',
            areaCode: '',
            svcFaciName: '',
            ...params
        });
    }
}

// =============================================================================
// Tests
// =============================================================================

async function testSM4Encryption(runtime) {
    console.log('\n' + '='.repeat(60));
    console.log('SM4 Encryption Test');
    console.log('='.repeat(60));

    const utils = runtime.require('b381');
    const sm4 = runtime.require('e04e');

    const key = utils.hexToArray('0123456789abcdeffedcba9876543210');
    const plaintext = 'Hello, SM4 Test!';
    const plaintextBytes = utils.hexToArray(utils.parseUtf8StringToHex(plaintext));

    const cipherBytes = sm4.encrypt(plaintextBytes, key);
    const decryptedBytes = sm4.decrypt(cipherBytes, key);
    const decrypted = utils.arrayToUtf8(decryptedBytes);

    console.log('Plaintext:', plaintext);
    console.log('Ciphertext:', utils.arrayToHex(cipherBytes));
    console.log('Decrypted:', decrypted);
    console.log(decrypted === plaintext ? '✓ PASS' : '✗ FAIL');
}

async function testApiCall(client) {
    console.log('\n' + '='.repeat(60));
    console.log('API Test: queryServiceFacilities');
    console.log('='.repeat(60));

    const result = await client.queryServiceFacilities({ pageSize: 5 });

    console.log('Status:', result.status);
    console.log('Code:', result.code);
    console.log('Message:', result.message);

    if (result.data && result.data.list) {
        console.log('Items:', result.data.list.length);
        console.log('Sample:', result.data.list[0]?.servitemName || 'N/A');
    }

    console.log(result.code === 0 ? '✓ SUCCESS' : '✗ FAILED');
}

// =============================================================================
// Main
// =============================================================================

async function main() {
    console.log('='.repeat(60));
    console.log('Webpack Runtime Test');
    console.log('='.repeat(60));

    // Initialize runtime and load bundles
    const runtime = new WebpackRuntime();
    console.log('\nLoading bundles:');
    runtime.loadBundle(path.join(__dirname, 'assets', 'app.js'));
    runtime.loadBundle(path.join(__dirname, 'assets', 'ServiceSearchModule.js'));
    console.log(`Total: ${runtime.totalModules} modules`);

    // Run tests
    await testSM4Encryption(runtime);

    // Initialize API client and test
    const client = new NHSAApiClient(runtime).init();
    await testApiCall(client);

    console.log('\n' + '='.repeat(60));
    console.log('All Tests Complete');
    console.log('='.repeat(60));
}

main().catch(console.error);
