import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        allowedHosts: true
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'FrogSoundGame',
            fileName: () => 'index.js',
            formats: ['es']
        },
        minify: false, // ✅ 關鍵：不要壓縮
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                exports: 'named' // ✅ 保留命名匯出
            }
        },
        outDir: 'dist'
    }
});
