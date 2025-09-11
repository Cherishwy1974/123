// 统一的MathJax配置 - 增强版本，修复渲染问题
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        processRefs: true,
        macros: {
            // 添加常用宏定义
            vec: ['{\\boldsymbol{#1}}', 1],
            mat: ['{\\boldsymbol{#1}}', 1],
            det: '{\\operatorname{det}}',
            tr: '{\\operatorname{tr}}',
            rank: '{\\operatorname{rank}}',
            null: '{\\operatorname{null}}',
            range: '{\\operatorname{range}}',
            span: '{\\operatorname{span}}'
        },
        packages: ['base', 'ams', 'autoload', 'require', 'newcommand', 'configmacros']
    },
    svg: {
        fontCache: 'global',
        scale: 1.2,
        minScale: 0.5,
        mtextInheritFont: false,
        merrorInheritFont: true,
        mathmlSpacing: false,
        skipAttributes: {},
        exFactor: 0.5,
        displayAlign: 'center',
        displayIndent: '0'
    },
    chtml: {
        scale: 1.2,
        minScale: 0.5,
        matchFontHeight: false,
        displayAlign: 'center',
        displayIndent: '0'
    },
    options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process',
        renderActions: {
            find_script_mathtex: [10, function (doc) {
                for (const node of document.querySelectorAll('script[type^="math/tex"]')) {
                    const display = !!node.type.match(/; *mode *= *display/);
                    const math = new doc.options.MathItem(node.textContent, doc.inputJax[0], display);
                    const text = document.createTextNode('');
                    node.parentNode.replaceChild(text, node);
                    math.start = {node: text, delim: '', n: 0};
                    math.end = {node: text, delim: '', n: 0};
                    doc.math.push(math);
                }
            }, '']
        }
    },
    startup: {
        typeset: false,
        ready: function() {
            console.log('MathJax 正在初始化...');
            MathJax.startup.defaultReady();
            
            // 添加错误处理
            MathJax.startup.promise.catch((error) => {
                console.error('MathJax 启动错误:', error);
            });
        },
        pageReady: () => {
            console.log('MathJax 页面准备中...');
            return MathJax.startup.defaultPageReady().then(() => {
                console.log('MathJax 已准备就绪');
                
                // 强制重新渲染所有公式
                setTimeout(() => {
                    if (window.MathJax && MathJax.typesetPromise) {
                        MathJax.typesetPromise().then(() => {
                            console.log('MathJax 重新渲染完成');
                        }).catch((error) => {
                            console.error('MathJax 渲染错误:', error);
                            // 尝试使用 CHTML 渲染器作为备选
                            if (MathJax.startup.output && MathJax.startup.output.name === 'SVG') {
                                console.log('尝试切换到 CHTML 渲染器...');
                            }
                        });
                    }
                }, 1000);
            }).catch((error) => {
                console.error('MathJax 页面准备错误:', error);
            });
        }
    },
    loader: {
        load: ['[tex]/ams', '[tex]/autoload', '[tex]/require', '[tex]/newcommand', '[tex]/configmacros']
    }
};

// 添加全局错误处理和重新渲染函数
window.reloadMathJax = function() {
    if (window.MathJax && MathJax.typesetPromise) {
        console.log('手动重新加载 MathJax...');
        MathJax.typesetPromise().then(() => {
            console.log('MathJax 手动重新渲染完成');
        }).catch((error) => {
            console.error('MathJax 手动渲染错误:', error);
        });
    }
};

// 页面加载完成后额外检查
window.addEventListener('load', function() {
    setTimeout(() => {
        // 检查是否有未渲染的公式
        const unrendered = document.querySelectorAll('script[type*="math/tex"], .MathJax_Preview + script');
        if (unrendered.length > 0) {
            console.log(`发现 ${unrendered.length} 个未渲染的公式，尝试重新渲染...`);
            window.reloadMathJax();
        }
    }, 2000);
});
