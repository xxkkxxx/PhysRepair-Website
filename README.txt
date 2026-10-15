PhysRepair — GitHub Pages 静态网站源码（2026-10-15 最新版）

这是当前网页修改后的完整版本。无需 Node.js、构建工具、数据库或私有预览平台。
首页是根目录 index.html；视频、图片、论文 PDF 和案例数据都在 assets/。
已包含本轮修改：Pipline 首字母大写，作者与单位更新，最新 Pipeline 图、论文 PDF 与三组消融图，
Goalkeeper save 首页大对比，15 个展示 case，扳手 case 暂时隐藏且保留素材，主球碰撞 case 第 3 位，
指定 case 隐藏、PPT 版本优先和消融中间结果补齐。

上传到 GitHub
1. 解压压缩包，将 index.html、style.css、app.js、assets/ 和 .nojekyll 放在仓库根目录。
   ZIP 中的文件已经位于根目录；不要直接上传 ZIP 文件或再套一层文件夹。
2. 视频文件较多，建议使用 GitHub Desktop 或 Git 命令上传整个目录。
3. 如果是全新 GitHub 仓库，可在解压目录执行以下命令：

   git init
   git add .
   git commit -m "Add PhysRepair project website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/physrepair.git
   git push -u origin main

将 YOUR_USERNAME 和 physrepair 替换为实际用户名、仓库名。
已有本地仓库时，直接复制文件进去，再 add、commit、push 即可。

启用 GitHub Pages
仓库 Settings → Pages → Build and deployment：
  Source：Deploy from a branch
  Branch：main
  Folder：/(root)
然后点击 Save。
项目页地址通常为 https://YOUR_USERNAME.github.io/physrepair/
最终地址以 GitHub Pages 设置页显示的链接为准。

本地预览
在解压目录运行：
  python -m http.server 8000
打开 http://localhost:8000/
请通过 HTTP 预览，直接双击首页可能导致浏览器阻止读取案例 JSON。

编辑位置
index.html：标题、作者、摘要和页面结构。
style.css：配色、字体、布局。
app.js：案例切换、视频播放和结果表格。
assets/data.json：case 名称、顺序、隐藏标记及视频路径。
assets/videos/、assets/posters/：视频与封面。
assets/figures/：论文图。
assets/PhysRepair-paper.pdf：当前网页提供的论文 PDF。

此目录不含私有托管配置、Git 历史或凭据。所有站内链接使用相对路径，
支持 https://用户名.github.io/项目名/，不需要修改资源前缀。
Google Fonts 不可访问时，页面自动使用系统备用字体。

官方 Pages 配置说明：
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
