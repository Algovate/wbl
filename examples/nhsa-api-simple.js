/**
 * NHSA API Test Script
 * 
 * Demonstrates how to use WBL to call queryServiceFacilities API
 */

import https from 'https';
import { WebpackBundleLoader } from '../dist/lib/WebpackBundleLoader.js';

// Load webpack bundles
const loader = new WebpackBundleLoader();
console.log('Loading bundles...');
loader.loadBundle('examples/bundles/nhsa/app.js');
loader.loadBundle('examples/bundles/nhsa/ServiceSearchModule.js');
console.log(`Loaded ${loader.totalModules} modules\n`);

// Get encryption module (7d92)
const encryptModule = loader.require('7d92');
console.log('Encryption module loaded');

// API configuration
const BASE_URL = 'https://fuwu.nhsa.gov.cn/ebus/fuwu/api';
const ENDPOINT = '/nthl/api/CommQuery/queryServiceFacilities';

/**
 * Make encrypted API request
 */
async function queryServiceFacilities(params = {}) {
    const data = {
        pageNum: 1,
        pageSize: 10,
        fixedInHos: '',
        areaCode: '',
        svcFaciName: '',
        ...params
    };

    // Encrypt request using module 7d92.a
    const encrypted = encryptModule.a({
        url: ENDPOINT,
        method: 'POST',
        headers: {},
        data: data
    });

    console.log('Request encrypted');
    console.log('Headers:', Object.keys(encrypted.headers).join(', '));

    // Make HTTPS request
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + ENDPOINT);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                ...Object.fromEntries(
                    Object.entries(encrypted.headers).filter(([_, v]) => v != null)
                ),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Referer': 'https://fuwu.nhsa.gov.cn/nationalHallSt/',
                'Origin': 'https://fuwu.nhsa.gov.cn'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    console.log(`Response status: ${res.statusCode}`);
                    console.log(`Response code: ${json.code}`);
                    console.log(`Response message: ${json.message}`);

                    // Decrypt response using module 7d92.b
                    if (json.data && json.data.appCode) {
                        const decrypted = encryptModule.b('SM4', json);
                        resolve({
                            status: res.statusCode,
                            code: json.code,
                            message: json.message,
                            data: decrypted
                        });
                    } else {
                        resolve({
                            status: res.statusCode,
                            code: json.code,
                            message: json.message,
                            data: json.data
                        });
                    }
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

// Run test
async function main() {
    console.log('='.repeat(60));
    console.log('NHSA API Test: queryServiceFacilities');
    console.log('='.repeat(60));
    console.log();

    try {
        const result = await queryServiceFacilities({ pageSize: 5 });

        console.log('\n' + '='.repeat(60));
        console.log('Result:');
        console.log('='.repeat(60));

        if (result.code === 0 && result.data) {
            console.log(`Total: ${result.data.total || 'N/A'}`);
            console.log(`Items: ${result.data.list?.length || 0}`);

            if (result.data.list && result.data.list.length > 0) {
                console.log('\nSample items:');
                for (const item of result.data.list.slice(0, 3)) {
                    console.log(`  - ${item.servitemName || item.svcFaciName || JSON.stringify(item).substring(0, 60)}`);
                }
            }
            console.log('\n✓ SUCCESS');
        } else {
            console.log('Response:', JSON.stringify(result, null, 2));
            console.log('\n✗ FAILED');
        }
    } catch (error) {
        console.error('Error:', error.message);
        console.log('\n✗ FAILED');
    }
}

main();
