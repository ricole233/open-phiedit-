// 右键菜单管理
$("cvs").addEventListener("contextmenu", (event) => {
    console.log(event); // 打印右键事件信息
    event.preventDefault(); // 阻止默认右键菜单
    let menu = $("contextmenu");
    menu.style.display = "block"; // 显示自定义菜单
    menu.style.left = event.pageX + "px"; // 定位菜单到鼠标X坐标
    menu.style.top = event.pageY + "px"; // 定位菜单到鼠标Y坐标
});

// 点击页面时隐藏右键菜单
document.addEventListener("click", (event) => {
    $("contextmenu").style.display = "none"; // 隐藏右键菜单
});

{
    // 更改选中音符类型的函数
    let change_note = (type) => {
        // 遍历所有选中的音符
        for(let i=0; i<selection.length; i++) {
            let nt = note_extract(notes[selection[i]]); // 提取音符数据
            
            // 仅更改非长按类型的音符
            if(nt.type != 2) {
                nt.type = type; // 设置新音符类型
                notes[selection[i]] = note_compress(nt); // 保存修改后的音符
            }
        }
        notecontrol.update(); // 更新音符显示
    }
    
    // 绑定菜单项点击事件：转换为点击/拖拽/滑动音符
    $("contextmenu-toTap").addEventListener("click", () => change_note(1));
    $("contextmenu-toDrag").addEventListener("click", () => change_note(4));
    $("contextmenu-toFlick").addEventListener("click", () => change_note(3));
}

// 水平翻转选中音符
$("contextmenu-filp").addEventListener("click", () => {
    for(let i=0; i<selection.length; i++) {
        let nt = note_extract(notes[selection[i]]); // 提取音符数据
        nt.positionX = -nt.positionX; // 反转X坐标
        notes[selection[i]] = note_compress(nt); // 保存修改
    }
    notecontrol.update(); // 更新音符显示
});