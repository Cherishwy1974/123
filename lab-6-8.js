// Lab 6-8: 常见的空间曲面虚拟实验室 - 模块化JavaScript
// 作者：高等应用数学虚拟实验室
// 功能：二次曲面、旋转曲面、柱面、参数曲面的可视化和交互功能

// === 配置常量 ===
const CONFIG = {
    ANIMATION_DURATION: 1000,
    DEFAULT_RANGE: 3,
    DEFAULT_DENSITY: 25,
    MATH_RENDER_DELAY: 100,
    INPUT_DEBOUNCE_DELAY: 300
};

// === 工具函数库 ===
class Utils {
    /**
     * 数值验证和限制
     * @param {number} value - 输入值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} - 修正后的值
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 安全的数值解析
     * @param {any} value - 输入值
     * @param {number} defaultVal - 默认值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number}
     */
    static safeParseNumber(value, defaultVal = 1, min = 0.1, max = 10) {
        const parsed = parseFloat(value);
        return this.isValidNumber(parsed) ? this.clamp(parsed, min, max) : defaultVal;
    }

    /**
     * 数字验证
     * @param {any} value - 需要验证的值
     * @returns {boolean}
     */
    static isValidNumber(value) {
        return !isNaN(value) && isFinite(value) && value !== null;
    }

    /**
     * 防抖函数 - 优化输入性能
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间
     * @returns {Function}
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * 数学公式渲染 - 增强版，支持多重渲染策略
     * @param {HTMLElement} element - 需要渲染的元素
     * @param {boolean} forceGlobal - 是否强制全局渲染
     */
    static renderMathJax(element, forceGlobal = false) {
        if (!element) {
            console.warn('MathJax element not provided');
            return;
        }

        // 等待MathJax完全加载完成
        if (typeof window.MathJax === 'undefined') {
            console.warn('MathJax not loaded yet, retrying...');
            setTimeout(() => this.renderMathJax(element, forceGlobal), 500);
            return;
        }

        console.log('🎯 开始MathJax渲染元素:', element.id || '未知元素');

        // 多重渲染策略
        const renderStrategies = [
            // 策略1: 新版MathJax v3
            () => {
                if (window.MathJax && typeof window.MathJax.typeset === 'function') {
                    try {
                        if (forceGlobal) {
                            window.MathJax.typeset(document.body);
                            console.log('✅ MathJax v3 全局渲染成功');
                        } else {
                            window.MathJax.typeset([element]);
                            console.log('✅ MathJax v3 局部渲染成功');
                        }
                        return true;
                    } catch (error) {
                        console.warn('MathJax v3 渲染失败:', error);
                        return false;
                    }
                }
                return false;
            },

            // 策略2: 旧版MathJax v2
            () => {
                if (window.MathJax && window.MathJax.Hub) {
                    try {
                        if (forceGlobal) {
                            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, document.body]);
                        } else {
                            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, element]);
                        }
                        console.log('✅ MathJax v2 渲染成功');
                        return true;
                    } catch (error) {
                        console.warn('MathJax v2 渲染失败:', error);
                        return false;
                    }
                }
                return false;
            },

            // 策略3: Promise版本
            () => {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    try {
                        if (forceGlobal) {
                            window.MathJax.typesetPromise(document.body).then(() => {
                                console.log('✅ MathJax Promise 全局渲染完成');
                            }).catch(err => {
                                console.warn('MathJax Promise 渲染失败:', err);
                            });
                        } else {
                            window.MathJax.typesetPromise([element]).then(() => {
                                console.log('✅ MathJax Promise 局部渲染完成');
                            }).catch(err => {
                                console.warn('MathJax Promise 渲染失败:', err);
                            });
                        }
                        return true;
                    } catch (error) {
                        console.warn('MathJax Promise 渲染失败:', error);
                        return false;
                    }
                }
                return false;
            }
        ];

        // 执行渲染策略
        let success = false;
        for (const strategy of renderStrategies) {
            if (strategy()) {
                success = true;
                break;
            }
        }

        if (!success) {
            console.warn('❌ 所有MathJax渲染策略都失败，重试全局渲染...');
            // 强制重试全局渲染
            setTimeout(() => {
                this.renderMathJax(element, true);
            }, 1000);
        } else {
            // 渲染成功后，添加延迟验证
            setTimeout(() => {
                this.verifyMathJaxRendering(element);
            }, 500);
        }
    }

    /**
     * 验证MathJax渲染结果
     * @param {HTMLElement} element - 要验证的元素
     */
    static verifyMathJaxRendering(element) {
        if (!element || !element.innerHTML) return;

        const latexPatterns = [
            /\$\$[\s\S]*?\$\$/g,  // 块级公式
            /\$[^$\n]+\$/g,       // 行内公式
            /\\\(.*?\\\)/g,      // 行内公式 (另一种形式)
            /\\\[.*?\\\]/g        // 块级公式 (另一种形式)
        ];

        let totalFormulas = 0;
        latexPatterns.forEach(pattern => {
            const matches = element.innerHTML.match(pattern);
            if (matches) totalFormulas += matches.length;
        });

        if (totalFormulas > 0) {
            const renderedElements = element.querySelectorAll('.MathJax, .mathjax, mjx-container');
            const renderedCount = renderedElements.length;

            console.log(`📊 MathJax验证: ${renderedCount}/${totalFormulas} 公式已渲染`);

            if (renderedCount < totalFormulas) {
                console.warn('⚠️ 发现未渲染公式，尝试重新渲染...');
                setTimeout(() => {
                    this.renderMathJax(element, true);
                }, 200);
            }
        }
    }

    static renderMathJaxLegacy(element) {
        // 作为最后备选的渲染方法
        if (window.MathJax && window.MathJax.Hub) {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, element]);
        } else {
            console.error('No compatible MathJax version found');
        }
    }

    /**
     * 全局错误处理
     * @param {string} message - 错误信息
     * @param {Error} error - 错误对象
     */
    static handleError(message, error) {
        console.error(message, error);
        const container = document.querySelector('.visualization-area');
        if (container) {
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;
                           color:#dc3545;font-weight:500;font-size:14px;text-align:center;">
                    <div>
                        <div>⚠️ ${message}</div>
                        <button onclick="location.reload()"
                                style="margin-top:10px;padding:5px 10px;border:1px solid #ccc;
                                      background:white;cursor:pointer;border-radius:3px;">
                            刷新页面
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// === 曲面生成器 - 核心功能类 ===
class SurfaceGenerator {
    /**
     * 生成二次曲面
     * @param {string} type - 曲面类型
     * @param {Object} params - 参数对象
     * @param {Object} options - 选项
     * @returns {Object} 包含网格数据的对象
     */
    static generate(type, params, options = {}) {
        const { range = CONFIG.DEFAULT_RANGE } = options;

        try {
            switch(type) {
                case 'ellipsoid':
                    return this.generateEllipsoid(params.a, params.b, params.c, range);
                case 'hyperboloid1':
                    return this.generateHyperboloid1(params.a, params.b, params.c, range);
                case 'hyperboloid2':
                    return this.generateHyperboloid2(params.a, params.b, params.c, range);
                case 'paraboloid1':
                    return this.generateEllipticParaboloid(params.a, params.b, range);
                case 'paraboloid2':
                    return this.generateHyperbolicParaboloid(params.a, params.b, range);
                case 'cone':
                    return this.generateCone(params.a, params.b, params.c, range);
                default:
                    throw new Error(`未知的二次曲面类型: ${type}`);
            }
        } catch (error) {
            Utils.handleError(`生成 ${type} 曲面时出错`, error);
            return this.generateDefaultSurface();
        }
    }

    static generateEllipsoid(a, b, c, range) {
        const x = [], y = [], z = [];
        const uStep = Math.PI / 30; // 更高的分辨率
        const vStep = 2 * Math.PI / 60;

        for (let phi = 0; phi <= Math.PI; phi += uStep) {
            const xRow = [], yRow = [], zRow = [];

            for (let theta = 0; theta <= 2 * Math.PI; theta += vStep) {
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);
                const cosPhi = Math.cos(phi);
                const sinPhi = Math.sin(phi);

                xRow.push(a * sinPhi * cosTheta);
                yRow.push(b * sinPhi * sinTheta);
                zRow.push(c * cosPhi);
            }

            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }

        return {
            x, y, z,
            name: '椭球面',
            equation: `\\frac{x^2}{${a}^2} + \\frac{y^2}{${b}^2} + \\frac{z^2}{${c}^2} = 1`,
            type: 'ellipsoid',
            volume: (4/3 * Math.PI * a * b * c).toFixed(3)
        };
    }

    static generateHyperboloid1(a, b, c, range) {
        const x = [], y = [], z = [];
        const uStep = 2 * Math.PI / 60;
        const vStep = range / 25;

        for (let v = -range; v <= range; v += vStep) {
            const xRow = [], yRow = [], zRow = [];

            // 避免虚数
            const factor = 1 + (v * v) / (c * c);
            if (factor > 0) {
                const coeff = Math.sqrt(factor);

                for (let u = 0; u <= 2 * Math.PI; u += uStep) {
                    xRow.push(a * coeff * Math.cos(u));
                    yRow.push(b * coeff * Math.sin(u));
                    zRow.push(v);
                }
            }

            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }

        return {
            x, y, z,
            name: '单叶双曲面',
            equation: `\\frac{x^2}{${a}^2} + \\frac{y^2}{${b}^2} - \\frac{z^2}{${c}^2} = 1`,
            type: 'hyperboloid1',
            properties: '中间收缩的双曲面，可以用直线生成'
        };
    }

    static generateHyperboloid2(a, b, c, range) {
        const x = [], y = [], z = [];

        // 第一叶 - z为正
        const upperX = [], upperY = [], upperZ = [];
        const upperUStep = 2 * Math.PI / 60;
        const upperVStep = range / 20;

        for (let v = c; v <= range; v += upperVStep) {
            const xRow = [], yRow = [], zRow = [];
            const coeff = Math.sqrt((v * v) / (c * c) - 1);

            if (!isNaN(coeff)) {
                for (let u = 0; u <= 2 * Math.PI; u += upperUStep) {
                    xRow.push(a * coeff * Math.cos(u));
                    yRow.push(b * coeff * Math.sin(u));
                    zRow.push(v);
                }
            }

            upperX.push(xRow);
            upperY.push(yRow);
            upperZ.push(zRow);
        }

        x.push(...upperX);
        y.push(...upperY);
        z.push(...upperZ);

        return {
            x, y, z,
            name: '双叶双曲面',
            equation: `\\frac{x^2}{${a}^2} + \\frac{y^2}{${b}^2} - \\frac{z^2}{${c}^2} = -1`,
            type: 'hyperboloid2',
            properties: '分离的两个叶片'
        };
    }

    static generateEllipticParaboloid(a, b, range) {
        const x = [], y = [], z = [];
        const steps = Math.max(30, range * 3);
        const stepSize = range / steps;

        for (let i = -steps; i <= steps; i++) {
            const ui = i * stepSize;
            const xRow = [], yRow = [], zRow = [];

            for (let j = -steps; j <= steps; j++) {
                const vj = j * stepSize;
                xRow.push(ui);
                yRow.push(vj);
                zRow.push((ui * ui) / (a * a) + (vj * vj) / (b * b));
            }

            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }

        return {
            x, y, z,
            name: '椭圆抛物面',
            equation: `\\frac{x^2}{${a}^2} + \\frac{y^2}{${b}^2} = z`,
            type: 'elliptic_paraboloid',
            properties: '开口向上的碗状曲面'
        };
    }

    static generateHyperbolicParaboloid(a, b, range) {
        const x = [], y = [], z = [];
        const steps = Math.max(30, range * 3);
        const stepSize = range / steps;

        for (let i = -steps; i <= steps; i++) {
            const ui = i * stepSize;
            const xRow = [], yRow = [], zRow = [];

            for (let j = -steps; j <= steps; j++) {
                const vj = j * stepSize;
                xRow.push(ui);
                yRow.push(vj);
                zRow.push((ui * ui) / (a * a) - (vj * vj) / (b * b));
            }

            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }

        return {
            x, y, z,
            name: '双曲抛物面',
            equation: `\\frac{x^2}{${a}^2} - \\frac{y^2}{${b}^2} = z`,
            type: 'hyperbolic_paraboloid',
            properties: '马鞍形的抛物面，可以用直线生成'
        };
    }

    static generateCone(a, b, c, range) {
        const x = [], y = [], z = [];
        const uStep = 2 * Math.PI / 60;
        const vStep = range / 20;

        for (let v = -range; v <= range; v += vStep) {
            const xRow = [], yRow = [], zRow = [];

            for (let u = 0; u <= 2 * Math.PI; u += uStep) {
                const factor = Math.abs(v) / c;
                xRow.push(a * factor * Math.cos(u));
                yRow.push(b * factor * Math.sin(u));
                zRow.push(v);
            }

            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }

        return {
            x, y, z,
            name: '圆锥面',
            equation: `\\frac{x^2}{${a}^2} + \\frac{y^2}{${b}^2} = \\frac{z^2}{${c}^2}`,
            type: 'cone',
            properties: '双锥形曲面，可以用直线生成'
        };
    }

    static generateDefaultSurface() {
        return this.generateEllipsoid(2, 1.5, 1, 3);
    }
}

// === 应用控制器 - 主管理类 ===
class SurfaceLabApp {
    constructor() {
        this.currentSurface = 'ellipsoid';
        this.currentPanel = 'quadric';
        this.plotlyContainer = null;
        this.isInitialized = false;
        this.surfaceData = {};
    }

    /**
     * 初始化应用
     */
    initialize() {
        if (this.isInitialized) return;

        try {
            this.plotlyContainer = document.getElementById('plotlyContainer');
            this.bindEvents();
            this.initializeNavigation();
            this.initializePlotly();
            this.updateSurface();

            this.isInitialized = true;
            console.log('✅ 空间曲面虚拟实验室初始化完成');

        } catch (error) {
            Utils.handleError('初始化应用失败', error);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 参数输入事件
        const debouncedUpdate = Utils.debounce(() => {
            if (this.currentPanel === 'quadric') {
                this.updateSurface();
            }
        }, CONFIG.INPUT_DEBOUNCE_DELAY);

        document.querySelectorAll('input[type="number"], select').forEach(input => {
            input.addEventListener('input', debouncedUpdate);
        });

        // 窗口大小调整
        window.addEventListener('resize', Utils.debounce(() => {
            this.resizePlotly();
        }, 100));
    }

    /**
     * 初始化导航
     */
    initializeNavigation() {
        const tabs = document.querySelectorAll('.tab');
        const panels = document.querySelectorAll('.panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchPanel(tab.getAttribute('data-panel'));
            });
        });
    }

    /**
     * 切换面板
     * @param {string} panelId - 面板ID
     */
    switchPanel(panelId) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });

        document.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
        document.getElementById(panelId).classList.add('active');

        this.currentPanel = panelId;

        setTimeout(() => {
            Utils.renderMathJax(document.body);
        }, CONFIG.MATH_RENDER_DELAY);

        if (panelId === 'quadric') {
            this.updateSurface();
        }
    }

    /**
     * 初始化Plotly
     */
    initializePlotly() {
        if (!this.plotlyContainer) {
            console.error('Plotly容器未找到');
            return;
        }

        this.plotlyContainer.style.width = '100%';
        this.plotlyContainer.style.height = '400px';

        if (typeof Plotly === 'undefined') {
            Utils.handleError('Plotly.js 库未加载', new Error('Plotly not found'));
            return;
        }

        // 清空容器
        this.plotlyContainer.innerHTML = '';
        console.log('✅ Plotly 初始化成功');
    }

    /**
     * 更新曲面显示
     */
    updateSurface() {
        if (!this.plotlyContainer || typeof Plotly === 'undefined') {
            console.warn('Plotly 未准备就绪');
            return;
        }

        const params = {
            a: Utils.safeParseNumber(document.getElementById('paramA')?.value, 2),
            b: Utils.safeParseNumber(document.getElementById('paramB')?.value, 1.5),
            c: Utils.safeParseNumber(document.getElementById('paramC')?.value, 1)
        };

        const options = {
            range: Utils.safeParseNumber(document.getElementById('rangeMax')?.value, CONFIG.DEFAULT_RANGE),
            colorScheme: document.getElementById('colorScheme')?.value || 'viridis',
            wireframe: document.getElementById('showWireframe')?.checked || false
        };

        try {
            this.surfaceData = SurfaceGenerator.generate(this.currentSurface, params, options);
            this.renderSurface(options);
            this.analyzeSurface();

        } catch (error) {
            Utils.handleError(`更新曲面时出错: ${this.currentSurface}`, error);
        }
    }

    /**
     * 渲染 3D 曲面
     * @param {Object} options - 渲染选项
     */
    renderSurface(options) {
        const trace = {
            type: 'surface',
            x: this.surfaceData.x,
            y: this.surfaceData.y,
            z: this.surfaceData.z,
            colorscale: options.colorScheme,
            showscale: false,
            hovertemplate:
                'x: %{x:.2f}<br>y: %{y:.2f}<br>z: %{z:.2f}<extra></extra>'
        };

        if (options.wireframe) {
            trace.contours = {
                x: { show: true, color: 'rgba(255,255,255,0.8)', width: 1 },
                y: { show: true, color: 'rgba(255,255,255,0.8)', width: 1 },
                z: { show: true, color: 'rgba(255,255,255,0.8)', width: 1 }
            };
        }

        const layout = {
            title: {
                text: this.surfaceData.name,
                font: { size: 16, family: 'Source Han Serif SC' },
                x: 0.5,
                xanchor: 'center'
            },
            scene: {
                xaxis: {
                    title: { text: 'X轴', font: { family: 'Source Han Serif SC' } },
                    gridcolor: '#ddd',
                    linecolor: '#666'
                },
                yaxis: {
                    title: { text: 'Y轴', font: { family: 'Source Han Serif SC' } },
                    gridcolor: '#ddd',
                    linecolor: '#666'
                },
                zaxis: {
                    title: { text: 'Z轴', font: { family: 'Source Han Serif SC' } },
                    gridcolor: '#ddd',
                    linecolor: '#666'
                },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.5 }
                },
                bgcolor: 'rgba(248,249,250,0.3)'
            },
            margin: { l: 0, r: 0, b: 50, t: 50 },
            paper_bgcolor: 'white',
            font: { family: 'Source Han Serif SC' }
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
                'pan2d', 'lasso2d', 'autoScale2d',
                'resetCameraLastSave3d', 'hoverClosestCartesian',
                'hoverCompareCartesian'
            ],
            locale: 'zh-CN'
        };

        Plotly.newPlot(this.plotlyContainer, [trace], layout, config);

        // 更新信息显示
        const surfaceNameEl = document.getElementById('surfaceName');
        if (surfaceNameEl) {
            surfaceNameEl.textContent = this.surfaceData.name;
        }
    }

    /**
     * 分析曲面性质
     */
    analyzeSurface() {
        const resultsDiv = document.getElementById('surfaceResults');
        if (!resultsDiv) return;

        const params = {
            a: Utils.safeParseNumber(document.getElementById('paramA')?.value),
            b: Utils.safeParseNumber(document.getElementById('paramB')?.value),
            c: Utils.safeParseNumber(document.getElementById('paramC')?.value)
        };

        let analysis = '';

        switch(this.currentSurface) {
            case 'ellipsoid':
                const volume = (4/3 * Math.PI * params.a * params.b * params.c).toFixed(3);
                analysis = this.createAnalysisItem('椭球面方程', `$${this.surfaceData.equation}$`) +
                          this.createAnalysisItem('半轴长度', `$a = ${params.a}$, $b = ${params.b}$, $c = ${params.c}$`) +
                          this.createAnalysisItem('体积', `$V = \\frac{4}{3}\\pi abc \\approx ${volume}$`) +
                          this.createAnalysisItem('性质', '闭合的凸曲面，所有截面都是椭圆，可以用球坐标参数化');
                break;

            case 'hyperboloid1':
                analysis = this.createAnalysisItem('单叶双曲面方程', `$${this.surfaceData.equation}$`) +
                          this.createAnalysisItem('参数范围', `$a = ${params.a}$, $b = ${params.b}$, $c = ${params.c}$`) +
                          this.createAnalysisItem('特性截面', `$z = 0$ 时为椭圆：$\\frac{x^2}{${params.a}^2} + \\frac{y^2}{${params.b}^2} = 1$`) +
                          this.createAnalysisItem('几何性质', '连通的单叶曲面，可以被无限多直线覆盖');
                break;

            case 'hyperboloid2':
                analysis = this.createAnalysisItem('双叶双曲面方程', `$${this.surfaceData.equation}$`) +
                          this.createAnalysisItem('参数', `$a = ${params.a}$, $b = ${params.b}$, $c = ${params.c}$`) +
                          this.createAnalysisItem('结构特征', '由两个分离的叶片组成') +
                          this.createAnalysisItem('几何性质', '所在的两个叶片在平行于z轴的平面上截出双曲线');
                break;

            case 'paraboloid1':
                analysis = this.createAnalysisItem('椭圆抛物面方程', `$${this.surfaceData.equation}$`) +
                          this.createAnalysisItem('参数', `$a = ${params.a}$, $b = ${params.b}$`) +
                          this.createAnalysisItem('顶点位置', '$(0, 0, 0)$') +
                          this.createAnalysisItem('形状特征', '开口向上的碗状曲面，截面为抛物线');
                break;

            case 'paraboloid2':
                analysis = this.createAnalysisItem('双曲抛物面方程', `$${this.surfaceData.equation}$`) +
                          this.createAnalysisItem('参数', `$a = ${params.a}$, $b = ${params.b}$`) +
                          this.createAnalysisItem('鞍点位置', '$(0, 0, 0)$') +
                          this.createAnalysisItem('几何性质', '马鞍形曲面，具有负的高斯曲率，可以被直线覆盖');
                break;

            case 'cone':
                analysis = this.createAnalysisItem('圆锥面方程', `$${this.surfaceData.equation}$`) +
                          this.createAnalysisItem('参数', `$a = ${params.a}$, $b = ${params.b}$, $c = ${params.c}$`) +
                          this.createAnalysisItem('顶点位置', '$(0, 0, 0)$') +
                          this.createAnalysisItem('生成性质', '可以被直线生成，双锥形结构');
                break;

            default:
                analysis = this.createAnalysisItem('未知曲面类型', '请选择有效曲面类型进行分析');
        }

        resultsDiv.innerHTML = analysis;
        Utils.renderMathJax(resultsDiv);
    }

    /**
     * 创建分析项HTML
     * @param {string} title - 标题
     * @param {string} content - 内容
     * @returns {string} HTML字符串
     */
    createAnalysisItem(title, content) {
        return `<div class="step"><strong>${title}：</strong>${content}</div>`;
    }

    /**
     * 调整Plotly尺寸
     */
    resizePlotly() {
        if (this.plotlyContainer && typeof Plotly !== 'undefined') {
            Plotly.Plots.resize(this.plotlyContainer);
        }
    }

    /**
     * 生成随机参数
     */
    randomParameters() {
        const paramA = document.getElementById('paramA');
        const paramB = document.getElementById('paramB');
        const paramC = document.getElementById('paramC');

        if (paramA) paramA.value = (Math.random() * 3 + 0.5).toFixed(1);
        if (paramB) paramB.value = (Math.random() * 3 + 0.5).toFixed(1);
        if (paramC) paramC.value = (Math.random() * 3 + 0.5).toFixed(1);

        this.updateSurface();
    }

    /**
     * 重置视角
     */
    resetView() {
        if (this.plotlyContainer && typeof Plotly !== 'undefined') {
            Plotly.relayout(this.plotlyContainer, {
                'scene.camera': {
                    eye: { x: 1.5, y: 1.5, z: 1.5 }
                }
            });
        }
    }

    /**
     * 加载指定曲面
     * @param {string} surfaceType - 曲面类型
     */
    loadSurface(surfaceType) {
        this.currentSurface = surfaceType;
        const selector = document.getElementById('surfaceType');
        if (selector) selector.value = surfaceType;
        this.updateSurface();
    }

    // === 旋转曲面生成器 ===
    generateRevolutionSurface() {
        if (!this.revolutionPlotlyContainer) {
            this.initializeRevolutionPlotly();
        }

        // 获取参数
        const generatrixType = document.getElementById('generatrixType')?.value || 'linear';
        const axis = document.getElementById('rotationAxis')?.value || 'z';
        const paramA = parseFloat(document.getElementById('funcParamA')?.value) || 1;
        const paramB = parseFloat(document.getElementById('funcParamB')?.value) || 0;
        const range = parseInt(document.getElementById('revolutionRange')?.value) || 360;
        const showWireframe = document.getElementById('showWireframeRev')?.checked || false;
        const showGeneratrix = document.getElementById('showGeneratrix')?.checked !== false;

        // 生成数据
        const surfaceData = this.generateRevolutionSurfaceData(generatrixType, axis, paramA, paramB, range);

        // 渲染
        this.renderRevolutionSurface(surfaceData, showWireframe, showGeneratrix);

        // 分析结果
        this.analyzeRevolutionSurface(generatrixType, axis, paramA, paramB, range);

        console.log('✅ 旋转曲面生成完成');
    }

    generateRevolutionSurfaceData(generatrixType, axis, paramA, paramB, range) {
        const uPoints = 30;
        const vPoints = 40;
        const uRange = range * Math.PI / 180; // 转换为弧度

        const x = [], y = [], z = [];

        // 获取母线函数
        const getRadius = (t) => {
            switch(generatrixType) {
                case 'linear': return Math.max(0.1, paramA * t + paramB);
                case 'quadratic': return Math.max(0.1, paramA * t * t + paramB);
                case 'exponential': return Math.max(0.1, paramA * Math.exp(paramB * t));
                case 'sine': return Math.max(0.1, paramA * Math.sin(paramB * t) + Math.abs(paramB));
                default: return Math.max(0.1, paramA * t + paramB);
            }
        };

        for (let i = 0; i < uPoints; i++) {
            const xRow = [], yRow = [], zRow = [];
            const t = (i / uPoints - 0.5) * 4; // 参数范围
            const radius = getRadius(t);

            for (let j = 0; j < vPoints; j++) {
                const angle = (j / vPoints) * uRange;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);

                switch(axis) {
                    case 'z':
                        xRow.push(radius * cosA);
                        yRow.push(radius * sinA);
                        zRow.push(t);
                        break;
                    case 'x':
                        xRow.push(t);
                        yRow.push(radius * cosA);
                        zRow.push(radius * sinA);
                        break;
                    case 'y':
                        xRow.push(radius * cosA);
                        yRow.push(t);
                        zRow.push(radius * sinA);
                        break;
                }
            }

            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }

        return {
            x, y, z,
            name: this.getRotationSurfaceName(generatrixType, axis),
            equation: this.getRotationEquation(generatrixType, axis, paramA, paramB),
            generatrix: generatrixType,
            axis: axis,
            params: { a: paramA, b: paramB }
        };
    }

    getRotationSurfaceName(generatrixType, axis) {
        const typeNames = {
            linear: '直线',
            quadratic: '抛物线',
            exponential: '指数',
            sine: '正弦'
        };
        const functionName = typeNames[generatrixType] || '母线';
        const axisName = axis.toUpperCase();
        return `绕${axisName}轴旋转的${functionName}曲面`;
    }

    getRotationEquation(generatrixType, axis, paramA, paramB) {
        let functionEq;
        switch(generatrixType) {
            case 'linear': functionEq = `${paramA}x + ${paramB}`; break;
            case 'quadratic': functionEq = `${paramA}x^2 + ${paramB}`; break;
            case 'exponential': functionEq = `${paramA}e^{${paramB}x}`; break;
            case 'sine': functionEq = `${paramA}\\sin(${paramB}x) + |${paramB}|`; break;
            default: functionEq = `${paramA}x + ${paramB}`;
        }

        const vars = axis === 'z' ? ['x', 'y', 'z'] : axis === 'x' ? ['x', 'y', 'z'] : ['x', 'z', 'y'];
        return `${vars[0]}^2 + ${vars[1]}^2 = (${functionEq})^2`;
    }

    renderRevolutionSurface(surfaceData, showWireframe, showGeneratrix) {
        const traces = [];

        // 主曲面
        const surfaceTrace = {
            type: 'surface',
            x: surfaceData.x,
            y: surfaceData.y,
            z: surfaceData.z,
            colorscale: 'viridis',
            showscale: false
        };

        if (showWireframe) {
            surfaceTrace.contours = {
                x: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 },
                y: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 },
                z: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 }
            };
        }

        traces.push(surfaceTrace);

        // 显示母线（如果勾选）
        if (showGeneratrix) {
            const centerLine = this.generateCenterLine(surfaceData);
            traces.push({
                type: 'scatter3d',
                x: centerLine.x,
                y: centerLine.y,
                z: centerLine.z,
                mode: 'lines',
                line: { color: 'red', width: 6 },
                name: '母线'
            });
        }

        const layout = {
            title: {
                text: surfaceData.name,
                font: { size: 16, family: 'Source Han Serif SC' },
                x: 0.5,
                xanchor: 'center'
            },
            scene: {
                xaxis: { title: { text: 'X轴', font: { family: 'Source Han Serif SC' } } },
                yaxis: { title: { text: 'Y轴', font: { family: 'Source Han Serif SC' } } },
                zaxis: { title: { text: 'Z轴', font: { family: 'Source Han Serif SC' } } },
                camera: { eye: { x: 2, y: 2, z: 2 } }
            },
            margin: { l: 0, r: 0, b: 40, t: 50 }
        };

        Plotly.newPlot(this.revolutionPlotlyContainer, traces, layout, {
            responsive: true,
            displayModeBar: true
        });
    }

    generateCenterLine(surfaceData) {
        const centerX = [], centerY = [], centerZ = [];
        const midIndex = Math.floor(surfaceData.x[0].length / 2);

        surfaceData.x.forEach((row, i) => {
            centerX.push(row[midIndex]);
            centerY.push(surfaceData.y[i][midIndex]);
            centerZ.push(surfaceData.z[i][midIndex]);
        });

        return { x: centerX, y: centerY, z: centerZ };
    }

    analyzeRevolutionSurface(generatrixType, axis, paramA, paramB, range) {
        const resultsDiv = document.getElementById('revolutionResults');
        if (!resultsDiv) return;

        const analysis = this.createAnalysisItem('方程类型', `绕${axis}轴旋转的${generatrixType}函数形成的旋转曲面`) +
                        this.createAnalysisItem('母线方程', this.getGeneratrixEquation(generatrixType, paramA, paramB)) +
                        this.createAnalysisItem('旋转范围', `0° ~ ${range}°`) +
                        this.createAnalysisItem('几何性质', this.getRevolutionProperties(generatrixType, axis)) +
                        this.createAnalysisItem('应用领域', '建筑设计、机械零件、艺术造型等');

                        resultsDiv.innerHTML = analysis;
        Utils.renderMathJax(resultsDiv);
    }

    getGeneratrixEquation(type, a, b) {
        switch(type) {
            case 'linear': return `$r(z) = ${a}z + ${b}$`;
            case 'quadratic': return `$r(z) = ${a}z^2 + ${b}$`;
            case 'exponential': return `$r(z) = ${a}e^{${b}z}$`;
            case 'sine': return `$r(z) = ${a}\\sin(${b}z) + |${b}|$`;
            default: return `$r(z) = ${a}z + ${b}$`;
        }
    }

    getRevolutionProperties(type, axis) {
        switch(type) {
            case 'linear': return '形成圆锥面，母线与旋转轴的角度为固定角度';
            case 'quadratic': return '形成高阶旋转曲面，具有复杂的曲率特性';
            case 'exponential': return '形成指数型旋转曲面，沿旋转轴方向变化快速';
            case 'sine': return '形成波浪状旋转曲面，具有周期性变化特征';
            default: return '基本旋转曲面性质';
        }
    }

    // === 柱面生成器 ===
    generateCylinder() {
        if (!this.cylinderPlotlyContainer) {
            this.initializeCylinderPlotly();
        }

        // 获取参数
        const directrixType = document.getElementById('directrixType')?.value || 'circle';
        const direction = document.getElementById('generatorDirection')?.value || 'z';
        const paramA = parseFloat(document.getElementById('cylParamA')?.value) || 2;
        const paramB = parseFloat(document.getElementById('cylParamB')?.value) || 1;
        const height = parseInt(document.getElementById('cylinderHeight')?.value) || 5;
        const showDirectrix = document.getElementById('showDirectrix')?.checked !== false;
        const showWireframe = document.getElementById('showWireframeCyl')?.checked || false;

        // 生成数据
        const surfaceData = this.generateCylinderData(directrixType, direction, paramA, paramB, height);

        // 渲染
        this.renderCylinder(surfaceData, showWireframe, showDirectrix);

        // 分析结果
        this.analyzeCylinder(directrixType, direction, paramA, paramB, height);

        console.log('✅ 柱面生成完成');
    }

    generateCylinderData(directrixType, direction, paramA, paramB, height) {
        const uPoints = 30;
        const vPoints = 30;
        const range = height;

        const x = [], y = [], z = [];

        // 获取准线函数
        const getDirectrixPoint = (t, u) => {
            let x, y;
            switch(directrixType) {
                case 'circle':
                    const radius = Math.max(0.1, paramA * (1 + 0.1 * Math.sin(2 * Math.PI * u)));
                    x = radius * Math.cos(2 * Math.PI * u);
                    y = radius * Math.sin(2 * Math.PI * u);
                    break;
                case 'ellipse':
                    x = paramA * Math.cos(2 * Math.PI * u);
                    y = paramB * Math.sin(2 * Math.PI * u);
                    break;
                case 'parabola':
                    x = t;
                    y = paramA * t * t + paramB;
                    break;
                case 'hyperbola':
                    x = paramA / Math.tan(Math.PI * u) || paramA;
                    y = paramB * Math.tan(Math.PI * u) || paramB;
                    break;
                default:
                    x = paramA * Math.cos(2 * Math.PI * u);
                    y = paramB * Math.sin(2 * Math.PI * u);
            }
            return { x, y };
        };

        for (let i = 0; i < uPoints; i++) {
            const xRow = [], yRow = [], zRow = [];
            const u = i / uPoints;

            for (let j = 0; j < vPoints; j++) {
                const v = (j / (vPoints - 1) - 0.5) * range * 2;
                const directrix = getDirectrixPoint(v, u);

                switch(direction) {
                    case 'z':
                        xRow.push(directrix.x);
                        yRow.push(directrix.y);
                        zRow.push(v);
                        break;
                    case 'x':
                        xRow.push(v);
                        yRow.push(directrix.x);
                        zRow.push(directrix.y);
                        break;
                    case 'y':
                        xRow.push(directrix.x);
                        yRow.push(v);
                        zRow.push(directrix.y);
                        break;
                }
            }

            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
        }

        return {
            x, y, z,
            name: this.getCylinderName(directrixType, direction),
            directrix: directrixType,
            direction: direction,
            params: { a: paramA, b: paramB, height: range }
        };
    }

    getCylinderName(directrixType, direction) {
        const typeNames = {
            circle: '圆',
            ellipse: '椭圆',
            parabola: '抛物线',
            hyperbola: '双曲线'
        };
        const plotName = typeNames[directrixType] || '平面曲线';
        return `准线为${plotName}的柱面（平行${direction.toUpperCase()}轴）`;
    }

    renderCylinder(surfaceData, showWireframe, showDirectrix) {
        const traces = [];

        // 主柱面
        const surfaceTrace = {
            type: 'surface',
            x: surfaceData.x,
            y: surfaceData.y,
            z: surfaceData.z,
            colorscale: 'plasma',
            showscale: false
        };

        if (showWireframe) {
            surfaceTrace.contours = {
                x: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 },
                y: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 },
                z: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 }
            };
        }

        traces.push(surfaceTrace);

        // 显示准线交叉
        if (showDirectrix) {
            const directrixLines = this.generateDirectrixLines(surfaceData);
            directrixLines.forEach(line => {
                traces.push(line);
            });
        }

        const layout = {
            title: {
                text: surfaceData.name,
                font: { size: 16, family: 'Source Han Serif SC' },
                x: 0.5,
                xanchor: 'center'
            },
            scene: {
                xaxis: { title: { text: 'X轴', font: { family: 'Source Han Serif SC' } } },
                yaxis: { title: { text: 'Y轴', font: { family: 'Source Han Serif SC' } } },
                zaxis: { title: { text: 'Z轴', font: { family: 'Source Han Serif SC' } } },
                camera: { eye: { x: 2, y: 2, z: 2 } }
            },
            margin: { l: 0, r: 0, b: 40, t: 50 }
        };

        Plotly.newPlot(this.cylinderPlotlyContainer, traces, layout, {
            responsive: true,
            displayModeBar: true
        });
    }

    generateDirectrixLines(surfaceData) {
        const lines = [];
        const midV = Math.floor(surfaceData.x[0].length / 2);
        const midU = Math.floor(surfaceData.x.length / 2);

        // 添加几条代表性的准线
        for (let i = 0; i < 3; i++) {
            const uIndex = Math.floor(surfaceData.x.length * (0.3 + i * 0.2));
            const x = [], y = [], z = [];

            surfaceData.x[uIndex].forEach((val, j) => {
                x.push(val);
                y.push(surfaceData.y[uIndex][j]);
                z.push(surfaceData.z[uIndex][j]);
            });

            lines.push({
                type: 'scatter3d',
                x, y, z,
                mode: 'lines',
                line: { color: ['#ff6b6b', '#4ecdc4', '#45b7d1'][i], width: 4 },
                name: `准线 ${i + 1}`
            });
        }

        return lines;
    }

    analyzeCylinder(directrixType, direction, paramA, paramB, height) {
        const resultsDiv = document.getElementById('cylinderResults');
        if (!resultsDiv) return;

        const analysis = this.createAnalysisItem('柱面类型', `${directrixType}柱面`) +
                        this.createAnalysisItem('准线', this.getDirectrixEquation(directrixType, paramA, paramB)) +
                        this.createAnalysisItem('生成方向', `母线平行于${direction.toUpperCase()}轴`) +
                        this.createAnalysisItem('尺寸', `高度: ${height} 单位`) +
                        this.createAnalysisItem('几何特性', this.getCylinderProperties(directrixType, direction));

                        resultsDiv.innerHTML = analysis;
        Utils.renderMathJax(resultsDiv);
    }

    getDirectrixEquation(type, a, b) {
        switch(type) {
            case 'circle': return `$x^2 + y^2 = ${a}^2$`;
            case 'ellipse': return `$\\frac{x^2}{${a}^2} + \\frac{y^2}{${b}^2} = 1$`;
            case 'parabola': return `$y = ${a}x^2 + ${b}$`;
            case 'hyperbola': return `$\\frac{x^2}{${a}^2} - \\frac{y^2}{${b}^2} = 1$`;
            default: return `$x^2 + y^2 = ${a}^2$`;
        }
    }

    getCylinderProperties(type, direction) {
        const properties = {
            circle: '圆柱面上任意两个平行母线的距离相等',
            ellipse: '形成椭圆柱面，除平行于母线的直线外，都与柱面相交',
            parabola: '形成抛物柱面，与柱面相交的直线不完全平行于母线',
            hyperbola: '形成双曲柱面，具有复杂的截面特征'
        };
        return properties[type] || '基本柱面几何特性';
    }

    // === 参数曲面生成器 ===
    generateParametricSurface() {
        if (!this.parametricPlotlyContainer) {
            this.initializeParametricPlotly();
        }

        // 获取参数
        const xExpr = document.getElementById('paramX')?.value || 'u*cos(v)';
        const yExpr = document.getElementById('paramY')?.value || 'u*sin(v)';
        const zExpr = document.getElementById('paramZ')?.value || 'v';
        const uMin = parseFloat(document.getElementById('uMin')?.value) || 0;
        const uMax = parseFloat(document.getElementById('uMax')?.value) || 2;
        const vMin = parseFloat(document.getElementById('vMin')?.value) || 0;
        const vMax = parseFloat(document.getElementById('vMax')?.value) || 6.28;
        const density = parseInt(document.getElementById('densityDisplay')?.textContent) || 25;
        const showWireframe = document.getElementById('showWireframeParam')?.checked || false;

        // 生成数据
        const surfaceData = this.generateParametricData(xExpr, yExpr, zExpr, uMin, uMax, vMin, vMax, density);

        // 渲染
        this.renderParametricSurface(surfaceData, showWireframe);

        // 分析结果
        this.analyzeParametricSurface(xExpr, yExpr, zExpr);

        console.log('✅ 参数曲面生成完成');
    }

    generateParametricData(xExpr, yExpr, zExpr, uMin, uMax, vMin, vMax, density) {
        const x = [], y = [], z = [];
        const uRange = uMax - uMin;
        const vRange = vMax - vMin;

        try {
            // 使用Function构造函数创建数学函数（注意安全考虑）
            const xFunc = new Function('u', 'v', 'Math', 'sin', 'cos', 'tan', 'sqrt',
                `return ${xExpr.replace(/\^/g, '**')};`);
            const yFunc = new Function('u', 'v', 'Math', 'sin', 'cos', 'tan', 'sqrt',
                `return ${yExpr.replace(/\^/g, '**')};`);
            const zFunc = new Function('u', 'v', 'Math', 'sin', 'cos', 'tan', 'sqrt',
                `return ${zExpr.replace(/\^/g, '**')};`);

            for (let i = 0; i < density; i++) {
                const xRow = [], yRow = [], zRow = [];
                const u = uMin + (i / (density - 1)) * uRange;

                for (let j = 0; j < density; j++) {
                    const v = vMin + (j / (density - 1)) * vRange;

                    try {
                        const xVal = xFunc(u, v, Math, Math.sin, Math.cos, Math.tan, Math.sqrt);
                        const yVal = yFunc(u, v, Math, Math.sin, Math.cos, Math.tan, Math.sqrt);
                        const zVal = zFunc(u, v, Math, Math.sin, Math.cos, Math.tan, Math.sqrt);

                        xRow.push(isNaN(xVal) ? 0 : xVal);
                        yRow.push(isNaN(yVal) ? 0 : yVal);
                        zRow.push(isNaN(zVal) ? 0 : zVal);
                    } catch (e) {
                        xRow.push(0);
                        yRow.push(0);
                        zRow.push(0);
                    }
                }

                x.push(xRow);
                y.push(yRow);
                z.push(zRow);
            }
        } catch (e) {
            console.warn('参数曲面生成错误:', e);
            return null;
        }

        return {
            x, y, z,
            equations: { x: xExpr, y: yExpr, z: zExpr },
            name: '自定义参数曲面'
        };
    }

    renderParametricSurface(surfaceData, showWireframe) {
        if (!surfaceData) {
            console.error('参数曲面数据无效');
            return;
        }

        const surfaceTrace = {
            type: 'surface',
            x: surfaceData.x,
            y: surfaceData.y,
            z: surfaceData.z,
            colorscale: 'rainbow',
            showscale: false
        };

        if (showWireframe) {
            surfaceTrace.contours = {
                x: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 },
                y: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 },
                z: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 }
            };
        }

        const layout = {
            title: {
                text: surfaceData.name,
                font: { size: 16, family: 'Source Han Serif SC' },
                x: 0.5,
                xanchor: 'center'
            },
            scene: {
                xaxis: { title: { text: 'X轴', font: { family: 'Source Han Serif SC' } } },
                yaxis: { title: { text: 'Y轴', font: { family: 'Source Han Serif SC' } } },
                zaxis: { title: { text: 'Z轴', font: { family: 'Source Han Serif SC' } } },
                camera: { eye: { x: 2, y: 2, z: 2 } }
            },
            margin: { l: 0, r: 0, b: 40, t: 50 }
        };

        Plotly.newPlot(this.parametricPlotlyContainer, [surfaceTrace], layout, {
            responsive: true,
            displayModeBar: true
        });
    }

    analyzeParametricSurface(xExpr, yExpr, zExpr) {
        const resultsDiv = document.getElementById('parametricResults');
        if (!resultsDiv) return;

        const analysis = this.createAnalysisItem('参数方程', `$$\\vec{r}(u,v) = \\begin{pmatrix} ${xExpr} \\\\ ${yExpr} \\\\ ${zExpr} \\end{pmatrix}$$`) +
                        this.createAnalysisItem('定义域', '参数 $u, v$ 的合理值范围') +
                        this.createAnalysisItem('几何特性', '根据参数方程的具体形式确定') +
                        this.createAnalysisItem('应用价值', '参数化表示提供了更灵活的曲面描述方式');

        resultsDiv.innerHTML = analysis;
        this.renderMathJax(resultsDiv);
    }

    // === 初始化函数 ===
    initializeRevolutionPlotly() {
        const container = document.getElementById('revolutionPlotlyContainer');
        if (container && typeof Plotly !== 'undefined') {
            this.revolutionPlotlyContainer = container;
            container.style.width = '100%';
            container.style.height = '400px';
            console.log('✅ 旋转曲面Plotly容器初始化成功');
        }
    }

    initializeCylinderPlotly() {
        const container = document.getElementById('cylinderPlotlyContainer');
        if (container && typeof Plotly !== 'undefined') {
            this.cylinderPlotlyContainer = container;
            container.style.width = '100%';
            container.style.height = '400px';
            console.log('✅ 柱面Plotly容器初始化成功');
        }
    }

    initializeParametricPlotly() {
        const container = document.getElementById('parametricPlotlyContainer');
        if (container && typeof Plotly !== 'undefined') {
            this.parametricPlotlyContainer = container;
            container.style.width = '100%';
            container.style.height = '400px';
            console.log('✅ 参数曲面Plotly容器初始化成功');
        }
    }
}

// === 全局实例和API绑定 ===
// 创建主应用实例
const app = new SurfaceLabApp();

// 绑定到全局作用域供HTML调用
window.app = app;
window.generateSurface = () => app.updateSurface();
window.randomParameters = () => app.randomParameters();
window.resetView = () => app.resetView();
window.analyzeSurface = () => app.analyzeSurface();
window.loadSurface = (type) => app.loadSurface(type);

// === 修复全局函数调用 ===
window.generateRevolutionSurface = () => {
    try {
        app.initializeRevolutionPlotly();
        app.generateRevolutionSurface();
    } catch(e) {
        alert('❌ 旋转曲面生成失败，请检查参数设置');
        console.error('旋转曲面生成失败:', e);
    }
};

window.generateCylinder = () => {
    try {
        app.initializeCylinderPlotly();
        app.generateCylinder();
    } catch(e) {
        alert('❌ 柱面生成失败，请检查参数设置');
        console.error('柱面生成失败:', e);
    }
};

window.generateParametricSurface = () => {
    try {
        app.initializeParametricPlotly();
        app.generateParametricSurface();
    } catch(e) {
        alert('❌ 参数曲面生成失败，请检查方程有效性');
        console.error('参数曲面生成失败:', e);
    }
};

window.validateEquations = () => {
    try {
        const xExpr = document.getElementById('paramX')?.value || '';
        const yExpr = document.getElementById('paramY')?.value || '';
        const zExpr = document.getElementById('paramZ')?.value || '';

        const resultsDiv = document.getElementById('parametricResults');
        if (!resultsDiv) return;

        // 验证方程语法
        const validationResult = validateParametricEquations(xExpr, yExpr, zExpr);

        resultsDiv.innerHTML = `
            <div class="step"><strong>方程验证结果：</strong>${validationResult.message}</div>
            ${validationResult.details ? validationResult.details.map(detail =>
                `<div class="step"><strong>${detail.title}：</strong>${detail.content}</div>`).join('') : ''}
        `;

        Utils.renderMathJax(resultsDiv);

        // 生成测试曲面
        if (validationResult.valid) {
            app.generateParametricSurface();
        }

    } catch(e) {
        console.error('方程验证失败:', e);
        const resultsDiv = document.getElementById('parametricResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = '<div class="step" style="color: #dc3545;"><strong>验证失败：</strong>请检查方程语法</div>';
        }
    }
};

window.calculateProperties = () => {
    try {
        const xExpr = document.getElementById('paramX')?.value || 'u';
        const yExpr = document.getElementById('paramY')?.value || 'v';
        const zExpr = document.getElementById('paramZ')?.value || '0';
        const u = parseFloat(document.getElementById('pointU')?.value) || 0;
        const v = parseFloat(document.getElementById('pointV')?.value) || 0;
        const propertyType = document.getElementById('propertyType')?.value || 'tangent';

        const resultsDiv = document.getElementById('propertyResults');
        if (!resultsDiv) return;

        const properties = calculateSurfaceProperties(xExpr, yExpr, zExpr, u, v, propertyType);

        let html = `<div class="step"><strong>计算点：</strong>$(u,v) = (${u}, ${v})$</div>`;

        properties.forEach(prop => {
            html += `<div class="step"><strong>${prop.title}：</strong>${prop.content}</div>`;
        });

        resultsDiv.innerHTML = html;
        Utils.renderMathJax(resultsDiv);

    } catch(e) {
        console.error('性质计算失败:', e);
        const resultsDiv = document.getElementById('propertyResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = '<div class="step" style="color: #dc3545;"><strong>计算失败：</strong>请检查参数和方程</div>';
        }
    }
};

// 参数方程验证函数
function validateParametricEquations(xExpr, yExpr, zExpr) {
    const result = {
        valid: false,
        message: '❌ 方程验证失败',
        details: []
    };

    // 基础语法检查
    if (!xExpr.trim() || !yExpr.trim() || !zExpr.trim()) {
        result.message = '❌ 方程不能为空，请输入完整的参数方程';
        return result;
    }

    // 验证数学语法
    const allowedFunctions = ['sin', 'cos', 'tan', 'sqrt', 'exp', 'log', 'abs', 'pow', 'Math.sin', 'Math.cos', 'Math.tan'];
    const detectedFunctions = [];

    [xExpr, yExpr, zExpr].forEach((expr, index) => {
        try {
            // 检查括号匹配
            let openBrackets = 0;
            let closeBrackets = 0;

            for (let char of expr) {
                if (char === '(') openBrackets++;
                else if (char === ')') closeBrackets++;
            }

            if (openBrackets !== closeBrackets) {
                result.details.push({
                    title: ['X分量', 'Y分量', 'Z分量'][index] + '语法错误',
                    content: '括号不匹配，请检查括号配对'
                });
                return;
            }

            // 检查变量使用
            if (!expr.includes('u') && !expr.includes('v')) {
                result.details.push({
                    title: ['X分量', 'Y分量', 'Z分量'][index] + '警告',
                    content: '没有使用参数变量 u 或 v'
                });
            }

            // 检查是否包含危险表达式
            if (expr.includes('eval') || expr.includes('Function') || expr.includes('constructor')) {
                result.details.push({
                    title: ['X分量', 'Y分量', 'Z分量'][index] + '安全警告',
                    content: '检测到潜在的安全风险表达式'
                });
                return;
            }

        } catch(e) {
            result.details.push({
                title: ['X分量', 'Y分量', 'Z分量'][index] + '语法错误',
                content: '数学表达式语法错误：' + e.message
            });
        }
    });

    if (result.details.length === 0) {
        result.valid = true;
        result.message = '✅ 方程验证通过，语法正确';

        // 添加详细信息
        result.details.push(
            {
                title: '方程格式',
                content: `$$\\vec{r}(u,v) = \\begin{pmatrix} ${xExpr} \\\\ ${yExpr} \\\\ ${zExpr} \\end{pmatrix}$$`
            },
            {
                title: '参数范围',
                content: '建议 u,v 在 [-π,π] 或 [0,2π] 范围内'
            },
            {
                title: '可生成性',
                content: '方程已通过验证，可以正常生成曲面'
            }
        );
    }

    return result;
}

// 曲面性质计算函数
function calculateSurfaceProperties(xExpr, yExpr, zExpr, u, v, type) {
    const properties = [];

    try {
        // 定义数学函数
        const funcs = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sqrt: Math.sqrt,
            exp: Math.exp,
            log: Math.log,
            abs: Math.abs,
            pow: Math.pow,
            pi: Math.PI,
            e: Math.E
        };

        // 安全评估表达式
        const safeEval = (expression, uVal, vVal) => {
            try {
                const expr = expression.replace(/\^/g, '**');
                const func = new Function('u', 'v', 'funcs', `return funcs.${expr}`);
                return func(uVal, vVal, funcs);
            } catch(e) {
                throw new Error('表达式计算错误');
            }
        };

        // 计算位置向量
        const x = safeEval(xExpr, u, v);
        const y = safeEval(yExpr, u, v);
        const z = safeEval(zExpr, u, v);

        if (isNaN(x) || isNaN(y) || isNaN(z) || !isFinite(x) || !isFinite(y) || !isFinite(z)) {
            properties.push({
                title: '计算失败',
                content: '无法在该参数点计算有效值'
            });
            return properties;
        }

        // 基本信息
        properties.push({
            title: '位置向量',
            content: `$$\\vec{r}(${u}, ${v}) = (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})$$`
        });

        // 根据计算类型返回不同结果
        switch(type) {
            case 'tangent':
                // 计算偏径向量
                try {
                    const xu = (safeEval(xExpr.replace(/v/g, `(${v}+0.01)`), u, v+0.01) -
                               safeEval(xExpr.replace(/v/g, `(${v})`), u, v)) / 0.01;
                    const yu = safeEval(yExpr.replace(/v/g, `(${v}+0.01)`), u, v+0.01) -
                               safeEval(yExpr.replace(/v/g, `(${v})`), u, v);
                    const zu = safeEval(zExpr.replace(/v/g, `(${v}+0.01)`), u, v+0.01) -
                               safeEval(zExpr.replace(/v/g, `(${v})`), u, v);

                    properties.push({
                        title: 'u方向偏径向量',
                        content: `$$\\frac{\\partial \\vec{r}}{\\partial u} = (${xu.toFixed(3)}, ${yu.toFixed(3)}, ${zu.toFixed(3)})$$`
                    });
                } catch(e) {
                    properties.push({
                        title: 'u向导数',
                        content: '无法计算偏导数'
                    });
                }
                break;

            case 'normal':
                properties.push({
                    title: '法向量计算',
                    content: '法向量 = u偏径 × v偏径向量'
                });
                break;

            case 'curvature':
                properties.push({
                    title: '高斯曲率',
                    content: '$$K = \\frac{LN - M^2}{EG - F^2}$$'
                });
                properties.push({
                    title: '平均曲率',
                    content: '$$H = \\frac{1}{2} \\cdot \\frac{EN - 2FM + GL}{EG - F^2}$$'
                });
                break;

            case 'area':
                properties.push({
                    title: '第一基本形式',
                    content: '面积元素 dA = |∂r/∂u × ∂r/∂v| du dv'
                });
                break;

            default:
                properties.push({
                    title: '可用计算类型',
                    content: '切平面、法向量、曲率、面积'
                });
        }

    } catch(e) {
        properties.push({
            title: '计算错误',
            content: '参数方程在该点可能存在奇异性'
        });
    }

    return properties;
}

// 重置视图函数
window.resetRevolutionView = () => {
    if (app.revolutionPlotlyContainer && typeof Plotly !== 'undefined') {
        Plotly.relayout(app.revolutionPlotlyContainer, {
            'scene.camera': { eye: { x: 2, y: 2, z: 2 } }
        });
    }
};

window.resetCylinderView = () => {
    if (app.cylinderPlotlyContainer && typeof Plotly !== 'undefined') {
        Plotly.relayout(app.cylinderPlotlyContainer, {
            'scene.camera': { eye: { x: 2, y: 2, z: 2 } }
        });
    }
};

window.resetParametricView = () => {
    if (app.parametricPlotlyContainer && typeof Plotly !== 'undefined') {
        Plotly.relayout(app.parametricPlotlyContainer, {
            'scene.camera': { eye: { x: 2, y: 2, z: 2 } }
        });
    }
};

// 更新函数
window.updateGeneratrix = () => app.generateRevolutionSurface();
window.updateRevolutionSurface = () => app.generateRevolutionSurface();
window.updateCylinder = () => app.generateCylinder();
window.updateCylinderHeight = () => {
    const height = parseInt(document.getElementById('cylinderHeight')?.value) || 5;
    document.getElementById('heightDisplay')?.textContent?.replace(/^\d+$/, height);
    app.generateCylinder();
};
window.updateMeshDensity = () => {
    const density = parseInt(document.getElementById('meshDensity')?.value) || 25;
    document.getElementById('densityDisplay').textContent = density;
    app.generateParametricSurface();
};
window.updateParametricSurface = () => app.generateParametricSurface();
window.loadPresetSurface = () => {
    const preset = document.getElementById('presetSurfaces')?.value;
    const presetEquations = {
        'sphere': { x: '2*sin(u)*cos(v)', y: '2*sin(u)*sin(v)', z: '2*cos(u)' },
        'torus': { x: '(2+cos(v))*cos(u)', y: '(2+cos(v))*sin(u)', z: 'sin(v)' },
        'mobius': { x: '(1+0.5*cos(0.5*u))*cos(u)', y: '(1+0.5*cos(0.5*u))*sin(u)', z: '0.5*sin(0.5*u)' },
        'klein': { x: '(2+cos(v))*(sin(u))', y: '(2+cos(v))*(cos(u))', z: 'sin(v)' },
        'helicoid': { x: 'u*cos(v)', y: 'u*sin(v)', z: 'v' },
        'catenoid': { x: 'cosh(v)*cos(u)', y: 'cosh(v)*sin(u)', z: 'v' }
    };

    if (preset !== 'custom' && presetEquations[preset]) {
        const eq = presetEquations[preset];
        const xElement = document.getElementById('paramX');
        const yElement = document.getElementById('paramY');
        const zElement = document.getElementById('paramZ');

        if (xElement) xElement.value = eq.x;
        if (yElement) yElement.value = eq.y;
        if (zElement) zElement.value = eq.z;

        app.generateParametricSurface();
    }
};

// 处理样式变量
function updateCSSVariables() {
    const root = document.documentElement;
    root.style.setProperty('--font-h1', '22px');
    root.style.setProperty('--font-h2', '18px');
    root.style.setProperty('--font-button', '14px');
}

// === 初始化 ===
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保所有资源加载完成
    setTimeout(() => {
        try {
            updateCSSVariables();
            app.initialize();

            // 等待MathJax完成初始化
            if (window.MathJax) {
                window.MathJax.startup.promise
                    .then(() => {
                        console.log('✅ MathJax 初始化完成');
                        Utils.renderMathJax(document.body);
                    })
                    .catch(err => {
                        console.warn('⚠️ MathJax 初始化失败，使用降级显示:', err);
                    });
            }

        } catch (error) {
            Utils.handleError('应用初始化失败', error);
        }
    }, 100);
});

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('应用运行时错误:', e.error);
    Utils.handleError('应用遇到错误，请刷新页面重试', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
});

// 页面加载完成
window.addEventListener('load', function() {
    console.log('🚀 Lab 6-8: 常见的空间曲面虚拟实验室已启动');
    Utils.renderMathJax(document.body);
});

console.log('📚 Lab 6-8 JavaScript 模块已加载');
