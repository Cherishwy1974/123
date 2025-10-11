/**
 * 课程导航组件
 * 提供课程间跳转、进度追踪、返回主页等功能
 * 使用方法：在课件HTML底部引入此脚本
 * <script src="./assets/course-navigation.js"></script>
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        storageKey: 'calculus_course_progress',
        configFile: './courses-config.json',
        indexPage: './index.html'
    };

    // 课程导航管理器
    class CourseNavigator {
        constructor() {
            this.courseData = null;
            this.currentLesson = null;
            this.init();
        }

        async init() {
            await this.loadCourseData();
            this.detectCurrentLesson();
            this.injectNavigationUI();
            this.setupEventListeners();
        }

        async loadCourseData() {
            try {
                const response = await fetch(CONFIG.configFile);
                this.courseData = await response.json();
            } catch (error) {
                console.error('加载课程数据失败:', error);
            }
        }

        detectCurrentLesson() {
            if (!this.courseData) return;

            const currentFile = window.location.pathname.split('/').pop();
            
            for (const chapter of this.courseData.chapters) {
                const lessonIndex = chapter.lessons.findIndex(l => l.file === currentFile);
                if (lessonIndex !== -1) {
                    this.currentLesson = {
                        chapter: chapter,
                        lesson: chapter.lessons[lessonIndex],
                        lessonIndex: lessonIndex,
                        file: currentFile
                    };
                    break;
                }
            }
        }

        getAdjacentLessons() {
            if (!this.currentLesson) return { prev: null, next: null };

            const { chapter, lessonIndex } = this.currentLesson;
            const lessons = chapter.lessons;

            return {
                prev: lessonIndex > 0 ? lessons[lessonIndex - 1] : null,
                next: lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null
            };
        }

        injectNavigationUI() {
            if (!this.currentLesson) return;

            const navHTML = this.createNavigationHTML();
            const navElement = document.createElement('div');
            navElement.innerHTML = navHTML;
            document.body.appendChild(navElement.firstElementChild);
        }

        createNavigationHTML() {
            const { prev, next } = this.getAdjacentLessons();
            const { chapter, lesson } = this.currentLesson;

            return `
                <div class="course-nav-overlay" id="courseNavOverlay" style="display: none;">
                    <div class="course-nav-panel">
                        <div class="course-nav-header">
                            <h3>📚 课程导航</h3>
                            <button class="course-nav-close" onclick="courseNav.closeNav()">✕</button>
                        </div>
                        <div class="course-nav-body">
                            <div class="current-lesson-info">
                                <div class="lesson-badge">${chapter.title}</div>
                                <h4>${lesson.title}</h4>
                            </div>
                            <div class="nav-actions">
                                <button class="nav-btn nav-btn-home" onclick="courseNav.goToHome()">
                                    🏠 返回主页
                                </button>
                                ${prev ? `
                                    <button class="nav-btn nav-btn-prev" onclick="courseNav.goToLesson('${prev.file}')">
                                        ⬅️ 上一节：${prev.title}
                                    </button>
                                ` : '<div class="nav-placeholder"></div>'}
                                ${next ? `
                                    <button class="nav-btn nav-btn-next" onclick="courseNav.goToLesson('${next.file}')">
                                        下一节：${next.title} ➡️
                                    </button>
                                ` : '<div class="nav-placeholder"></div>'}
                                <button class="nav-btn nav-btn-complete" onclick="courseNav.markComplete()">
                                    ✅ 标记为已完成
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="course-nav-fab" onclick="courseNav.toggleNav()" title="课程导航">
                    📖
                </button>
                <style>
                    .course-nav-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(4px);
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1rem;
                        animation: fadeIn 0.3s ease;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .course-nav-panel {
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        border: 1px solid #334155;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        max-width: 600px;
                        width: 100%;
                        max-height: 90vh;
                        overflow: hidden;
                        animation: slideUp 0.3s ease;
                    }

                    @keyframes slideUp {
                        from { transform: translateY(50px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }

                    .course-nav-header {
                        padding: 1.5rem;
                        border-bottom: 1px solid #334155;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(59, 130, 246, 0.1);
                    }

                    .course-nav-header h3 {
                        margin: 0;
                        color: #facc15;
                        font-size: 1.5rem;
                    }

                    .course-nav-close {
                        background: none;
                        border: none;
                        color: #94a3b8;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0.25rem 0.5rem;
                        border-radius: 8px;
                        transition: all 0.3s ease;
                    }

                    .course-nav-close:hover {
                        background: rgba(239, 68, 68, 0.2);
                        color: #ef4444;
                    }

                    .course-nav-body {
                        padding: 1.5rem;
                        overflow-y: auto;
                        max-height: calc(90vh - 100px);
                    }

                    .current-lesson-info {
                        margin-bottom: 1.5rem;
                        padding: 1rem;
                        background: rgba(59, 130, 246, 0.1);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 12px;
                    }

                    .lesson-badge {
                        display: inline-block;
                        background: rgba(139, 92, 246, 0.2);
                        border: 1px solid rgba(139, 92, 246, 0.4);
                        color: #c4b5fd;
                        padding: 0.25rem 0.75rem;
                        border-radius: 999px;
                        font-size: 0.875rem;
                        margin-bottom: 0.5rem;
                    }

                    .current-lesson-info h4 {
                        margin: 0;
                        color: #e2e8f0;
                        font-size: 1.1rem;
                    }

                    .nav-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .nav-btn {
                        padding: 1rem;
                        border: 1px solid #334155;
                        border-radius: 12px;
                        background: rgba(30, 41, 59, 0.5);
                        color: #e2e8f0;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: left;
                    }

                    .nav-btn:hover {
                        background: rgba(59, 130, 246, 0.2);
                        border-color: #3b82f6;
                        transform: translateX(4px);
                    }

                    .nav-btn-home {
                        background: rgba(139, 92, 246, 0.2);
                        border-color: rgba(139, 92, 246, 0.4);
                    }

                    .nav-btn-home:hover {
                        background: rgba(139, 92, 246, 0.3);
                    }

                    .nav-btn-complete {
                        background: rgba(16, 185, 129, 0.2);
                        border-color: rgba(16, 185, 129, 0.4);
                    }

                    .nav-btn-complete:hover {
                        background: rgba(16, 185, 129, 0.3);
                    }

                    .nav-placeholder {
                        height: 1rem;
                    }

                    .course-nav-fab {
                        position: fixed;
                        bottom: 2rem;
                        left: 2rem;
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                        color: white;
                        border: none;
                        font-size: 1.75rem;
                        cursor: pointer;
                        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
                        transition: all 0.3s ease;
                        z-index: 9998;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .course-nav-fab:hover {
                        transform: scale(1.1);
                        box-shadow: 0 12px 32px rgba(59, 130, 246, 0.6);
                    }

                    .course-nav-fab:active {
                        transform: scale(0.95);
                    }

                    @media (max-width: 768px) {
                        .course-nav-fab {
                            bottom: 1rem;
                            left: 1rem;
                            width: 56px;
                            height: 56px;
                            font-size: 1.5rem;
                        }

                        .course-nav-panel {
                            max-width: 100%;
                            border-radius: 16px;
                        }

                        .nav-btn {
                            font-size: 0.9rem;
                        }
                    }
                </style>
            `;
        }

        setupEventListeners() {
            // ESC键关闭导航
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeNav();
                }
            });

            // 点击遮罩关闭
            const overlay = document.getElementById('courseNavOverlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeNav();
                    }
                });
            }
        }

        toggleNav() {
            const overlay = document.getElementById('courseNavOverlay');
            if (overlay) {
                overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
            }
        }

        closeNav() {
            const overlay = document.getElementById('courseNavOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        }

        goToHome() {
            window.location.href = CONFIG.indexPage;
        }

        goToLesson(file) {
            window.location.href = file;
        }

        markComplete() {
            if (!this.currentLesson) return;

            try {
                const progress = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
                progress[this.currentLesson.file] = {
                    completed: true,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(CONFIG.storageKey, JSON.stringify(progress));

                // 显示反馈
                const btn = document.querySelector('.nav-btn-complete');
                if (btn) {
                    const originalText = btn.textContent;
                    btn.textContent = '✅ 已标记为完成！';
                    btn.style.background = 'rgba(16, 185, 129, 0.4)';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                    }, 2000);
                }

                // 通知父窗口（如果在iframe中）
                if (window.parent !== window) {
                    window.parent.postMessage({
                        type: 'lesson_completed',
                        lessonFile: this.currentLesson.file
                    }, '*');
                }
            } catch (error) {
                console.error('标记完成失败:', error);
                alert('标记失败，请重试');
            }
        }
    }

    // 自动初始化
    let courseNav = null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            courseNav = new CourseNavigator();
            window.courseNav = courseNav;
        });
    } else {
        courseNav = new CourseNavigator();
        window.courseNav = courseNav;
    }

})();

