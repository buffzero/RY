/**
 * 密探升级助手 - 完整版 (v3.0)
 * 包含全部原有功能 + 精确材料分类系统
 * 修改内容：
 * 1. 严格按风火/地水/阴阳分类材料
 * 2. 精确计算13/15/17修为各层需求
 * 3. 历练进度显示关联材料名称
 * 4. 移除"清除17修为"按钮
 */
const ResourceTracker = (() => {
    // ==================== 配置常量 ====================
    const CONFIG = {
        containerId: '#resourceTracker',
        elements: {
            classStatus: '#classStatus',
            attributeStatus: '#attributeStatus',
            materialsList: '#materials-list',
            moneyCheck: '#money-check',
            fragments: '#bingshu_canjuan',
            scrolls: '#bingshu_quanjuan',
            expStatus: '#exp-status',
            yinYangTraining: '#yinYangTraining',
            windFireTraining: '#windFireTraining',
            earthWaterTraining: '#earthWaterTraining',
            lastUpdated: '#lastUpdated',
            resetButton: '#resetButton'
            trainingContent: '#trainingContent' 
        },
        storageKey: 'DHY-Upgrade-Assistant_v3',
        requiredExp: 2386300
    };

    // ==================== 游戏数据 ====================
    const GAME_DATA = {
        // 基础数据
        classes: ['诡道', '神纪', '岐黄', '龙盾', '破军'],
        attributes: ['阴', '阳', '风', '火', '地', '水'],

        // === 精确材料分类 ===
        // 风火历练材料
        windFireMaterials: [
            { id: 'juanshan', name: '【绢扇】', level: 'blue', tier: 4 },
            { id: 'cuishan', name: '【翠扇】', level: 'purple', tier: 6 },
            { id: 'jinsishan', name: '【金丝扇】', level: 'purple', tier: 8 },
            { id: 'yushan', name: '【羽扇】', level: 'gold', tier: 10 },
            { id: 'xianmenshan', name: '【仙门扇】', level: 'gold', tier: 12 },
            { id: 'beihuifengshan', name: '【悲回风扇】', level: 'gold', tier: 12 }
        ],
        // 地水历练材料
        earthWaterMaterials: [
            { id: 'zhuojiu', name: '【浊酒】', level: 'blue', tier: 4 },
            { id: 'qingjiu', name: '【清酒】', level: 'purple', tier: 6 },
            { id: 'baimozhijiu', name: '【百末旨酒】', level: 'purple', tier: 8 },
            { id: 'lingshanquan', name: '【灵山泉】', level: 'gold', tier: 10 },
            { id: 'bawanglei', name: '【霸王泪】', level: 'gold', tier: 12 },
            { id: 'mulanzhuilu', name: '【木兰坠露】', level: 'gold', tier: 12 }
        ],
        // 阴阳历练材料
        yinYangMaterials: [
            { id: 'tongjing', name: '【铜镜】', level: 'blue', tier: 4 },
            { id: 'liubojing', name: '【六博镜】', level: 'purple', tier: 6 },
            { id: 'liujinjing', name: '【鎏金镜】', level: 'purple', tier: 8 },
            { id: 'baoshijing', name: '【宝石镜】', level: 'gold', tier: 10 },
            { id: 'shuijing', name: '【水镜】', level: 'gold', tier: 12 },
            { id: 'xinghanjing', name: '【星汉镜】', level: 'gold', tier: 12 }
        ],
        // 职业突破材料
        breakthroughMaterials: [
            { id: 'fujunhaitang', name: '【府君海棠】*30', class: '诡道', level: 'gold' },
            { id: 'panlonggu', name: '【蟠龙鼓】*30', class: '神纪', level: 'gold' },
            { id: 'yinwendao', name: '【银纹刀】*30', class: '岐黄', level: 'gold' },
            { id: 'yuguidun', name: '【玉龟盾】*30', class: '龙盾', level: 'gold' },
            { id: 'xijiaogong', name: '【犀角弓】*30', class: '破军', level: 'gold' },
            { id: 'menghunlan', name: '【梦魂兰】*30', class: '诡道', level: 'purple' },
            { id: 'zhentiangu', name: '【震天鼓】*30', class: '神纪', level: 'purple' },
            { id: 'qingtongdao', name: '【青铜刀】*30', class: '岐黄', level: 'purple' },
            { id: 'caiwendun', name: '【彩纹盾】*30', class: '龙盾', level: 'purple' },
            { id: 'tietaigong', name: '【铁胎弓】*30', class: '破军', level: 'purple' }
        ],
        // 通用材料
        commonMaterials: [
            { id: 'zuigucao', name: '【醉骨草】*30', class: '通用', level: 'purple' },
            { id: 'qingtingyan', name: '【蜻蜓眼】*120', class: '通用', level: 'blue' },
            { id: 'ziyunying', name: '【紫云英】*160', class: '通用', level: 'blue' },
            { id: 'yingqiongyao', name: '【瑛琼瑶】*105', class: '通用', level: 'blue' },
            { id: 'jincuodao', name: '【金错刀】*80', class: '通用', level: 'blue' },
            { id: 'diguanghe', name: '【低光荷】*100', class: '通用', level: 'blue' },
            { id: 'yuanyu', name: '【鸢羽】*40', class: '通用', level: 'blue' },
            { id: 'jianjia', name: '【蒹葭】*494', class: '通用', level: 'blue' }
        ],

        // === 修为需求配置 ===
        trainingPresets: {
            13: { 4: 6, 6: 12, 8: 24, 10: 16, 12: 1 },   // 修为13
            15: { 4: 6, 6: 12, 8: 24, 10: 35, 12: 12 },  // 修为15
            17: { 4: 6, 6: 12, 8: 24, 10: 35, 12: 47 }   // 修为17
        },

        // 材料与历练层级映射
        materialMapping: {
            windFire: { 4: 'juanshan', 6: 'cuishan', 8: 'jinsishan', 10: 'yushan', 12: 'xianmenshan' },
            earthWater: { 4: 'zhuojiu', 6: 'qingjiu', 8: 'baimozhijiu', 10: 'lingshanquan', 12: 'bawanglei' },
            yinYang: { 4: 'tongjing', 6: 'liubojing', 8: 'liujinjing', 10: 'baoshijing', 12: 'shuijing' }
        },

        // 历练基础配置
        trainingConfig: {
            windFire: [
                { name: '【历练·四】', baseReq: 6 },
                { name: '【历练·六】', baseReq: 12 },
                { name: '【历练·八】', baseReq: 24 },
                { name: '【历练·十】', baseReq: 35 },
                { name: '【历练·十二】', baseReq: 47 }
            ],
            earthWater: [
                { name: '【历练·四】', baseReq: 6 },
                { name: '【历练·六】', baseReq: 12 },
                { name: '【历练·八】', baseReq: 24 },
                { name: '【历练·十】', baseReq: 35 },
                { name: '【历练·十二】', baseReq: 47 }
            ],
            yinYang: [
                { name: '【历练·四】', baseReq: 6 },
                { name: '【历练·六】', baseReq: 12 },
                { name: '【历练·八】', baseReq: 24 },
                { name: '【历练·十】', baseReq: 35 },
                { name: '【历练·十二】', baseReq: 47 }
            ]
        }
    };

    // ==================== 状态管理 ====================
    let state = {
        currentAttribute: 'windFire', // 当前选中属性分类
        materials: {},               // 所有材料状态
        training: {                  // 历练进度
            yinYang: [], windFire: [], earthWater: [] 
        },
        trainingCompletions: {      // 修为完成记录
            yinYang: {13: 0, 15: 0, 17: 0},
            windFire: {13: 0, 15: 0, 17: 0},
            earthWater: {13: 0, 15: 0, 17: 0}
        },
        targetSelection: {           // 目标选择
            classes: { guidao: false, shenji: false, qihuang: false, longdun: false, pojun: false },
            attributes: { yin: false, yang: false, feng: false, huo: false, di: false, shui: false }
        },
        trainingHistory: [],         // 操作历史
        lastUpdated: null,           // 最后更新时间
        moneyChecked: false,         // 金钱状态
        fragments: 0,                // 兵书残卷
        scrolls: 0                   // 兵书全卷
    };

    let dom = {}; // DOM元素缓存

    // ==================== 核心函数 ====================

    // 初始化DOM引用
    const setupDOM = () => {
        try {
            // 主容器
            dom.container = document.querySelector(CONFIG.containerId);
            if (!dom.container) throw new Error('主容器未找到');

            // 关键元素
            Object.keys(CONFIG.elements).forEach(key => {
                dom[key] = document.querySelector(CONFIG.elements[key]);
                if (!dom[key] && key !== 'lastUpdated') {
                    console.warn(`未找到元素: ${CONFIG.elements[key]}`);
                }
            });
        } catch (error) {
            console.error('DOM初始化失败:', error);
            document.body.innerHTML = `
                <div style="color:red;padding:20px;font-family:sans-serif">
                    <h2>系统初始化失败</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">刷新页面</button>
                </div>
            `;
            throw error;
        }
    };

    // 加载保存数据
    const loadData = () => {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (!saved) return;

            const parsed = JSON.parse(saved);
            
            // 数据迁移处理
            if (!parsed.trainingCompletions) {
                parsed.trainingCompletions = {
                    yinYang: {13: 0, 15: 0, 17: 0},
                    windFire: {13: 0, 15: 0, 17: 0},
                    earthWater: {13: 0, 15: 0, 17: 0}
                };
            }

            // 合并状态
            state = {
                ...resetState(),
                ...parsed,
                materials: parsed.materials || {},
                targetSelection: parsed.targetSelection || resetState().targetSelection,
                trainingHistory: parsed.trainingHistory || []
            };

            updateLastUpdated();
        } catch (e) {
            console.error('数据加载失败:', e);
            state = resetState();
        }
    };

    // 保存数据
    const saveData = () => {
        try {
            state.lastUpdated = new Date().toISOString();
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
            updateLastUpdated();
        } catch (e) {
            console.error('数据保存失败:', e);
            alert('保存失败，请检查浏览器存储设置');
        }
    };

    // 重置状态
    const resetState = () => ({
        currentAttribute: 'windFire',
        materials: {},
        training: {
            yinYang: GAME_DATA.trainingConfig.yinYang.map(item => ({ 
                completed: 0, 
                required: item.baseReq,
                tier: 17 
            })),
            windFire: GAME_DATA.trainingConfig.windFire.map(item => ({ 
                completed: 0, 
                required: item.baseReq,
                tier: 17 
            })),
            earthWater: GAME_DATA.trainingConfig.earthWater.map(item => ({ 
                completed: 0, 
                required: item.baseReq,
                tier: 17 
            }))
        },
        trainingCompletions: {
            yinYang: {13: 0, 15: 0, 17: 0},
            windFire: {13: 0, 15: 0, 17: 0},
            earthWater: {13: 0, 15: 0, 17: 0}
        },
        targetSelection: {
            classes: { guidao: false, shenji: false, qihuang: false, longdun: false, pojun: false },
            attributes: { yin: false, yang: false, feng: false, huo: false, di: false, shui: false }
        },
        trainingHistory: [],
        lastUpdated: new Date().toISOString(),
        moneyChecked: false,
        fragments: 0,
        scrolls: 0
    });

    // 更新最后更新时间显示
    const updateLastUpdated = () => {
        if (state.lastUpdated && dom.lastUpdated) {
            const date = new Date(state.lastUpdated);
            dom.lastUpdated.textContent = `最近更新: ${date.toLocaleString('zh-CN')}`;
        }
    };

    // ==================== 渲染函数 ====================

    // 渲染所有内容
    const renderAll = () => {
        renderTargetSelection();
        renderClassStatus();
        renderAttributeStatus();
        renderMaterials();
        renderTraining();
        updateBasicUI();
    };

    // 渲染目标选择
    const renderTargetSelection = () => {
        const checkboxes = document.querySelectorAll('.target-section input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const type = checkbox.dataset.type;
            const value = checkbox.dataset.value;
            checkbox.checked = type === 'class' 
                ? state.targetSelection.classes[value] 
                : state.targetSelection.attributes[value];
        });
    };

    // 渲染职业状态
    const renderClassStatus = () => {
        dom.classStatus.innerHTML = GAME_DATA.classes.map(className => {
            const isReady = checkClassReady(className);
            const classKey = getClassKey(className);
            return `
                <div class="status-item ${classKey}">
                    <span>${className}</span>
                    <span class="status-indicator ${isReady ? 'ready' : 'pending'}">
                        ${isReady ? '可满级' : '待沉淀'}
                    </span>
                </div>
            `;
        }).join('');
    };

    // 渲染属性状态
    const renderAttributeStatus = () => {
        dom.attributeStatus.innerHTML = GAME_DATA.attributes.map(attr => {
            const attrClass = attr === '阴' ? 'yin' :
                            attr === '阳' ? 'yang' :
                            attr === '风' ? 'feng' :
                            attr === '火' ? 'huo' :
                            attr === '地' ? 'di' : 'shui';
            const isReady = checkAttributeReady(attr);
            
            return `
                <div class="status-item ${attrClass}">
                    <span>${attr}</span>
                    <span class="status-indicator ${isReady ? 'ready' : 'pending'}">
                        ${isReady ? '可满级' : '待沉淀'}
                    </span>
                </div>
            `;
        }).join('');
    };

    // 渲染材料列表
    const renderMaterials = () => {
        const materials = [
            ...(state.currentAttribute === 'windFire' ? GAME_DATA.windFireMaterials :
               state.currentAttribute === 'earthWater' ? GAME_DATA.earthWaterMaterials :
               GAME_DATA.yinYangMaterials),
            ...GAME_DATA.breakthroughMaterials,
            ...GAME_DATA.commonMaterials
        ];

        dom.materialsList.innerHTML = materials.map(material => {
            const checked = state.materials[material.id] ? 'checked' : '';
            return `
                <div class="resource-item ${material.level}">
                    <div class="resource-name">${material.name}</div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="${material.id}-check" ${checked}>
                        <label for="${material.id}-check" class="material-checkbox"></label>
                    </div>
                </div>
            `;
        }).join('');
    };
    // 历练渲染逻辑
    const renderTraining = () => {
    const currentTraining = state.training[state.currentAttribute] || [];
    const tier = currentTraining[0]?.tier || 17;
    
    dom.trainingContent.innerHTML = `
        <div class="training-controls">
            <select class="tier-select">
                ${[13, 15, 17].map(t => `
                    <option value="${t}" ${t === tier ? 'selected' : ''}>
                        修为${t}
                    </option>
                `).join('')}
            </select>
        </div>
        ${currentTraining.map((item, index) => {
            const floor = [4, 6, 8, 10, 12][index];
            const required = GAME_DATA.trainingPresets[tier][floor] || 0;
            
            return `
                <div class="training-item">
                    <div class="training-header">
                        <div class="training-name">【历练·${floor}】</div>
                        <div class="sub-status-indicator ${item.completed >= required ? 'met' : 'not-met'}">
                            ${item.completed >= required ? '已满足' : `${item.completed}/${required}`}
                        </div>
                    </div>
                    ${renderCircles(required, item.completed)}
                    <div class="training-actions">
                        ${[1, 3, 6].map(count => `
                            <button class="consume-btn" 
                                data-index="${index}" 
                                data-count="${count}"
                                ${item.completed >= required ? 'disabled' : ''}>
                                核销${count}次
                            </button>
                        `).join('')}
                        <button class="undo-btn" 
                            data-index="${index}"
                            ${item.completed <= 0 ? 'disabled' : ''}>
                            撤销
                        </button>
                    </div>
                </div>
            `;
        }).join('')}
    `;
};

    // 渲染圆圈进度
    const renderCircles = (required, completed) => {
        let circles = '';
        for (let i = 0; i < required; i++) {
            circles += `<div class="circle ${i < completed ? 'filled' : ''}"></div>`;
        }
        return `<div class="circles-container">${circles}</div>`;
    };

    // 更新基础UI
    const updateBasicUI = () => {
        const expStatus = calculateExpStatus();
        dom.expStatus.textContent = expStatus.text;
        dom.expStatus.className = expStatus.className;
        dom.moneyCheck.checked = state.moneyChecked;
        dom.fragments.value = state.fragments;
        dom.scrolls.value = state.scrolls;
    };

    // ==================== 业务逻辑 ====================

    // 计算经验状态
    const calculateExpStatus = () => {
        const currentExp = state.fragments * 100 + state.scrolls * 1000;
        const isMet = currentExp >= CONFIG.requiredExp;
        return {
            isMet,
            text: isMet ? '已满足' : '未满足',
            className: `sub-status-indicator ${isMet ? 'met' : 'not-met'}`
        };
    };

    // 检查职业是否就绪
    const checkClassReady = (className) => {
        const classMaterials = GAME_DATA.breakthroughMaterials.filter(m => m.class === className);
        const generalMaterialsReady = GAME_DATA.commonMaterials.every(m => state.materials[m.id]);
        return state.moneyChecked && 
               calculateExpStatus().isMet && 
               generalMaterialsReady && 
               classMaterials.every(m => state.materials[m.id]);
    };

    // 检查属性是否就绪
    const checkAttributeReady = (attr) => {
        const category = attr === '阴' || attr === '阳' ? 'yinYang' :
                        attr === '风' || attr === '火' ? 'windFire' : 'earthWater';
        return state.training[category].every((item, index) => {
            const floor = [4, 6, 8, 10, 12][index];
            const required = GAME_DATA.trainingPresets[item.tier || 17][floor];
            return item.completed >= required;
        });
    };

    // 获取分类名称
    const getCategoryName = (category) => {
        return category === 'yinYang' ? '阴阳历练' :
               category === 'windFire' ? '风火历练' : '地水历练';
    };

    // 获取职业CSS类名
    const getClassKey = (className) => {
        const map = { '诡道': 'guidao', '神纪': 'shenji', '岐黄': 'qihuang', '龙盾': 'longdun', '破军': 'pojun' };
        return map[className] || '';
    };

    // ==================== 事件处理 ====================

    // 处理核销操作
    const handleConsume = (index, count) => {
    const training = state.training[state.currentAttribute][index];
    const floor = [4, 6, 8, 10, 12][index];
    const tier = training.tier || 17;  // 确保有默认值
    const required = GAME_DATA.trainingPresets[tier][floor];
    const remaining = required - training.completed;

    if (count > remaining) {
        alert(`剩余次数不足: 还需${remaining}次`);
        return;
    }

    // 记录操作历史
    state.trainingHistory.push({
        category: state.currentAttribute,
        index,
        previousCount: training.completed,
        count,
        timestamp: new Date().toISOString()
    });

    // 更新状态
    training.completed += count;
    
    // 检查修为完成状态
    updateTrainingCompletions(state.currentAttribute);
    updateAndSave();
};

    // 更新修为完成状态
    const updateTrainingCompletions = (category) => {
        [13, 15, 17].forEach(tier => {
            const canComplete = checkTierCompletion(category, tier);
            const currentCompleted = state.trainingCompletions[category][tier] || 0;
            
            if (canComplete > currentCompleted) {
                state.trainingCompletions[category][tier] = canComplete;
            }
        });
    };

    // 检查修为完成情况
    const checkTierCompletion = (category, tier) => {
        const floors = [4, 6, 8, 10, 12];
        let minCompletion = Infinity;

        floors.forEach((floor, index) => {
            const required = GAME_DATA.trainingPresets[tier][floor];
            const completed = state.training[category][index].completed;
            
            // 计算被更高修为占用的次数
            const usedByHigher = [15, 17]
                .filter(t => t > tier)
                .reduce((sum, t) => sum + (state.trainingCompletions[category][t] || 0) * GAME_DATA.trainingPresets[t][floor], 0);

            const available = Math.max(0, completed - usedByHigher);
            if (required > 0) {
                minCompletion = Math.min(minCompletion, Math.floor(available / required));
            }
        });

        return minCompletion === Infinity ? 0 : minCompletion;
    };

    // 处理撤销操作
    const handleUndo = (category, index) => {
        const lastActionIndex = [...state.trainingHistory]
            .reverse()
            .findIndex(a => a.category === category && a.index === index);

        if (lastActionIndex !== -1) {
            const action = state.trainingHistory[state.trainingHistory.length - 1 - lastActionIndex];
            state.training[category][index].completed = action.previousCount;
            state.trainingHistory.splice(state.trainingHistory.length - 1 - lastActionIndex, 1);
            updateTrainingCompletions(category);
            updateAndSave();
        }
    };

    // 处理修为切换
    const handleTierChange = (category, tier) => {
        state.training[category].forEach((item, index) => {
            const floor = [4, 6, 8, 10, 12][index];
            item.required = GAME_DATA.trainingPresets[tier][floor];
            item.tier = tier;
        });
        updateAndSave();
    };

    // 处理分类重置
    const handleResetCategory = (category) => {
        if (confirm(`确定要重置${getCategoryName(category)}的所有进度吗？`)) {
            state.training[category].forEach(item => {
                item.completed = 0;
            });
            state.trainingHistory = state.trainingHistory.filter(
                record => record.category !== category
            );
            updateAndSave();
        }
    };

    // 更新并保存状态
    const updateAndSave = () => {
        renderAll();
        saveData();
    };

    // 初始化事件监听
    const setupEventListeners = () => {
        // 材料勾选
        document.addEventListener('change', (e) => {
            if (e.target.matches('#materials-list input[type="checkbox"]')) {
                const materialId = e.target.id.replace('-check', '');
                state.materials[materialId] = e.target.checked;
                updateAndSave();
            }
            // 目标选择
            else if (e.target.matches('.target-section input[type="checkbox"]')) {
                const type = e.target.dataset.type;
                const value = e.target.dataset.value;
                if (type === 'class') {
                    state.targetSelection.classes[value] = e.target.checked;
                } else {
                    state.targetSelection.attributes[value] = e.target.checked;
                }
                updateAndSave();
            }
            // 修为切换
            else if (e.target.classList.contains('tier-select')) {
                const category = e.target.dataset.category;
                const tier = parseInt(e.target.value);
                handleTierChange(category, tier);
            }
        });

        // 数值输入
        document.addEventListener('input', (e) => {
            if (e.target === dom.fragments || e.target === dom.scrolls) {
                state[e.target.id === 'bingshu_canjuan' ? 'fragments' : 'scrolls'] = 
                    parseInt(e.target.value) || 0;
                updateAndSave();
            }
        });

        // 金钱勾选
        dom.moneyCheck.addEventListener('change', () => {
            state.moneyChecked = dom.moneyCheck.checked;
            updateAndSave();
        });

        // 按钮点击
        document.addEventListener('click', (e) => {
    if (e.target.classList.contains('consume-btn')) {
        const btn = e.target;
        handleConsume(
            parseInt(btn.dataset.index),
            parseInt(btn.dataset.count)
        );
    }
});
            // 撤销按钮
            else if (e.target.classList.contains('undo-btn')) {
                const btn = e.target;
                handleUndo(btn.dataset.category, parseInt(btn.dataset.index));
            }
            // 重置分类
            else if (e.target.classList.contains('reset-category-btn')) {
                handleResetCategory(e.target.dataset.category);
            }
            // 全局重置
            else if (e.target === dom.resetButton && confirm('确定要重置所有数据吗？')) {
                state = resetState();
                updateAndSave();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (e.key === '1') document.querySelector('.consume-btn[data-count="1"]')?.click();
            else if (e.key === '3') document.querySelector('.consume-btn[data-count="3"]')?.click();
            else if (e.key === '6') document.querySelector('.consume-btn[data-count="6"]')?.click();
        });
    };

    // ==================== 初始化 ====================
    const init = () => {
        setupDOM();
        loadData();
        setupEventListeners();
        renderAll();
        console.log('系统初始化完成 v3.0');
    };

    return { init };
})();

// 启动应用
document.addEventListener('DOMContentLoaded', ResourceTracker.init);
