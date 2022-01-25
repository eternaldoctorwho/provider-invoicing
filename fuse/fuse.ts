import { config } from './fuse-config';
import { fusebox } from 'fuse-box';
import { dirname } from 'path';

const doBuild = process.argv.some(a => a === "build");

const fuse = fusebox({
    ...config,
    ... (doBuild ? undefined :{
        // dev-only
        watcher: {
            root: [
                dirname(dirname(__dirname)),
            ],
        },
        devServer: {
            proxy: [
                {
                    path: '/api',
                    options: {
                        target: 'http://localhost:8888',
                        changeOrigin: true,
                        pathRewrite: {
                            '^/api': '/',
                        },
                    },
                },
            ],
            hmrServer: {
                enabled: true,
                port: 4445,
                connectionURL: 'ws://127.0.0.1:4445/'
            }      
        },
        hmr: true,
    }),
});

if (doBuild) {
    console.log("Production");
    fuse.runProd({
        bundles: {
            styles: { path: 'p/app/styles-$hash.css' },
            app: { path: 'p/app/app-$hash.js' },
            vendor: { path: 'p/app/vendor-$hash.js' },
            distRoot: "../distweb",
        },
        manifest: false,
    });
}
else {
    fuse.runDev({
        bundles: { app: { path: 'p/app.js' }}
    });
}
