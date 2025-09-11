// 修复版MathJax配置 - 支持本地部署和多种渲染器
(function() {
    'use strict';
    
    // 检查是否已经配置了MathJax
    if (window.MathJax) {
        console.log('MathJax已配置，跳过重复配置');
        return;
    }

    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true,
            packages: {'[+]': ['ams', 'base', 'autoload', 'require']}
        },
        svg: {
            fontCache: 'local',
            scale: 1.2,
            minScale: 0.5,
            mtextInheritFont: false,
            merrorInheritFont: true,
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
            processHtmlClass: 'tex2jax_process'
        },
        startup: {
            typeset: false,
            ready: () => {
                console.log('MathJax 正在初始化...');
                MathJax.startup.defaultReady();
                console.log('MathJax 初始化完成');
            },
            pageReady: () => {
                console.log('MathJax 页面准备中...');
                return MathJax.startup.defaultPageReady().then(() => {
                    console.log('MathJax 页面准备完成');
                    // 强制重新渲染所有公式
                    setTimeout(() => {
                        if (window.MathJax && MathJax.typesetPromise) {
                            MathJax.typesetPromise().then(() => {
                                console.log('MathJax 公式渲染完成');
                            }).catch((error) => {
                                console.error('MathJax 渲染错误:', error);
                                // 尝试使用备用渲染器
                                if (typeof window.tryFallbackRenderer === 'function') {
                                    window.tryFallbackRenderer();
                                }
                            });
                        }
                    }, 500);
                }).catch((error) => {
                    console.error('MathJax 页面准备错误:', error);
                    if (typeof window.tryFallbackRenderer === 'function') {
                        window.tryFallbackRenderer();
                    }
                });
            }
        },
        loader: {
            load: ['[tex]/ams', '[tex]/autoload', '[tex]/require']
        }
    };

    // 备用渲染器函数
    window.tryFallbackRenderer = function() {
        console.log('尝试使用备用渲染器...');
        // 如果SVG渲染器失败，尝试切换到CHTML
        if (window.MathJax && MathJax.startup && MathJax.startup.output) {
            const currentOutput = MathJax.startup.output.name;
            if (currentOutput === 'SVG') {
                console.log('切换到CHTML渲染器...');
                // 重新加载CHTML版本
                const script = document.createElement('script');
                script.src = '../common-assets/js/tex-mml-chtml.js';
                script.async = true;
                script.onload = () => {
                    console.log('CHTML渲染器加载完成');
                    if (window.MathJax && MathJax.typesetPromise) {
                        MathJax.typesetPromise().catch(err => console.error('CHTML渲染也失败:', err));
                    }
                };
                script.onerror = () => {
                    console.error('CHTML渲染器加载失败');
                    // 最后尝试CDN版本
                    window.tryCDNFallback();
                };
                document.head.appendChild(script);
            }
        }
    };

    // CDN备用方案
    window.tryCDNFallback = function() {
        console.log('尝试CDN备用方案...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
        script.async = true;
        script.onload = () => {
            console.log('CDN MathJax加载完成');
            if (window.MathJax && MathJax.typesetPromise) {
                MathJax.typesetPromise().catch(err => console.error('CDN渲染失败:', err));
            }
        };
        script.onerror = () => {
            console.error('所有MathJax加载方案都失败了');
        };
        document.head.appendChild(script);
    };

    // 增强的MathJax渲染辅助函数
    window.renderMathJax = function(element) {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([element]).then(() => {
                console.log('MathJax渲染成功');
            }).catch(err => {
                console.warn('MathJax渲染错误:', err);
                // 如果渲染失败，尝试延迟重新渲染
                setTimeout(() => {
                    if (window.MathJax && window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise([element]).then(() => {
                            console.log('MathJax延迟渲染成功');
                        }).catch(e => {
                            console.warn('MathJax延迟渲染也失败:', e);
                            // 尝试重新初始化MathJax
                            if (typeof window.tryFallbackRenderer === 'function') {
                                window.tryFallbackRenderer();
                            }
                        });
                    }
                }, 500);
            });
        } else {
            // MathJax还没加载完成，延迟渲染
            console.log('MathJax未加载完成，延迟渲染...');
            setTimeout(() => window.renderMathJax(element), 500);
        }
    };

    // 全局重新渲染函数
    window.reloadMathJax = function() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            console.log('手动重新渲染MathJax...');
            window.MathJax.typesetPromise().then(() => {
                console.log('MathJax手动重新渲染完成');
            }).catch(err => {
                console.error('MathJax手动重新渲染失败:', err);
                if (typeof window.tryFallbackRenderer === 'function') {
                    window.tryFallbackRenderer();
                }
            });
        }
    };

    console.log('MathJax修复配置已加载');
})();
