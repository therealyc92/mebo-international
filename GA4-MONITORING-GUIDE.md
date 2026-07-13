# MEBO International - Google Analytics 4 监控配置指南
**Measurement ID: G-X9NMMSXRDT**
**部署日期: 2026-07-03**
**最后更新: 2026-07-03**

---

## 一、概览

MEBO International 网站已集成 Google Analytics 4 (GA4)，并配置了**9 类自定义事件**用于深度用户行为分析。所有事件仅在用户接受分析 Cookie 后触发，符合隐私合规要求。

---

## 二、自定义事件清单

| # | 事件名称 | 类别 | 关键参数 | 触发场景 |
|---|----------|------|----------|----------|
| 1 | `page_view_enriched` | 页面浏览 | page_type, language, has_hcp_gate, has_contact_form, sections_count | 页面加载1秒后 |
| 2 | `language_switch` | 用户偏好 | from_language, to_language, target_url, page_location | 点击ES/EN切换器 |
| 3 | `cta_click` | 转化追踪 | cta_text, cta_url, cta_location, cta_type | 点击任何CTA按钮 |
| 4 | `hcp_gate_interaction` | 门控专区 | action, page | HCP门控复选框勾选 |
| 5 | `hcp_gate_access` | 门控专区 | confirmed, page | HCP门控进入按钮点击 |
| 6 | `form_field_focus` | 表单 | field_name, field_type, form_id | 联系表单字段聚焦 |
| 7 | `form_submit` | 转化追踪 | form_id, form_name, page | 联系表单提交 |
| 8 | `scroll_depth` | 参与度 | percent, page | 滚动到25%/50%/75%/100% |
| 9 | `reading_progress` | 参与度 | milestone | 读完50% / 完整阅读 |
| 10 | `external_link_click` | 出站 | link_url, link_domain, link_text | 点击PubMed等外链 |
| 11 | `cookie_consent` | 隐私 | action, page | Cookie同意/拒绝 |

---

## 三、推荐自定义维度

在 GA4 中创建以下 **Custom Dimensions**：

| 维度名称 | 范围 | 参数 | 说明 |
|----------|------|------|------|
| Page Type | Event | page_view_enriched.page_type | home / inner_page / hcp_gated / contact |
| Language | Event | page_view_enriched.language | es / en |
| CTA Location | Event | cta_click.cta_location | hero / page_hero / cta_section / footer / body |
| CTA Type | Event | cta_click.cta_type | primary / accent / light / outline / study_link / resource |
| HCP Status | Event | hcp_gate_access.confirmed | true / false |
| Form Field | Event | form_field_focus.field_name | nombre / email / pais / profesion / asunto / mensaje |
| Scroll Milestone | Event | scroll_depth.percent | 25 / 50 / 75 / 100 |
| Link Domain | Event | external_link_click.link_domain | pubmed.ncbi.nlm.nih.gov / others |

**设置路径**：GA4 → 管理 → 媒体资源 → 自定义定义

---

## 四、推荐自定义指标

| 指标名称 | 公式 | 用途 |
|----------|------|------|
| HCP Engagement Rate | hcp_gate_access / page_view_enriched (where page_type = hcp_gated) | 衡量医疗专业人员转化率 |
| Bilingual Switch Rate | language_switch / page_view_enriched | 衡量双语使用分布 |
| Form Completion Rate | form_submit / form_field_focus (unique users) | 表单转化漏斗 |
| Average Scroll Depth | AVG(scroll_depth.percent) | 页面参与度 |
| CTA CTR | cta_click / page_view_enriched | CTA点击率 |

---

## 五、推荐报告 / 探索 (Explorations)

### 报告 1: 跨语言用户行为对比

**目标**：对比西语 vs 英语用户行为差异

**维度**：Language (es / en)
**指标**：Users, Engaged sessions, Average engagement time, Form submissions
**过滤器**：Page path starts with `/mebo-international/`
**细分**：Language = es vs Language = en

### 报告 2: HCP 门控转化漏斗

**目标**：追踪医疗专业人员从访问到门控进入的转化

**步骤**：
1. 步骤1: page_view_enriched where page_type = hcp_gated
2. 步骤2: hcp_gate_interaction where action = checkbox_checked
3. 步骤3: hcp_gate_access where confirmed = true

### 报告 3: 联系表单转化漏斗

**步骤**：
1. 步骤1: page_view_enriched where has_contact_form = true
2. 步骤2: form_field_focus
3. 步骤3: form_submit

### 报告 4: 内容参与度

**维度**：Page title
**指标**：Users, scroll_depth (avg), reading_progress events
**可视化**：散点图（参与度 vs 流量）

### 报告 5: 双语切换路径

**维度**：Page path
**指标**：language_switch events, switching rate
**过滤器**：landing page + language_switch within 30s

---

## 六、关键受众 (Audiences) 推荐

| 受众名称 | 条件 | 用途 |
|----------|------|------|
| Spanish-speaking visitors | Language = es AND Page path does not contain /en/ | 西语市场细分 |
| English-speaking visitors | Language = en | 英语市场细分 |
| Engaged HCP prospects | hcp_gate_access (confirmed = true) in last 30 days | 高价值医疗专业人员 |
| Form abandoners | form_field_focus but no form_submit in same session | 表单流失用户 |
| Deep readers | scroll_depth = 100 in last 7 days | 深度内容读者 |
| Multi-page explorers | engaged sessions >= 3 pages in same session | 高参与度用户 |

---

## 七、关键警报配置 (Insights)

GA4 → Reports → Insights → Create

| 警报名称 | 条件 | 通知方式 |
|----------|------|----------|
| Spike in Spanish traffic | Spanish users +50% vs 7-day avg | Email |
| HCP gate conversion drop | hcp_gate_access rate < 5% | Email |
| Form submission failure | form_submit events missing > 24h | Email |
| New English market entry | English users > 100/day | Email |

---

## 八、自定义实时仪表板 (Realtime Dashboard)

**设置路径**：GA4 → Reports → Library → Create new report

### Dashboard 1: MEBO Health Check

**Widget 配置**：
1. **实时用户数** - 维度: Page path, 指标: Active users
2. **过去30分钟事件** - 维度: Event name, 指标: Event count
3. **今日热门页面** - 维度: Page title, 指标: Views
4. **语言分布** - 维度: Language, 指标: Users (饼图)
5. **当前活跃国家** - 维度: Country, 指标: Users (地图)
6. **关键转化率** - 单数字: form_submit / page_view_enriched

### Dashboard 2: HCP Engagement

1. **门控专区访问量** - 维度: page_type=hcp_gated, 指标: Users
2. **确认勾选率** - hcp_gate_interaction / page_view_enriched (filter hcp_gated)
3. **成功访问率** - hcp_gate_access(confirmed=true) / hcp_gate_interaction
4. **门控专区停留时间** - 维度: page_type, 指标: Avg engagement time
5. **HCP 流量来源** - 维度: Session source, 指标: Users (filter hcp_gated)

### Dashboard 3: Content Performance

1. **页面浏览排行** - 维度: Page title, 指标: Views, Users
2. **滚动深度分布** - 维度: scroll_depth.percent, 指标: Events
3. **CTA 点击热图** - 维度: cta_text, 指标: cta_click count
4. **语言切换热点** - 维度: from_language → to_language, 指标: language_switch
5. **外链点击** - 维度: link_domain, 指标: external_link_click
6. **阅读完成率** - 维度: Page title, 指标: reading_progress(milestone=complete) / Views

### Dashboard 4: Conversion Funnel

1. **总访问** - page_view_enriched
2. **参与会话** - Engaged sessions
3. **联系表单启动** - form_field_focus (unique)
4. **联系表单完成** - form_submit
5. **总体转化率** - form_submit / page_view_enriched (%)

---

## 九、GA4 内置报告的关键洞察

**Acquisition 报告**：
- 用户来源国家分布（拉美 vs 英语国家）
- 自然搜索关键词（监控品牌词和医学术语）
- 引荐来源（医学论坛、专业网站）

**Engagement 报告**：
- 着陆页表现（首页 vs 产品页）
- 热门事件（哪些CTA最常被点击）
- 转化路径

**Monetization 报告**（如未来启用电商）：
- 联系表单价值标记

**Retention 报告**：
- 回访用户 vs 新用户
- 双语用户的回访率

---

## 十、建议的 GA4 配置检查清单

完成以下步骤以确保数据完整：

- [ ] 登录 https://analytics.google.com/
- [ ] 选择 MEBO International 媒体资源（G-X9NMMSXRDT）
- [ ] 管理 → 自定义定义 → 添加上述8个自定义维度
- [ ] 管理 → 自定义指标 → 添加5个自定义指标
- [ ] 报告 → 探索 → 创建5个推荐报告
- [ ] 报告 → 受众 → 创建6个推荐受众
- [ ] 报告 → 库 → 创建4个自定义仪表板
- [ ] 设置 → 数据流 → 启用增强型衡量
- [ ] 设置 → 数据流 → 配置跨域跟踪（如有需要）
- [ ] 设置 → 数据过滤 → 添加内部流量过滤（您的IP）
- [ ] 设置 → 数据保留 → 配置为14个月
- [ ] 报告 → 实时 → 验证事件流入（等待24-48小时）

---

## 十一、数据隐私与合规

**当前实施**：
- ✅ IP匿名化（`anonymize_ip: true`）
- ✅ 仅在用户接受"全部Cookie"后加载GA
- ✅ Cookie标记 `SameSite=None;Secure`
- ✅ 不收集个人身份信息
- ✅ 西班牙语/英语 Cookie 同意横幅

**拉美法规建议**（待办）：
- 🇲🇽 墨西哥 LFPDPPP - 数据保护
- 🇦🇷 阿根廷 Ley 25.326
- 🇨🇴 哥伦比亚 Ley 1581
- 🇨🇱  Chile Ley 19.628
- 🇧🇷 巴西 LGPD

**建议**：在 Google Analytics 后台 → 数据设置 → 启用"数据删除请求"工作流

---

## 十二、监控命令快速参考

```bash
# 本地测试 GA 事件
curl -s "https://www.google-analytics.com/debug/mp/collect?measurement_id=G-X9NMMSXRDT" \
  -d "v=2&tid=G-X9NMMSXRDT&en=test_event"

# GA4 实时事件验证
# 在浏览器中打开 https://therealyc92.github.io/mebo-international/
# 打开 GA4 → Reports → Realtime → 查看事件
```

---

## 十三、报告生成器代码模板

如需在 GA4 中创建**自定义报告**，可以使用以下 JSON 配置（导入到 GA4 Explore）：

```json
{
  "reportName": "MEBO HCP Funnel",
  "dimensions": ["pageType", "hcpStatus"],
  "metrics": ["eventCount", "activeUsers"],
  "filters": {
    "pageType": "hcp_gated"
  }
}
```

---

**配置维护**：
- 每周检查一次实时数据流入
- 每月导出关键报告存档
- 每季度审查自定义维度和受众表现

**联系方式**：
- GA4 账号：therealyc92
- 媒体资源：MEBO International
- Measurement ID：G-X9NMMSXRDT
