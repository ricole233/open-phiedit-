<!-- 和ae一样的逻辑 按下回车键修改 再按回车键确认 按下esc键取消修改  -->
<template>
    <input type="text" v-model="value" @keydown.enter="handleEnter" @keydown.esc="handleEsc" :disabled="disabled" />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: string;
    disabled?: boolean;
    // 是否启用数学表达式计算
    enableMathExpression?: boolean;
}>();

const value = ref(props.modelValue);
const emit = defineEmits(['update:modelValue']);

// 计算表达式函数
const evaluateExpression = (expression: string): number | null => {
    try {
        // 清理表达式，只保留数字和基本运算符
        const cleanExpr = expression.replace(/[^0-9+\-*/().]/g, '');
        
        // 检查表达式是否包含运算符
        if (!/[+\-*/]/.test(cleanExpr)) {
            return null; // 不包含运算符，不需要计算
        }
        
        // 使用Function构造函数计算表达式，比eval更安全
        const result = new Function('return ' + cleanExpr)();
        return result;
    } catch (error) {
        // 如果计算失败，返回null
        return null;
    }
};

const handleEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        // 如果启用了数学表达式计算，并且输入包含数学运算符
        if (props.enableMathExpression && /[+\-*/]/.test(value.value)) {
            const result = evaluateExpression(value.value);
            if (result !== null) {
                // 将计算结果应用到输入值
                value.value = result.toString();
            }
        }
        
        emit('update:modelValue', value.value);
    }
};

const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        value.value = props.modelValue;
    }
};

watch(
  () => props.modelValue,
  (newVal) => {
    value.value = newVal;
  }
);
</script>
<style scoped>
input {
    width: 100%;
    height: 22px;
    border: 1px solid #3a3a3a;
    border-radius: 2px;
    background-color: #2a2a2a;
    color: #d8d8d8;
    font-family: 'Arial', sans-serif;
    font-size: 11px;
    padding: 0 5px;
    outline: none;
    box-sizing: border-box;
}

input:focus {
    border-color: #3676b8;
    box-shadow: 0 0 0 1px rgba(54, 118, 184, 0.5);
}

input:hover:not(:focus) {
    border-color: #464646;
}

/* 禁用状态 */
input:disabled {
    background-color: #262626;
    color: #686868;
    border-color: #333333;
}
</style>