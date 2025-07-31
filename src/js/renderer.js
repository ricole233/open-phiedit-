let renderer = {
	// 渲染区域的左上角坐标
	x1: 125,
	y1: 0,
	// 渲染区域的右下角坐标
	x2: 1475,
	y2: 900,
	pre: function () { // 预处理
		// 初始化缓存，为每条判定线创建缓存数组
		if (this.cache == null || this.cache.length != all_data.judgeLineList.length) {
			this.cache = [];
			for (let i = 0; i < all_data.judgeLineList.length; i++) this.cache.push(new Array);
		}

		// 将带分数格式[整数部分, 分子, 分母]转换为小数
		function to(a) {
			return a[0] + a[1] / a[2];
		}
		for (let i = 0; i < all_data.judgeLineList.length; i++) {
			let line = all_data.judgeLineList[i];
			for (let j = 0; j < line.eventLayers.length; j++) {
				if (line.eventLayers[j] != null) {
					for (e of ["moveXEvents", "moveYEvents", "rotateEvents", "alphaEvents", "speedEvents"]) {
						// 一定要先检查是否存在，有些层级可能没有事件
						if (line.eventLayers[j][e] != null)
							line.eventLayers[j][e].sort((a, b) => to(a.startTime) - to(b.startTime));
					}
				}
			}
			if (line.notes != null) {
				this.cache[i] = [];
				for (let j = 0; j < line.notes.length; j++) {
					let note = note_extract(line.notes[j]);
					if (note.type == 2) this.cache[i].push({ st: this.getdis(line, note.startTime), ed: this.getdis(line, note.endTime) });
					else this.cache[i].push(this.getdis(line, note.startTime));
				}
			}
		}
	},
	basic_getval: function (e, t) { // 单层级事件：e 为事件 Array，t 为一个带分数或者小数表示时间
		// 将带分数格式转换为小数
		function to(s) {
			return s[0] + s[1] / s[2];
		}
		if (Array.isArray(t)) t = to(t);
		let val = 0;
		// 二分查找对应的事件
		let l = 0, r = e.length - 1;
		while (l <= r) {
			let mid = Math.floor((l + r) / 2);
			if (to(e[mid].endTime) <= t) { // endTime <= t 已结束
				val = e[mid].end;
				l = mid + 1;
			} else if (to(e[mid].startTime) <= t) { // startTime <= t 进行中
				val = e[mid].start + (e[mid].end - e[mid].start) * calcease(e[mid].easingType, e[mid].easingLeft + (e[mid].easingRight - e[mid].easingLeft) * (t - to(e[mid].startTime)) / (to(e[mid].endTime) - to(e[mid].startTime)))
				return val;
			} else {
				r = mid - 1;
			}
		}
		return val;
	},
	basic_getval_colorevents: function (e, t) { // 同 basic_getval，用来处理颜色事件
		let val = [255, 255, 255];
		for (let i = 0; i < e.length; i++) {
			if (cmp(e[i].endTime, t)) { // endTime <= t 已结束
				val = e[i].end;
			} else if (cmp(e[i].startTime, t)) { // startTime <= t 进行中
				let ratio = calcease(e[i].easingType, e[i].easingLeft + (e[i].easingRight - e[i].easingLeft) * div(sub(t, e[i].startTime), sub(e[i].endTime, e[i].startTime)));
				for (let j = 0; j < 3; j++) val[j] = e[i].start[j] + (e[i].end[j] - e[i].start[j]) * ratio;
			}
		}
		return val;
	},
	basic_getval_textevents: function (e, t) { // 同 basic_getval，用来处理文字事件
		function tonum(s) {
			let s2 = "";
			for (let i = 0; i < s.length; i++) {
				if (s.substring(i, i + 3) == "%P%") i += 2;
				else s2 += s[i];
			}
			return Number(s2);
		}
		let str = "";
		for (let i = 0; i < e.length; i++) {
			if (cmp(e[i].endTime, t)) { // endTime <= t 已结束
				str = e[i].end;
			} else if (cmp(e[i].startTime, t)) { // startTime <= t 进行中
				let ratio = calcease(e[i].easingType, e[i].easingLeft + (e[i].easingRight - e[i].easingLeft) * div(sub(t, e[i].startTime), sub(e[i].endTime, e[i].startTime)));
				if (e[i].start.includes("%P%") && e[i].end.includes("%P%")) {
					let start_num = tonum(e[i].start);
					let end_num = tonum(e[i].end);
					if (isNaN(start_num) && isNaN(end_num)) str = "";
					else if (start_num % 1 === 0 && end_num % 1 === 0) str = (start_num + (end_num - start_num) * ratio).toFixed(0);
					else str = (start_num + (end_num - start_num) * ratio).toFixed(3);
				} else if (e[i].end.startsWith(e[i].start)) {// 逐渐添加字符
					str = e[i].end.substring(0, Math.round(e[i].start.length + ratio * (e[i].end.length - e[i].start.length)));
				} else if (e[i].start.startsWith(e[i].end)) { // 逐渐删除字符
					str = e[i].start.substring(0, Math.round(e[i].start.length - ratio * (e[i].start.length - e[i].end.length)));
				} else {
					str = e[i].start;
				}
			}
		}
		return str;
	},
	getval: function (line, e, t) { // 多层级普通事件：line 为判定线信息，e 为事件名，t 为一个带分数表示时间
		let s = 0;
		for (let i = 0; i < line.eventLayers.length; i++)
			if (line.eventLayers[i] != null && line.eventLayers[i][e] != null) s += this.basic_getval(line.eventLayers[i][e], t);
		return s;
	},
	basic_getdis: function (e, t) { // 单层级求距离：e 为速度事件 Array，t 为一个带分数表示时间（不考虑 bpmfactor）
		// 将带分数格式转换为小数
		function to(a) {
			return a[0] + a[1] / a[2];
		}
		let val = 0; // 总距离
		for (let i = 0; i < e.length; i++) { // 遍历所有速度事件
			if (cmp(e[i].endTime, e[i].startTime)) {
				let tmp = e[i].startTime;
				e[i].startTime = e[i].endTime;
				e[i].endTime = tmp;
			}

			if (cmp(e[i].endTime, t)) { // endTime <= t 已结束
				val += (e[i].start + e[i].end) / 2 * beat_to_sec(sub(e[i].endTime, e[i].startTime));
			} else {
				if (cmp(e[i].startTime, t)) { // startTime <= t 进行中
					let now = e[i].start + (e[i].end - e[i].start) * div(sub(t, e[i].startTime), sub(e[i].endTime, e[i].startTime))
					val += (e[i].start + now) / 2 * beat_to_sec(sub(t, e[i].startTime));
				}
				break; // 后面的肯定都没开始，直接跳出
			}
			let t2 = t;
			if (i != e.length - 1 && cmp2(e[i + 1].startTime, t2)) t2 = e[i + 1].startTime;
			val += beat_to_sec(sub(t2, e[i].endTime)) * e[i].end;

		}
		return 120 * val;
	},
	getdis: function (line, t) { // 多层级求距离：line 为判定线信息，t 为一个带分数表示时间（不考虑 bpmfactor）
		let s = 0;
		for (let i = 0; i < line.eventLayers.length; i++)
			if (line.eventLayers[i] != null && line.eventLayers[i].speedEvents != null) s += this.basic_getdis(line.eventLayers[i].speedEvents, t);
		return s;
	},
	order: [],
	// 计算判定线之间的父子关系，并确定绘制顺序
	calcfa: function () {
		let n = all_data.judgeLineList.length;
		this.order = []; // 存储绘制顺序
		let c = new Array(n); // 孩子列表
		let vis = new Array(n); // 访问标记
		for (let i = 0; i < n; i++) c[i] = [];
		// 构建父子关系图
		for (let i = 0; i < n; i++)
			if ((all_data.judgeLineList[i].father ?? -1) != -1)
				c[all_data.judgeLineList[i].father].push(i);
		// 深度优先搜索，确定绘制顺序
		function dfs(x, order) {
			if (vis[x] == 1) return;
			vis[x] = 1, order.push(x);
			for (let i = 0; i < c[x].length; i++) dfs(c[x][i], order);
		}
		// 从所有没有父线的判定线开始DFS
		for (let i = 0; i < n; i++)
			if ((all_data.judgeLineList[i].father ?? -1) == -1)
				dfs(i, this.order);
		// 检查是否有未被访问的判定线（可能是由于循环引用导致的）
		for (let i = 0; i < n; i++)
			if (!vis[i])
				this.order.push(i), console.warn("父线错误：出现循环");
	},
	cache: null,
	// 根据控制点插值计算属性值
	attributes_control: function (con, name, x) {
		if (!Array.isArray(con)) return 1; // 如果没有控制点，返回默认值1
		// console.log(name, con);
		// 二分查找确定x在哪两个控制点之间
		let l = 0, r = con.length - 1;
		while (l <= r) {
			let mid = (l + r) >> 1;
			if (con[mid].x <= x) l = mid + 1;
			else r = mid - 1;
		}
		if (r == -1) return con[0][name];
		else if (r == con.length - 1) return con[r][name];
		return con[r][name] + (con[r + 1][name] - con[r][name]) * calcease(con[r].easing, (x - con[r].x) / (con[r + 1].x - con[r].x));
	},
	//绘制一次打击特效
	draw_hit_effect: function (t, x, y, type) {//t为时间，x,y为特效位置坐标（canvas坐标系），type为音符类型
		// 创建一个新的特效对象
		const effect = {
			x: x,                  // 特效X坐标(canvas坐标系)
			y: y,                  // 特效Y坐标(canvas坐标系)
			frameIndex: 0,         // 当前帧索引
			frameCount: 31,        // 总帧数
			size: 120,             // 特效大小
			type: type,            // 音符类型(1-tap, 2-hold, 3-flick, 4-drag)
			isActive: true         // 特效是否活跃
		};
		
		// 播放对应音效
		if (type >= 1 && type <= 4) {
			// 克隆音频节点以允许重叠播放
			const audioClone = noteAudios[type-1].cloneNode();
			audioClone.volume = 0.3; // 设置适当音量
			audioClone.play();
		}
		
		// 添加到活跃特效列表
		activeEffects.push(effect);
	},
	// 主绘制函数
	main: function (t, enable_combo_UI, enable_hit_effect) { // t 为一个带分数表示时间
		// 绘制音符的函数
		let draw = (t, x, y, sz, ang /* canvas 坐标系 */, alpha) => {
			let w = 1089 * sz, h = [100, null, 200, 60][t - 1] * sz; // 根据音符类型确定尺寸
			if (x + w >= -100 && x <= 1700 && y + h >= -100 && y <= 1000) { // 屏幕内的才绘制
				let old = ctx.globalAlpha;
				ctx.globalAlpha *= (alpha / 255); // 设置透明度
				ctx.translate(x, y), ctx.rotate(ang); // 移动和旋转画布
				ctx.drawImage(imgs[t - 1], Math.round(- w / 2), Math.round(-h / 2), w, h);
				ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换矩阵
				ctx.globalAlpha = old; // 恢复透明度
			}
		}
		// 绘制长按音符的函数
		let drawhold = (x, y, sz, ang /* canvas 坐标系 */, h) => {
			let w = 1089 * sz; // 宽度
			ctx.translate(x, y), ctx.rotate(ang); // 移动和旋转画布
			ctx.drawImage(imgs[1], Math.round(- w / 2), Math.round(-h), w, h);
			ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换矩阵
		}

		// 计算判定线的绘制顺序
		this.calcfa();

		// 初始化变量
		let n = all_data.judgeLineList.length;
		let x = new Array(n); // 存储每条判定线的x坐标
		let y = new Array(n); // 存储每条判定线的y坐标
		let f = new Array(n); // 存储每条判定线的角度
		let combo = 0; // 连击数
		// 按照计算好的顺序绘制判定线
		for (let order_i = 0; order_i < all_data.judgeLineList.length; order_i++) {
			let i = this.order[order_i]; // 当前处理的判定线索引
			let line = all_data.judgeLineList[i]; // 当前处理的判定线

			// 根据BPM因子调整时间
			function mul(a, b) {
				let x = (a[0] * a[2] + a[1]) * line.bpmfactor; // 转换为最简分数
				let y = a[2];
				let z = gcd(x, y); // 求最大公约数
				x /= z, y /= z; // 约分
				return [Math.floor(x / y), x % y, y]; // 返回带分数形式[整数部分, 分子, 分母]
			}
			let t2 = mul(t, line.bpmfactor); // 根据当前判定线的BPM因子调整时间

			// 计算判定线的基本属性
			x[i] = this.getval(line, "moveXEvents", t2); // 获取X坐标
			y[i] = this.getval(line, "moveYEvents", t2); // 获取Y坐标
			// 如果有父线，需要进行坐标转换
			if ((line.father ?? -1) != -1) {
				// 根据父线坐标和角度计算当前线的实际位置
				let x2 = x[line.father] + Math.sin(f[line.father] * (Math.PI / 180)) * y[i] + Math.cos(f[line.father] * (Math.PI / 180)) * x[i];
				let y2 = y[line.father] + Math.cos(f[line.father] * (Math.PI / 180)) * y[i] - Math.sin(f[line.father] * (Math.PI / 180)) * x[i];
				x[i] = x2, y[i] = y2;
			}
			f[i] = this.getval(line, "rotateEvents", t2); // 获取旋转角度
			let a = this.getval(line, "alphaEvents", t2); // 获取透明度
			if (a < 0) continue; // 透明度小于0则不绘制
			// console.log(i, x[i], y[i], a);
			// ctx.strokeStyle = "#FFFFFF" + "0123456789ABCDEF"[Math.floor(a / 16)] + "0123456789ABCDEF"[Math.floor(a % 16)];
			let line_color = (line.extended["colorEvents"] == undefined ? [255, 255, 255] : this.basic_getval_colorevents(line.extended["colorEvents"], t2));
			if (line.extended["textEvents"] == undefined) {
				// 绘制判定线
				let scaleY = (line.extended["scaleYEvents"] == undefined ? 1 : this.basic_getval(line.extended["scaleYEvents"], t2));
				let scaleX = (line.extended["scaleXEvents"] == undefined ? 1 : this.basic_getval(line.extended["scaleXEvents"], t2));
				
				// 确保最小线宽和长度
				ctx.lineWidth = Math.max(3, 5 * scaleY);
				let line_length = Math.max(200, 800 * scaleX); // 减小默认长度，确保最小长度
				
				// 确保透明度可见
				let alpha = Math.max(0.3, Math.min(1.0, a / 255));
				
				// 确保颜色可见，如果颜色太暗则使用白色
				let r = line_color[0] || 255;
				let g = line_color[1] || 255; 
				let b = line_color[2] || 255;
				if (r + g + b < 100) { // 如果颜色太暗
					r = g = b = 255; // 使用白色
				}
				
				ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
				
				// 计算判定线的起点和终点
				let cos_f = Math.cos(f[i] * Math.PI / 180);
				let sin_f = Math.sin(f[i] * Math.PI / 180);
				
				let startX = this.x1 + (x[i] - line_length * cos_f + 675) / 1350 * (this.x2 - this.x1);
				let startY = this.y2 - (y[i] + line_length * sin_f + 450) / 900 * (this.y2 - this.y1);
				let endX = this.x1 + (x[i] + line_length * cos_f + 675) / 1350 * (this.x2 - this.x1);
				let endY = this.y2 - (y[i] - line_length * sin_f + 450) / 900 * (this.y2 - this.y1);
				
				ctx.beginPath();
				ctx.moveTo(startX, startY);
				ctx.lineTo(endX, endY);
				ctx.stroke();
				
								// 绘制判定线编号（跟随判定线朝向）
				let anchorX = this.x1 + (this.x2 - this.x1) * (x[i] + 675) / 1350;
				let anchorY = this.y2 - (this.y2 - this.y1) * (y[i] + 450) / 900;
				
				// 保存当前canvas状态
				ctx.save();
				
				// 移动到锚点并应用旋转
				ctx.translate(anchorX, anchorY);
				ctx.rotate(f[i] * Math.PI / 180);
				
				// 设置编号文字样式
				ctx.font = "bold 18px Arial";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				
				// 创建带箭头的编号文本
				let labelText = `<${i}>`;
				
				// 测量文本宽度以确定背景大小
				let textMetrics = ctx.measureText(labelText);
				let textWidth = textMetrics.width;
				let textHeight = 20;
				
				// 绘制编号背景矩形（半透明黑色）
				ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
				ctx.fillRect(-textWidth/2 - 4, -textHeight/2 - 2, textWidth + 8, textHeight + 4);
				
				
				// 绘制编号文字
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText(labelText, 0, 0);
				
				// 恢复canvas状态
				ctx.restore();
			} else {
				ctx.fillStyle = "rgba(" + line_color[0] + "," + line_color[1] + "," + line_color[2] + "," + a / 255 + ")"; // 文字颜色
				ctx.textAlign = "center";
				let line_text = this.basic_getval_textevents(line.extended["textEvents"], t2);
				ctx.fillText(line_text, this.x1 + (this.x2 - this.x1) * (x[i] + 675) / 1350, this.y2 - (this.y2 - this.y1) * (y[i] + 450) / 900);
			}
			// 计算音符已经经过的距离
			let passed = this.getdis(line, t2); // 音符已经经过的距离
			// 遍历判定线上的所有音符
			for (let j = 0; j < (line.notes == undefined ? 0 : line.notes.length); j++) {
				let note = note_extract(line.notes[j]); // 提取音符信息
				
				// 获取音符的开始和结束时间（小数形式）
				let startTimeNum = note.startTime[0] + note.startTime[1] / note.startTime[2];
				let endTimeNum = note.type == 2 ? (note.endTime[0] + note.endTime[1] / note.endTime[2]) : startTimeNum;
				
				// 获取当前时间的小数形式
				let currentTimeNum = t2[0] + t2[1] / t2[2];
				
				// 如果音符已经结束，则增加连击并跳过
				if (cmp2(note.endTime, t2)) {
					if (note.isFake == 0) combo++; // 非假音符才增加连击
					
					// 检测音符结束时是否触发特效（对于hold音符）
					if (enable_hit_effect && note.type == 2 && Math.abs(currentTimeNum - endTimeNum) < 0.05) {
						// 计算特效显示位置
						let notex = x[i] + Math.cos(f[i] * (Math.PI / 180)) * note.positionX;
						let notey = y[i] - Math.sin(f[i] * (Math.PI / 180)) * note.positionX;
						// 转换为canvas坐标
						let tx = this.x1 + (this.x2 - this.x1) * ((notex + 675) / 1350);
						let ty = this.y2 - (this.y2 - this.y1) * ((notey + 450) / 900);
						// 创建特效
						this.draw_hit_effect(currentTimeNum, tx, ty, note.type);
					}
					
					continue;
				}
				
				// 检测音符开始时是否触发特效（所有类型音符）
				if (enable_hit_effect && Math.abs(currentTimeNum - startTimeNum) < 0.05) {
					// 计算特效显示位置
					let notex = x[i] + Math.cos(f[i] * (Math.PI / 180)) * note.positionX;
					let notey = y[i] - Math.sin(f[i] * (Math.PI / 180)) * note.positionX;
					// 转换为canvas坐标
					let tx = this.x1 + (this.x2 - this.x1) * ((notex + 675) / 1350);
					let ty = this.y2 - (this.y2 - this.y1) * ((notey + 450) / 900);
					// 创建特效
					this.draw_hit_effect(currentTimeNum, tx, ty, note.type);
				}
				
				// 如果是反面音符，需要翻转坐标和角度
				if (note.above != 1) f[i] += 180, note.positionX *= -1; // 绘制反面的音符
				// 处理长按音符(Hold)
				if (note.type == 2) {
					// x1：开始位置，x2：结束位置，y 同理
					let notex1, notey1, dis1;
					// 计算长按音符的开始距离
					if (cmp2(note.startTime, t2)) { // 开始接触判定线了
						dis1 = 0; // 已经开始了，距离为0
					} else {
						dis1 = this.cache[i][j].st - passed; // 从缓存中获取开始距离
					}
					let dis2 = this.cache[i][j].ed - passed; // 长按音符的结束距离
					if (dis1 < 1700) {
						notex1 = x[i] + Math.sin(f[i] * (Math.PI / 180)) * dis1 + Math.cos(f[i] * (Math.PI / 180)) * note.positionX;				
						notey1 = y[i] + Math.cos(f[i] * (Math.PI / 180)) * dis1 - Math.sin(f[i] * (Math.PI / 180)) * note.positionX;
						let notex2 = x[i] + Math.sin(f[i] * (Math.PI / 180)) * dis2 + Math.cos(f[i] * (Math.PI / 180)) * note.positionX;
						let notey2 = y[i] + Math.cos(f[i] * (Math.PI / 180)) * dis2 - Math.sin(f[i] * (Math.PI / 180)) * note.positionX;
						let tx1 = this.x1 + (this.x2 - this.x1) * ((notex1 + 675) / 1350);
						let ty1 = this.y2 - (this.y2 - this.y1) * ((notey1 + 450) / 900);
						let tx2 = this.x1 + (this.x2 - this.x1) * ((notex2 + 675) / 1350);
						let ty2 = this.y2 - (this.y2 - this.y1) * ((notey2 + 450) / 900);
						drawhold(tx1, ty1, 0.15, f[i] * (Math.PI / 180), Math.sqrt((tx2 - tx1) * (tx2 - tx1) + (ty2 - ty1) * (ty2 - ty1)));
					}
				} else { // 处理点按音符(Tap/Drag/Flick)
					// 计算音符到判定线的距离
					let dis = this.cache[i][j] - passed; // 音符现在到判定线的距离
					// 获取y方向的控制值
					let attr_dis = this.attributes_control(now_line.yControl, "y", dis);
					if (dis < 1700) { // 只绘制在一定距离内的音符
						// 获取x方向的控制值
						let attr_x = this.attributes_control(now_line.posControl, "pos", dis); // 相对于判定线的 x 坐标
						// 计算音符的实际坐标(考虑判定线角度和偏移)
						let notex = x[i] + Math.sin(f[i] * (Math.PI / 180)) * (dis * attr_dis + note.yOffset) + Math.cos(f[i] * (Math.PI / 180)) * note.positionX * attr_x;
						let notey = y[i] + Math.cos(f[i] * (Math.PI / 180)) * (dis * attr_dis + note.yOffset) - Math.sin(f[i] * (Math.PI / 180)) * note.positionX * attr_x;

						// 获取大小和透明度的控制值
						let attr_size = this.attributes_control(now_line.sizeControl, "size", dis);
						let attr_alpha = this.attributes_control(now_line.alphaControl, "alpha", dis);
						// 绘制音符
						draw(note.type, this.x1 + (this.x2 - this.x1) * ((notex + 675) / 1350), this.y2 - (this.y2 - this.y1) * ((notey + 450) / 900), 0.15 * note.size * attr_size, f[i] * (Math.PI / 180), note.alpha * attr_alpha);
					}
				}
				// 如果是反面音符，恢复角度和坐标
				if (note.above != 1) f[i] -= 180, note.positionX *= -1;
			}
			// const e = ["moveXEvents", "moveYEvents", "rotateEvents", "alphaEvents", "speedEvents"];
		}
		// 渲染所有活跃特效
		if (activeEffects && activeEffects.length > 0) {
			this.updateEffects();
			this.renderEffects();
		}

		// 如果需要显示连击UI
		if (enable_combo_UI) {
			let old_font = ctx.font; // 保存原字体设置
			// 绘制连击数
			ctx.font = "45px 思源黑体";
			ctx.textAlign = "center";
			ctx.fillStyle = "#FFF";
			ctx.fillText(combo, 800, 40);
			// 绘制自动播放提示
			ctx.font = "25px 思源黑体";
			ctx.fillText("Autoplay", 800, 80);
			ctx.font = old_font; // 恢复原字体设置
		}
	},

	// 更新特效状态
	updateEffects: function() {
		// 过滤并保留仍然活跃的特效
		activeEffects = activeEffects.filter(effect => {
			// 更新特效帧
			effect.frameIndex++;
			
			// 检查特效是否完成
			if (effect.frameIndex >= effect.frameCount) {
				effect.isActive = false;
				return false; // 从列表中移除
			}
			
			return true; // 保留在列表中
		});
	},
	
	// 渲染所有特效
	renderEffects: function() {
		// 遍历所有活跃特效并绘制
		activeEffects.forEach(effect => {
			if (effect.frameIndex < effectImgs.length) {
				const img = effectImgs[effect.frameIndex];
				if (img && img.complete) { // 确保图片已加载
					const size = effect.size;
					ctx.drawImage(img, effect.x - size/2, effect.y - size/2, size, size);
				}
			}
		});
	}
}
