# SuanNiao 项目

这是一个轻量级的 Web + Desktop 应用项目。前期使用 **Vite + React** 开发网页版本，后期可通过 **Electron** 转换成独立桌面应用。

## 项目架构

```
SuanNiao/
├── src/                 # React 应用源代码
├── electron/            # Electron 主进程代码（将来使用）
├── public/              # 静态资源
├── index.html           # 应用入口 HTML
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目依赖和脚本
```

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式

**运行网页版本（推荐开发阶段）：**
```bash
npm run dev
```
应用会在 `http://localhost:5173` 启动。

**运行 Electron 版本（测试桌面应用）：**
```bash
npm run electron-dev
```
这会同时启动 Vite 开发服务器和 Electron 应用窗口。

### 构建

**构建网页版本：**
```bash
npm run build
```
输出文件到 `dist/` 目录。

**构建 Electron 应用（仅当完全准备好转换时）：**
```bash
npm run build:electron
```
```
suan-niao-electron/
## 开发流程

### 第一阶段：网页应用开发
1. 在 `src/` 目录中开发 React 组件
2. 使用 `npm run dev` 进行实时开发
3. 充分测试所有功能

### 第二阶段：准备 Electron 转换
1. 确保所有 React 代码都是纯前端的
2. 避免依赖服务器端的特定功能
3. 所有数据存储使用本地存储（localStorage、IndexedDB 等）

### 第三阶段：Electron 集成
1. 更新 `electron/main.ts` 来配置应用窗口
2. 添加 IPC 通信（如果需要）
3. 使用 `npm run build:electron` 打包成可执行文件

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 超快速构建工具
- **Electron** - 桌面应用框架（可选，将来使用）
- **Electron-Builder** - Electron 应用打包工具

## 脚本命令

| 命令 | 描述 |
|-----|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run build:electron` | 构建并打包 Electron 应用 |
| `npm run electron-dev` | 同时启动 Vite 和 Electron 开发环境 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint 检查代码 |

## 项目特点

✅ **模块化结构** - 清晰的文件组织，易于扩展  
✅ **TypeScript 支持** - 完整的类型检查  
✅ **快速热更新** - Vite 提供极速开发体验  
✅ **Electron 就绪** - 预配置 Electron 支持，随时可转换为桌面应用  
✅ **现代开发体验** - ESLint、TypeScript、React 最佳实践  

## 后续步骤

1. **开发您的应用**：在 `src/` 目录创建 React 组件
2. **测试功能**：使用 `npm run dev` 验证所有功能
3. **准备桌面版**：当网页版完成时，考虑 Electron 转换
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
