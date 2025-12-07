import dotenv from 'dotenv';
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import { URL } from 'url';

dotenv.config();

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('Force-set DNS servers to Google DNS (8.8.8.8)');
} catch (e) {
    console.error('Failed to set DNS servers:', e);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
}

// Handle mongodb+srv://
const isSrv = uri.startsWith('mongodb+srv://');
const cleanUri = uri.replace('mongodb+srv://', 'mongodb://'); // Hack to parse hostname
// Note: standard URL parser might fail on srv if not handled carefully, but let's try to extract host manually if needed.

let hostname = '';
try {
    const parsed = new URL(cleanUri);
    hostname = parsed.hostname;
} catch (e) {
    // Fallback regex
    const match = uri.match(/@([^/?]+)/);
    if (match) {
        hostname = match[1];
    }
}

console.log(`Analyzing connection to: ${hostname}`);
console.log(`Type: ${isSrv ? 'SRV' : 'Standard'}`);

if (isSrv) {
    console.log('Resolving SRV records...');
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
        if (err) {
            console.error('❌ SRV Resolution Failed:', err.message);
            // Try A record fallback just in case
            checkARecord(hostname);
        } else {
            console.log('✅ SRV Records found:', addresses);
            if (addresses.length > 0) {
                const target = addresses[0];
                // checkConnection(target.name, target.port);
                checkTlsConnection(target.name, target.port);
            }
        }
    });
} else {
    checkConnection(hostname, 27017);
}

function checkARecord(host: string) {
    console.log(`Checking A record for ${host}...`);
    dns.lookup(host, { all: true }, (err, addresses) => {
        if (err) console.error('❌ DNS Lookup Failed:', err.message);
        else {
            console.log('✅ DNS Resolved:', addresses);
            addresses.forEach(addr => {
                console.log(`   - ${addr.address} (IPv${addr.family})`);
            });
        }
    });
}

function checkConnection(host: string, port: number) {
    console.log(`Testing TCP connection to ${host}:${port}...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log('✅ TCP Connection Successful!');
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.error('❌ TCP Connection Timed Out (Firewall?)');
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.error('❌ TCP Connection Error:', err.message);
    });

    socket.connect(port, host);
}

function checkTlsConnection(host: string, port: number) {
    console.log(`Testing TLS connection to ${host}:${port}...`);
    const socket = tls.connect(port, host, { servername: host }, () => {
        console.log('✅ TLS Connection Successful! Handshake complete.');
        console.log('   Cipher:', socket.getCipher());
        console.log('   Protocol:', socket.getProtocol());
        socket.end();
    });

    socket.on('error', (err) => {
        console.error('❌ TLS Connection Error:', err);
    });

    socket.on('timeout', () => {
        console.error('❌ TLS Connection Timed Out');
        socket.destroy();
    });
}
