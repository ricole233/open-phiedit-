class TimeInput {
    constructor(options = {}) {
        // 配置选项
        this.modelValue = options.modelValue || 0;
        this.min = options.min !== undefined ? options.min : 0;
        this.max = options.max !== undefined ? options.max : Infinity;
        this.step = options.step !== undefined ? options.step : 1;
        this.precision = options.precision !== undefined ? options.precision : 0;
        this.showHours = options.showHours !== undefined ? options.showHours : true;
        this.showMinutes = options.showMinutes !== undefined ? options.showMinutes : true;
        this.showSeconds = options.showSeconds !== undefined ? options.showSeconds : true;
        this.showMilliseconds = options.showMilliseconds !== undefined ? options.showMilliseconds : false;
        this.showUnitToggle = options.showUnitToggle !== undefined ? options.showUnitToggle : false;
        this.frameRate = options.frameRate !== undefined ? options.frameRate : 30;

        // 内部状态
        this.hoursValue = '0';
        this.minutesValue = '0';
        this.secondsValue = '0';
        this.millisecondsValue = '0';
        this.isHovering = false;
        this.isDraggingHours = false;
        this.isDraggingMinutes = false;
        this.isDraggingSeconds = false;
        this.isDraggingMilliseconds = false;
        this.isEditingHours = false;
        this.isEditingMinutes = false;
        this.isEditingSeconds = false;
        this.isEditingMilliseconds = false;
        this.startX = 0;
        this.startY = 0;
        this.initialValue = 0;
        this.currentValue = 0;
        this.displayMode = 'milliseconds';

        this.dragSensitivity = {
            normal: 0.5,
            shift: 2.5,
            ctrl: 0.1
        };

        this.dragUnitMultipliers = {
            hours: 3600000,
            minutes: 60000,
            seconds: 1000,
            milliseconds: 1
        };

        // DOM元素引用
        this.container = null;
        this.hoursInput = null;
        this.minutesInput = null;
        this.secondsInput = null;
        this.millisecondsInput = null;
        this.dragIndicator = null;

        // 事件回调
        this.onChangeCallback = options.onChange || (() => { });
        this.onInputCallback = options.onInput || (() => { });

        // 初始化
        this.updateDisplayValues(this.modelValue);

        // 创建DOM
        this.render();
        this.attachEvents();
    }

    // 是否正在编辑任何输入框
    isEditingAny() {
        return this.isEditingHours || this.isEditingMinutes ||
            this.isEditingSeconds || this.isEditingMilliseconds;
    }

    // 是否正在拖动任何输入框
    isDraggingAny() {
        return this.isDraggingHours || this.isDraggingMinutes ||
            this.isDraggingSeconds || this.isDraggingMilliseconds;
    }

    // 表达式计算
    evaluateExpression(expression) {
        try {
            const cleanExpr = expression.toString().replace(/[^0-9+\-*/().]/g, '');

            if (!/[+\-*/]/.test(cleanExpr)) {
                return parseFloat(cleanExpr);
            }

            const result = new Function('return ' + cleanExpr)();
            return result;
        } catch (error) {
            return NaN;
        }
    }

    // 更新显示值
    updateDisplayValues(totalMs) {
        const numValue = Number(totalMs) || 0;
        this.currentValue = numValue;

        // 计算小时、分钟、秒和毫秒
        const hours = Math.floor(numValue / 3600000);
        const minutes = Math.floor((numValue % 3600000) / 60000);
        const seconds = Math.floor((numValue % 60000) / 1000);
        const milliseconds = Math.floor(numValue % 1000);

        this.hoursValue = hours.toString();
        this.minutesValue = minutes.toString().padStart(2, '0');
        this.secondsValue = seconds.toString().padStart(2, '0');

        // 如果是帧显示模式，则将毫秒转换为帧
        if (this.displayMode === 'frames') {
            const frames = this.millisecondsToFrames(milliseconds);
            this.millisecondsValue = frames.toString().padStart(2, '0');
        } else {
            this.millisecondsValue = milliseconds.toString().padStart(3, '0');
        }

        // 更新DOM元素
        if (this.hoursInput) this.hoursInput.value = this.hoursValue;
        if (this.minutesInput) this.minutesInput.value = this.minutesValue;
        if (this.secondsInput) this.secondsInput.value = this.secondsValue;
        if (this.millisecondsInput) this.millisecondsInput.value = this.millisecondsValue;
    }

    // 计算总毫秒值
    calculateTotalValue() {
        const hours = parseInt(this.hoursValue) || 0;
        const minutes = parseInt(this.minutesValue) || 0;
        const seconds = parseInt(this.secondsValue) || 0;
        let milliseconds;

        // 根据显示模式处理毫秒值
        if (this.displayMode === 'frames') {
            const frames = parseInt(this.millisecondsValue) || 0;
            milliseconds = this.framesToMilliseconds(frames);
        } else {
            milliseconds = parseInt(this.millisecondsValue) || 0;
        }

        return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
    }

    // 毫秒转换为帧
    millisecondsToFrames(ms) {
        return Math.round(ms / 1000 * this.frameRate);
    }

    // 帧转换为毫秒
    framesToMilliseconds(frames) {
        return Math.round(frames * 1000 / this.frameRate);
    }

    // 切换显示单位（毫秒/帧）
    toggleDisplayUnit() {
        // 保存当前值
        const currentTotalMs = this.calculateTotalValue();

        // 切换显示模式
        this.displayMode = this.displayMode === 'milliseconds' ? 'frames' : 'milliseconds';

        // 更新显示值
        this.updateDisplayValues(currentTotalMs);

        // 更新单位显示
        if (this.displayUnit) {
            this.displayUnit.textContent = this.displayMode === 'frames' ? 'f' : 'ms';
        }

        // 如果有切换按钮，更新样式
        if (this.toggleButton) {
            if (this.displayMode === 'frames') {
                this.toggleButton.classList.add('active');
                this.toggleButton.textContent = 'ms';
            } else {
                this.toggleButton.classList.remove('active');
                this.toggleButton.textContent = 'f';
            }
        }
    }

    // 处理拖动事件
    handleDrag(e, unitType) {
        const deltaX = e.clientX - this.startX;

        // 根据按键状态选择灵敏度
        let sensitivity = this.dragSensitivity.normal;
        if (e.shiftKey) {
            sensitivity = this.dragSensitivity.shift;
        } else if (e.ctrlKey) {
            sensitivity = this.dragSensitivity.ctrl;
        }

        // 根据单位类型确定倍数
        const multiplier = this.dragUnitMultipliers[unitType];

        // 计算值的变化
        const change = deltaX * sensitivity * multiplier;

        // 计算新的总毫秒值
        let newTotalMs = this.initialValue + change;

        // 限制在min和max范围内
        const clampedValue = Math.min(Math.max(newTotalMs, this.min), this.max);

        // 更新显示值
        this.updateDisplayValues(clampedValue);

        // 更新当前值并发出事件
        this.currentValue = clampedValue;
        this.emitInputEvent(clampedValue);
    }

    // 小时输入框事件处理
    onHoursBlur() {
        this.isEditingHours = false;
        if (this.hoursInput) this.hoursInput.readOnly = true;

        try {
            // 尝试计算表达式
            const expressionValue = this.evaluateExpression(this.hoursValue);
            let hours = isNaN(expressionValue) ? (parseInt(this.hoursValue) || 0) : Math.floor(expressionValue);

            if (hours < 0) hours = 0; // 防止负值

            this.hoursValue = hours.toString();
            if (this.hoursInput) this.hoursInput.value = this.hoursValue;
            this.emitUpdatedValue();
        } catch (error) {
            // 表达式无效，使用原有行为
            let hours = parseInt(this.hoursValue) || 0;
            if (hours < 0) hours = 0; // 防止负值

            this.hoursValue = hours.toString();
            if (this.hoursInput) this.hoursInput.value = this.hoursValue;
            this.emitUpdatedValue();
        }
    }

    enableHoursEdit() {
        this.isEditingHours = true;
        if (this.hoursInput) {
            this.hoursInput.readOnly = false;
            this.hoursInput.focus();
            this.hoursInput.select();
        }
    }

    handleHoursMouseDown(event) {
        if (event.detail === 2) return; // 双击由dblclick处理

        if (!this.isEditingHours) {
            event.preventDefault();
            this.startDrag(event, 'hours');
        }
    }

    // 分钟输入框事件处理
    onMinutesBlur() {
        this.isEditingMinutes = false;
        if (this.minutesInput) this.minutesInput.readOnly = true;

        try {
            // 尝试计算表达式
            const expressionValue = this.evaluateExpression(this.minutesValue);
            let minutes = isNaN(expressionValue) ? (parseInt(this.minutesValue) || 0) : Math.floor(expressionValue);

            // 处理分钟超出范围的情况（进位）
            if (minutes >= 60) {
                const extraHours = Math.floor(minutes / 60);
                const newHours = (parseInt(this.hoursValue) || 0) + extraHours;
                minutes = minutes % 60;
                this.hoursValue = newHours.toString();
                if (this.hoursInput) this.hoursInput.value = this.hoursValue;
            }

            if (minutes < 0) minutes = 0;

            this.minutesValue = minutes.toString().padStart(2, '0');
            if (this.minutesInput) this.minutesInput.value = this.minutesValue;
            this.emitUpdatedValue();
        } catch (error) {
            // 表达式无效，使用原有行为
            let minutes = parseInt(this.minutesValue) || 0;

            // 处理分钟超出范围的情况（进位）
            if (minutes >= 60) {
                const extraHours = Math.floor(minutes / 60);
                const newHours = (parseInt(this.hoursValue) || 0) + extraHours;
                minutes = minutes % 60;
                this.hoursValue = newHours.toString();
                if (this.hoursInput) this.hoursInput.value = this.hoursValue;
            }

            if (minutes < 0) minutes = 0;

            this.minutesValue = minutes.toString().padStart(2, '0');
            if (this.minutesInput) this.minutesInput.value = this.minutesValue;
            this.emitUpdatedValue();
        }
    }

    enableMinutesEdit() {
        this.isEditingMinutes = true;
        if (this.minutesInput) {
            this.minutesInput.readOnly = false;
            this.minutesInput.focus();
            this.minutesInput.select();
        }
    }

    handleMinutesMouseDown(event) {
        if (event.detail === 2) return;

        if (!this.isEditingMinutes) {
            event.preventDefault();
            this.startDrag(event, 'minutes');
        }
    }

    // 秒输入框事件处理
    onSecondsBlur() {
        this.isEditingSeconds = false;
        if (this.secondsInput) this.secondsInput.readOnly = true;

        try {
            // 尝试计算表达式
            const expressionValue = this.evaluateExpression(this.secondsValue);
            let seconds = isNaN(expressionValue) ? (parseInt(this.secondsValue) || 0) : Math.floor(expressionValue);

            // 处理秒超出范围的情况（进位）
            if (seconds >= 60) {
                const extraMinutes = Math.floor(seconds / 60);
                seconds = seconds % 60;

                let minutes = (parseInt(this.minutesValue) || 0) + extraMinutes;
                let hours = parseInt(this.hoursValue) || 0;

                // 处理分钟进位
                if (minutes >= 60) {
                    const extraHours = Math.floor(minutes / 60);
                    hours += extraHours;
                    minutes = minutes % 60;
                }

                this.hoursValue = hours.toString();
                this.minutesValue = minutes.toString().padStart(2, '0');
                if (this.hoursInput) this.hoursInput.value = this.hoursValue;
                if (this.minutesInput) this.minutesInput.value = this.minutesValue;
            }

            if (seconds < 0) seconds = 0;

            this.secondsValue = seconds.toString().padStart(2, '0');
            if (this.secondsInput) this.secondsInput.value = this.secondsValue;
            this.emitUpdatedValue();
        } catch (error) {
            // 表达式无效，使用原有行为
            let seconds = parseInt(this.secondsValue) || 0;

            // 处理秒超出范围的情况（进位）
            if (seconds >= 60) {
                const extraMinutes = Math.floor(seconds / 60);
                seconds = seconds % 60;

                let minutes = (parseInt(this.minutesValue) || 0) + extraMinutes;
                let hours = parseInt(this.hoursValue) || 0;

                // 处理分钟进位
                if (minutes >= 60) {
                    const extraHours = Math.floor(minutes / 60);
                    hours += extraHours;
                    minutes = minutes % 60;
                }

                this.hoursValue = hours.toString();
                this.minutesValue = minutes.toString().padStart(2, '0');
                if (this.hoursInput) this.hoursInput.value = this.hoursValue;
                if (this.minutesInput) this.minutesInput.value = this.minutesValue;
            }

            if (seconds < 0) seconds = 0;

            this.secondsValue = seconds.toString().padStart(2, '0');
            if (this.secondsInput) this.secondsInput.value = this.secondsValue;
            this.emitUpdatedValue();
        }
    }

    enableSecondsEdit() {
        this.isEditingSeconds = true;
        if (this.secondsInput) {
            this.secondsInput.readOnly = false;
            this.secondsInput.focus();
            this.secondsInput.select();
        }
    }

    handleSecondsMouseDown(event) {
        if (event.detail === 2) return;

        if (!this.isEditingSeconds) {
            event.preventDefault();
            this.startDrag(event, 'seconds');
        }
    }

    // 毫秒输入框事件处理
    onMillisecondsBlur() {
        this.isEditingMilliseconds = false;
        if (this.millisecondsInput) this.millisecondsInput.readOnly = true;

        try {
            // 尝试计算表达式
            const expressionValue = this.evaluateExpression(this.millisecondsValue);
            let value = isNaN(expressionValue) ? (parseInt(this.millisecondsValue) || 0) : Math.floor(expressionValue);

            if (value < 0) value = 0;

            // 根据显示模式处理进位
            if (this.displayMode === 'frames') {
                // 帧模式下，检查是否超出每秒的帧数
                if (value >= this.frameRate) {
                    const extraSeconds = Math.floor(value / this.frameRate);
                    value = value % this.frameRate;

                    // 处理进位
                    this.handleTimeUnitCarry(extraSeconds);
                }

                this.millisecondsValue = value.toString().padStart(2, '0');
            } else {
                // 毫秒模式
                if (value >= 1000) {
                    const extraSeconds = Math.floor(value / 1000);
                    value = value % 1000;

                    // 处理进位
                    this.handleTimeUnitCarry(extraSeconds);
                }

                this.millisecondsValue = value.toString().padStart(3, '0');
            }

            if (this.millisecondsInput) this.millisecondsInput.value = this.millisecondsValue;
            this.emitUpdatedValue();
        } catch (error) {
            // 表达式无效，使用原有行为
            let value = parseInt(this.millisecondsValue) || 0;

            if (value < 0) value = 0;

            // 根据显示模式处理进位
            if (this.displayMode === 'frames') {
                // 帧模式下，检查是否超出每秒的帧数
                if (value >= this.frameRate) {
                    const extraSeconds = Math.floor(value / this.frameRate);
                    value = value % this.frameRate;

                    // 处理进位
                    this.handleTimeUnitCarry(extraSeconds);
                }

                this.millisecondsValue = value.toString().padStart(2, '0');
            } else {
                // 毫秒模式
                if (value >= 1000) {
                    const extraSeconds = Math.floor(value / 1000);
                    value = value % 1000;

                    // 处理进位
                    this.handleTimeUnitCarry(extraSeconds);
                }

                this.millisecondsValue = value.toString().padStart(3, '0');
            }

            if (this.millisecondsInput) this.millisecondsInput.value = this.millisecondsValue;
            this.emitUpdatedValue();
        }
    }

    // 处理时间单位进位
    handleTimeUnitCarry(extraSeconds) {
        let seconds = (parseInt(this.secondsValue) || 0) + extraSeconds;
        let minutes = parseInt(this.minutesValue) || 0;
        let hours = parseInt(this.hoursValue) || 0;

        // 处理秒进位
        if (seconds >= 60) {
            const extraMinutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
            minutes += extraMinutes;

            // 处理分钟进位
            if (minutes >= 60) {
                const extraHours = Math.floor(minutes / 60);
                minutes = minutes % 60;
                hours += extraHours;
            }
        }

        this.secondsValue = seconds.toString().padStart(2, '0');
        this.minutesValue = minutes.toString().padStart(2, '0');
        this.hoursValue = hours.toString();

        if (this.secondsInput) this.secondsInput.value = this.secondsValue;
        if (this.minutesInput) this.minutesInput.value = this.minutesValue;
        if (this.hoursInput) this.hoursInput.value = this.hoursValue;
    }

    enableMillisecondsEdit() {
        this.isEditingMilliseconds = true;
        if (this.millisecondsInput) {
            this.millisecondsInput.readOnly = false;
            this.millisecondsInput.focus();
            this.millisecondsInput.select();
        }
    }

    handleMillisecondsMouseDown(event) {
        if (event.detail === 2) return;

        if (!this.isEditingMilliseconds) {
            event.preventDefault();
            this.startDrag(event, 'milliseconds');
        }
    }
    // 统一的拖动开始处理函数
    startDrag(event, unitType) {
        // 设置对应的拖动状态
        if (unitType === 'hours') this.isDraggingHours = true;
        else if (unitType === 'minutes') this.isDraggingMinutes = true;
        else if (unitType === 'seconds') this.isDraggingSeconds = true;
        else if (unitType === 'milliseconds') this.isDraggingMilliseconds = true;

        // 记录初始位置和值
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.initialValue = this.calculateTotalValue();

        // 显示拖动指示器
        if (this.dragIndicator) {
            this.dragIndicator.style.display = 'flex';
            this.dragIndicator.classList.add('dragging');
        }

        // 创建鼠标移动事件处理函数
        const handleMouseMove = (e) => {
            this.handleDrag(e, unitType);
        };

        // 创建鼠标释放事件处理函数
        const handleMouseUp = () => {
            // 重置拖动状态
            this.isDraggingHours = false;
            this.isDraggingMinutes = false;
            this.isDraggingSeconds = false;
            this.isDraggingMilliseconds = false;

            // 隐藏拖动指示器
            if (this.dragIndicator && !this.isHovering) {
                this.dragIndicator.style.display = 'none';
            }
            if (this.dragIndicator) {
                this.dragIndicator.classList.remove('dragging');
            }

            // 移除事件监听
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // 发送change事件
            this.emitChangeEvent(this.currentValue);
        };

        // 添加全局事件监听
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // 更新值并发出事件
    emitUpdatedValue() {
        const totalValue = this.calculateTotalValue();
        const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);

        if (clampedValue !== totalValue) {
            this.updateDisplayValues(clampedValue);
        }

        this.currentValue = clampedValue;
        this.emitInputEvent(clampedValue);
        this.emitChangeEvent(clampedValue);
    }

    // 发送input事件
    emitInputEvent(value) {
        if (this.onInputCallback) this.onInputCallback(value);
    }

    // 发送change事件
    emitChangeEvent(value) {
        if (this.onChangeCallback) this.onChangeCallback(value);
    }

    // 渲染组件
    render() {
        // 创建容器
        this.container = document.createElement('div');
        this.container.className = 'time-input-container';

        // 小时输入框
        if (this.showHours) {
            const hoursGroup = document.createElement('div');
            hoursGroup.className = 'hours-input-group';

            this.hoursInput = document.createElement('input');
            this.hoursInput.type = 'text';
            this.hoursInput.className = 'value-input hours-input';
            this.hoursInput.value = this.hoursValue;
            this.hoursInput.readOnly = true;

            const hoursSymbol = document.createElement('span');
            hoursSymbol.className = 'time-symbol';
            hoursSymbol.textContent = 'h';

            hoursGroup.appendChild(this.hoursInput);
            hoursGroup.appendChild(hoursSymbol);
            this.container.appendChild(hoursGroup);
        }

        // 分钟输入框
        if (this.showMinutes) {
            const minutesGroup = document.createElement('div');
            minutesGroup.className = 'minutes-input-group';

            this.minutesInput = document.createElement('input');
            this.minutesInput.type = 'text';
            this.minutesInput.className = 'value-input minutes-input';
            this.minutesInput.value = this.minutesValue;
            this.minutesInput.readOnly = true;

            const minutesSymbol = document.createElement('span');
            minutesSymbol.className = 'time-symbol';
            minutesSymbol.textContent = 'm';

            minutesGroup.appendChild(this.minutesInput);
            minutesGroup.appendChild(minutesSymbol);
            this.container.appendChild(minutesGroup);
        }

        // 秒输入框
        if (this.showSeconds) {
            const secondsGroup = document.createElement('div');
            secondsGroup.className = 'seconds-input-group';

            this.secondsInput = document.createElement('input');
            this.secondsInput.type = 'text';
            this.secondsInput.className = 'value-input seconds-input';
            this.secondsInput.value = this.secondsValue;
            this.secondsInput.readOnly = true;

            const secondsSymbol = document.createElement('span');
            secondsSymbol.className = 'time-symbol';
            secondsSymbol.textContent = 's';

            secondsGroup.appendChild(this.secondsInput);
            secondsGroup.appendChild(secondsSymbol);
            this.container.appendChild(secondsGroup);
        }

        // 毫秒/帧输入框
        if (this.showMilliseconds) {
            const millisecondsGroup = document.createElement('div');
            millisecondsGroup.className = 'milliseconds-input-group';

            this.millisecondsInput = document.createElement('input');
            this.millisecondsInput.type = 'text';
            this.millisecondsInput.className = 'value-input milliseconds-input';
            this.millisecondsInput.value = this.millisecondsValue;
            this.millisecondsInput.readOnly = true;

            this.displayUnit = document.createElement('span');
            this.displayUnit.className = 'time-symbol';
            this.displayUnit.textContent = this.displayMode === 'frames' ? 'f' : 'ms';

            millisecondsGroup.appendChild(this.millisecondsInput);
            millisecondsGroup.appendChild(this.displayUnit);
            this.container.appendChild(millisecondsGroup);

            // 毫秒/帧切换按钮
            if (this.showUnitToggle) {
                const unitToggle = document.createElement('div');
                unitToggle.className = 'unit-toggle';

                this.toggleButton = document.createElement('span');
                this.toggleButton.className = 'toggle-button';
                if (this.displayMode === 'frames') {
                    this.toggleButton.classList.add('active');
                    this.toggleButton.textContent = 'ms';
                } else {
                    this.toggleButton.textContent = 'f';
                }

                unitToggle.appendChild(this.toggleButton);
                this.container.appendChild(unitToggle);

                // 添加切换事件
                unitToggle.addEventListener('click', this.toggleDisplayUnit.bind(this));
            }
        }

        // 拖动指示器
        this.dragIndicator = document.createElement('div');
        this.dragIndicator.className = 'drag-indicator';
        this.dragIndicator.style.display = 'none';
        this.container.appendChild(this.dragIndicator);

        // 添加样式
        this.addStyles();
    }

    // 添加事件监听
    attachEvents() {
        // 鼠标进入/离开事件
        this.container.addEventListener('mouseenter', () => {
            this.isHovering = true;
            if (this.isHovering || this.isDraggingAny()) {
                this.dragIndicator.style.display = 'flex';
            }
        });

        this.container.addEventListener('mouseleave', () => {
            this.isHovering = false;
            if (!this.isDraggingAny()) {
                this.dragIndicator.style.display = 'none';
            }
        });

        // 小时输入框事件
        if (this.hoursInput) {
            this.hoursInput.addEventListener('blur', this.onHoursBlur.bind(this));
            this.hoursInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') this.onHoursBlur();
            });
            this.hoursInput.addEventListener('mousedown', this.handleHoursMouseDown.bind(this));
            this.hoursInput.addEventListener('dblclick', this.enableHoursEdit.bind(this));
        }

        // 分钟输入框事件
        if (this.minutesInput) {
            this.minutesInput.addEventListener('blur', this.onMinutesBlur.bind(this));
            this.minutesInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') this.onMinutesBlur();
            });
            this.minutesInput.addEventListener('mousedown', this.handleMinutesMouseDown.bind(this));
            this.minutesInput.addEventListener('dblclick', this.enableMinutesEdit.bind(this));
        }

        // 秒输入框事件
        if (this.secondsInput) {
            this.secondsInput.addEventListener('blur', this.onSecondsBlur.bind(this));
            this.secondsInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') this.onSecondsBlur();
            });
            this.secondsInput.addEventListener('mousedown', this.handleSecondsMouseDown.bind(this));
            this.secondsInput.addEventListener('dblclick', this.enableSecondsEdit.bind(this));
        }

        // 毫秒输入框事件
        if (this.millisecondsInput) {
            this.millisecondsInput.addEventListener('blur', this.onMillisecondsBlur.bind(this));
            this.millisecondsInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') this.onMillisecondsBlur();
            });
            this.millisecondsInput.addEventListener('mousedown', this.handleMillisecondsMouseDown.bind(this));
            this.millisecondsInput.addEventListener('dblclick', this.enableMillisecondsEdit.bind(this));
        }
    }

    // 添加组件样式
    addStyles() {
        const styleId = 'time-input-styles';

        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        .time-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .hours-input-group,
        .minutes-input-group,
        .seconds-input-group,
        .milliseconds-input-group {
          display: flex;
          align-items: center;
          margin: 0 1px;
        }
        
        .value-input {
          height: 20px;
          background-color: #2c2c2c;
          border: none;
          font-size: 12px;
          text-align: center;
          padding: 0;
          margin: 0;
          color: #ccc;
          outline: none;
          cursor: ew-resize;
        }
        
        .hours-input {
          width: 20px;
        }
        
        .minutes-input,
        .seconds-input {
          width: 20px;
        }
        
        .milliseconds-input {
          width: 30px;
        }
        
        .time-symbol {
          font-size: 12px;
          color: #888;
          margin: 0 2px;
          user-select: none;
        }
        
        .value-input:focus {
          background-color: #3a3a3a;
          color: #fff;
          cursor: text;
        }
        
        .value-input.dragging {
          cursor: ew-resize;
          user-select: none;
        }
        
        .unit-toggle {
          display: flex;
          align-items: center;
          margin-left: 4px;
          cursor: pointer;
        }
        
        .toggle-button {
          font-size: 10px;
          background-color: #3a3a3a;
          color: #888;
          padding: 1px 4px;
          border-radius: 2px;
          user-select: none;
        }
        
        .toggle-button:hover {
          background-color: #4a4a4a;
          color: #ccc;
        }
        
        .toggle-button.active {
          background-color: #505050;
          color: #fff;
        }
        
        .drag-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          border: 1px solid #00a8ff;
          border-radius: 3px;
          opacity: 0.3;
        }
        
        .drag-indicator.dragging {
          background-color: rgba(0, 168, 255, 0.1);
          opacity: 0.6;
        }
        
        .time-input-container:active {
          user-select: none;
        }
      `;
            document.head.appendChild(style);
        }
    }

    // 获取DOM元素
    getElement() {
        return this.container;
    }

    // 设置值
    setValue(value) {
        if (this.isDraggingAny() || this.isEditingAny()) return;

        const numValue = Number(value) || 0;
        this.currentValue = numValue;
        this.updateDisplayValues(numValue);
    }

    // 获取当前值
    getValue() {
        return this.currentValue;
    }
}
