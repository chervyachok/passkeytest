import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'


let production = process.env.NODE_ENV === 'production' 

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {	
		
	return {		
		define: {
			IS_PRODUCTION: production,		
			//'global.Buffer': Buffer,
		},
		plugins: [
			vue({
				template: {
					compilerOptions: {
					}
				}
			})
		],
		server: {
			//port: 5217,
			//proxy: {
			//	'/api': 'http://localhost:3907',
			//},
		},
		alias: {
			//buffer: 'buffer',
		  },		
		css: {
			loaderOptions: {
				sass: {
					implementation: require("sass"),
				},
			},
			preprocessorOptions: {
				scss: {
					includePaths: ['node_modules']
				}
			}
		},
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),	
				//crypto: "crypto-browserify",			
			},
		},
		optimizeDeps: {
			esbuildOptions: {
				// Node.js global to browser globalThis
				define: {
					global: 'globalThis',
				},
				// Enable esbuild polyfill plugins
				plugins: [
					NodeGlobalsPolyfillPlugin({
						//buffer: true,
						process: true,						
					}),
					//NodeModulesPolyfillPlugin(),
				],
			},
		},		
		build: {
			rollupOptions: {
				plugins: [
					rollupNodePolyFill()
				],
			},
			chunkSizeWarningLimit: false,
			
			//outDir: path.resolve("z:/www/client"),		
			//emptyOutDir: true,
			//root: 'src',
		},
				
	};
});
