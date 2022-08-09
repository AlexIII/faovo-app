import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import css from 'rollup-plugin-import-css';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.tsx',
    output: {
        file: 'assets/bundle.js',
        format: 'cjs'
    },
    onwarn: (warning, next) => {
        if(warning.code === 'CIRCULAR_DEPENDENCY') return;
        if(warning.code === 'THIS_IS_UNDEFINED') return;
        next(warning);
    },
    plugins: [
        css({ minify: process.env.BUILD !== 'dev' }),

        json({
            compact: true,
            preferConst: true
        }),

        alias({
            entries: [
                { find: 'react', replacement: 'preact/compat' },
                { find: 'react-dom', replacement: 'preact/compat' }
            ]
        }),
        
        typescript(),

        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify(process.env.BUILD === 'dev'? 'development' : 'production')
        }),

        commonjs({
            sourceMap: false
        }),

        resolve({
            browser: true,
            preferBuiltins: true
        }),

        process.env.BUILD === 'dev'? undefined :
            terser({
                compress: true,
                format: {comments: false}
            }),
    ]
};