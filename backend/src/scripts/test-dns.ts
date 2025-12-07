import dns from 'dns';

const hosts = [
    'google.com',
    'cluster0.pklmsfm.mongodb.net',
    'cluster0-shard-00-00.pklmsfm.mongodb.net'
];

console.log('Testing DNS Resolution...');

hosts.forEach(host => {
    dns.lookup(host, { all: true }, (err, addresses) => {
        if (err) {
            console.error(`❌ ${host}: Failed - ${err.message}`);
        } else {
            console.log(`✅ ${host}: Resolved`);
            addresses.forEach(a => console.log(`   -> ${a.address} (IPv${a.family})`));
        }
    });
});
