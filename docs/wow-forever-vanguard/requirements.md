# 8016 Vanguard Monument — 产品需求文档

**项目：** TierListBase · WoW Forever 玩家先锋纪念碑  
**版本：** 1.1 · Development Baseline  
**日期：** 2026-10-19  
**活动页：** /wow-forever/vanguard  
**核心业务页：** /wow-forever/tier-list  

---

## 0. 文档定位

本文件定义 8016 Vanguard Monument 的产品规则、用户流程、视觉与交互边界、活动生命周期、上传与审核体验、分享产物、异常状态以及与 WoW Forever Tier List 的业务联动。

本功能是 TierListBase 主站内页，不是独立站。必须沿用 TierListBase 现有 Header、Footer、账户体系、SEO、Analytics、Privacy/Terms 与整体站点框架。

目标不是做复杂游戏，而是完成一个清晰、限时、有仪式感、可传播的玩家纪念活动。

---

## 1. 核心概念

玩家不是“提交一张表单”，而是在一座由玩家记忆组成的数字纪念碑中，占据一个永久位置。

整体由两个阶段组成：

### Phase 1 — WOW

- WOW 三个字母合计 **8,016 席**
- W1：2,672 席
- O：2,672 席
- W2：2,672 席
- 只有 WOW 满 8,016 席以后，FOREVER 才具备出现资格

8,016 对应 2004-11-23 到 2026-11-04 之间的日期间隔，是整个活动的核心纪念数字。

### Phase 2 — FOREVER

- FOREVER 共 7 个字母
- 每个字母 **8,016 席**
- 总计 **56,112 席**
- F：8,016
- O：8,016
- R1：8,016
- E1：8,016
- V：8,016
- E2：8,016
- R2：8,016

### 最终系统容量

- WOW：8,016
- FOREVER：56,112
- 总容量：**64,128 席**

### 硬规则

- WOW 未满时，FOREVER 不展示，也不可提前占位
- WOW 满后不会立刻显示 FOREVER
- WOW 满时记录完成时间
- FOREVER 在 WOW 完成 **24 小时后自动解锁**
- 不开发后台开关
- 如果 FOREVER 的自动解锁时间已经晚于整个活动截止时间，则 FOREVER 不再开放 Claim
- 所有已成功铭刻的席位在活动截止后仍永久可浏览

---

## 2. 活动时间

### 开放

不做预热期。

活动页正式发布到生产环境时，WOW Claim 同时开放。

页面发布与 Claim 开放是同一时刻。

### 最终截止

WoW Forever 官方全球上线时间为：

**2026-11-04 15:00 PST / 2026-11-04 23:00 UTC**

对应：

- 英国：2026-11-04 23:00 GMT
- 中国北京时间：2026-11-05 07:00

此时整个活动立即停止新增铭刻。

### 截止后的状态

截止后：

- 不允许新 Claim
- 不允许新的 Seat Hold
- 不允许最终提交
- 不允许更换或上传 Memory Image
- 已有玩家仍然可以永久浏览自己的 Seat
- 所有人仍然可以浏览 Monument、搜索玩家、打开 Focus、查看 Vanguard Seal、使用分享链接以及进入 WoW Forever Tier List

如果用户在截止前已经开始填写，但在截止后才提交：

**提交失败。**

Seat Hold 不延长活动截止时间。

关闭状态统一展示：

**THE MONUMENT IS SEALED**

辅助文案：

**The inscription period has ended. Every completed Vanguard remains here to explore.**

如果用户仍点击空位或 Claim CTA：

- 不进入表单
- 显示轻量 Toast / Inline Notice：
  **The inscription period has ended. The Monument is now sealed.**

---

## 3. WOW → FOREVER 解锁

WOW 是第一阶段，也是整个活动的 Founding Cohort。

当第 8,016 个 WOW Seat 成功铭刻时：

1. WOW 状态变为 COMPLETE
2. 记录 wowCompletedAt
3. WOW 不再允许 Claim
4. 页面进入为期 24 小时的完成展示状态
5. 页面可出现倒计时：
   **FOREVER AWAKENS IN …**
6. 到 wowCompletedAt + 24h 后，系统自动切换到 FOREVER
7. FOREVER 七个字母同时出现并开放 Claim
8. 不需要人工后台操作

如果 24 小时解锁点已经超过活动最终截止时间，则活动直接进入 SEALED，不开放 FOREVER Claim。

---

## 4. WOW 未满的运营预案

产品正常路径始终是真实用户自然参与。

如果临近最终截止时 WOW 仍未满，可进行运营补量。

为了不增加产品和后台开发：

- 不开发专门的补位 UI
- 不开发运营 Admin
- 如确需补位，由一次性内部脚本执行
- 系统补位记录必须在数据层标记为 system_fill
- system_fill 不绑定真实 TierListBase 用户账户
- system_fill 不计入“真实参与用户数”分析指标
- 不使用虚构真实人物身份、虚构真实玩家照片或冒充真实用户
- 如需要在公共 Monument 中展示，使用中性纪念铭牌 / Default Emblem

运营层可以决定是否执行补位，但该能力不属于普通用户功能。

如希望确保 FOREVER 至少开放一天，WOW 必须在最终截止前至少 24 小时完成。

---

## 5. 视觉原则

第一眼必须看到完整纪念碑，而不是普通网页表单。

整体视觉：

- 经典 WoW / Vanilla / Classic 气质
- stylized hand-painted high fantasy
- 庄严、古老、安静、史诗、纪念感
- 不复制 Blizzard 官方 Logo、字体、建筑、职业图标或官方美术资产
- 固定艺术视角 + 2.5D 空间感
- 不追求任意 360° 真 3D

### 远景

- 看到清晰的 WOW / FOREVER 字形
- 不显示成杂乱头像墙
- 玩家图片被统一石框、暗部和阵营光效约束
- 主要感受是 Monument

### 中景

逐渐看到：

- 玩家图片
- 职业标识
- 阵营色
- Seat ID

### Focus

完整看到单个玩家的信息与记忆。

原则：

**远看统一，近看个性。**

---

## 6. Vanguard Memory Plate

每个 Seat 是一块统一结构的 Memory Plate。

包含：

- 玩家 Memory Image，或职业 Default Emblem
- Vanguard Name
- Faction
- Class
- 可选 Guild
- 可选 Battle Cry
- Seat ID
- 阵营能量
- 固定统一的纪念碑框体

不上传图片、图片审核未通过或图片不可用时，使用对应职业的原创 Default Emblem。

Default Emblem 共 9 套，对应 WoW Forever 9 个职业，必须为 TierListBase 原创视觉，不复制 Blizzard 官方职业图标。

---

## 7. 唯一公开编号：Seat ID

用户不再拥有第二套 Vanguard Number。

对外只展示 **一个 Seat ID**。

Seat ID 表示这个玩家在整个 64,128 席 Monument 中的真实位置，不代表注册顺序。

### WOW Seat ID

格式：

**WOW-{LETTER}-{LOCAL_INDEX}**

范围：

- WOW-W1-0001 ～ WOW-W1-2672
- WOW-O-0001 ～ WOW-O-2672
- WOW-W2-0001 ～ WOW-W2-2672

示例：

**WOW-W1-0614**

含义：

- WOW：第一阶段 Founding Monument
- W1：第一个 W
- 0614：该字母中的第 614 个固定 Seat

### FOREVER Seat ID

格式：

**FOREVER-{LETTER}-{LOCAL_INDEX}**

范围：

- FOREVER-F-0001 ～ FOREVER-F-8016
- FOREVER-O-0001 ～ FOREVER-O-8016
- FOREVER-R1-0001 ～ FOREVER-R1-8016
- FOREVER-E1-0001 ～ FOREVER-E1-8016
- FOREVER-V-0001 ～ FOREVER-V-8016
- FOREVER-E2-0001 ～ FOREVER-E2-8016
- FOREVER-R2-0001 ～ FOREVER-R2-8016

示例：

**FOREVER-E2-0421**

Seat ID 一旦生成永久不变。

用户删除内容或内容被隐藏后，也不把该 Seat ID 分配给其他人。

---

## 8. 账户与席位规则

登录完全复用 TierListBase 现有账户体系。

V1 登录方式：

**Google Only**

不开放 Email Magic Link。

不创建 Vanguard 独立账户体系。

### 一账户一席

一个 TierListBase Account 在整个 64,128 席系统中最多只能拥有 **一个**正式 Seat。

这意味着：

- 已占 WOW 的用户不能再占 FOREVER
- 已占 FOREVER 的用户不能再占第二个 FOREVER Seat
- 用户换浏览器或设备后，登录同一 Google Account 仍只能回到原 Seat

如果已拥有 Seat 的账户点击其他空位：

不进入 Claim。

显示：

**You already have a place in the Monument.**

CTA：

**VIEW MY SEAT**

### 一席一账户

任何 Seat 最多只能绑定一个用户。

数据库必须保证并发情况下不会重复占位。

---

## 9. Claim 表单

### 必填

- Vanguard Name
- Faction
- Class

### 选填

- Memory Image
- Guild
- Battle Cry

### Faction

只能选择：

- Alliance
- Horde

不设置默认值。

### Class

必须从 TierListBase 现有 WoW Forever 9 个职业中选择。

不复制第二套职业定义。

---

## 10. 图片选择、规格与用户提示

WOW 与 FOREVER 使用 **同一套图片上传要求**。

不要求用户理解“大格 / 小格”两种尺寸，也不提供两套上传入口。

系统从同一张标准母版自动派生不同显示尺寸。

### 用户在上传区域必须直接看到的小字

**JPG, PNG or WebP · Max 20 MB · Minimum 512×512 · 1024×1024 or larger recommended · Square crop required**

### 上传流程

1. 用户选择本地图片
2. 浏览器检查格式和本地文件大小
3. 用户进行 1:1 方形裁切
4. 浏览器把裁切结果缩放为最高 2048×2048 的标准母版
5. 标准母版上传到私有 Cloudflare R2
6. 系统生成：
   - 512px moderation image
   - 1024px Focus/detail
   - 256px WOW thumbnail
   - 128px FOREVER thumbnail
7. 图片审核通过后才可公开

因此 20 MB 是“用户本地选择文件”的上限，不是最终存储文件大小。

### 明确错误提示

格式不支持：

**Use a JPG, PNG or WebP image.**

文件超过 20 MB：

**This image is too large. Choose an image under 20 MB.**

尺寸不足 512×512：

**This image is too small. Choose an image at least 512×512.**

无法解码：

**We couldn’t read this image. Try another file.**

上传失败：

**Upload failed. Try again.**

自动审核拒绝：

**This image can’t be used. Choose another image or continue without one.**

审核服务暂时失败：

**We couldn’t verify this image right now. Try again or continue with your class emblem.**

任何错误都不能让用户在不知道原因的情况下卡住。

---

## 11. 图片存储与审核产品规则

### 存储

固定使用：

**Cloudflare R2**

玩家图片默认私有。

未经审核的图片不允许公共访问。

### 审核

固定使用：

**Cloudflare Workers AI · @cf/cloudflare/clef-flash**

不使用 Google Cloud Vision。

不人工逐张预审。

不开发 Moderation Admin。

重点拦截：

- 色情 / 裸露
- 明显性内容
- 极端血腥 / 猎奇
- 仇恨 / 极端主义
- 违法或明显滥用内容
- 广告和垃圾宣传
- 二维码 / 明显站外导流
- 明显泄露个人敏感信息

正常 WoW 游戏战斗不能因为武器、技能、怪物或普通游戏战斗画面被机械拒绝。

只有 approved 图片可以公开。

---

## 12. 最终提交与锁定

用户在 HOLD TO INSCRIBE 之前可以修改草稿。

一旦最终 Inscription 成功：

**全部锁死。**

用户不能再自行修改：

- Seat
- Seat ID
- Vanguard Name
- Faction
- Class
- Memory Image
- Guild
- Battle Cry

如果图片审核没有通过，则不能把该图片带入成功 Inscription。

用户必须：

- 换图后重新审核
- 或明确选择使用职业 Default Emblem

违规、隐私、冒充或法律要求导致的平台隐藏 / 删除不属于“用户修改”。

---

## 13. 刻碑仪式

最终动作不是普通 Submit。

用户按住：

**HOLD TO INSCRIBE**

目标时长：

**3–5 秒**

过程：

1. 镜头进入目标 Seat
2. 环境与背景音乐短暂收束
3. 玩家图片 / Default Emblem 出现
4. Alliance / Horde 对应能量聚集
5. Memory Plate 形成
6. Vanguard Name 与 Seat ID 显现
7. 石刻 / 金属 / 能量短音效播放
8. 铭牌嵌入目标位置
9. 目标 Seat 点亮
10. 镜头快速拉远
11. 用户明确看到“我就是 Monument 中的这一点”

低性能设备允许减少粒子，但不能破坏核心仪式。

---

## 14. 音乐与音效

### 背景音乐

背景音乐由项目方提供原创音乐。

页面右上角固定存在一个克制的 Music Toggle。

功能：

- Music On
- Music Off

只控制背景音乐。

浏览器不允许无交互自动播放时，不弹错误；在用户首次有效操作后开始播放。

### 点亮 / 刻碑音效

刻碑、点亮、石刻、金属、能量等 SFX 属于交互反馈。

它们不跟随背景 Music Toggle 一起关闭。

在浏览器允许音频播放以后，SFX 正常播放。

不使用 WoW 官方 OST 或未经授权音频。

---

## 15. 用户完整流程

1. 进入活动页
2. 直接看到当前阶段 Monument 与已占 Seat 数
3. 点击 ENTER THE MONUMENT
4. 使用鼠标、触控或可选手势浏览
5. 选择空 Seat
6. 填写 Vanguard Name / Faction / Class
7. 可选填写 Guild / Battle Cry
8. 可选选择 Memory Image 并裁切
9. 最后正式占位前要求 Google 登录
10. 创建短时 Seat Hold
11. 图片上传和自动审核
12. 图片不合格则换图或使用 Default Emblem
13. HOLD TO INSCRIBE
14. 数据库事务完成正式占位
15. 3–5 秒刻碑动画
16. Reveal
17. 生成 Vanguard Seal
18. 用户保存 / 分享 / Stand Beside Me
19. 展示与所选 Class 对应的 WoW Forever Tier List CTA
20. 用户之后可以随时回到自己的 Seat，但不能修改

---

## 16. 提交成功以后用户得到什么

Claim 成功并完成动画以后，Claim 流程结束，但页面体验不立即结束。

Reveal 页面需要提供三个明确方向：

### 1. 保存纪念

**Vanguard Seal**

### 2. 邀请朋友

**STAND BESIDE ME**

### 3. 进入核心业务

**See how {Class} is performing in WoW Forever**

用户仍可以继续浏览 Monument。

---

## 17. Vanguard Seal

Vanguard Seal 是可保存、可分享的身份纪念卡，不是普通成功弹窗。

必须包含：

- 玩家审核通过的 Memory Image，或 Default Emblem
- Vanguard Name
- Seat ID
- Faction
- Class
- 可选 Guild
- Monument 定位缩略图
- Inscribed 日期
- Stand Beside Me QR / Share Link
- Unofficial Community Tribute 小字

Battle Cry：

- 9:16 收藏版可以显示
- 1:1 分享版可省略，避免信息过载

输出：

- 9:16
- 1:1

二维码必须直接定位本人 Seat，不回活动首页。

---

## 18. Tier List 联动

Vanguard 页面不是孤立活动。

活动页：

/wow-forever/vanguard

核心业务页：

/wow-forever/tier-list

### 最重要导流位置：Reveal

用户刚刚选择过 Class，因此 Reveal 中展示：

**See how {Class} is performing in WoW Forever**

链接：

/wow-forever/tier-list?class={Class}

### Focus 其他玩家

查看其他玩家 Seat 时，详情底部可出现低优先级职业 CTA：

**View {Class} Tier List**

### 活动结束以后

SEALED / Archive 状态继续保留 WoW Forever Tier List 入口。

不在首屏强推 Tier List。

不增加额外投票、竞猜或第二套排行榜，避免稀释纪念活动。

---

## 19. Stand Beside Me

用户 Seal 和 Reveal 中的核心传播 CTA：

**STAND BESIDE ME**

朋友打开分享链接后：

1. 页面进入 Monument
2. 自动飞到邀请人的 Seat
3. 显示该 Seat 的 Focus
4. 如果活动仍开放，则附近可用 Seat 被轻量高亮
5. 如果活动已经 SEALED，则只展示邀请人内容，不再出现 Claim CTA

---

## 20. 举报

每个公开玩家 Focus 详情底部提供低干扰的：

**Report**

点击后选择固定原因：

- Sexual / Graphic Content
- Hate / Harassment / Impersonation
- Privacy
- Spam / Promotion
- Other

不提供大段自由文本。

提交后：

1. 写入数据库
2. 给运营支持邮箱发送一封通知
3. 邮件包含 Seat ID、举报原因、公开 Seat 链接、时间
4. 单次举报不会自动隐藏内容，防止恶意举报
5. 如确认违规，运营可以通过数据库 / 现有运维工具把内容标记为 hidden
6. 不开发 Vanguard Admin Dashboard

内容被 hidden 后：

- Seat 永久保留
- Seat ID 永久保留
- 不重新开放给其他用户
- 玩家公开内容被替换为中性不可用状态

---

## 21. 交互

### 手势

- 握拳：聚合回 Monument
- 张开手掌：进入 Scatter
- 捏合 / 抓取：Focus 单个 Seat

### 鼠标

- 拖拽
- 平移
- 滚轮缩放
- 点击 Focus

### 手机

- 点击
- 双指缩放
- 移动
- Focus

摄像头是增强体验，不是参与门槛。

拒绝 Camera Permission 后必须完整支持浏览、Claim、刻碑和分享。

---

## 22. 异常与边界状态

### Seat 刚被别人抢走

**This place was just claimed. Choose another nearby seat.**

自动推荐邻近空位。

### 同一账户已有 Seat

**You already have a place in the Monument.**

CTA：

**VIEW MY SEAT**

### WOW 已满但 FOREVER 未开放

禁止新的 WOW Claim。

展示：

**WOW IS COMPLETE**

以及：

**FOREVER AWAKENS IN …**

### FOREVER 已开放

所有七个 FOREVER 字母同时可参与。

### 全部 64,128 满席

立即禁止新增 Claim。

展示：

**THE MONUMENT IS COMPLETE**

### 活动时间截止

无论是否满席：

**THE MONUMENT IS SEALED**

### 登录失败

Claim 草稿与当前 Seat Hold 尽可能保留。

不得让用户重新填写全部内容。

### 网络失败

明确提供 Retry。

---

## 23. 法律与品牌边界

活动页保留：

**8016 Vanguard Monument is an unofficial community tribute and is not affiliated with, endorsed by, or sponsored by Blizzard Entertainment.**

上传区域增加：

**By uploading an image, you confirm that you have the right to use it and understand that it will be automatically screened before public display.**

不新建 Vanguard 独立 Privacy Policy / Terms。

TierListBase 现有全站 Privacy / Terms / Acceptable Use / Account Deletion 必须在 Vanguard 上线前更新，以覆盖：

- Google Account 登录
- 玩家账户数据
- UGC 图片与文字
- Cloudflare R2
- Workers AI 自动审核
- UGC 展示许可
- 隐藏 / 删除
- 账户删除

---

## 24. 非目标

V1 不做：

- 独立 Vanguard Admin
- 独立 CMS
- 人工逐图审核后台
- Email Magic Link
- Password Login
- NFT
- 付费 Seat
- 高级编号
- 复杂任务 / 积分
- WebSocket
- 公会战争
- 额外社区投票系统
- 第二套 Tier List
- 第二套账户系统
- 第二套网站 Header / Footer

---

## 25. 关键指标

真实用户指标必须与 system_fill 分开。

核心指标：

- Page Visit
- Enter Monument
- Focus
- Claim Start
- Claim Complete
- Real User Seats
- System Fill Seats
- Seal Save
- Share
- Stand Beside Me Open
- Invite → Claim
- Tier List Click
- WOW Completion Time
- FOREVER Unlock Time
- Total Occupied Seats

不得把 system_fill 计入真实参与人数。

---

## 26. 仍需设计提供的资产

产品规则已冻结，但以下美术资产仍需制作：

1. WOW Monument 主视觉
2. FOREVER 展开后的整体主视觉
3. WOW / FOREVER 中景
4. Focus 状态
5. Memory Plate 分层母版
6. 9 个原创职业 Default Emblem
7. 3–5 秒 Inscription Ritual 关键帧
8. Vanguard Seal 9:16
9. Vanguard Seal 1:1
10. 原创背景音乐
11. 刻碑 / 点亮短音效

---

## 27. 产品验收标准

必须满足：

- 用户 10 秒内理解这是限时纪念活动
- WOW 阶段总容量准确为 8,016
- FOREVER 阶段总容量准确为 56,112
- 总容量准确为 64,128
- WOW 未满时 FOREVER 完全不可见、不可占位
- WOW 满后 24 小时自动进入 FOREVER
- 活动截止严格固定为 2026-11-04 23:00 UTC
- 截止后所有已完成 Seat 仍可永久浏览
- 一账户全局只能有一个 Seat
- 只有一个公开 Seat ID
- Inscription 成功后用户资料全部锁死
- 上传规则在 UI 中明确显示
- 所有上传失败与审核失败都有明确提示
- 未审核图片绝不公开
- Google 是 V1 唯一登录方式
- 背景音乐有右上角开关
- 点亮 / 刻碑音效正常播放
- 拒绝摄像头不阻塞完整流程
- Vanguard Seal 可保存和分享
- Stand Beside Me 能正确定位本人 Seat
- Reveal 能按 Class 导流现有 WoW Forever Tier List
- 不新增 Admin / CMS / 第二套账户或网站框架

---

## 28. 冻结结论

本版本中的核心产品规则可以作为开发基线。

不再待确认：

- 总容量
- WOW / FOREVER 两阶段关系
- WOW → FOREVER 解锁方式
- 活动截止时间
- Google Only
- 一账户一席
- 提交后锁死
- Seat ID 规则
- R2 图片存储
- Workers AI 自动审核
- 上传规格
- 音乐开关
- 举报最小闭环
- Tier List 导流

后续开发不得在没有新产品决策的情况下自行扩展额外功能。
