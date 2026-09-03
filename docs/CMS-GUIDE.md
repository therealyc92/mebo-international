# MEBO 官网内容管理后台 · 使用指南(非技术版)

> 写给市场同事:看完这份文档,你就能自己更新官网内容,不需要找开发。

---

## 1. 这个后台是什么?

一句话:**官网的"内容编辑器"**。

- 你在浏览器里打开后台,像填表一样改轮播图、发新闻、改文案;
- 点"保存"后,内容自动存进 GitHub 仓库(相当于自动留档,改错了能找回旧版);
- 大约 1 分钟后,官网自动更新,全程不需要碰代码。

后台地址:**https://therealyc92.github.io/mebo-international/admin/**

## 2. 能改什么?

| 后台里的目录 | 对应官网位置 |
|---|---|
| 首页轮播(西语/英语) | 首页顶部的大图轮播:背景图、标题、副标题、按钮 |
| 新闻(西语/英语) | Noticias 新闻列表 + 新闻文章 |
| 临床证据(西语/英语) | Estudios Clínicos 页:顶部数据条、RCT 数据卡、研究卡片 |
| 产品/联系页文案(西语/英语) | 产品页各节标题导语、联系页文案、电话邮箱显示文字 |

**重要:西语和英语是两套内容,改了一边记得改另一边**(标识 slug 保持一致即可)。

## 3. 第一次使用:开通登录(一次性,约 10 分钟)

后台用 **GitHub 账号**登录。第一次用之前,需要做一次性的"登录网关"设置
(因为 GitHub 的登录验证需要一个小中转服务,部署在免费的 Cloudflare 上):

1. **创建 GitHub OAuth 应用**(2 分钟)
   - 打开 https://github.com/settings/applications/new
   - Application name: `MEBO 官网后台`
   - Homepage URL: `https://therealyc92.github.io/mebo-international/`
   - Authorization callback URL: 暂时填 `https://therealyc92.github.io/mebo-international/admin/`(下一步部署完网关后改成网关地址)
   - 创建后记下 **Client ID**,并生成一个 **Client Secret**

2. **部署登录网关**(5 分钟,免费)
   - 用 Cloudflare Workers 部署开源的 `sveltia-cms-auth`
     (仓库:https://github.com/sveltia/sveltia-cms-auth,按 README 操作:
     注册 Cloudflare → 安装 wrangler → 填入 Client ID/Secret → `wrangler deploy`)
   - 部署完得到一个地址,形如 `https://xxx.workers.dev`

3. **回填两个配置**(3 分钟)
   - 把 GitHub OAuth 应用的 callback URL 改成 `https://xxx.workers.dev/callback`
   - 把仓库里 `admin/config.yml` 中 `base_url` 改成 `https://xxx.workers.dev`

做完这三步,任何有仓库写权限的 GitHub 账号都能从浏览器登录后台。

> 这一步需要技术同事协助一次,之后永远不用再管。

## 4. 日常操作

### 改首页轮播
1. 打开后台 → 「首页轮播(西语)」→「轮播内容」
2. 每一项是一张轮播:换背景图(点图片上传)、改标题/副标题/按钮文字
3. 换行:标题里输入 `<br>`;重点词高亮:`<span class="apec-highlight">词</span>`
4. 顺序:拖动条目排序;第一个 = 默认显示的那张
5. 点右上角 **保存(Publish)**,约 1 分钟后官网生效
6. 同样操作「首页轮播(英语)」

### 发一条新闻
1. 「新闻(西语)」→「新闻列表」→ 新增条目
2. 填写:
   - **标识(slug)**:英文小写+短横线,如 `med-2026-peru-webinar`,全站唯一
   - **分类 / 分类显示名**:如 `med` + `Medicina`
   - **日期(显示)**:按页面语言写,如 `3 de septiembre de 2026`
   - **标题 / 摘要 / 封面图**
   - **正文(新文章)**:直接写,支持加粗 `**文字**`、链接 `[文字](网址)`、小标题 `## 标题`、插图 `![说明](图片地址)`、列表 `- 条目`
   - 「旧文章静态链接」**留空**(那是历史文章用的)
3. 保存,官网新闻列表自动出现这篇文章,点开是完整文章页
4. 别忘了在「新闻(英语)」发对应的英文版(**slug 保持一致**)

### 改临床证据 / 产品文案
对应目录里找到条目直接改,保存即可。RCT 数据卡的"条宽(%)"是横向条形图的比例,"数值(显示)"是图上印的数字。

### 改错了怎么办?
- 每次保存都会留档。在 GitHub 仓库的 commit 历史里可以找到任何旧版本;
- 后台里把内容改回去再保存一次也行。

## 5. 注意事项

- **图片**:后台上传的图片统一存在 `assets/uploads/`,建议上传前压缩(单张 < 500KB),新闻封面比例约 16:9
- **不要删空**:轮播至少留 1 张;新闻至少留 1 条
- **双语同步**:西语/英语两套内容分开维护,发布节奏尽量一致
- **搜索索引**:站内搜索结果来自一个静态索引文件,新发的新闻暂时不会出现在站内搜索里(不影响页面展示);定期由技术同事重新生成即可
- **生效时间**:保存后约 1 分钟(GitHub Pages 构建);没看到变化时强刷浏览器(Ctrl+F5)

## 6. 技术结构(交接给信息部时看这一节)

- 内容全部以 JSON 数据文件存放在 `assets/data/`(轮播/新闻/证据/文案 × 西英双语)
- 页面渲染层:`js/content.js`,加载 JSON 渲染;**页面内仍保留硬编码内容作为兜底**,JSON 加载失败时网站照常可用
- 后台:Sveltia CMS(自托管于 `admin/vendor/`),配置在 `admin/config.yml`
- 新闻文章:历史文章是静态页;新文章由 `noticias/articulo.html` / `en/news/article.html` 模板按 slug 渲染
- 迁移友好:内容是标准 JSON,搬到任何服务器或换任何 CMS 都可直接复用
- 内容初始化/打标工具脚本在 `tools/`(extract_content.py / patch_pages.py / tag_copy.py,均为一次性脚本,可重复执行)
