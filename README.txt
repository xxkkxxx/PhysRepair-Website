PhysRepair — GitHub Pages 静态网站源码

网页：https://xxkkxxx.github.io/PhysRepair-Website/
网页仓库：https://github.com/xxkkxxx/PhysRepair-Website
论文代码仓库：https://github.com/xxkkxxx/PhysRepair

首页为 index.html；图片、视频和案例数据位于 assets/。
当前展示 15 个对比案例和 4 个消融案例。扳手案例已隐藏，素材保留。
Cue-ball collision 位于第 3 个，首页大对比为 Goalkeeper save。

GitHub Pages 设置
Source: Deploy from a branch
Branch: main
Folder: /(root)

本地预览
python -m http.server 8000
打开 http://localhost:8000/。

编辑位置
index.html：标题、作者、摘要和页面结构。
style.css：配色、字体和布局。
app.js：案例切换与播放。
assets/data.json：案例顺序、隐藏标记及素材路径。
assets/figures/：论文静态图片。
assets/videos/、assets/posters/：视频和封面。

所有站内素材使用相对路径，可部署到 GitHub Pages 项目子路径。
