- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
    - Vite + React TypeScript 项目
    - Electron 依赖已预装
    - 为将来的桌面应用转换做准备

- [x] Scaffold the Project
    - 使用 `npx create-vite@latest . --template react-ts` 创建项目
    - 已安装所有 npm 依赖

- [x] Customize the Project
    - 创建 `electron/main.ts` 和 `electron/preload.ts`
    - 添加 Electron 脚本命令到 package.json
    - 配置 Electron 开发和构建流程

- [x] Install Required Extensions
    - 无需特殊 VS Code 扩展（React、TypeScript、Vite 开发可直接使用）

- [x] Compile the Project
    - 依赖安装完成，无编译错误

- [x] Create and Run Task
    - Web 开发：`npm run dev`
    - Electron 开发：`npm run electron-dev`

- [x] Launch the Project
    - 项目已准备好启动

- [x] Ensure Documentation is Complete
    - README.md 已更新
    - 本文件已清理注释
