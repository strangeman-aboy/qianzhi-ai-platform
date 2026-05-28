const seedAgents = [
    {
        id: 'legal-sg-001',
        name: '新加坡跨境电商合规 Agent',
        owner: '林女士 · 独立法律顾问',
        category: 'legal',
        price: 50,
        stake: 12000,
        reputation: 96,
        successRate: 98,
        tasks: 286,
        escrowLimit: 500,
        verification: 'TEE',
        summary: '专注新加坡跨境电商、标签合规、消费者保护和平台政策审查。',
        tags: ['标签合规', '跨境电商', '法律审查']
    },
    {
        id: 'design-pack-002',
        name: '包装设计审核 Agent',
        owner: 'Moss Studio · 设计团队',
        category: 'design',
        price: 18,
        stake: 6800,
        reputation: 91,
        successRate: 95,
        tasks: 412,
        escrowLimit: 240,
        verification: 'Optimistic',
        summary: '检查包装版式、视觉风险、平台主图规范和海外市场本地化问题。',
        tags: ['包装审核', '品牌规范', '出海设计']
    },
    {
        id: 'code-review-003',
        name: 'SaaS 代码审查 Agent',
        owner: 'Byte Harbor · 全栈工程师',
        category: 'code',
        price: 65,
        stake: 18000,
        reputation: 94,
        successRate: 97,
        tasks: 198,
        escrowLimit: 800,
        verification: 'TEE',
        summary: '为中小团队做 PR 审查、接口风险评估、性能问题定位和修复建议。',
        tags: ['代码审查', '安全风险', '性能优化']
    },
    {
        id: 'edu-math-004',
        name: '高中数学个性化辅导 Agent',
        owner: '陈老师 · 教育创作者',
        category: 'education',
        price: 12,
        stake: 3500,
        reputation: 88,
        successRate: 93,
        tasks: 734,
        escrowLimit: 120,
        verification: 'Optimistic',
        summary: '根据错题和学习目标生成讲解、练习路径与阶段性测评。',
        tags: ['个性化辅导', '错题分析', '学习路径']
    },
    {
        id: 'growth-005',
        name: '小红书投放复盘 Agent',
        owner: 'North Loop · 增长顾问',
        category: 'ops',
        price: 35,
        stake: 7600,
        reputation: 90,
        successRate: 94,
        tasks: 327,
        escrowLimit: 300,
        verification: 'Optimistic',
        summary: '分析投放素材、达人表现和转化数据，输出下一轮内容策略。',
        tags: ['增长复盘', '内容策略', '投放优化']
    },
    {
        id: 'trans-local-006',
        name: '东南亚本地化翻译 Agent',
        owner: 'SeaLang Lab · 本地化团队',
        category: 'translation',
        price: 15,
        stake: 5200,
        reputation: 93,
        successRate: 96,
        tasks: 589,
        escrowLimit: 180,
        verification: 'Optimistic',
        summary: '覆盖英语、马来语、印尼语和泰语，适合电商页面与客服话术本地化。',
        tags: ['多语言', '电商本地化', '客服话术']
    },
    {
        id: 'medical-copy-007',
        name: '医疗科普合规审核 Agent',
        owner: 'Dr. Wei · 医疗内容顾问',
        category: 'legal',
        price: 42,
        stake: 15000,
        reputation: 92,
        successRate: 95,
        tasks: 154,
        escrowLimit: 620,
        verification: 'TEE',
        summary: '审核医疗健康内容中的夸大宣传、禁用词和责任边界。',
        tags: ['医疗科普', '广告合规', '风险提示']
    },
    {
        id: 'ux-audit-008',
        name: 'B2B 产品 UX 审核 Agent',
        owner: 'Flowline · 产品设计师',
        category: 'design',
        price: 28,
        stake: 6100,
        reputation: 89,
        successRate: 92,
        tasks: 221,
        escrowLimit: 260,
        verification: 'Optimistic',
        summary: '为后台、SaaS、CRM 等工作型产品做信息架构和交互可用性评估。',
        tags: ['SaaS UX', '信息架构', '可用性']
    }
];

const categoryLabels = {
    all: '全部',
    legal: '法律合规',
    design: '设计审核',
    code: '编程辅助',
    education: '教育辅导',
    ops: '运营增长',
    translation: '翻译本地化'
};

const appConfig = {
    apiBase: '',
    apiMode: 'auto',
    environmentName: 'local',
    ...(window.QIANZHI_CONFIG || {})
};

const statusLabels = {
    ACCEPTED: '验收通过',
    DRAFT: '草稿',
    MATCHED: '方案生成',
    FUNDED: '资金托管',
    IN_PROGRESS: '执行中',
    SUBMITTED: '待验收',
    DISPUTED: '争议中',
    SETTLED: '已结算',
    REFUNDED: '已退款',
    CANCELLED: '已取消'
};

const statusProgress = {
    DRAFT: 8,
    MATCHED: 18,
    FUNDED: 38,
    IN_PROGRESS: 62,
    SUBMITTED: 82,
    DISPUTED: 72,
    SETTLED: 100,
    REFUNDED: 100,
    CANCELLED: 100
};

const actorLabels = {
    user: '用户',
    agent: 'Agent 创作者',
    arbitrator: '仲裁员',
    platform: '平台系统'
};

const actorHints = {
    user: '可发布任务、托管预算、验收、争议和托管前取消',
    agent: '可注册 Agent、接单执行和提交交付物',
    arbitrator: '可处理争议并给出结算或退款结论',
    platform: '可模拟挑战窗口到期后的自动结算'
};

const actionActors = {
    fund: 'user',
    cancel: 'user',
    start: 'agent',
    submit: 'agent',
    accept: 'user',
    dispute: 'user',
    'resolve-agent': 'arbitrator',
    'resolve-user': 'arbitrator',
    'auto-settle': 'platform'
};

const taskActionMap = {
    MATCHED: [
        { action: 'fund', label: '确认并托管', style: 'primary' },
        { action: 'cancel', label: '取消任务', style: 'secondary' }
    ],
    FUNDED: [
        { action: 'start', label: 'Agent 接单执行', style: 'primary' }
    ],
    IN_PROGRESS: [
        { action: 'submit', label: '提交交付物', style: 'primary' }
    ],
    SUBMITTED: [
        { action: 'accept', label: '验收并结算', style: 'primary' },
        { action: 'dispute', label: '发起争议', style: 'secondary' },
        { action: 'auto-settle', label: '窗口结束自动结算', style: 'secondary' }
    ],
    DISPUTED: [
        { action: 'resolve-agent', label: '仲裁支持 Agent', style: 'primary' },
        { action: 'resolve-user', label: '仲裁支持用户', style: 'secondary' }
    ]
};

const pageIds = ['home', 'market', 'agent-detail', 'tasks', 'task-detail', 'arbitration', 'earnings', 'updates', 'security', 'creators'];
const agentDetailHashPrefix = 'agent-';
const taskDetailHashPrefix = 'task-';

const changeLogEntries = [
    {
        date: '2026-05-29',
        type: '产品定位',
        title: '首屏补充专业 Agent 与低门槛使用',
        summary: '首页首屏明确创作者把能解决垂直复杂问题的专业 Agent 带到市场，用户只需要描述任务和验收结果，平台负责匹配、托管、证据和结算。',
        impact: '平台定位从“展示 Agent”进一步收紧到“让普通人低门槛使用专业 AI 能力，并按结果付费”。'
    },
    {
        date: '2026-05-29',
        type: '交易安全',
        title: '挑战窗口未结束时阻止自动结算',
        summary: '前端会根据提交时间和挑战窗口判断自动结算是否可用；窗口未结束时不会把自动结算作为平台待处理动作展示，本地状态机也会拒绝提前结算。',
        impact: '演示逻辑和后端状态机规则保持一致，避免用户误以为平台可以绕过争议保护直接放款。'
    },
    {
        date: '2026-05-28',
        type: '后端对接',
        title: 'API 合约检查加入状态机负向测试',
        summary: '合约检查器会对进行中的任务发起缺少 signature、错身份签名、签名动作/任务不匹配、缺争议证据、提前自动结算和缺仲裁依据的负向请求。',
        impact: '拿到真实后端地址后，不只检查字段是否齐全，也能提前发现状态机是否会绕过签名、操作者身份、证据要求、挑战窗口或仲裁理由直接推进交易。'
    },
    {
        date: '2026-05-28',
        type: '创作者准入',
        title: 'Agent 入驻加入创作者声明',
        summary: '创作者注册 Agent 前必须确认所有权、平台非托管和按结果结算，未确认时前端和 mock API 都会拒绝入驻，合约检查器也会验证缺失或不完整声明。',
        impact: '供给侧边界更清楚：Agent 属于创作者，平台不生产也不接管 Agent，只登记可交易元数据并保障任务交易。'
    },
    {
        date: '2026-05-28',
        type: '视觉体验',
        title: '首页无订阅定位明确',
        summary: '首页主文案和关键指标补充“0 月费 / 无订阅捆绑”，把用户按任务结果付费和平台透明协议费区分开。',
        impact: '用户第一屏就能理解乾智不是订阅制 AI 平台，而是每笔任务按结果验收、托管和结算的交易市场。'
    },
    {
        date: '2026-05-28',
        type: '视觉体验',
        title: '首页资金流转补足',
        summary: '左侧新增资金托管、结果放款和争议冻结说明，右侧新增下单前校验摘要，并把预算拆分与任务托管单联动。',
        impact: '首页底部不再留下无意义空白，也不是靠拉高角色卡片填充，而是用交易安全信息解释平台为什么值得信任。'
    },
    {
        date: '2026-05-27',
        type: '后端对接',
        title: '容量风控来源优先级明确',
        summary: '前端会优先使用后端返回的 lockedCapacity 和 availableEscrowLimit；后端未提供时才根据当前任务列表本地推算。',
        impact: '真实后端接入后，Agent 可承接额度以服务端实时风控为准，避免前端只拿到部分任务时低估或高估容量。'
    },
    {
        date: '2026-05-27',
        type: '交易风控',
        title: 'Agent 活跃容量占用加入',
        summary: 'Agent 市场、托管预览和本地 mock API 会按未完成任务占用后的剩余可承接额度判断是否还能接新任务。',
        impact: '同一个 Agent 不会因为静态承接上限足够就被反复过度匹配，交易安全更接近真实平台的容量锁定逻辑。'
    },
    {
        date: '2026-05-27',
        type: '交易准入',
        title: '手选执行方案硬校验加入',
        summary: '用户手动选择 Agent 后，发布任务前会硬校验所有权、剩余可承接额度和总质押覆盖，不满足时不会生成托管方案。',
        impact: 'Agent 市场的选择动作和任务托管的提交动作形成闭环，避免用户把风险不足的手选组合提交给托管状态机。'
    },
    {
        date: '2026-05-27',
        type: '视觉体验',
        title: '浅色模式选中态高对比收口',
        summary: '浅色模式统一修正主按钮、角色切换、筛选按钮、任务状态筛选和导航高亮的选中/点击态，并处理浅色底色规则覆盖 active 样式的问题。',
        impact: '用户切换浅色风格后，选中的筛选项和身份按钮会有明确高对比状态，点击后不会出现文字发白、状态不明显或看起来没选中的情况。'
    },
    {
        date: '2026-05-27',
        type: 'Agent 市场',
        title: 'Agent 卡片适配检查加入',
        summary: 'Agent 卡片新增当前任务适配检查，逐项显示类型、所有权、剩余可承接额度和质押覆盖是否通过。',
        impact: '用户不需要只依赖筛选结果，可以直接理解每个 Agent 为什么适合或不适合当前托管任务。'
    },
    {
        date: '2026-05-27',
        type: 'Agent 市场',
        title: '适配当前任务筛选加入',
        summary: 'Agent 市场新增“适配当前任务”筛选，会同时检查任务类型、当前预算、所有权校验、剩余可承接额度和质押覆盖。',
        impact: '用户可以一键看到真正适合进入当前托管方案的 Agent，把交易准入从多个分散条件收敛成明确的下单前筛选。'
    },
    {
        date: '2026-05-27',
        type: 'Agent 市场',
        title: '按当前预算筛选 Agent',
        summary: 'Agent 市场新增“可承接当前预算”筛选，会读取首页任务预算，只展示剩余可承接额度足够的 Agent。',
        impact: '用户在生成托管方案前就能排除承接能力不足的 Agent，降低预算超过 Agent 上限导致交易失败的概率。'
    },
    {
        date: '2026-05-27',
        type: 'Agent 市场',
        title: 'Agent 所有权筛选加入',
        summary: 'Agent 市场新增所有权状态筛选，用户可以按全部、已校验和待复核查看供给，筛选结果会同步影响可信供给池概览。',
        impact: '用户在选择执行方案前能更快排除不可托管供给，也更清楚平台把 Agent 所有权作为交易准入门槛。'
    },
    {
        date: '2026-05-27',
        type: 'Agent 市场',
        title: 'Agent 市场安全概览加入',
        summary: 'Agent 市场新增可信供给池概览，汇总当前筛选结果里的所有权校验数量、总质押、剩余可承接额度、平均声誉和已选执行方案容量。',
        impact: '用户在挑选 Agent 前能先看到供给池是否足够可信，平台的安全边界从任务详情前移到 Agent 选择阶段。'
    },
    {
        date: '2026-05-27',
        type: '任务工作台',
        title: '当前身份待处理队列加入',
        summary: '任务托管页新增当前身份行动队列，会按用户、Agent 创作者、仲裁员或平台身份聚合需要处理的交易，并可直接进入交易档案。',
        impact: '用户进入任务页后能先看到“现在轮到我做什么”，比只看列表和筛选更接近真实交易平台的工作台体验。'
    },
    {
        date: '2026-05-27',
        type: '信息架构',
        title: '首页角色入口加入',
        summary: '首页新增用户下任务、选择 Agent、创作者经营和交易保障四条入口，并在点击时同步切换体验身份和目标页面。',
        impact: '新用户先按身份选择路径，再进入对应工作台，避免页面到了创作者或平台视角但身份仍停留在用户视角。'
    },
    {
        date: '2026-05-27',
        type: '创作者资产',
        title: 'Agent 资产档案页加入',
        summary: 'Agent 详情从市场弹窗升级为可直达的资产档案页，支持通过 Agent 编号 hash 查看所有权、服务边界、经济参数、容量和任务履历。',
        impact: '创作者拥有 Agent 的平台定位更清楚，用户也能在下单前像查看资产一样核对 Agent 的可信度、收入表现和风险边界。'
    },
    {
        date: '2026-05-27',
        type: '信息架构',
        title: '任务交易档案页加入',
        summary: '任务详情从单纯弹窗升级为可直达的页面式交易档案，支持通过任务编号 hash 进入同一笔交易上下文。',
        impact: '任务托管列表负责筛选和浏览，任务交易档案负责承载契约、证据、资金、结算和审计链，复杂交易不会挤在列表或弹窗里。'
    },
    {
        date: '2026-05-27',
        type: '交易追踪',
        title: '任务契约指纹加入',
        summary: '结果契约卡、托管确认、接单承诺、验收放款和结算/退款凭证统一展示同一个任务契约指纹。',
        impact: '用户、Agent 创作者和仲裁员可以用同一串编号追溯本次交易的验收标准、预算、挑战窗口和执行 Agent，减少前端展示和结算口径不一致。'
    },
    {
        date: '2026-05-27',
        type: '验收结算',
        title: '用户验收放款确认加入',
        summary: '用户点击验收并结算时会先确认交付物满足契约、证据已核对、放弃争议并释放托管资金。',
        impact: '托管资金释放从“一键结算”升级为“带验收确认凭证的放款动作”，补齐按结果付费交易的最后一段安全链路。'
    },
    {
        date: '2026-05-27',
        type: '创作者责任',
        title: 'Agent 接单承诺清单加入',
        summary: 'Agent 创作者点击接单执行时会先确认服务边界、结果契约、交付证据和声誉风险，再进入执行中状态。',
        impact: '接单动作从“直接开始”升级为“带承诺凭证的执行责任确认”，强化个人拥有 Agent、平台只记录交易责任的产品边界。'
    },
    {
        date: '2026-05-27',
        type: '托管安全',
        title: '预算托管确认清单加入',
        summary: '用户点击确认并托管时会先进入确认清单，逐项确认结果契约、Agent 所有权、费用拆分和平台边界后再托管预算。',
        impact: '按结果付费从“按钮推进状态”升级为“带确认凭证的交易动作”，减少用户误解为订阅平台服务或平台直接售卖 Agent。'
    },
    {
        date: '2026-05-27',
        type: '按结果付费',
        title: '结果契约卡加入',
        summary: '任务发布预览、任务卡片和交易详情统一展示验收标准、挑战窗口、放款条件、争议条件和平台边界。',
        impact: '用户下单前能看清“结果达标才放款”，创作者也能看到自己承接的是结果契约，平台定位更明确地回到托管、证据和结算安全。'
    },
    {
        date: '2026-05-27',
        type: '争议仲裁',
        title: '仲裁裁决理由表单加入',
        summary: '仲裁员处理争议时需要先填写裁决理由和证据核对说明，再执行支持 Agent 或支持用户的结算/退款动作。',
        impact: '争议处理从“点按钮裁决”升级为“带理由和证据核对的裁决凭证”，交易安全链路更接近真实平台。'
    },
    {
        date: '2026-05-27',
        type: '创作者准入',
        title: 'Agent 入驻预检加入',
        summary: '创作者入驻表单新增实时预检，提交前展示所有权证明类型、服务边界完整度、质押覆盖、承接上限和是否可进入可信匹配池。',
        impact: '创作者能在注册前理解平台交易准入规则，强化“个人拥有 Agent、平台只做安全交易层”的供给侧边界。'
    },
    {
        date: '2026-05-27',
        type: 'Agent 市场',
        title: 'Agent 执行方案栏加入',
        summary: 'Agent 市场新增执行方案栏，用户在市场页可直接把已校验 Agent 加入方案，并查看剩余可承接额度、质押覆盖和所有权状态。',
        impact: 'Agent 市场从浏览列表升级为交易入口，个人拥有的 Agent 可以被用户选择进托管任务，平台在选择阶段就提示交易安全边界。'
    },
    {
        date: '2026-05-27',
        type: '任务工作台',
        title: '任务托管页状态筛选加入',
        summary: '任务托管页新增交易概览和状态筛选，可按全部、当前身份待处理、进行中、待验收、争议中和已完成查看任务。',
        impact: '任务托管页更像独立工作台，用户、创作者、仲裁员进入后能直接定位自己该处理的交易，减少在长列表里寻找状态。'
    },
    {
        date: '2026-05-27',
        type: '信息架构',
        title: '长页面改为页面式视图',
        summary: '保留单个前端工程，但把首页、Agent 市场、任务托管、仲裁、收益、日志、交易保障和创作者入口切成独立视图。',
        impact: '差异大的操作不再全部堆在一个长滚动页面里，更符合用户按角色和任务进入功能页的习惯，也降低手机端迷路感。'
    },
    {
        date: '2026-05-27',
        type: '交易安全',
        title: '交易安全总览加入',
        summary: '交易保障区新增动态安全总览，从 Agent 所有权、托管资金、验收契约、交付证据、审计链和争议队列汇总当前平台状态。',
        impact: '平台定位从“说明自己保障交易”推进到“用当前交易数据证明保障覆盖”，更适合对外解释按结果付费为什么可信。'
    },
    {
        date: '2026-05-27',
        type: '准入风控',
        title: '已校验 Agent 才能进入托管方案',
        summary: '任务自动推荐、手动选择和 mock API 创建任务都加入所有权准入门槛，未通过所有权校验的 Agent 不能进入托管执行方案。',
        impact: '平台把“个人拥有自己的 Agent”从展示信息变成交易前硬约束，降低冒名 Agent 接单和资金纠纷风险。'
    },
    {
        date: '2026-05-27',
        type: '资金安全',
        title: '托管资金流水加入',
        summary: '任务交易档案新增资金流水，mock API 会记录用户托管、平台协议费、创作者分账和用户退款等资金事件，并返回演示交易编号。',
        impact: '用户和创作者能看到钱在平台里的关键流向，平台不只是展示状态，而是提供可审计的资金动作记录。'
    },
    {
        date: '2026-05-27',
        type: '所有权安全',
        title: 'Agent 所有权复核接入',
        summary: 'Agent 所有权证明从自动展示升级为可审核流程，平台身份可对待人工复核的 Agent 执行通过或拒绝，并保留审核签名。',
        impact: '更贴近“个人拥有自己的 Agent、平台不接管 Agent”的定位，用户选择 Agent 时能看到所有权是否经过平台复核。'
    },
    {
        date: '2026-05-27',
        type: '争议仲裁',
        title: '用户争议证据提交台加入',
        summary: '用户发起争议前需要填写争议理由和证据引用，前端为证据生成演示哈希，并把争议材料提交给状态机和仲裁中心。',
        impact: '按结果付费交易的反向保护更完整：用户不是只点一个争议按钮，而是留下可被仲裁员复核的契约、交付和争议证据。'
    },
    {
        date: '2026-05-27',
        type: '出账安全',
        title: '提现审核接入 mock API',
        summary: '创作者提现从前端内存队列升级为 mock API 持久化流程，后端会校验可提现余额、锁定审核中金额，并保存创作者申请和平台审核签名。',
        impact: '平台闭环更接近真实交易：Agent 替创作者赚钱后，收益出账也有余额校验、审核状态和可追踪凭证。'
    },
    {
        date: '2026-05-27',
        type: '交付验收',
        title: 'Agent 交付证据提交台加入',
        summary: 'Agent 提交交付物前需要填写交付摘要和证据引用，前端会为每条证据生成演示哈希，并把证据包随状态流转提交给 mock API。',
        impact: '交易从“一键提交”变成“带证据提交”，用户、创作者和仲裁员能围绕同一份交付材料验收、争议和裁决。'
    },
    {
        date: '2026-05-27',
        type: '托管体验',
        title: '任务托管方案预览加入',
        summary: '任务发布表单新增实时托管预览，展示预算、协议费、创作者池、验证方式、推荐或手选 Agent、剩余可承接额度、质押覆盖和风控检查。',
        impact: '用户在生成任务前就能看清钱如何托管、Agent 是否覆盖风险，减少按结果付费交易里的不确定感。'
    },
    {
        date: '2026-05-27',
        type: '结算出账',
        title: '创作者提现审核队列加入',
        summary: '创作者经营台新增提现请求入口，创作者可对可提现余额发起签名提现，平台身份可审核批准或拒绝，金额会从可提现池锁定。',
        impact: '把“Agent 替创作者赚钱”从静态收益数字推进到出账前审核流程，强调平台负责结算安全和争议风险核对。'
    },
    {
        date: '2026-05-27',
        type: '供给侧资产',
        title: 'Agent 资产档案升级',
        summary: 'Agent 详情从基础介绍升级为资产档案，展示所有权、服务边界、经济参数、已结算收入、待结算收入、争议中收入、承接容量和任务履历。',
        impact: '更突出“创作者拥有 Agent，Agent 替创作者接任务赚钱”的平台定位，也让用户选择 Agent 时能看到能力、风险和收益履历。'
    },
    {
        date: '2026-05-27',
        type: '交易体验',
        title: '任务详情交易档案加入',
        summary: '任务卡片和仲裁中心新增查看详情入口，集中展示验收契约、执行 Agent、托管分账、风控、证据包、签名凭证、结算凭证和审计链。',
        impact: '用户、创作者和仲裁员可以从同一个交易档案判断任务是否可验收、是否可争议以及责任链是否清楚，减少卡片信息过载。'
    },
    {
        date: '2026-05-27',
        type: '交易安全',
        title: '关键操作签名审计加入',
        summary: '托管、取消、接单、提交、验收、争议、仲裁和自动结算都会生成操作签名凭证，mock API 会校验角色、动作和任务编号是否匹配。',
        impact: '交易状态推进不再只依赖前端传入角色，审计链也能展示关键动作的签名编号，为后续接入钱包签名或 DID 校验预留接口。'
    },
    {
        date: '2026-05-27',
        type: '视觉体验',
        title: '顶部导航轻量化',
        summary: '顶部栏拆成品牌、导航和操作三区，导航改为轻量文字与细下划线高亮，右侧身份、主题和钱包操作收紧，并修复浅色模式下部分浅色文字不清楚的问题。',
        impact: '缓解顶部标题和导航文字拥挤的问题，保留点击跳转和滚动高亮，同时更贴近浅色简约的年轻化产品风格。'
    },
    {
        date: '2026-05-27',
        type: '创作者经营',
        title: '创作者经营台加入',
        summary: '新增创作者经营台，按创作者汇总 Agent 资产、已结算收益、待结算收入、质押规模、争议风险和可提现余额。',
        impact: '创作者能看到自己拥有的 Agent 如何接任务赚钱，平台角色也更明确为交易和结算基础设施。'
    },
    {
        date: '2026-05-27',
        type: '争议仲裁',
        title: '仲裁中心加入',
        summary: '新增独立仲裁中心，集中展示争议任务的验收契约、交付证据、用户争议证据、托管金额和裁决入口。',
        impact: '争议处理从任务卡片里的按钮升级为可复核的工作台，更贴近真实交易安全流程。'
    },
    {
        date: '2026-05-27',
        type: '风控规则',
        title: '托管前风险检查加入',
        summary: '任务卡片展示 Agent 可用承接额度、质押覆盖、所有权证明、验收契约和证据状态，后端拒绝超过匹配 Agent 承接能力的任务。',
        impact: '平台开始把“交易安全”落到可见规则和硬校验上，而不是只靠页面说明。'
    },
    {
        date: '2026-05-27',
        type: '交易安全',
        title: '任务审计链前台化',
        summary: '任务卡片展示完整状态历史，每条记录包含操作角色、时间、资金/证据/结算摘要和审计编号。',
        impact: '用户、创作者和仲裁员能更快判断一笔交易的钱、证据和责任链是否清楚。'
    },
    {
        date: '2026-05-27',
        type: '产品定位',
        title: '从 AI 商品页转为 Agent 任务交易平台',
        summary: '首页、任务入口、Agent 市场和创作者表达都围绕“用户按结果付费、创作者拥有 Agent 并接任务赚钱”重新组织。',
        impact: '影响首屏主张、信息架构、交易叙事和后续后端接口边界。'
    },
    {
        date: '2026-05-27',
        type: '交易流程',
        title: '托管状态机和角色权限落地',
        summary: '任务可从匹配、托管、执行、提交、验收、争议走到结算或退款，并按用户、创作者、仲裁、平台身份控制操作。',
        impact: '影响任务卡片、mock API 状态校验和真实后端交接。'
    },
    {
        date: '2026-05-27',
        type: '结算透明',
        title: '证据包、挑战窗口和收益台账加入',
        summary: '交付和争议会留下证据引用，挑战窗口结束可由平台自动结算，创作者收益按 Agent 汇总展示。',
        impact: '影响结算凭证、声誉回写、创作者收益展示和争议处理路径。'
    },
    {
        date: '2026-05-27',
        type: '交接文档',
        title: '前后端边界与真实后端清单补齐',
        summary: '补齐 API 契约、数据模型、交易安全说明、前后端边界和后端索要资料清单。',
        impact: '后续只要拿到真实 API Base URL、鉴权和字段映射，就能替换 mock 服务。'
    }
];

const state = {
    apiAvailable: false,
    apiHealth: null,
    backendReadiness: null,
    apiError: '',
    activePage: 'home',
    activeAgentId: '',
    activeTaskId: '',
    taskFilter: 'all',
    actor: 'user',
    filter: 'all',
    ownershipFilter: 'all',
    capacityFilter: 'all',
    fitFilter: 'all',
    sort: 'reputation',
    query: '',
    connected: false,
    walletAddress: '',
    selectedAgents: [],
    agents: [...seedAgents],
    tasks: getFallbackTasks(),
    creatorLedger: null,
    withdrawals: []
};

const elements = {
    appMain: document.getElementById('appMain'),
    siteHeader: document.getElementById('siteHeader'),
    navMenu: document.getElementById('navMenu'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    environmentBanner: document.getElementById('environmentBanner'),
    walletBtn: document.getElementById('walletBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    roleSwitch: document.getElementById('roleSwitch'),
    actorIndicator: document.getElementById('actorIndicator'),
    publishTaskBtn: document.getElementById('publishTaskBtn'),
    taskForm: document.getElementById('taskForm'),
    taskDescription: document.getElementById('taskDescription'),
    taskAcceptanceCriteria: document.getElementById('taskAcceptanceCriteria'),
    taskCategory: document.getElementById('taskCategory'),
    taskBudget: document.getElementById('taskBudget'),
    taskVerification: document.getElementById('taskVerification'),
    taskChallengeWindow: document.getElementById('taskChallengeWindow'),
    composerPreview: document.getElementById('composerPreview'),
    homeEscrowFlow: document.getElementById('homeEscrowFlow'),
    agentForm: document.getElementById('agentForm'),
    agentName: document.getElementById('agentName'),
    agentOwner: document.getElementById('agentOwner'),
    agentOwnershipProof: document.getElementById('agentOwnershipProof'),
    agentCategory: document.getElementById('agentCategory'),
    agentVerification: document.getElementById('agentVerification'),
    agentPrice: document.getElementById('agentPrice'),
    agentStake: document.getElementById('agentStake'),
    agentEscrowLimit: document.getElementById('agentEscrowLimit'),
    agentSummary: document.getElementById('agentSummary'),
    agentServiceBoundary: document.getElementById('agentServiceBoundary'),
    agentTags: document.getElementById('agentTags'),
    agentOwnsDeclaration: document.getElementById('agentOwnsDeclaration'),
    agentCustodyDeclaration: document.getElementById('agentCustodyDeclaration'),
    agentOutcomeDeclaration: document.getElementById('agentOutcomeDeclaration'),
    agentOnboardPreview: document.getElementById('agentOnboardPreview'),
    creatorSummary: document.getElementById('creatorSummary'),
    creatorList: document.getElementById('creatorList'),
    withdrawalList: document.getElementById('withdrawalList'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    categoryFilters: document.getElementById('categoryFilters'),
    ownershipFilters: document.getElementById('ownershipFilters'),
    capacityFilters: document.getElementById('capacityFilters'),
    fitFilters: document.getElementById('fitFilters'),
    agentGrid: document.getElementById('agentGrid'),
    resultCount: document.getElementById('resultCount'),
    marketSafetySummary: document.getElementById('marketSafetySummary'),
    marketPlanTray: document.getElementById('marketPlanTray'),
    agentDetailPage: document.getElementById('agentDetailPage'),
    taskList: document.getElementById('taskList'),
    taskDetailPage: document.getElementById('taskDetailPage'),
    taskBoardSummary: document.getElementById('taskBoardSummary'),
    taskActionQueue: document.getElementById('taskActionQueue'),
    taskStatusFilters: document.getElementById('taskStatusFilters'),
    arbitrationSummary: document.getElementById('arbitrationSummary'),
    arbitrationList: document.getElementById('arbitrationList'),
    earningsSummary: document.getElementById('earningsSummary'),
    earningsList: document.getElementById('earningsList'),
    changeLogList: document.getElementById('changeLogList'),
    trustDashboard: document.getElementById('trustDashboard'),
    agentModal: document.getElementById('agentModal'),
    modalPanel: document.getElementById('modalPanel'),
    modalClose: document.getElementById('modalClose'),
    modalContent: document.getElementById('modalContent'),
    toastContainer: document.getElementById('toastContainer')
};

function getFallbackTasks() {
    return [
        {
            id: 'LOCAL-1024',
            description: '审查护肤品出口新加坡的标签合规风险',
            acceptanceCriteria: '交付物需列出风险等级、对应法规依据、建议替换文案和仍需人工确认的不确定项。',
            challengeWindowHours: 24,
            category: 'legal',
            budget: 80,
            status: 'SUBMITTED',
            verification: 'TEE',
            selectedAgents: [seedAgents[0], seedAgents[5]],
            deliverable: '初步合规报告已提交，等待验收。',
            deliverableEvidence: [
                {
                    type: 'report',
                    label: '合规报告摘要',
                    uri: 'qz://deliverables/LOCAL-1024/report.md',
                    hash: 'sha256-local-1024-report'
                },
                {
                    type: 'audit',
                    label: 'TEE 执行审计引用',
                    uri: 'qz://audit/LOCAL-1024/tee-run',
                    hash: 'sha256-local-1024-tee'
                }
            ],
            escrow: {
                protocolFee: 4,
                creatorPool: 76,
                splits: [
                    { agentName: seedAgents[0].name, amount: 57.14 },
                    { agentName: seedAgents[5].name, amount: 18.86 }
                ]
            },
            history: [
                { status: 'MATCHED', actor: 'platform', note: '平台生成 Agent 执行方案' },
                { status: 'FUNDED', actor: 'user', note: '用户确认方案并托管预算' },
                { status: 'IN_PROGRESS', actor: 'agent', note: 'Agent 开始执行' },
                { status: 'SUBMITTED', actor: 'agent', note: 'Agent 提交交付物' }
            ]
        },
        {
            id: 'LOCAL-1019',
            description: '复盘小红书投放素材，输出下一轮内容策略',
            acceptanceCriteria: '交付物需包含表现最好的素材共性、低效素材原因、下一轮选题和预算分配建议。',
            challengeWindowHours: 24,
            category: 'ops',
            budget: 120,
            status: 'SETTLED',
            verification: 'Optimistic',
            selectedAgents: [seedAgents[4]],
            deliverable: '投放复盘和下一轮内容策略已验收通过。',
            deliverableEvidence: [
                {
                    type: 'report',
                    label: '增长复盘报告',
                    uri: 'qz://deliverables/LOCAL-1019/growth-review.md',
                    hash: 'sha256-local-1019-review'
                }
            ],
            escrow: {
                protocolFee: 6,
                creatorPool: 114,
                splits: [
                    { agentName: seedAgents[4].name, amount: 114 }
                ]
            },
            settlement: {
                result: 'accepted',
                settledAt: Date.now() - 5 * 60 * 60 * 1000,
                escrow: {
                    protocolFee: 6,
                    creatorPool: 114,
                    splits: [
                        { agentName: seedAgents[4].name, amount: 114 }
                    ]
                },
                payouts: [
                    { agentName: seedAgents[4].name, amount: 114 }
                ],
                reputationEvents: [
                    {
                        agentName: seedAgents[4].name,
                        reputationBefore: 89,
                        reputationAfter: 90,
                        successRateBefore: 93,
                        successRateAfter: 94,
                        stakeSlash: 0
                    }
                ]
            },
            history: [
                { status: 'MATCHED', actor: 'platform', note: '平台生成 Agent 执行方案' },
                { status: 'FUNDED', actor: 'user', note: '用户确认方案并托管预算' },
                { status: 'IN_PROGRESS', actor: 'agent', note: 'Agent 开始执行' },
                { status: 'SUBMITTED', actor: 'agent', note: 'Agent 提交交付物' },
                { status: 'SETTLED', actor: 'user', note: '用户验收通过，托管资金完成分账' }
            ]
        },
        {
            id: 'LOCAL-1018',
            description: '审核一组美妆包装主图是否存在夸大功效风险',
            acceptanceCriteria: '交付物需指出每张主图的风险点、夸大表述、替换建议和需要人工确认的证据缺口。',
            challengeWindowHours: 24,
            category: 'design',
            budget: 60,
            status: 'DISPUTED',
            verification: 'Optimistic',
            selectedAgents: [seedAgents[1]],
            deliverable: '包装主图风险清单已提交，但用户认为缺少第 3 张图的功效宣称依据。',
            deliverableEvidence: [
                {
                    type: 'report',
                    label: '包装主图审核清单',
                    uri: 'qz://deliverables/LOCAL-1018/design-audit.md',
                    hash: 'sha256-local-1018-report'
                }
            ],
            dispute: {
                reason: '用户认为第 3 张图的功效宣称没有被单独评估，要求仲裁复核。',
                openedAt: Date.now() - 2 * 60 * 60 * 1000,
                evidence: [
                    {
                        type: 'dispute-note',
                        label: '用户争议说明',
                        uri: 'qz://disputes/LOCAL-1018/reason.md',
                        hash: 'sha256-local-1018-dispute'
                    },
                    {
                        type: 'source-image',
                        label: '第 3 张包装主图引用',
                        uri: 'qz://evidence/LOCAL-1018/image-03.png',
                        hash: 'sha256-local-1018-image-03'
                    }
                ]
            },
            escrow: {
                protocolFee: 3,
                creatorPool: 57,
                splits: [
                    { agentName: seedAgents[1].name, amount: 57 }
                ]
            },
            history: [
                { status: 'MATCHED', actor: 'platform', note: '平台生成 Agent 执行方案' },
                { status: 'FUNDED', actor: 'user', note: '用户确认方案并托管预算' },
                { status: 'IN_PROGRESS', actor: 'agent', note: 'Agent 开始执行' },
                { status: 'SUBMITTED', actor: 'agent', note: 'Agent 提交交付物' },
                { status: 'DISPUTED', actor: 'user', note: '用户发起争议，等待仲裁' }
            ]
        }
    ];
}

function formatUSDC(value) {
    return `${Number(value || 0).toLocaleString()} USDC`;
}

function getCategoryLabel(category) {
    return categoryLabels[category] || category || '未分类';
}

function getStatusLabel(status) {
    return statusLabels[status] || status;
}

function getActorLabel(actor = state.actor) {
    return actorLabels[actor] || actor;
}

function setActor(actor, options = {}) {
    const nextActor = actorLabels[actor] ? actor : 'user';
    const changed = state.actor !== nextActor;
    state.actor = nextActor;
    renderActorUI();
    renderTasks();
    renderCreatorConsole();

    if (state.activePage === 'task-detail') {
        renderTaskDetailPage();
    }

    if (state.activePage === 'agent-detail') {
        renderAgentDetailPage();
    }

    if (!options.silent && changed) {
        showToast(`已切换为${getActorLabel()}身份`);
    }
}

function getRequiredActor(action) {
    return actionActors[action] || 'platform';
}

function canCurrentActor(action) {
    return getRequiredActor(action) === state.actor;
}

function getChallengeWindowLabel(task) {
    const hours = Number(task.challengeWindowHours || 24);
    return `${hours} 小时`;
}

function getSubmittedAt(task) {
    const submitted = [...getAuditTimeline(task)].reverse().find(item => item.status === 'SUBMITTED');
    return submitted?.at || task.submittedAt || null;
}

function getChallengeDeadline(task) {
    const submittedAt = getSubmittedAt(task);
    if (!submittedAt) return null;
    return Number(submittedAt) + Number(task.challengeWindowHours || 24) * 60 * 60 * 1000;
}

function getChallengeRemainingMs(task) {
    const deadline = getChallengeDeadline(task);
    if (!deadline) return null;
    return deadline - Date.now();
}

function isChallengeWindowExpired(task) {
    const remaining = getChallengeRemainingMs(task);
    return remaining !== null && remaining <= 0;
}

function getChallengeStatus(task) {
    if (task.status !== 'SUBMITTED') return '';
    const remaining = getChallengeRemainingMs(task);
    if (remaining === null) return '挑战窗口计时中';
    if (remaining <= 0) return '挑战窗口已结束，可自动结算';

    const hours = Math.ceil(remaining / (60 * 60 * 1000));
    return `挑战窗口剩余约 ${hours} 小时`;
}

function getTaskActionBlockReason(task, action) {
    if (action === 'auto-settle' && task.status === 'SUBMITTED' && !isChallengeWindowExpired(task)) {
        return getChallengeStatus(task) || '挑战窗口未结束，平台不能提前自动结算';
    }
    return '';
}

function getOwnershipProof(agent) {
    return agent.ownershipProof || (agent.id ? `DID:${agent.id}` : '');
}

function getOwnershipStatus(agent) {
    if (agent.ownershipStatus) return agent.ownershipStatus;

    const proof = getOwnershipProof(agent).trim().toLowerCase();
    const methods = [
        ['did:', 'DID 签名'],
        ['agentnft:', 'Agent NFT'],
        ['modelhash:', '模型承诺哈希'],
        ['reposig:', '代码仓库签名']
    ];
    const matched = methods.find(([prefix]) => proof.startsWith(prefix));
    if (matched) {
        return {
            status: 'verified',
            label: '已校验',
            method: matched[1],
            reviewRequired: false
        };
    }
    if (proof) {
        return {
            status: 'review',
            label: '人工复核',
            method: '待人工复核',
            reviewRequired: true
        };
    }
    return {
        status: 'missing',
        label: '未提交',
        method: '无所有权证明',
        reviewRequired: true
    };
}

function renderOwnershipBadge(agent) {
    const status = getOwnershipStatus(agent);
    return `<span class="ownership-badge ${status.status}">${status.label} · ${status.method}</span>`;
}

function isAgentOwnershipVerified(agent) {
    return getOwnershipStatus(agent).status === 'verified';
}

function shortenAddress(address) {
    const value = String(address || '').trim();
    if (value.length <= 12) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getSignatureSigner() {
    return state.walletAddress || `demo:${state.actor}`;
}

function makeSignatureId(seed) {
    return makeEvidenceHash(seed)
        .replace('sha256-demo-', 'SIG-')
        .toUpperCase();
}

function canRequestWalletSignature() {
    return Boolean(state.connected && state.walletAddress && window.ethereum?.request);
}

async function attachWalletProof(signature, message) {
    if (!canRequestWalletSignature()) {
        return signature;
    }

    try {
        const walletSignature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, state.walletAddress]
        });
        return {
            ...signature,
            walletAddress: state.walletAddress,
            walletSignature,
            message
        };
    } catch (error) {
        throw new Error(`钱包签名未完成：${error.message || '用户取消或钱包拒绝签名'}`);
    }
}

async function buildOwnershipReviewSignature(agent, action) {
    const issuedAt = Date.now();
    const signedAction = `ownership-${action}`;
    const signer = getSignatureSigner();
    const signatureId = makeSignatureId(`${agent.id}-${signedAction}-${agent.owner}-${signer}-${issuedAt}`);
    const message = [
        'Qianzhi Agent ownership review',
        `Agent: ${agent.id}`,
        `Owner: ${agent.owner}`,
        `Action: ${signedAction}`,
        `Actor: ${state.actor}`,
        `IssuedAt: ${issuedAt}`
    ].join('\n');

    return attachWalletProof({
        signatureId,
        signer,
        actor: state.actor,
        action: signedAction,
        agentId: agent.id,
        owner: agent.owner,
        issuedAt
    }, message);
}

function renderOwnershipReviewPanel(agent) {
    const status = getOwnershipStatus(agent);
    const signature = agent.ownershipReviewSignature?.signatureId
        ? `<small>审核签名 ${agent.ownershipReviewSignature.signatureId}</small>`
        : '';
    const note = status.reviewNote
        ? `<small>${status.reviewNote}</small>`
        : '<small>平台只复核所有权证明，不接管 Agent 能力和模型资产。</small>';
    const canReview = state.actor === 'platform' && status.status !== 'verified' && Boolean(getOwnershipProof(agent));

    return `
        <div class="ownership-review-panel">
            <div>
                ${note}
                ${signature}
            </div>
            ${canReview ? `
                <div class="ownership-review-actions">
                    <button class="btn btn-primary btn-sm" type="button" data-ownership-action="approve">通过所有权</button>
                    <button class="btn btn-ghost btn-sm" type="button" data-ownership-action="reject">拒绝证明</button>
                </div>
            ` : ''}
        </div>
    `;
}

function getServiceBoundary(agent) {
    return agent.serviceBoundary || '只承接能力说明范围内的任务；高风险结论需要用户二次复核。';
}

function getTaskTitle(task) {
    const text = task.description || task.title || '';
    return text.length > 52 ? `${text.slice(0, 52)}...` : text;
}

function getTaskAgents(task) {
    const selected = task.selectedAgents || task.agents || [];
    return selected.map(agent => {
        if (typeof agent === 'string') return agent;
        return getAgentLabel(agent);
    });
}

function getAgentLabel(agent) {
    if (typeof agent === 'string') return agent;
    return agent?.name || agent?.agentName || agent?.id || '未知 Agent';
}

function formatTime(value) {
    if (!value) return '待记录';
    return new Date(Number(value)).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getSettlementPayouts(task) {
    const settlement = task.settlement || {};
    const escrow = settlement.escrow || task.escrow || {};
    return settlement.payouts || escrow.splits || [];
}

function formatMetricChange(before, after, suffix = '') {
    const delta = Number(after) - Number(before);
    const sign = delta > 0 ? '+' : '';
    return `${before}${suffix} → ${after}${suffix} (${sign}${delta}${suffix})`;
}

function makeEvidenceHash(seed) {
    const value = String(seed || 'qianzhi');
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(index);
        hash |= 0;
    }
    return `sha256-demo-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

function getTaskContractSnapshot(task) {
    const agents = (task.selectedAgents || task.agents || []).map(agent => {
        if (typeof agent === 'string') {
            return {
                id: agent,
                name: agent,
                owner: ''
            };
        }

        return {
            id: agent.id || agent.agentId || '',
            name: agent.name || agent.agentName || agent.id || '',
            owner: agent.owner || ''
        };
    });

    return {
        taskId: task.id || '',
        description: task.description || task.title || '',
        category: task.category || '',
        acceptanceCriteria: String(task.acceptanceCriteria || '').trim(),
        challengeWindowHours: Number(task.challengeWindowHours || 24),
        budget: Number(task.budget || 0),
        verification: task.verification || '',
        agents,
        escrow: {
            protocolFee: Number(task.escrow?.protocolFee || 0),
            creatorPool: Number(task.escrow?.creatorPool || 0)
        }
    };
}

function getTaskContractFingerprint(task) {
    const existing = task.contractFingerprint
        || task.settlement?.contractFingerprint
        || task.settlement?.acceptanceConfirmation?.contractFingerprint;
    if (existing) return existing;

    return makeEvidenceHash(JSON.stringify(getTaskContractSnapshot(task)))
        .replace('sha256-demo-', 'CTR-')
        .toUpperCase();
}

function renderContractFingerprint(task, options = {}) {
    const fingerprint = getTaskContractFingerprint(task);
    const label = options.compact ? '契约' : '契约指纹';

    return `
        <div class="contract-fingerprint ${options.compact ? 'compact' : ''}">
            <span>${label}</span>
            <strong>${fingerprint}</strong>
            <small>绑定任务、验收标准、预算、挑战窗口和执行 Agent</small>
        </div>
    `;
}

function normalizeSignatureAction(action) {
    if (action === 'resolve-agent' || action === 'resolve-user') {
        return 'resolve';
    }
    return action;
}

async function buildActionSignature(task, action) {
    const issuedAt = Date.now();
    const signedAction = normalizeSignatureAction(action);
    const signer = getSignatureSigner();
    const signatureId = makeSignatureId(`${task.id}-${signedAction}-${state.actor}-${signer}-${issuedAt}`);
    const message = [
        'Qianzhi task action',
        `Task: ${task.id}`,
        `Action: ${signedAction}`,
        `Actor: ${state.actor}`,
        `Contract: ${getTaskContractFingerprint(task)}`,
        `IssuedAt: ${issuedAt}`
    ].join('\n');

    return attachWalletProof({
        signatureId,
        signer,
        actor: state.actor,
        action: signedAction,
        taskId: task.id,
        issuedAt
    }, message);
}

function renderSignatureLabel(signature) {
    if (!signature || !signature.signatureId) return '';
    return ` · ${signature.signatureId}`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function buildEvidenceBundle(task, kind) {
    const taskId = task.id || `local-${Date.now()}`;

    if (kind === 'dispute') {
        return [
            {
                type: 'dispute-note',
                label: '用户争议说明',
                uri: `qz://disputes/${taskId}/reason.md`,
                hash: makeEvidenceHash(`${taskId}-dispute-reason`)
            },
            {
                type: 'task-contract',
                label: '原始验收标准',
                uri: `qz://tasks/${taskId}/acceptance.md`,
                hash: makeEvidenceHash(`${taskId}-${task.acceptanceCriteria}`)
            }
        ];
    }

    return [
        {
            type: 'report',
            label: '交付报告摘要',
            uri: `qz://deliverables/${taskId}/report.md`,
            hash: makeEvidenceHash(`${taskId}-deliverable-report`)
        },
        {
            type: 'audit',
            label: `${task.verification || 'Optimistic'} 执行审计引用`,
            uri: `qz://audit/${taskId}/agent-run`,
            hash: makeEvidenceHash(`${taskId}-${task.verification}-run`)
        }
    ];
}

function getTaskEvidence(task) {
    return [
        ...(task.deliverableEvidence || []),
        ...((task.dispute && task.dispute.evidence) || task.disputeEvidence || [])
    ];
}

function renderEvidenceBundle(task) {
    const evidence = getTaskEvidence(task);
    if (!evidence.length) return '';

    return `
        <div class="evidence-bundle">
            <span>证据包</span>
            ${evidence.map(item => `
                <div>
                    <strong>${item.label || item.type || '证据引用'}</strong>
                    <small>${item.uri || '待上传'} · ${item.hash || '待生成哈希'}</small>
                </div>
            `).join('')}
        </div>
    `;
}

function getDefaultSubmissionPayload(task) {
    return {
        deliverable: buildDeliverable(task),
        deliverableEvidence: buildEvidenceBundle(task, 'deliverable')
    };
}

function getDefaultDisputePayload(task) {
    return {
        reason: '用户认为交付物没有覆盖关键风险点，要求仲裁复核。',
        evidence: buildEvidenceBundle(task, 'dispute')
    };
}

function makeEvidenceHashFromFields(taskId, type, label, uri) {
    return makeEvidenceHash(`${taskId}-${type}-${label}-${uri}`);
}

function isRealEvidenceHash(value) {
    return /^sha256-[a-f0-9]{64}$/i.test(String(value || '').trim());
}

function getEvidenceRowHash(row, task, type, label, uri) {
    const vaultHash = row.dataset.evidenceVaultHash || '';
    const vaultUri = row.dataset.evidenceVaultUri || '';
    if (isRealEvidenceHash(vaultHash) && uri === vaultUri) {
        return vaultHash;
    }

    const displayed = row.querySelector('[data-evidence-hash]')?.textContent.trim() || '';
    if (isRealEvidenceHash(displayed)) {
        return displayed;
    }
    return makeEvidenceHashFromFields(task.id, type, label, uri);
}

function setEvidenceVaultStatus(row, message, tone = '') {
    const target = row.querySelector('[data-evidence-vault-status]');
    if (!target) return;
    target.textContent = message;
    target.dataset.tone = tone;
}

async function hashEvidenceFile(file) {
    if (!window.crypto?.subtle) {
        throw new Error('当前浏览器不支持本地 SHA-256 文件存证');
    }

    const buffer = await file.arrayBuffer();
    const digest = await window.crypto.subtle.digest('SHA-256', buffer);
    return [...new Uint8Array(digest)]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

async function registerEvidenceFile(row) {
    const fileInput = row.querySelector('[data-evidence-file]');
    const file = fileInput?.files?.[0];
    if (!file) {
        throw new Error('请先选择要存证的本地文件');
    }

    const form = row.closest('[data-evidence-task-id]');
    const taskId = form?.dataset.evidenceTaskId || 'local';
    const typeInput = row.querySelector('[data-evidence-type]');
    const labelInput = row.querySelector('[data-evidence-label]');
    const uriInput = row.querySelector('[data-evidence-uri]');
    const hashTarget = row.querySelector('[data-evidence-hash]');
    const type = typeInput?.value || 'file';
    const label = labelInput?.value.trim() || file.name;

    setEvidenceVaultStatus(row, '正在计算文件哈希...', 'working');
    const sha256 = await hashEvidenceFile(file);
    let evidence = {
        type,
        label,
        uri: `qz://evidence/${taskId}/${sha256.slice(0, 16)}`,
        hash: `sha256-${sha256}`
    };

    if (state.apiAvailable && (appConfig.apiMode || 'auto') !== 'off') {
        try {
            const response = await apiRequest('/api/evidence', {
                method: 'POST',
                body: JSON.stringify({
                    taskId,
                    type,
                    label,
                    fileName: file.name,
                    mimeType: file.type,
                    sizeBytes: file.size,
                    sha256,
                    actor: state.actor
                })
            });
            evidence = response.evidence || evidence;
            setEvidenceVaultStatus(row, `已登记到本地 mock 存证：${evidence.id || evidence.hash}`, 'ok');
        } catch (error) {
            setEvidenceVaultStatus(row, `后端存证未成功：${error.message}；已先填入本地哈希。`, 'error');
        }
    } else {
        setEvidenceVaultStatus(row, '已生成本地哈希；未连接后端时只填充引用，不会持久保存。', 'ok');
    }

    if (labelInput) labelInput.value = evidence.label || label;
    if (uriInput) uriInput.value = evidence.uri;
    if (hashTarget) hashTarget.textContent = evidence.hash;
    row.dataset.evidenceVaultHash = evidence.hash || '';
    row.dataset.evidenceVaultUri = evidence.uri || '';
}

function renderEvidenceInputRow(task, item = {}, removable = true) {
    const type = item.type || 'report';
    const label = item.label || '';
    const uri = item.uri || '';
    const hash = label && uri
        ? (item.hash || makeEvidenceHashFromFields(task.id, type, label, uri))
        : '填写标签和引用后生成哈希';
    const vaultAttrs = isRealEvidenceHash(hash) && uri
        ? ` data-evidence-vault-hash="${escapeHtml(hash)}" data-evidence-vault-uri="${escapeHtml(uri)}"`
        : '';

    const option = (value, text) => `
        <option value="${value}" ${type === value ? 'selected' : ''}>${text}</option>
    `;

    return `
        <div class="evidence-input-row" data-evidence-row${vaultAttrs}>
            <div class="evidence-row-grid">
                <label class="field compact">
                    <span>证据类型</span>
                    <select data-evidence-type>
                        ${option('report', '交付报告')}
                        ${option('file', '结果文件')}
                        ${option('audit', '执行审计')}
                        ${option('proof', '验收证明')}
                        ${option('reference', '外部引用')}
                    </select>
                </label>
                <label class="field compact">
                    <span>证据名称</span>
                    <input data-evidence-label type="text" value="${escapeHtml(label)}" placeholder="例如：结果报告">
                </label>
                <label class="field compact">
                    <span>文件或审计引用</span>
                    <input data-evidence-uri type="text" value="${escapeHtml(uri)}" placeholder="qz://deliverables/... 或 https://...">
                </label>
            </div>
            <div class="evidence-row-foot">
                <small data-evidence-hash>${escapeHtml(hash)}</small>
                ${removable ? '<button class="btn btn-ghost btn-sm" type="button" data-remove-evidence>移除</button>' : ''}
            </div>
            <div class="evidence-vault-tools">
                <input data-evidence-file type="file">
                <button class="btn btn-ghost btn-sm" type="button" data-register-evidence>生成文件存证</button>
                <small data-evidence-vault-status>只登记文件名、大小和 SHA-256 哈希，不上传原文件内容。</small>
            </div>
        </div>
    `;
}

function updateEvidenceRowHash(row) {
    const form = row.closest('[data-evidence-task-id]');
    const taskId = form?.dataset.evidenceTaskId || 'local';
    const type = row.querySelector('[data-evidence-type]')?.value || 'reference';
    const label = row.querySelector('[data-evidence-label]')?.value.trim() || '';
    const uri = row.querySelector('[data-evidence-uri]')?.value.trim() || '';
    const target = row.querySelector('[data-evidence-hash]');
    if (!target) return;

    const vaultHash = row.dataset.evidenceVaultHash || '';
    const vaultUri = row.dataset.evidenceVaultUri || '';
    if (isRealEvidenceHash(vaultHash) && uri === vaultUri) {
        target.textContent = vaultHash;
        return;
    }

    if (vaultHash && uri !== vaultUri) {
        delete row.dataset.evidenceVaultHash;
        delete row.dataset.evidenceVaultUri;
        setEvidenceVaultStatus(row, '引用地址已修改，原文件哈希存证不再自动绑定。', 'error');
    }

    target.textContent = label && uri
        ? makeEvidenceHashFromFields(taskId, type, label, uri)
        : '填写标签和引用后生成哈希';
}

function collectSubmissionPayload(form, task) {
    const deliverable = form.querySelector('[data-deliverable-summary]')?.value.trim() || '';
    if (deliverable.length < 6) {
        throw new Error('请先填写可供验收的交付摘要');
    }

    const deliverableEvidence = [...form.querySelectorAll('[data-evidence-row]')].map(row => {
        const type = row.querySelector('[data-evidence-type]')?.value || 'reference';
        const label = row.querySelector('[data-evidence-label]')?.value.trim() || '';
        const uri = row.querySelector('[data-evidence-uri]')?.value.trim() || '';
        if (!label && !uri) return null;
        if (!label || !uri) {
            throw new Error('每条证据都需要同时填写名称和引用地址');
        }
        return {
            type,
            label,
            uri,
            hash: getEvidenceRowHash(row, task, type, label, uri)
        };
    }).filter(Boolean);

    if (!deliverableEvidence.length) {
        throw new Error('至少需要提交一条交付证据');
    }

    return { deliverable, deliverableEvidence };
}

function collectDisputePayload(form, task) {
    const reason = form.querySelector('[data-dispute-reason]')?.value.trim() || '';
    if (reason.length < 6) {
        throw new Error('请先填写清楚争议理由');
    }

    const evidence = [...form.querySelectorAll('[data-evidence-row]')].map(row => {
        const type = row.querySelector('[data-evidence-type]')?.value || 'reference';
        const label = row.querySelector('[data-evidence-label]')?.value.trim() || '';
        const uri = row.querySelector('[data-evidence-uri]')?.value.trim() || '';
        if (!label && !uri) return null;
        if (!label || !uri) {
            throw new Error('每条争议证据都需要同时填写名称和引用地址');
        }
        return {
            type,
            label,
            uri,
            hash: getEvidenceRowHash(row, task, type, label, uri)
        };
    }).filter(Boolean);

    if (!evidence.length) {
        throw new Error('至少需要提交一条争议证据');
    }

    return { reason, evidence };
}

function getDefaultResolutionPayload(task, action) {
    const outcome = action === 'resolve-agent' ? 'agent' : 'user';
    const deliverableEvidenceCount = (task.deliverableEvidence || []).length;
    const disputeEvidenceCount = (task.dispute?.evidence || task.disputeEvidence || []).length;
    const reason = outcome === 'agent'
        ? '交付证据与验收契约基本一致，用户争议未证明关键缺陷。'
        : '用户争议证据证明交付未满足验收标准，托管预算应退回。';

    return {
        outcome,
        reason,
        evidenceReview: `已核对验收契约、${deliverableEvidenceCount} 项 Agent 交付证据、${disputeEvidenceCount} 项用户争议证据和交易审计链。`
    };
}

function collectResolutionPayload(form, task) {
    const action = form.dataset.resolveAction;
    const defaults = getDefaultResolutionPayload(task, action);
    const reason = form.querySelector('[data-resolution-reason]')?.value.trim() || '';
    const evidenceReview = form.querySelector('[data-resolution-evidence-review]')?.value.trim() || '';

    if (reason.length < 8) {
        throw new Error('请填写更清楚的裁决理由');
    }

    if (evidenceReview.length < 8) {
        throw new Error('请填写证据核对说明');
    }

    return {
        outcome: defaults.outcome,
        reason,
        evidenceReview
    };
}

function renderModalRouteBar(task, modeLabel) {
    return `
        <div class="modal-route-bar">
            <button class="btn btn-ghost btn-sm" type="button" data-task-detail="${task.id}">返回交易档案</button>
            <span>${task.id} · ${modeLabel}</span>
        </div>
    `;
}

function openSubmissionModal(taskId) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    const defaults = getDefaultSubmissionPayload(task);
    const agents = getTaskAgents(task).join(' / ') || '待确认 Agent';

    elements.modalContent.innerHTML = `
        <form class="submission-form" data-submit-task-id="${task.id}" data-evidence-task-id="${task.id}">
            ${renderModalRouteBar(task, '交付证据')}
            <div class="detail-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(task.category)}</span>
                    <h2 id="modalTitle">提交交付物与证据包</h2>
                    <p>${task.id} · ${getTaskTitle(task)}</p>
                </div>
                <div class="detail-progress">
                    <strong>${getTaskAgents(task).length || 1}</strong>
                    <span>执行 Agent</span>
                </div>
            </div>

            <div class="submit-preview-grid">
                <div><strong>${formatUSDC(task.budget)}</strong><span>托管预算</span></div>
                <div><strong>${task.verification}</strong><span>验证方式</span></div>
                <div><strong>${getChallengeWindowLabel(task)}</strong><span>挑战窗口</span></div>
            </div>

            <section class="detail-section">
                <span>执行方</span>
                <p>${agents}</p>
            </section>

            <label class="field">
                <span>交付摘要</span>
                <textarea data-deliverable-summary rows="4">${escapeHtml(defaults.deliverable)}</textarea>
            </label>

            <section class="detail-section evidence-submit-section">
                <span>证据包</span>
                <p>这里填写的是演示元数据，不上传真实文件；真实版本应接文件服务、加密存储或可信执行日志。</p>
                <div class="evidence-input-list" data-evidence-list>
                    ${defaults.deliverableEvidence.map((item, index) =>
                        renderEvidenceInputRow(task, item, index > 0)
                    ).join('')}
                </div>
                <button class="btn btn-secondary btn-sm" type="button" data-add-evidence>添加证据</button>
            </section>

            <div class="task-actions detail-actions">
                <button class="btn btn-ghost" type="button" data-task-detail="${task.id}">返回交易档案</button>
                <button class="btn btn-primary" type="submit">提交到验收</button>
            </div>
        </form>
    `;

    openModal(true);
}

function openDisputeModal(taskId) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    const defaults = getDefaultDisputePayload(task);
    const submittedAt = getSubmittedAt(task);

    elements.modalContent.innerHTML = `
        <form class="submission-form dispute-form" data-dispute-task-id="${task.id}" data-evidence-task-id="${task.id}">
            ${renderModalRouteBar(task, '争议证据')}
            <div class="detail-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(task.category)}</span>
                    <h2 id="modalTitle">发起争议与证据包</h2>
                    <p>${task.id} · ${getTaskTitle(task)}</p>
                </div>
                <div class="detail-progress">
                    <strong>${getTaskEvidence(task).length}</strong>
                    <span>已有证据</span>
                </div>
            </div>

            <div class="submit-preview-grid">
                <div><strong>${formatUSDC(task.budget)}</strong><span>托管预算</span></div>
                <div><strong>${submittedAt ? formatTime(submittedAt) : '待记录'}</strong><span>提交时间</span></div>
                <div><strong>${getChallengeWindowLabel(task)}</strong><span>挑战窗口</span></div>
            </div>

            <section class="detail-section">
                <span>验收契约</span>
                <p>${task.acceptanceCriteria}</p>
            </section>

            <section class="detail-section">
                <span>Agent 交付摘要</span>
                <p>${task.deliverable || 'Agent 尚未留下交付摘要。'}</p>
            </section>

            <label class="field">
                <span>争议理由</span>
                <textarea data-dispute-reason rows="4">${escapeHtml(defaults.reason)}</textarea>
            </label>

            <section class="detail-section evidence-submit-section">
                <span>争议证据包</span>
                <p>这里记录用户反驳交付结果的引用材料，仲裁员会同时查看验收契约、Agent 交付证据和用户争议证据。</p>
                <div class="evidence-input-list" data-evidence-list>
                    ${defaults.evidence.map((item, index) =>
                        renderEvidenceInputRow(task, item, index > 0)
                    ).join('')}
                </div>
                <button class="btn btn-secondary btn-sm" type="button" data-add-evidence>添加证据</button>
            </section>

            <div class="task-actions detail-actions">
                <button class="btn btn-ghost" type="button" data-task-detail="${task.id}">返回交易档案</button>
                <button class="btn btn-primary" type="submit">提交争议</button>
            </div>
        </form>
    `;

    openModal(true);
}

function openResolutionModal(taskId, action) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    const defaults = getDefaultResolutionPayload(task, action);
    const outcomeLabel = action === 'resolve-agent' ? '支持 Agent 结算' : '支持用户退款';
    const disputeEvidence = task.dispute?.evidence || task.disputeEvidence || [];
    const deliverableEvidence = task.deliverableEvidence || [];
    const escrow = task.escrow || {};

    elements.modalContent.innerHTML = `
        <form class="submission-form resolution-form" data-resolve-task-id="${task.id}" data-resolve-action="${action}">
            ${renderModalRouteBar(task, '仲裁裁决')}
            <div class="detail-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(task.category)}</span>
                    <h2 id="modalTitle">填写仲裁裁决理由</h2>
                    <p>${task.id} · ${getTaskTitle(task)}</p>
                </div>
                <div class="detail-progress">
                    <strong>${outcomeLabel}</strong>
                    <span>${formatUSDC(task.budget)}</span>
                </div>
            </div>

            <div class="submit-preview-grid">
                <div><strong>${formatUSDC(task.budget)}</strong><span>托管预算</span></div>
                <div><strong>${formatUSDC(escrow.creatorPool)}</strong><span>创作者池</span></div>
                <div><strong>${deliverableEvidence.length}</strong><span>交付证据</span></div>
                <div><strong>${disputeEvidence.length}</strong><span>争议证据</span></div>
            </div>

            <section class="detail-section">
                <span>用户争议理由</span>
                <p>${task.dispute?.reason || '暂无争议理由'}</p>
            </section>

            <section class="detail-section">
                <span>证据核对</span>
                <div class="case-evidence-grid">
                    <div class="case-panel">
                        <span>Agent 交付证据</span>
                        ${renderEvidenceItems(deliverableEvidence)}
                    </div>
                    <div class="case-panel warning">
                        <span>用户争议证据</span>
                        ${renderEvidenceItems(disputeEvidence)}
                    </div>
                </div>
            </section>

            <label class="field">
                <span>裁决理由</span>
                <textarea data-resolution-reason rows="4">${escapeHtml(defaults.reason)}</textarea>
            </label>

            <label class="field">
                <span>证据核对说明</span>
                <textarea data-resolution-evidence-review rows="3">${escapeHtml(defaults.evidenceReview)}</textarea>
            </label>

            <div class="task-actions detail-actions">
                <button class="btn btn-ghost" type="button" data-task-detail="${task.id}">返回交易档案</button>
                <button class="btn btn-primary" type="submit">提交裁决并${action === 'resolve-agent' ? '结算' : '退款'}</button>
            </div>
        </form>
    `;

    openModal(true);
}

function openFundConfirmationModal(taskId, options = {}) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    const escrow = task.escrow || {};
    const items = getFundingConfirmationItems(task);
    const agentRows = (task.selectedAgents || task.agents || []).map(agent => `
        <div>
            <strong>${agent.name || agent.agentName || agent.id || '未知 Agent'}</strong>
            <span>${agent.owner || '待确认创作者'}</span>
            ${renderOwnershipBadge(agent)}
        </div>
    `).join('');

    elements.modalContent.innerHTML = `
        <form class="submission-form fund-confirm-form" data-fund-task-id="${task.id}" data-reopen-detail="${options.reopenDetail ? 'true' : 'false'}">
            ${renderModalRouteBar(task, '托管确认')}
            <div class="detail-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(task.category)}</span>
                    <h2 id="modalTitle">确认托管预算</h2>
                    <p>${task.id} · ${getTaskTitle(task)}</p>
                </div>
                <div class="detail-progress">
                    <strong>${formatUSDC(task.budget)}</strong>
                    <span>预算进入 Escrow</span>
                </div>
            </div>

            ${renderOutcomeContract(task, { detail: true })}

            <div class="detail-grid">
                <section class="detail-section">
                    <span>执行 Agent</span>
                    <div class="fund-confirm-agent-list">
                        ${agentRows || '<p class="action-note">当前任务还没有匹配 Agent。</p>'}
                    </div>
                </section>
                <section class="detail-section">
                    <span>托管分账</span>
                    <div class="detail-escrow-grid">
                        <div><strong>${formatUSDC(task.budget)}</strong><span>托管预算</span></div>
                        <div><strong>${formatUSDC(escrow.protocolFee)}</strong><span>协议费</span></div>
                        <div><strong>${formatUSDC(escrow.creatorPool)}</strong><span>创作者池</span></div>
                    </div>
                </section>
            </div>

            <section class="detail-section fund-confirm-list">
                <span>托管前确认</span>
                ${items.map(item => `
                    <label>
                        <input type="checkbox" data-fund-confirm="${item.id}">
                        <div>
                            <strong>${item.label}</strong>
                            <small>${item.detail}</small>
                        </div>
                    </label>
                `).join('')}
            </section>

            <div class="task-actions detail-actions">
                <button class="btn btn-ghost" type="button" data-task-detail="${task.id}">返回交易档案</button>
                <button class="btn btn-primary" type="submit">确认并托管预算</button>
            </div>
        </form>
    `;

    openModal(true);
}

function openStartConfirmationModal(taskId) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    const items = getExecutionCommitmentItems(task);
    const agents = task.selectedAgents || task.agents || [];
    const agentRows = agents.map(agent => `
        <div>
            <strong>${agent.name || agent.agentName || agent.id || '未知 Agent'}</strong>
            <span>${agent.owner || '待确认创作者'}</span>
            <small>${getServiceBoundary(agent)}</small>
        </div>
    `).join('');

    elements.modalContent.innerHTML = `
        <form class="submission-form start-commit-form" data-start-task-id="${task.id}">
            ${renderModalRouteBar(task, '接单承诺')}
            <div class="detail-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(task.category)}</span>
                    <h2 id="modalTitle">确认接单执行</h2>
                    <p>${task.id} · ${getTaskTitle(task)}</p>
                </div>
                <div class="detail-progress">
                    <strong>${formatUSDC(task.escrow?.creatorPool || task.budget)}</strong>
                    <span>待释放创作者池</span>
                </div>
            </div>

            ${renderOutcomeContract(task, { detail: true })}

            <div class="detail-grid">
                <section class="detail-section">
                    <span>接单 Agent</span>
                    <div class="fund-confirm-agent-list">
                        ${agentRows || '<p class="action-note">当前任务还没有匹配 Agent。</p>'}
                    </div>
                </section>
                <section class="detail-section">
                    <span>执行责任</span>
                    <div class="detail-escrow-grid">
                        <div><strong>${formatUSDC(task.budget)}</strong><span>用户托管</span></div>
                        <div><strong>${getChallengeWindowLabel(task)}</strong><span>挑战窗口</span></div>
                        <div><strong>${getTaskEvidence(task).length}</strong><span>当前证据</span></div>
                    </div>
                    <p>接单后状态进入执行中，Agent 需要按契约交付并准备可核对证据。</p>
                </section>
            </div>

            <section class="detail-section fund-confirm-list">
                <span>接单前承诺</span>
                ${items.map(item => `
                    <label>
                        <input type="checkbox" data-execution-commitment="${item.id}">
                        <div>
                            <strong>${item.label}</strong>
                            <small>${item.detail}</small>
                        </div>
                    </label>
                `).join('')}
            </section>

            <div class="task-actions detail-actions">
                <button class="btn btn-ghost" type="button" data-task-detail="${task.id}">返回交易档案</button>
                <button class="btn btn-primary" type="submit">确认接单并开始执行</button>
            </div>
        </form>
    `;

    openModal(true);
}

function openAcceptanceConfirmationModal(taskId) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    const items = getAcceptanceConfirmationItems(task);
    const escrow = task.escrow || {};

    elements.modalContent.innerHTML = `
        <form class="submission-form accept-confirm-form" data-accept-task-id="${task.id}">
            ${renderModalRouteBar(task, '验收放款')}
            <div class="detail-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(task.category)}</span>
                    <h2 id="modalTitle">确认验收并释放托管</h2>
                    <p>${task.id} · ${getTaskTitle(task)}</p>
                </div>
                <div class="detail-progress">
                    <strong>${formatUSDC(escrow.creatorPool || task.budget)}</strong>
                    <span>待释放创作者池</span>
                </div>
            </div>

            ${renderOutcomeContract(task, { detail: true })}

            <div class="detail-grid">
                <section class="detail-section">
                    <span>Agent 交付摘要</span>
                    <p>${task.deliverable || 'Agent 尚未留下交付摘要。'}</p>
                    ${renderEvidenceBundle(task) || '<p class="action-note">当前没有可核对证据，不建议直接放款。</p>'}
                </section>
                <section class="detail-section">
                    <span>放款分账</span>
                    <div class="detail-escrow-grid">
                        <div><strong>${formatUSDC(task.budget)}</strong><span>托管预算</span></div>
                        <div><strong>${formatUSDC(escrow.protocolFee)}</strong><span>协议费</span></div>
                        <div><strong>${formatUSDC(escrow.creatorPool)}</strong><span>创作者池</span></div>
                    </div>
                    <p>确认后平台会释放托管资金，并回写 Agent 成交、声誉和成功率。</p>
                </section>
            </div>

            <section class="detail-section fund-confirm-list">
                <span>验收前确认</span>
                ${items.map(item => `
                    <label>
                        <input type="checkbox" data-acceptance-confirm="${item.id}">
                        <div>
                            <strong>${item.label}</strong>
                            <small>${item.detail}</small>
                        </div>
                    </label>
                `).join('')}
            </section>

            <div class="task-actions detail-actions">
                <button class="btn btn-ghost" type="button" data-task-detail="${task.id}">返回交易档案</button>
                <button class="btn btn-primary" type="submit">确认验收并结算</button>
            </div>
        </form>
    `;

    openModal(true);
}

function getAgentEscrowLimit(agent) {
    return Number(agent.escrowLimit || agent.escrow_limit || 0);
}

function getAgentStake(agent) {
    return Number(agent.stake || 0);
}

const capacityLockStatuses = new Set(['MATCHED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'DISPUTED']);

function getAgentCapacityNumber(agent, keys) {
    for (const key of keys) {
        const value = Number(agent?.[key]);
        if (Number.isFinite(value)) return value;
    }
    return null;
}

function getAgentLockedCapacity(agent, options = {}) {
    const ignoredTaskId = options.ignoreTaskId || '';
    const backendLocked = getAgentCapacityNumber(agent, ['lockedCapacity', 'locked_capacity']);
    const backendAvailable = getAgentCapacityNumber(agent, ['availableEscrowLimit', 'available_escrow_limit']);
    if (!ignoredTaskId && backendLocked !== null) {
        return Math.max(0, backendLocked);
    }
    if (!ignoredTaskId && backendAvailable !== null) {
        return Math.max(0, getAgentEscrowLimit(agent) - backendAvailable);
    }
    if (!agent || !state.tasks?.length) return 0;

    return state.tasks
        .filter(task => task.id !== ignoredTaskId)
        .filter(task => capacityLockStatuses.has(task.status))
        .filter(task => taskIncludesAgent(task, agent))
        .reduce((sum, task) => sum + getAgentTaskSplit(task, agent), 0);
}

function getAgentAvailableEscrowLimit(agent, options = {}) {
    const ignoredTaskId = options.ignoreTaskId || '';
    const backendAvailable = getAgentCapacityNumber(agent, ['availableEscrowLimit', 'available_escrow_limit']);
    if (!ignoredTaskId && backendAvailable !== null) {
        return Math.max(0, backendAvailable);
    }
    return Math.max(0, getAgentEscrowLimit(agent) - getAgentLockedCapacity(agent, options));
}

function getRequiredStakeForBudget(budget) {
    return Number(budget || 0) * 2;
}

function getPlannedAgentShare(agents, budget) {
    if (!agents.length) return 0;
    const creatorPool = Math.round((Number(budget || 0) - (Number(budget || 0) * 5) / 100) * 100) / 100;
    return Math.round((creatorPool / agents.length) * 100) / 100;
}

function getExecutionPlanStats(agents, budget, options = {}) {
    const plannedShare = getPlannedAgentShare(agents, budget);
    return {
        totalEscrowLimit: agents.reduce((sum, agent) => sum + getAgentEscrowLimit(agent), 0),
        totalLockedCapacity: agents.reduce((sum, agent) => sum + getAgentLockedCapacity(agent, options), 0),
        totalAvailableCapacity: agents.reduce((sum, agent) => sum + getAgentAvailableEscrowLimit(agent, options), 0),
        totalStake: agents.reduce((sum, agent) => sum + getAgentStake(agent), 0),
        requiredStake: getRequiredStakeForBudget(budget),
        plannedShare,
        blockedAgents: agents.filter(agent => !isAgentOwnershipVerified(agent)),
        overCapacityAgents: agents.filter(agent => getAgentAvailableEscrowLimit(agent, options) < plannedShare)
    };
}

function getExecutionPlanBlockingReason(agents, budget, options = {}) {
    const planName = options.planName || '执行方案';
    if (!agents.length) {
        return `${planName}没有可用 Agent，请先选择已校验 Agent 或降低预算后重新匹配。`;
    }

    const stats = getExecutionPlanStats(agents, budget);
    if (stats.blockedAgents.length) {
        return `以下 Agent 还未通过所有权校验：${stats.blockedAgents.map(getAgentLabel).join('、')}`;
    }

    if (stats.totalAvailableCapacity < budget) {
        return `${planName}可用承接额度不足：当前可用 ${formatUSDC(stats.totalAvailableCapacity)}，任务预算 ${formatUSDC(budget)}。请增加 Agent、等待已有任务结算，或降低预算。`;
    }

    if (stats.overCapacityAgents.length) {
        return `${planName}中以下 Agent 剩余容量不足以覆盖预计分账：${stats.overCapacityAgents.map(getAgentLabel).join('、')}。请调整执行组合。`;
    }

    if (stats.totalStake < stats.requiredStake) {
        return `${planName}质押覆盖不足：当前 ${formatUSDC(stats.totalStake)}，至少需要 ${formatUSDC(stats.requiredStake)}。请选择质押更高的 Agent 或降低预算。`;
    }

    return '';
}

function validateExecutionPlanBeforeSubmit(agents, budget, options = {}) {
    const reason = getExecutionPlanBlockingReason(agents, budget, options);
    if (!reason) return true;
    showToast(reason, 'error');
    return false;
}

function getTaskRiskChecks(task) {
    const agents = task.selectedAgents || [];
    const budget = Number(task.budget || 0);
    const stats = getExecutionPlanStats(agents, budget, { ignoreTaskId: task.id });
    const evidenceRequired = ['SUBMITTED', 'DISPUTED', 'SETTLED', 'REFUNDED'].includes(task.status);
    const evidenceCount = getTaskEvidence(task).length;
    const verifiedOwnership = agents.length - stats.blockedAgents.length;
    const ownershipReady = agents.length > 0 && verifiedOwnership === agents.length;
    const contractReady = String(task.acceptanceCriteria || '').length >= 8 && Number(task.challengeWindowHours || 0) > 0;

    return [
        {
            label: '可用承接',
            ok: agents.length > 0 && budget <= stats.totalAvailableCapacity && !stats.overCapacityAgents.length,
            detail: `${formatUSDC(budget)} / ${formatUSDC(stats.totalAvailableCapacity)}，已锁 ${formatUSDC(stats.totalLockedCapacity)}`
        },
        {
            label: '质押覆盖',
            ok: agents.length > 0 && stats.totalStake >= stats.requiredStake,
            detail: `${formatUSDC(stats.totalStake)} 质押，要求至少 ${formatUSDC(stats.requiredStake)}`
        },
        {
            label: '所有权证明',
            ok: ownershipReady,
            detail: ownershipReady ? 'Agent 均已校验' : `${verifiedOwnership}/${agents.length} 个 Agent 已校验`
        },
        {
            label: '验收契约',
            ok: contractReady,
            detail: contractReady ? `挑战窗口 ${getChallengeWindowLabel(task)}` : '缺少验收标准或挑战窗口'
        },
        {
            label: '证据状态',
            ok: !evidenceRequired || evidenceCount > 0,
            detail: evidenceRequired ? `${evidenceCount} 项证据` : '交付前暂不要求证据'
        }
    ];
}

function renderRiskChecks(task) {
    const checks = getTaskRiskChecks(task);
    const passed = checks.filter(check => check.ok).length;

    return `
        <div class="risk-check-panel">
            <div class="risk-check-head">
                <span>托管前风控</span>
                <strong>${passed}/${checks.length} 通过</strong>
            </div>
            <div class="risk-check-list">
                ${checks.map(check => `
                    <div class="${check.ok ? 'pass' : 'warn'}">
                        <strong>${check.label}</strong>
                        <span>${check.detail}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderOutcomeContract(task, options = {}) {
    const criteria = String(task.acceptanceCriteria || '').trim();
    const contractReady = criteria.length >= 8;
    const status = task.status || 'MATCHED';
    const challengeText = getChallengeStatus(task);
    const isFinal = ['SETTLED', 'REFUNDED', 'CANCELLED'].includes(status);
    const rules = [
        {
            label: '放款条件',
            text: isFinal
                ? '最终资金结果已写入结算或退款凭证。'
                : '用户验收通过，或挑战窗口结束且无争议，托管预算才会释放。'
        },
        {
            label: '争议条件',
            text: '交付未满足验收标准时，用户需要在挑战窗口内提交争议理由和证据。'
        },
        {
            label: '平台边界',
            text: '平台只记录契约、托管资金、证据和结算，不生产或接管 Agent。'
        }
    ];

    return `
        <div class="outcome-contract ${contractReady ? '' : 'warning'} ${options.detail ? 'detail' : ''}">
            <div>
                <span>${options.preview ? '下单前结果契约' : '结果验收'}</span>
                <p>${criteria || '请先写清楚可验收的结果标准，否则无法形成按结果付费的交易契约。'}</p>
            </div>
            <div>
                <span>挑战窗口</span>
                <strong>${getChallengeWindowLabel(task)}</strong>
                ${challengeText ? `<small>${challengeText}</small>` : '<small>用于验收后争议保护</small>'}
            </div>
            <div class="contract-rule-list ${options.compact ? 'compact' : ''}">
                ${rules.map(rule => `
                    <section>
                        <strong>${rule.label}</strong>
                        <small>${rule.text}</small>
                    </section>
                `).join('')}
            </div>
            ${renderContractFingerprint(task, { compact: options.compact })}
        </div>
    `;
}

function getFundingConfirmationItems(task) {
    const agents = task.selectedAgents || task.agents || [];
    const verifiedCount = agents.filter(isAgentOwnershipVerified).length;
    const contractFingerprint = getTaskContractFingerprint(task);
    return [
        {
            id: 'contract',
            label: '我确认这是按结果付费交易',
            detail: `验收标准和 ${getChallengeWindowLabel(task)} 挑战窗口将作为结算与争议依据；契约指纹 ${contractFingerprint}。`
        },
        {
            id: 'agents',
            label: '我确认执行方是创作者拥有的 Agent',
            detail: `${verifiedCount}/${agents.length} 个 Agent 所有权已校验，平台不生产或接管 Agent。`
        },
        {
            id: 'escrow',
            label: '我确认预算进入托管而不是直接放款',
            detail: `托管预算 ${formatUSDC(task.budget)}，验收通过或窗口结束无争议后才释放。`
        },
        {
            id: 'fee',
            label: '我确认费用拆分',
            detail: `协议费 ${formatUSDC(task.escrow?.protocolFee)}，创作者池 ${formatUSDC(task.escrow?.creatorPool)}。`
        }
    ];
}

function collectFundingConfirmationPayload(form, task) {
    const items = getFundingConfirmationItems(task);
    const confirmed = items.filter(item => form.querySelector(`[data-fund-confirm="${item.id}"]`)?.checked);
    if (confirmed.length !== items.length) {
        throw new Error('请先逐项确认托管规则');
    }

    const contractFingerprint = getTaskContractFingerprint(task);
    return {
        confirmed: confirmed.map(item => item.id),
        confirmedAt: Date.now(),
        contractFingerprint,
        summary: `用户确认结果契约、Agent 所有权、费用拆分和平台边界后托管预算（契约指纹 ${contractFingerprint}）`
    };
}

function getExecutionCommitmentItems(task) {
    const agents = task.selectedAgents || task.agents || [];
    const contractFingerprint = getTaskContractFingerprint(task);
    return [
        {
            id: 'boundary',
            label: '我确认任务在 Agent 服务边界内',
            detail: `${agents.length || 1} 个 Agent 将按已登记能力和服务边界承接，不由平台代为交付。`
        },
        {
            id: 'contract',
            label: '我确认按结果契约交付',
            detail: `交付物需要满足验收标准，并受 ${getChallengeWindowLabel(task)} 挑战窗口约束；契约指纹 ${contractFingerprint}。`
        },
        {
            id: 'evidence',
            label: '我确认会提交可核对证据',
            detail: '交付时需要提交结果摘要、证据引用和演示哈希，供用户验收和仲裁复核。'
        },
        {
            id: 'reputation',
            label: '我理解失败会影响 Agent 资产表现',
            detail: '争议退款会影响声誉、成功率和质押风险，后续匹配排序也会受到影响。'
        }
    ];
}

function collectExecutionCommitmentPayload(form, task) {
    const items = getExecutionCommitmentItems(task);
    const confirmed = items.filter(item => form.querySelector(`[data-execution-commitment="${item.id}"]`)?.checked);
    if (confirmed.length !== items.length) {
        throw new Error('请先逐项确认接单责任');
    }

    const contractFingerprint = getTaskContractFingerprint(task);
    return {
        confirmed: confirmed.map(item => item.id),
        committedAt: Date.now(),
        contractFingerprint,
        summary: `Agent 确认服务边界、结果契约、证据责任和声誉风险后接单执行（契约指纹 ${contractFingerprint}）`
    };
}

function getAcceptanceConfirmationItems(task) {
    const deliverableEvidenceCount = (task.deliverableEvidence || []).length;
    const contractFingerprint = getTaskContractFingerprint(task);
    return [
        {
            id: 'contract',
            label: '我确认交付物满足结果契约',
            detail: `验收标准已核对，交付结果达到本次任务的放款条件；契约指纹 ${contractFingerprint}。`
        },
        {
            id: 'evidence',
            label: '我确认已核对交付证据',
            detail: `已查看 ${deliverableEvidenceCount} 项 Agent 交付证据，证据足以支持验收。`
        },
        {
            id: 'no-dispute',
            label: '我确认本次不发起争议',
            detail: `确认后托管资金会结算，${getChallengeWindowLabel(task)} 挑战窗口不再作为本次退款入口。`
        },
        {
            id: 'payout',
            label: '我确认释放托管分账',
            detail: `协议费 ${formatUSDC(task.escrow?.protocolFee)}，创作者池 ${formatUSDC(task.escrow?.creatorPool)} 将按规则释放。`
        }
    ];
}

function collectAcceptanceConfirmationPayload(form, task) {
    const items = getAcceptanceConfirmationItems(task);
    const confirmed = items.filter(item => form.querySelector(`[data-acceptance-confirm="${item.id}"]`)?.checked);
    if (confirmed.length !== items.length) {
        throw new Error('请先逐项确认验收放款规则');
    }

    const contractFingerprint = getTaskContractFingerprint(task);
    return {
        confirmed: confirmed.map(item => item.id),
        acceptedAt: Date.now(),
        evidenceCount: (task.deliverableEvidence || []).length,
        contractFingerprint,
        summary: `用户确认交付满足契约、证据已核对且不发起争议后释放托管资金（契约指纹 ${contractFingerprint}）`
    };
}

function getComposerSelectedAgents() {
    const budget = Number(elements.taskBudget?.value || 0);
    const category = elements.taskCategory?.value || 'legal';

    if (state.selectedAgents.length) {
        return state.selectedAgents
            .map(name => state.agents.find(agent => agent.name === name))
            .filter(Boolean);
    }

    return state.agents
        .filter(agent => agent.category === category)
        .filter(isAgentOwnershipVerified)
        .filter(agent => getAgentAvailableEscrowLimit(agent) >= budget)
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 2);
}

function getSelectedAgentObjects() {
    return state.selectedAgents
        .map(name => state.agents.find(agent => agent.name === name))
        .filter(Boolean);
}

function renderMarketPlanTray() {
    if (!elements.marketPlanTray) return;

    const agents = getSelectedAgentObjects();
    const stats = getExecutionPlanStats(agents, getCurrentTaskBudget());
    const verifiedAgents = agents.filter(isAgentOwnershipVerified).length;

    if (!agents.length) {
        elements.marketPlanTray.innerHTML = `
            <div class="market-plan-empty">
                <div>
                    <span class="panel-kicker">Execution Plan</span>
                    <strong>还没有手选 Agent</strong>
                    <p>点击卡片上的“加入方案”，会同步到首页任务托管单；未通过所有权校验的 Agent 不能进入托管方案。</p>
                </div>
                <button class="btn btn-secondary btn-sm" type="button" data-market-plan-create>去发布任务</button>
            </div>
        `;
        return;
    }

    elements.marketPlanTray.innerHTML = `
        <div class="market-plan-head">
            <div>
                <span class="panel-kicker">Execution Plan</span>
                <strong>${agents.length} 个 Agent 已加入执行方案</strong>
                <p>所有权 ${verifiedAgents}/${agents.length} 已校验 · 可用承接 ${formatUSDC(stats.totalAvailableCapacity)} · 已锁 ${formatUSDC(stats.totalLockedCapacity)} · 质押 ${formatUSDC(stats.totalStake)}</p>
            </div>
            <div class="market-plan-actions">
                <button class="btn btn-secondary btn-sm" type="button" data-market-plan-create>去发布任务</button>
                <button class="btn btn-ghost btn-sm" type="button" data-market-plan-clear>清空</button>
            </div>
        </div>
        <div class="market-plan-agents">
            ${agents.map(agent => `
                <div class="market-plan-agent">
                    <span>${agent.name}</span>
                    ${renderOwnershipBadge(agent)}
                    <small>${formatUSDC(getAgentAvailableEscrowLimit(agent))} 可用 / ${formatUSDC(getAgentEscrowLimit(agent))} 上限 · ${formatUSDC(agent.stake)} 质押</small>
                    <button type="button" data-remove-agent="${agent.name}" aria-label="移除 ${agent.name}">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

function getComposerVerificationLabel() {
    const value = elements.taskVerification?.value || 'optimistic';
    if (value === 'tee') return 'TEE';
    if (value === 'zkml') return 'zkML';
    return 'Optimistic';
}

function renderHomeEscrowFlow() {
    if (!elements.homeEscrowFlow) return;

    const budget = Number(elements.taskBudget?.value || 0);
    const protocolFee = Math.round(budget * 5) / 100;
    const creatorPool = Math.round((budget - protocolFee) * 100) / 100;
    const challengeWindow = Number(elements.taskChallengeWindow?.value || 24);
    const criteriaReady = String(elements.taskAcceptanceCriteria?.value || '').trim().length >= 8;

    elements.homeEscrowFlow.innerHTML = `
        <div>
            <span>托管预算</span>
            <strong>${formatUSDC(budget)}</strong>
            <small>用户确认方案后锁定</small>
        </div>
        <div>
            <span>协议费</span>
            <strong>${formatUSDC(protocolFee)}</strong>
            <small>平台透明收取 5%</small>
        </div>
        <div>
            <span>创作者池</span>
            <strong>${formatUSDC(creatorPool)}</strong>
            <small>验收或仲裁后释放</small>
        </div>
        <div>
            <span>挑战窗口</span>
            <strong>${challengeWindow} 小时</strong>
            <small>${criteriaReady ? '验收标准已可签约' : '需要补清验收标准'}</small>
        </div>
    `;
}

function renderComposerPreview() {
    renderHomeEscrowFlow();

    if (!elements.composerPreview) return;

    const budget = Number(elements.taskBudget?.value || 0);
    const protocolFee = Math.round(budget * 5) / 100;
    const creatorPool = Math.round((budget - protocolFee) * 100) / 100;
    const agents = getComposerSelectedAgents();
    const selectedMode = state.selectedAgents.length > 0;
    const previewTask = {
        id: 'PREVIEW',
        status: 'MATCHED',
        budget,
        acceptanceCriteria: elements.taskAcceptanceCriteria?.value || '',
        challengeWindowHours: Number(elements.taskChallengeWindow?.value || 24),
        selectedAgents: agents,
        escrow: {
            protocolFee,
            creatorPool,
            splits: agents.map(agent => ({
                agentId: agent.id,
                agentName: agent.name,
                owner: agent.owner,
                amount: agents.length ? creatorPool / agents.length : 0
            }))
        }
    };
    const stats = getExecutionPlanStats(agents, budget);
    const capacityOk = agents.length > 0 && budget <= stats.totalAvailableCapacity && !stats.overCapacityAgents.length;
    const stakeOk = agents.length > 0 && stats.totalStake >= stats.requiredStake;

    elements.composerPreview.innerHTML = `
        <div class="preview-head">
            <div>
                <span class="panel-kicker">Escrow Preview</span>
                <strong>托管方案预览</strong>
            </div>
            <span class="${capacityOk && stakeOk ? 'pass' : 'warn'}">${capacityOk && stakeOk ? '可生成' : '需调整'}</span>
        </div>
        <div class="preview-money">
            <div><strong>${formatUSDC(budget)}</strong><span>任务预算</span></div>
            <div><strong>${formatUSDC(protocolFee)}</strong><span>协议费 5%</span></div>
            <div><strong>${formatUSDC(creatorPool)}</strong><span>创作者池</span></div>
            <div><strong>${getComposerVerificationLabel()}</strong><span>验证方式</span></div>
        </div>
        ${renderOutcomeContract(previewTask, { preview: true, compact: true })}
        <div class="preview-agents">
            <div class="preview-agents-head">
                <span>${selectedMode ? '已选 Agent' : '自动推荐 Agent'}</span>
                <small>可用承接 ${formatUSDC(stats.totalAvailableCapacity)} · 已锁 ${formatUSDC(stats.totalLockedCapacity)} · 质押 ${formatUSDC(stats.totalStake)}</small>
            </div>
            ${agents.length ? agents.map(agent => `
                <div class="preview-agent-pill">
                    <span>${agent.name}</span>
                    ${selectedMode ? `<button type="button" data-remove-agent="${agent.name}" aria-label="移除 ${agent.name}">×</button>` : ''}
                </div>
            `).join('') : '<p class="action-note">当前预算下没有已校验且承接上限足够的 Agent，请降低预算或先完成 Agent 所有权复核。</p>'}
        </div>
        ${renderRiskChecks(previewTask)}
    `;
    renderMarketPlanTray();
}

function getAgentOnboardDraft() {
    return {
        name: elements.agentName?.value.trim() || '待命名 Agent',
        owner: elements.agentOwner?.value.trim() || '待填写创作者',
        ownershipProof: elements.agentOwnershipProof?.value.trim() || '',
        category: elements.agentCategory?.value || 'legal',
        verification: elements.agentVerification?.value || 'Optimistic',
        price: Number(elements.agentPrice?.value || 0),
        stake: Number(elements.agentStake?.value || 0),
        escrowLimit: Number(elements.agentEscrowLimit?.value || 0),
        summary: elements.agentSummary?.value.trim() || '',
        serviceBoundary: elements.agentServiceBoundary?.value.trim() || '',
        tags: elements.agentTags?.value.split(',').map(tag => tag.trim()).filter(Boolean) || [],
        creatorDeclaration: {
            ownsAgent: Boolean(elements.agentOwnsDeclaration?.checked),
            nonCustody: Boolean(elements.agentCustodyDeclaration?.checked),
            outcomePayout: Boolean(elements.agentOutcomeDeclaration?.checked)
        }
    };
}

function renderAgentOnboardPreview() {
    if (!elements.agentOnboardPreview) return;

    const draft = getAgentOnboardDraft();
    const ownership = getOwnershipStatus({ ownershipProof: draft.ownershipProof });
    const ownershipReady = ownership.status === 'verified';
    const proofSubmitted = Boolean(draft.ownershipProof);
    const summaryReady = draft.summary.length >= 16;
    const boundaryReady = draft.serviceBoundary.length >= 16;
    const stakeRequired = draft.escrowLimit * 2;
    const stakeReady = draft.escrowLimit > 0 && draft.stake >= stakeRequired;
    const economicsReady = draft.price > 0 && draft.escrowLimit >= draft.price;
    const declarationReady = Object.values(draft.creatorDeclaration).every(Boolean);
    const readyCount = [proofSubmitted, summaryReady, boundaryReady, stakeReady, economicsReady, declarationReady].filter(Boolean).length;
    const canEnterPool = ownershipReady && summaryReady && boundaryReady && stakeReady && economicsReady && declarationReady;
    const statusLabel = canEnterPool
        ? '可进入可信匹配池'
        : proofSubmitted && !ownershipReady
            ? '待平台复核后入池'
            : '继续补充准入材料';

    const checks = [
        {
            label: '所有权证明',
            ok: ownershipReady,
            detail: proofSubmitted ? `${ownership.label} · ${ownership.method}` : '未提交 DID、Agent NFT、模型哈希或仓库签名'
        },
        {
            label: '能力说明',
            ok: summaryReady,
            detail: summaryReady ? '已说明 Agent 能解决的任务' : '至少写清楚 Agent 能解决什么任务'
        },
        {
            label: '服务边界',
            ok: boundaryReady,
            detail: boundaryReady ? '已声明不接任务和人工复核边界' : '需要说明不接哪些任务、需要哪些材料'
        },
        {
            label: '质押覆盖',
            ok: stakeReady,
            detail: `${formatUSDC(draft.stake)} 质押，建议至少 ${formatUSDC(stakeRequired)}`
        },
        {
            label: '承接上限',
            ok: economicsReady,
            detail: economicsReady ? `${formatUSDC(draft.escrowLimit)} 上限覆盖报价` : '单任务上限需要大于起步报价'
        },
        {
            label: '创作者声明',
            ok: declarationReady,
            detail: declarationReady ? '已确认所有权、非托管和按结果结算' : '需要确认平台不接管 Agent，收益来自任务结果'
        }
    ];

    elements.agentOnboardPreview.innerHTML = `
        <div class="onboard-preview-head">
            <div>
                <span class="panel-kicker">Admission Preview</span>
                <strong>${statusLabel}</strong>
                <p>${draft.name} · ${getCategoryLabel(draft.category)} · ${draft.verification} · ${draft.owner}</p>
            </div>
            <span class="${canEnterPool ? 'pass' : 'warn'}">${readyCount}/${checks.length} 通过</span>
        </div>
        <div class="onboard-preview-grid">
            <div><strong>${formatUSDC(draft.price)}</strong><span>起步报价</span></div>
            <div><strong>${formatUSDC(draft.escrowLimit)}</strong><span>单任务上限</span></div>
            <div><strong>${formatUSDC(draft.stake)}</strong><span>质押保证金</span></div>
            <div><strong>${draft.tags.length || 0}</strong><span>能力标签</span></div>
        </div>
        <div class="onboard-check-list">
            ${checks.map(check => `
                <div class="${check.ok ? 'pass' : 'warn'}">
                    <strong>${check.label}</strong>
                    <span>${check.detail}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function getFallbackActorForStatus(status) {
    const actorsByStatus = {
        MATCHED: 'platform',
        FUNDED: 'user',
        IN_PROGRESS: 'agent',
        SUBMITTED: 'agent',
        DISPUTED: 'user',
        SETTLED: 'platform',
        REFUNDED: 'arbitrator',
        CANCELLED: 'user'
    };
    return actorsByStatus[status] || 'platform';
}

function getAuditTimeline(task) {
    const createdAt = Number(task.createdAt || Date.now());
    return (task.history || []).map((item, index) => {
        const at = Number(item.at || createdAt + index * 60000);
        return {
            ...item,
            actor: item.actor || getFallbackActorForStatus(item.status),
            at,
            auditId: item.auditId || makeEvidenceHash(`${task.id}-${item.status}-${item.actor}-${item.note}-${at}`)
                .replace('sha256-demo-', 'AUD-')
                .toUpperCase()
        };
    });
}

function getAuditDetail(task, item) {
    const escrow = task.settlement?.escrow || task.escrow || {};
    const evidenceCount = getTaskEvidence(task).length;
    const disputeEvidenceCount = (task.dispute?.evidence || task.disputeEvidence || []).length;

    switch (item.status) {
        case 'MATCHED':
            return `匹配 ${getTaskAgents(task).length} 个 Agent，预算 ${formatUSDC(task.budget)}`;
        case 'FUNDED':
            return `托管锁定 ${formatUSDC(task.budget)}，协议费 ${formatUSDC(escrow.protocolFee)}，创作者池 ${formatUSDC(escrow.creatorPool)}`;
        case 'IN_PROGRESS':
            return `执行中，资金仍在托管账户，不直接进入创作者钱包`;
        case 'SUBMITTED':
            return `交付证据 ${evidenceCount} 项，挑战窗口 ${getChallengeWindowLabel(task)}`;
        case 'DISPUTED':
            return `争议证据 ${disputeEvidenceCount} 项，等待仲裁核对任务契约和交付证据`;
        case 'SETTLED':
            return `已结算创作者池 ${formatUSDC(escrow.creatorPool)}，协议费 ${formatUSDC(escrow.protocolFee)}`;
        case 'REFUNDED':
            return `退款 ${formatUSDC(task.settlement?.refund || task.budget)}，记录负面声誉或扣罚建议`;
        case 'CANCELLED':
            return `托管前取消，没有发生资金结算`;
        default:
            return `状态记录已写入交易历史`;
    }
}

function renderAuditTrail(task) {
    const timeline = getAuditTimeline(task);
    if (!timeline.length) return '';

    return `
        <details class="audit-trail" open>
            <summary>
                <span>交易审计链</span>
                <strong>${timeline.length} 条记录</strong>
            </summary>
            <div class="audit-steps">
                ${timeline.map(item => `
                    <article class="audit-step">
                        <div class="audit-step-head">
                            <strong>${getStatusLabel(item.status)}</strong>
                            <span>${getActorLabel(item.actor)} · ${formatTime(item.at)}</span>
                        </div>
                        <p>${item.note || '状态已更新'}</p>
                        <small>${getAuditDetail(task, item)} · ${item.auditId}${renderSignatureLabel(item.signature)}</small>
                    </article>
                `).join('')}
            </div>
        </details>
    `;
}

function getSettlementReasonLabel(result) {
    const labels = {
        accepted: '用户验收通过',
        challenge_window_expired: '挑战窗口结束自动结算',
        agent_won_dispute: '仲裁支持 Agent',
        user_won_dispute: '仲裁支持用户退款'
    };
    return labels[result] || '结算规则触发';
}

function getReceiptTxIds(task, eventTypes) {
    const types = new Set(eventTypes);
    return getEscrowEvents(task)
        .filter(event => types.has(event.type) && event.txId)
        .map(event => event.txId);
}

function renderReceiptBreakdown(items) {
    return `
        <div class="receipt-breakdown">
            ${items.map(item => `
                <div>
                    <span>${item.label}</span>
                    <strong>${item.value}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

function renderReceiptTxList(txIds) {
    if (!txIds.length) {
        return '<small>资金流水编号：等待资金事件写入</small>';
    }

    return `
        <div class="receipt-tx-list">
            <span>关联资金流水</span>
            ${txIds.slice(0, 4).map(txId => `<strong>${txId}</strong>`).join('')}
        </div>
    `;
}

function renderArbitrationDecision(decision) {
    if (!decision) return '';

    return `
        <div class="arbitration-decision">
            <span>仲裁裁决依据</span>
            <strong>${decision.outcome === 'agent' ? '支持 Agent' : '支持用户'}</strong>
            <p>${decision.reason || '暂无裁决理由'}</p>
            <small>${decision.evidenceReview || '暂无证据核对说明'} · ${decision.decisionId || '待生成裁决编号'}</small>
        </div>
    `;
}

function renderAcceptanceConfirmation(confirmation) {
    if (!confirmation) return '';

    const contractFingerprint = confirmation.contractFingerprint
        ? ` · 契约指纹 ${confirmation.contractFingerprint}`
        : '';

    return `
        <div class="arbitration-decision acceptance-confirmation">
            <span>用户验收确认</span>
            <strong>确认放款</strong>
            <p>${confirmation.summary || '用户确认交付满足契约并释放托管资金。'}</p>
            <small>${confirmation.evidenceCount || 0} 项交付证据 · ${formatTime(confirmation.acceptedAt)}${contractFingerprint}</small>
        </div>
    `;
}

function renderSettlementReceipt(task) {
    if (!task.settlement) return '';

    const settlement = task.settlement;
    const reputationEvents = settlement.reputationEvents || [];
    const isRefund = task.status === 'REFUNDED' || settlement.result === 'user_won_dispute';
    const reason = getSettlementReasonLabel(settlement.result);
    const contractFingerprint = getTaskContractFingerprint(task);

    if (isRefund) {
        const refundAmount = Number(settlement.refund || task.budget || 0);
        const refundTxIds = getReceiptTxIds(task, ['user_refund']);
        const disputeEvidenceCount = (task.dispute?.evidence || task.disputeEvidence || []).length;
        return `
            <div class="settlement-receipt refund">
                <div class="receipt-heading">
                    <span>退款凭证</span>
                    <strong>${formatUSDC(refundAmount)}</strong>
                </div>
                ${renderReceiptBreakdown([
                    { label: '原托管预算', value: formatUSDC(task.budget) },
                    { label: '退回用户', value: formatUSDC(refundAmount) },
                    { label: '创作者释放', value: formatUSDC(0) },
                    { label: '争议证据', value: `${disputeEvidenceCount} 项` }
                ])}
                <p>${reason}：托管预算退回用户；${settlement.slashSuggested ? '建议记录负面声誉或扣罚保证金。' : '无扣罚建议。'}</p>
                <div class="receipt-lines">
                    <span>退款时间 ${formatTime(settlement.refundedAt)}</span>
                    <span>结果依据 任务契约 + 争议证据</span>
                    <span>契约指纹 ${contractFingerprint}</span>
                </div>
                ${renderArbitrationDecision(settlement.decision)}
                ${renderReceiptTxList(refundTxIds)}
                ${renderReputationEvents(reputationEvents)}
            </div>
        `;
    }

    const escrow = settlement.escrow || task.escrow || {};
    const payouts = getSettlementPayouts(task);
    const releaseTxIds = getReceiptTxIds(task, ['protocol_fee', 'creator_payout']);
    const evidenceCount = getTaskEvidence(task).length;
    const protocolFee = Number(escrow.protocolFee || 0);
    const creatorPool = Number(escrow.creatorPool || 0);
    const budget = Number(task.budget || protocolFee + creatorPool);

    return `
        <div class="settlement-receipt">
            <div class="receipt-heading">
                <span>结算凭证</span>
                <strong>${formatUSDC(creatorPool)}</strong>
            </div>
            ${renderReceiptBreakdown([
                { label: '托管预算', value: formatUSDC(budget) },
                { label: '平台协议费', value: formatUSDC(protocolFee) },
                { label: '创作者收入池', value: formatUSDC(creatorPool) },
                { label: '交付证据', value: `${evidenceCount} 项` }
            ])}
            <p>${reason}：按验收契约释放托管资金，平台只收取协议费，剩余进入创作者分账。</p>
            <div class="receipt-lines">
                <span>分账公式 ${formatUSDC(budget)} - ${formatUSDC(protocolFee)} = ${formatUSDC(creatorPool)}</span>
                <span>结算时间 ${formatTime(settlement.settledAt)}</span>
                <span>契约指纹 ${contractFingerprint}</span>
            </div>
            ${renderAcceptanceConfirmation(settlement.acceptanceConfirmation)}
            ${renderArbitrationDecision(settlement.decision)}
            ${renderReceiptTxList(releaseTxIds)}
            ${payouts.length ? `
                <div class="payout-list">
                    ${payouts.map(item => `
                        <div>
                            <span>${item.agentName || item.agentId || 'Agent'}${item.owner ? ` · ${item.owner}` : ''}</span>
                            <strong>${formatUSDC(item.amount)}</strong>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${renderReputationEvents(reputationEvents)}
        </div>
    `;
}

function makeEscrowTxId(seed) {
    return makeEvidenceHash(seed).replace('sha256-demo-', 'TX-').toUpperCase();
}

function getEscrowEventLabel(type) {
    const labels = {
        escrow_deposit: '预算托管',
        protocol_fee: '协议费入账',
        creator_payout: '创作者分账',
        user_refund: '用户退款'
    };
    return labels[type] || '资金事件';
}

function buildLocalEscrowEvent(task, type, actor, amount, counterparty, note) {
    const at = Date.now();
    return {
        id: `${task.id}-${type}-${at}`,
        type,
        actor,
        amount: Math.round(Number(amount || 0) * 100) / 100,
        currency: 'USDC',
        counterparty,
        txId: makeEscrowTxId(`${task.id}-${type}-${actor}-${amount}-${counterparty}-${at}`),
        note,
        at
    };
}

function buildSettlementEscrowEvents(task, reason) {
    const escrow = task.settlement?.escrow || task.escrow || {};
    const events = [
        buildLocalEscrowEvent(
            task,
            'protocol_fee',
            'platform',
            escrow.protocolFee,
            'Qianzhi Protocol',
            `平台协议费入账 · ${reason}`
        )
    ];

    (escrow.splits || []).forEach(split => {
        events.push(buildLocalEscrowEvent(
            task,
            'creator_payout',
            'platform',
            split.amount,
            split.owner || split.agentName || split.agentId || 'Agent Creator',
            `创作者分账释放 · ${reason}`
        ));
    });

    return events.filter(event => event.amount > 0);
}

function buildRefundEscrowEvent(task, reason) {
    return buildLocalEscrowEvent(
        task,
        'user_refund',
        'platform',
        task.settlement?.refund || task.budget,
        'Task Creator',
        `托管预算退回用户 · ${reason}`
    );
}

function appendLocalEscrowEvents(task, events) {
    task.escrowEvents = [
        ...(task.escrowEvents || []),
        ...events.filter(event => event.amount > 0)
    ];
}

function getEscrowEvents(task) {
    return [...(task.escrowEvents || [])].sort((a, b) => Number(a.at || 0) - Number(b.at || 0));
}

function renderEscrowLedger(task) {
    const events = getEscrowEvents(task);
    if (!events.length) {
        return '<p class="action-note">资金动作发生后，这里会显示托管、分账或退款流水。</p>';
    }

    return `
        <div class="escrow-ledger">
            ${events.map(event => `
                <div class="escrow-ledger-row">
                    <div>
                        <strong>${getEscrowEventLabel(event.type)}</strong>
                        <span>${event.counterparty || getActorLabel(event.actor)}</span>
                    </div>
                    <div>
                        <strong>${formatUSDC(event.amount)}</strong>
                        <small>${event.txId || '待生成交易编号'} · ${formatTime(event.at)}</small>
                    </div>
                    <p>${event.note || '资金事件已记录'}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderReputationEvents(events) {
    if (!events.length) return '';

    return `
        <div class="reputation-events">
            ${events.map(event => `
                <div>
                    <span>${event.agentName || event.agentId}</span>
                    <strong>${formatMetricChange(event.reputationBefore, event.reputationAfter)}</strong>
                    <small>成功率 ${formatMetricChange(event.successRateBefore, event.successRateAfter, '%')}${event.stakeSlash ? ` · 扣罚 ${formatUSDC(event.stakeSlash)}` : ''}</small>
                </div>
            `).join('')}
        </div>
    `;
}

function buildArbitrationDecision(task, action, payload = {}) {
    const defaults = getDefaultResolutionPayload(task, action);
    const outcome = payload.outcome || defaults.outcome;
    const decidedAt = Date.now();
    return {
        outcome,
        reason: payload.reason || defaults.reason,
        evidenceReview: payload.evidenceReview || defaults.evidenceReview,
        decisionId: makeEvidenceHash(`${task.id}-${outcome}-${payload.reason || defaults.reason}-${decidedAt}`)
            .replace('sha256-demo-', 'ARB-')
            .toUpperCase(),
        arbitrator: state.connected ? '0x7A...QZ' : `demo:${state.actor}`,
        decidedAt
    };
}

function buildSettlement(task, result, reputationEvents = [], decision = null, acceptanceConfirmation = null) {
    const escrow = task.escrow || {};
    const settlement = {
        result,
        settledAt: Date.now(),
        escrow,
        payouts: escrow.splits || [],
        contractFingerprint: getTaskContractFingerprint(task),
        reputationEvents
    };
    if (decision) settlement.decision = decision;
    if (acceptanceConfirmation) settlement.acceptanceConfirmation = acceptanceConfirmation;
    return settlement;
}

function buildRefundSettlement(task, reputationEvents = [], decision = null) {
    const settlement = {
        result: 'user_won_dispute',
        refundedAt: Date.now(),
        refund: task.budget,
        slashSuggested: true,
        contractFingerprint: getTaskContractFingerprint(task),
        reputationEvents
    };
    if (decision) settlement.decision = decision;
    return settlement;
}

function getAgentByPayout(payout) {
    return state.agents.find(agent =>
        agent.id === payout.agentId ||
        agent.name === payout.agentName
    );
}

function getEarningsLedger() {
    const summary = {
        creatorIncome: 0,
        protocolFees: 0,
        settledTasks: 0,
        refundAmount: 0
    };
    const byAgent = new Map();

    state.tasks.forEach(task => {
        const settlement = task.settlement;
        if (!settlement) return;

        const isRefund = task.status === 'REFUNDED' || settlement.result === 'user_won_dispute';
        if (isRefund) {
            summary.refundAmount += Number(settlement.refund || task.budget || 0);
            return;
        }

        const escrow = settlement.escrow || task.escrow || {};
        const payouts = settlement.payouts || escrow.splits || [];
        summary.creatorIncome += Number(escrow.creatorPool || 0);
        summary.protocolFees += Number(escrow.protocolFee || 0);
        summary.settledTasks += 1;

        payouts.forEach(payout => {
            const agent = getAgentByPayout(payout) || {};
            const key = payout.agentId || agent.id || payout.agentName;
            if (!key) return;

            const existing = byAgent.get(key) || {
                agentName: payout.agentName || agent.name || '未知 Agent',
                owner: payout.owner || agent.owner || '未知创作者',
                amount: 0,
                tasks: 0,
                reputation: agent.reputation,
                successRate: agent.successRate
            };
            existing.amount += Number(payout.amount || 0);
            existing.tasks += 1;
            existing.reputation = agent.reputation ?? existing.reputation;
            existing.successRate = agent.successRate ?? existing.successRate;
            byAgent.set(key, existing);
        });
    });

    return {
        summary,
        rows: [...byAgent.values()].sort((a, b) => b.amount - a.amount)
    };
}

function renderEarningsLedger() {
    if (!elements.earningsSummary || !elements.earningsList) return;

    const ledger = getEarningsLedger();
    elements.earningsSummary.innerHTML = `
        <div class="earning-metric">
            <strong>${formatUSDC(ledger.summary.creatorIncome)}</strong>
            <span>累计创作者收入</span>
        </div>
        <div class="earning-metric">
            <strong>${formatUSDC(ledger.summary.protocolFees)}</strong>
            <span>平台协议费</span>
        </div>
        <div class="earning-metric">
            <strong>${ledger.summary.settledTasks}</strong>
            <span>已结算任务</span>
        </div>
        <div class="earning-metric">
            <strong>${formatUSDC(ledger.summary.refundAmount)}</strong>
            <span>争议退款金额</span>
        </div>
    `;

    if (!ledger.rows.length) {
        elements.earningsList.innerHTML = '<div class="empty-state">完成结算后，这里会按 Agent 汇总创作者收益。</div>';
        return;
    }

    elements.earningsList.innerHTML = ledger.rows.map(row => `
        <article class="earning-row">
            <div>
                <h3>${row.agentName}</h3>
                <p>${row.owner}</p>
            </div>
            <div>
                <strong>${formatUSDC(row.amount)}</strong>
                <span>${row.tasks} 笔结算</span>
            </div>
            <div>
                <strong>${row.reputation ?? '-'} / ${row.successRate ?? '-'}%</strong>
                <span>声誉 / 成功率</span>
            </div>
        </article>
    `).join('');
}

function getCreatorConsoleLedger() {
    const creatorMap = new Map();
    const ensureCreator = (owner) => {
        const key = owner || '未知创作者';
        if (!creatorMap.has(key)) {
            creatorMap.set(key, {
                owner: key,
                agentCount: 0,
                agentNames: [],
                settledIncome: 0,
                pendingIncome: 0,
                disputedIncome: 0,
                refundedAmount: 0,
                stake: 0,
                escrowLimit: 0,
                tasks: 0,
                reputationTotal: 0,
                successTotal: 0,
                verifiedAgents: 0,
                reviewAgents: 0,
                missingOwnership: 0
            });
        }
        return creatorMap.get(key);
    };

    state.agents.forEach(agent => {
        const row = ensureCreator(agent.owner);
        row.agentCount += 1;
        row.agentNames.push(agent.name);
        row.stake += Number(agent.stake || 0);
        row.escrowLimit += getAgentEscrowLimit(agent);
        row.tasks += Number(agent.tasks || 0);
        row.reputationTotal += Number(agent.reputation || 0);
        row.successTotal += Number(agent.successRate || 0);
        const ownershipStatus = getOwnershipStatus(agent).status;
        if (ownershipStatus === 'verified') {
            row.verifiedAgents += 1;
        } else if (ownershipStatus === 'review') {
            row.reviewAgents += 1;
        } else {
            row.missingOwnership += 1;
        }
    });

    state.tasks.forEach(task => {
        const escrow = task.settlement?.escrow || task.escrow || {};
        const payouts = getSettlementPayouts(task);
        const isRefund = task.status === 'REFUNDED' || task.settlement?.result === 'user_won_dispute';
        const isPending = ['FUNDED', 'IN_PROGRESS', 'SUBMITTED'].includes(task.status);
        const isDisputed = task.status === 'DISPUTED';

        payouts.forEach(payout => {
            const agent = getAgentByPayout(payout) || {};
            const row = ensureCreator(payout.owner || agent.owner);
            const amount = Number(payout.amount || 0);

            if (isRefund) {
                row.refundedAmount += amount || Number(task.settlement?.refund || task.budget || 0) / Math.max(1, payouts.length);
            } else if (task.settlement) {
                row.settledIncome += amount;
            } else if (isDisputed) {
                row.disputedIncome += amount;
            } else if (isPending) {
                row.pendingIncome += amount || Number(escrow.creatorPool || 0) / Math.max(1, payouts.length);
            }
        });
    });

    const rows = [...creatorMap.values()].map(row => ({
        ...row,
        averageReputation: row.agentCount ? Math.round(row.reputationTotal / row.agentCount) : 0,
        averageSuccessRate: row.agentCount ? Math.round(row.successTotal / row.agentCount) : 0,
        withdrawable: Math.max(0, row.settledIncome - row.refundedAmount)
    })).sort((a, b) => b.withdrawable - a.withdrawable || b.agentCount - a.agentCount);

    return {
        summary: {
            creators: rows.length,
            agents: state.agents.length,
            withdrawable: rows.reduce((sum, row) => sum + row.withdrawable, 0),
            stake: rows.reduce((sum, row) => sum + row.stake, 0),
            verifiedAgents: rows.reduce((sum, row) => sum + row.verifiedAgents, 0),
            reviewAgents: rows.reduce((sum, row) => sum + row.reviewAgents, 0)
        },
        rows
    };
}

function getWithdrawalStatusLabel(status) {
    const labels = {
        PENDING_REVIEW: '审核中',
        APPROVED: '已批准',
        REJECTED: '已拒绝'
    };
    return labels[status] || '待处理';
}

function getReservedWithdrawalAmount(owner) {
    return state.withdrawals
        .filter(item => item.owner === owner && item.status !== 'REJECTED')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function applyWithdrawalLocks(ledger) {
    const rows = ledger.rows.map(row => {
        const requestedWithdrawals = getReservedWithdrawalAmount(row.owner);
        return {
            ...row,
            requestedWithdrawals,
            withdrawable: Math.max(0, Number(row.withdrawable || 0) - requestedWithdrawals)
        };
    });

    return {
        summary: {
            ...ledger.summary,
            withdrawable: rows.reduce((sum, row) => sum + row.withdrawable, 0),
            pendingWithdrawals: state.withdrawals
                .filter(item => item.status === 'PENDING_REVIEW')
                .reduce((sum, item) => sum + Number(item.amount || 0), 0)
        },
        rows
    };
}

function normalizeWithdrawal(withdrawal) {
    return {
        ...withdrawal,
        signature: withdrawal.signature || {},
        reviewSignature: withdrawal.reviewSignature || null,
        reviewNote: withdrawal.reviewNote || ''
    };
}

async function buildWithdrawalSignature(owner, amount, action = 'withdraw-request', withdrawalId = null) {
    const issuedAt = Date.now();
    const signer = getSignatureSigner();
    const signatureId = makeSignatureId(`${owner}-${action}-${amount}-${withdrawalId || 'new'}-${signer}-${issuedAt}`);

    const signature = {
        signatureId,
        signer,
        actor: state.actor,
        action,
        owner,
        amount,
        issuedAt
    };

    if (withdrawalId) {
        signature.withdrawalId = withdrawalId;
    }

    const message = [
        'Qianzhi withdrawal action',
        `Owner: ${owner}`,
        `Action: ${action}`,
        `Amount: ${amount} USDC`,
        withdrawalId ? `Withdrawal: ${withdrawalId}` : 'Withdrawal: new',
        `Actor: ${state.actor}`,
        `IssuedAt: ${issuedAt}`
    ].join('\n');

    return attachWalletProof(signature, message);
}

function renderWithdrawalQueue() {
    if (!elements.withdrawalList) return;

    if (!state.withdrawals.length) {
        elements.withdrawalList.innerHTML = '<div class="empty-state compact">还没有提现请求。创作者发起提现后，平台会在这里审核结算和争议风险。</div>';
        return;
    }

    elements.withdrawalList.innerHTML = state.withdrawals.map(item => {
        const canReview = state.actor === 'platform' && item.status === 'PENDING_REVIEW';
        const requestSignature = item.signature?.signatureId || '待签名';
        const signer = item.signature?.signer || '待确认签名人';
        const reviewSignature = item.reviewSignature?.signatureId
            ? ` · 审核签名 ${item.reviewSignature.signatureId}`
            : '';
        return `
            <article class="withdrawal-row" data-withdrawal-id="${item.id}">
                <div>
                    <strong>${item.id} · ${getWithdrawalStatusLabel(item.status)}</strong>
                    <span>${item.owner} · ${formatTime(item.requestedAt)}</span>
                    <small>${requestSignature} · ${signer}${reviewSignature}</small>
                </div>
                <div>
                    <strong>${formatUSDC(item.amount)}</strong>
                    ${canReview ? `
                        <span class="withdrawal-actions">
                            <button class="btn btn-primary btn-sm" type="button" data-withdraw-action="approve">批准</button>
                            <button class="btn btn-ghost btn-sm" type="button" data-withdraw-action="reject">拒绝</button>
                        </span>
                    ` : `<span>${item.reviewNote || '等待平台审核'}</span>`}
                </div>
            </article>
        `;
    }).join('');
}

function renderCreatorConsole() {
    if (!elements.creatorSummary || !elements.creatorList) return;

    const ledger = applyWithdrawalLocks(state.creatorLedger || getCreatorConsoleLedger());
    elements.creatorSummary.innerHTML = `
        <div class="creator-metric">
            <strong>${ledger.summary.creators}</strong>
            <span>创作者</span>
        </div>
        <div class="creator-metric">
            <strong>${ledger.summary.agents}</strong>
            <span>已登记 Agent</span>
        </div>
        <div class="creator-metric">
            <strong>${formatUSDC(ledger.summary.withdrawable)}</strong>
            <span>可提现演示余额</span>
        </div>
        <div class="creator-metric">
            <strong>${ledger.summary.verifiedAgents || 0}/${ledger.summary.agents}</strong>
            <span>已校验 Agent</span>
        </div>
        <div class="creator-metric">
            <strong>${formatUSDC(ledger.summary.pendingWithdrawals || 0)}</strong>
            <span>提现审核中</span>
        </div>
    `;

    if (!ledger.rows.length) {
        elements.creatorList.innerHTML = '<div class="empty-state">创作者注册 Agent 后，这里会显示经营状态。</div>';
        renderWithdrawalQueue();
        return;
    }

    elements.creatorList.innerHTML = ledger.rows.map(row => `
        <article class="creator-account">
            <div>
                <h3>${row.owner}</h3>
                <p>${row.agentNames.slice(0, 3).join(' / ')}${row.agentNames.length > 3 ? ' 等' : ''}</p>
                <button
                    class="btn btn-secondary btn-sm"
                    type="button"
                    data-withdraw-owner="${encodeURIComponent(row.owner)}"
                    ${state.actor !== 'agent' || row.withdrawable <= 0 ? 'disabled' : ''}
                    title="${state.actor !== 'agent' ? '需要 Agent 创作者身份操作' : row.withdrawable <= 0 ? '暂无可提现余额' : ''}"
                >申请提现</button>
                ${row.requestedWithdrawals ? `<small class="withdrawal-note">已锁定提现请求 ${formatUSDC(row.requestedWithdrawals)}</small>` : ''}
            </div>
            <div class="creator-account-stats">
                <div><strong>${row.agentCount}</strong><span>Agent</span></div>
                <div><strong>${formatUSDC(row.withdrawable)}</strong><span>可提现</span></div>
                <div><strong>${formatUSDC(row.pendingIncome)}</strong><span>待结算</span></div>
                <div><strong>${formatUSDC(row.disputedIncome)}</strong><span>争议中</span></div>
                <div><strong>${formatUSDC(row.stake)}</strong><span>质押</span></div>
                <div><strong>${row.verifiedAgents || 0}/${row.agentCount}</strong><span>所有权校验</span></div>
                <div><strong>${row.averageReputation} / ${row.averageSuccessRate}%</strong><span>声誉 / 成功率</span></div>
            </div>
        </article>
    `).join('');

    renderWithdrawalQueue();
}

function renderChangeLog() {
    if (!elements.changeLogList) return;

    elements.changeLogList.innerHTML = changeLogEntries.map(entry => `
        <article class="change-log-item">
            <div class="change-log-meta">
                <strong>${entry.type}</strong>
                <span>${entry.date}</span>
            </div>
            <h3>${entry.title}</h3>
            <p>${entry.summary}</p>
            <small>${entry.impact}</small>
        </article>
    `).join('');
}

function formatRatioPercent(part, total) {
    if (!total) return '0%';
    return `${Math.round((part / total) * 100)}%`;
}

function sumTaskBudget(tasks) {
    return tasks.reduce((sum, task) => sum + Number(task.budget || 0), 0);
}

function getBackendReadinessItems(environment) {
    if (state.backendReadiness && Array.isArray(state.backendReadiness.capabilities)) {
        return state.backendReadiness.capabilities.map(item => {
            const mapped = {
                id: item.id || '',
                label: item.label || item.id || '后端能力',
                value: item.value || '待确认',
                state: ['ready', 'mock', 'todo'].includes(item.state) ? item.state : 'todo',
                note: item.note || '后端未返回说明'
            };
            if (mapped.id === 'auth' && state.connected && state.walletAddress) {
                return {
                    ...mapped,
                    value: `浏览器钱包 ${shortenAddress(state.walletAddress)}`,
                    state: 'mock',
                    note: '前端已拿到真实钱包地址；mock 后端仍未做登录态、JWT 或服务端验签'
                };
            }
            if (mapped.id === 'signature' && state.connected && state.walletAddress) {
                return {
                    ...mapped,
                    value: '钱包可发起 personal_sign',
                    state: 'mock',
                    note: '前端会把钱包签名随操作凭证提交；mock 后端只保存字段，真实后端仍需验签'
                };
            }
            return mapped;
        });
    }

    const isApiConnected = state.apiAvailable;
    const isLiveBackend = environment.tone === 'live';
    const isMockBackend = environment.tone === 'mock';
    const hasEscrowEvents = state.tasks.some(task => getEscrowEvents(task).length > 0);
    const hasEvidence = state.tasks.some(task => getTaskEvidence(task).length > 0);
    const hasSignedHistory = state.tasks.some(task => getAuditTimeline(task).some(item => getHistorySignatureId(item)));
    const hasArbitration = state.tasks.some(task => task.status === 'DISPUTED' || task.settlement?.decision);
    const hasWithdrawals = state.withdrawals.length > 0;

    const apiState = isLiveBackend ? 'ready' : isMockBackend ? 'mock' : isApiConnected ? 'mock' : 'todo';
    const demoState = isApiConnected ? 'mock' : 'todo';

    return [
        {
            label: 'API 连接',
            value: environment.label,
            state: apiState,
            note: isLiveBackend ? '真实业务后端已接入' : '当前还不是生产后端'
        },
        {
            label: '账号与鉴权',
            value: state.connected && state.walletAddress ? `浏览器钱包 ${shortenAddress(state.walletAddress)}` : '演示签名',
            state: isLiveBackend ? 'ready' : state.connected ? 'mock' : 'todo',
            note: state.connected
                ? '前端已连接浏览器钱包；真实后端仍需校验登录态、JWT、Session 或钱包签名'
                : '未连接钱包时使用 demo 签名演示，不能当作真实鉴权'
        },
        {
            label: '任务状态机',
            value: isApiConnected ? 'API 校验中' : '前端演示',
            state: isLiveBackend ? 'ready' : demoState,
            note: '托管、接单、提交、验收、争议和仲裁都应由后端校验'
        },
        {
            label: '资金与出账',
            value: hasEscrowEvents ? '已有流水演示' : '待资金流水',
            state: isLiveBackend ? 'ready' : hasEscrowEvents ? 'mock' : 'todo',
            note: '真实版本需要支付流水、链上交易哈希或出账单号'
        },
        {
            label: '证据上传',
            value: hasEvidence ? '已有证据引用' : '待上传接口',
            state: isLiveBackend ? 'ready' : hasEvidence ? 'mock' : 'todo',
            note: '真实交付物需要文件上传、哈希和访问权限控制'
        },
        {
            label: '签名凭证',
            value: state.connected ? '钱包签名可用' : hasSignedHistory ? '已有演示签名' : '待签名',
            state: isLiveBackend ? 'ready' : (state.connected || hasSignedHistory) ? 'mock' : 'todo',
            note: state.connected
                ? '操作会尝试调用 personal_sign；mock 后端保存签名字段，真实后端必须验签'
                : '真实后端不能信任前端角色字段，需要校验签名和身份'
        },
        {
            label: '争议仲裁',
            value: hasArbitration ? '已有争议链路' : '待真实权限',
            state: isLiveBackend ? 'ready' : hasArbitration ? 'mock' : 'todo',
            note: '需要仲裁员身份、裁决权限、附件和申诉状态'
        },
        {
            label: '提现与结算',
            value: hasWithdrawals ? '已有提现队列' : '待出账审核',
            state: isLiveBackend ? 'ready' : hasWithdrawals ? 'mock' : 'todo',
            note: '创作者提现需要钱包地址、审核记录和真实出账状态'
        }
    ];
}

function renderBackendReadinessPanel(environment) {
    const readinessItems = getBackendReadinessItems(environment);
    const nextAsks = state.backendReadiness?.nextAsks || [
        'API Base URL',
        '登录/鉴权方式',
        '资金流水和上传接口',
        '仲裁与提现字段'
    ];
    const readyCount = readinessItems.filter(item => item.state === 'ready').length;
    const mockCount = readinessItems.filter(item => item.state === 'mock').length;
    const pendingCount = readinessItems.length - readyCount - mockCount;

    return `
        <div class="backend-readiness">
            <div class="backend-readiness-head">
                <div>
                    <span>真实后端接入就绪</span>
                    <strong>${readyCount}/${readinessItems.length} 真实可用 · ${mockCount} 项演示可跑</strong>
                </div>
                <small>${pendingCount ? `${pendingCount} 项需要后端资料或接口` : '当前关键接入项已闭合'}</small>
            </div>
            <div class="backend-readiness-grid">
                ${readinessItems.map(item => `
                    <div class="${item.state}">
                        <span>${item.label}</span>
                        <strong>${item.value}</strong>
                        <small>${item.note}</small>
                    </div>
                `).join('')}
            </div>
            <div class="backend-next-asks">
                <strong>下一步向后端要</strong>
                ${nextAsks.map(item => `<span>${item}</span>`).join('')}
            </div>
        </div>
    `;
}

function getTrustDashboardMetrics() {
    const tasks = state.tasks || [];
    const agents = state.agents || [];
    const activeEscrowStatuses = ['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'DISPUTED'];
    const evidenceRequiredStatuses = ['SUBMITTED', 'DISPUTED', 'SETTLED', 'REFUNDED'];

    const verifiedAgents = agents.filter(isAgentOwnershipVerified).length;
    const reviewAgents = agents.filter(agent => getOwnershipStatus(agent).reviewRequired).length;
    const contractReadyTasks = tasks.filter(task => task.acceptanceCriteria && Number(task.challengeWindowHours || 0) > 0).length;
    const auditedTasks = tasks.filter(task => (task.history || []).length > 0).length;
    const activeEscrowTasks = tasks.filter(task => activeEscrowStatuses.includes(task.status));
    const evidenceRequiredTasks = tasks.filter(task => evidenceRequiredStatuses.includes(task.status));
    const evidenceCoveredTasks = evidenceRequiredTasks.filter(task => getTaskEvidence(task).length > 0);
    const disputedTasks = tasks.filter(task => task.status === 'DISPUTED');
    const settledTasks = tasks.filter(task => task.status === 'SETTLED');
    const refundedTasks = tasks.filter(task => task.status === 'REFUNDED');
    const settledCreatorPool = settledTasks.reduce((sum, task) => {
        const escrow = task.settlement?.escrow || task.escrow || {};
        return sum + Number(escrow.creatorPool || 0);
    }, 0);
    const environment = getEnvironmentStatus();

    const ownershipRatio = agents.length ? verifiedAgents / agents.length : 0;
    const contractRatio = tasks.length ? contractReadyTasks / tasks.length : 0;
    const evidenceRatio = evidenceRequiredTasks.length ? evidenceCoveredTasks.length / evidenceRequiredTasks.length : 1;
    const auditRatio = tasks.length ? auditedTasks / tasks.length : 0;
    const disputePenalty = tasks.length ? Math.min(disputedTasks.length / tasks.length, 1) : 0;
    const coverageScore = Math.round(
        ownershipRatio * 24
        + contractRatio * 20
        + evidenceRatio * 20
        + auditRatio * 18
        + (1 - disputePenalty) * 18
    );

    return {
        coverageScore,
        verifiedAgents,
        totalAgents: agents.length,
        reviewAgents,
        contractReadyTasks,
        totalTasks: tasks.length,
        auditedTasks,
        evidenceCoveredTasks: evidenceCoveredTasks.length,
        evidenceRequiredTasks: evidenceRequiredTasks.length,
        evidenceMissingTasks: Math.max(0, evidenceRequiredTasks.length - evidenceCoveredTasks.length),
        activeEscrowAmount: sumTaskBudget(activeEscrowTasks),
        activeEscrowCount: activeEscrowTasks.length,
        settledCreatorPool,
        settledCount: settledTasks.length,
        refundedCount: refundedTasks.length,
        disputedCount: disputedTasks.length,
        environment
    };
}

function renderTrustDashboard() {
    if (!elements.trustDashboard) return;

    const metrics = getTrustDashboardMetrics();
    const scoreTone = metrics.coverageScore >= 80
        ? 'strong'
        : metrics.coverageScore >= 60
            ? 'watch'
            : 'risk';
    const evidenceValue = metrics.evidenceRequiredTasks
        ? `${metrics.evidenceCoveredTasks}/${metrics.evidenceRequiredTasks}`
        : '暂未要求';
    const watchItems = [
        {
            label: '所有权复核',
            value: metrics.reviewAgents ? `${metrics.reviewAgents} 个待处理` : '无待复核',
            tone: metrics.reviewAgents ? 'watch' : 'strong'
        },
        {
            label: '争议队列',
            value: metrics.disputedCount ? `${metrics.disputedCount} 笔待裁决` : '无待裁决',
            tone: metrics.disputedCount ? 'watch' : 'strong'
        },
        {
            label: '证据缺口',
            value: metrics.evidenceMissingTasks ? `${metrics.evidenceMissingTasks} 笔需补证` : '覆盖正常',
            tone: metrics.evidenceMissingTasks ? 'risk' : 'strong'
        },
        {
            label: '运行来源',
            value: metrics.environment.label,
            tone: metrics.environment.tone === 'error' ? 'risk' : metrics.environment.tone === 'live' ? 'strong' : 'watch'
        }
    ];

    elements.trustDashboard.innerHTML = `
        <div class="trust-score ${scoreTone}">
            <span>交易保障覆盖</span>
            <strong>${metrics.coverageScore}</strong>
            <small>按所有权、契约、证据、审计链和争议状态综合估算</small>
        </div>
        <div class="trust-metrics">
            <div>
                <strong>${metrics.verifiedAgents}/${metrics.totalAgents}</strong>
                <span>Agent 所有权已校验</span>
            </div>
            <div>
                <strong>${formatUSDC(metrics.activeEscrowAmount)}</strong>
                <span>${metrics.activeEscrowCount} 笔资金托管中</span>
            </div>
            <div>
                <strong>${formatUSDC(metrics.settledCreatorPool)}</strong>
                <span>${metrics.settledCount} 笔已进入创作者池</span>
            </div>
            <div>
                <strong>${evidenceValue}</strong>
                <span>交付阶段证据覆盖</span>
            </div>
            <div>
                <strong>${formatRatioPercent(metrics.auditedTasks, metrics.totalTasks)}</strong>
                <span>任务审计链覆盖</span>
            </div>
            <div>
                <strong>${metrics.refundedCount}</strong>
                <span>已退款闭环</span>
            </div>
        </div>
        <div class="trust-watchlist">
            ${watchItems.map(item => `
                <div class="${item.tone}">
                    <span>${item.label}</span>
                    <strong>${item.value}</strong>
                </div>
            `).join('')}
        </div>
        ${renderBackendReadinessPanel(metrics.environment)}
    `;
}

function applyAgentOutcomeToState(task, success) {
    const selected = task.selectedAgents || [];
    const splits = task.escrow?.splits || [];

    return selected.map(agentSnapshot => {
        const agentName = agentSnapshot.name || agentSnapshot.agentName;
        const agentId = agentSnapshot.id;
        const agent = state.agents.find(item => item.id === agentId || item.name === agentName);
        if (!agent) return null;

        const split = splits.find(item => item.agentId === agent.id || item.agentName === agent.name) || {};
        const previousTasks = Number(agent.tasks || 0);
        const previousReputation = Number(agent.reputation || 0);
        const previousSuccessRate = Number(agent.successRate || 0);
        const previousStake = Number(agent.stake || 0);
        const nextTasks = previousTasks + 1;
        const outcomeScore = success ? 100 : 0;
        const nextSuccessRate = Math.round(((previousSuccessRate * previousTasks) + outcomeScore) / nextTasks);
        const nextReputation = success
            ? Math.min(100, previousReputation + 1)
            : Math.max(0, previousReputation - 6);
        const slashAmount = success ? 0 : Math.round(Math.min(previousStake * 0.02, Number(split.amount || 0)) * 100) / 100;
        const nextStake = Math.max(0, Math.round((previousStake - slashAmount) * 100) / 100);

        agent.tasks = nextTasks;
        agent.successRate = nextSuccessRate;
        agent.reputation = nextReputation;
        agent.stake = nextStake;

        return {
            agentId: agent.id,
            agentName: agent.name,
            owner: agent.owner,
            outcome: success ? 'success' : 'refund',
            reputationBefore: previousReputation,
            reputationAfter: nextReputation,
            successRateBefore: previousSuccessRate,
            successRateAfter: nextSuccessRate,
            tasksBefore: previousTasks,
            tasksAfter: nextTasks,
            stakeSlash: slashAmount,
            stakeAfter: nextStake
        };
    }).filter(Boolean);
}

function enrichAgent(agent) {
    const local = seedAgents.find(item => item.id === agent.id) || {};
    return {
        ...local,
        ...agent,
        summary: agent.summary || local.summary || '该 Agent 已在平台登记能力、报价、质押和声誉，可参与托管任务。',
        ownershipProof: agent.ownershipProof || local.ownershipProof || '',
        ownershipStatus: agent.ownershipStatus || local.ownershipStatus || null,
        serviceBoundary: agent.serviceBoundary || local.serviceBoundary || '',
        tags: agent.tags || local.tags || []
    };
}

function normalizeTask(task) {
    const createdAt = Number(task.createdAt || Date.now());
    const history = (task.history || []).map((item, index) => ({
        ...item,
        at: item.at || createdAt + index * 60 * 1000
    }));

    return {
        ...task,
        createdAt,
        acceptanceCriteria: task.acceptanceCriteria || '交付物需要覆盖任务目标、风险点、可执行建议，并能被用户复核。',
        challengeWindowHours: Number(task.challengeWindowHours || 24),
        deliverableEvidence: task.deliverableEvidence || [],
        escrowEvents: task.escrowEvents || [],
        selectedAgents: (task.selectedAgents || task.agents || []).map(agent => {
            if (typeof agent === 'string') {
                return state.agents.find(item => item.name === agent) || { name: agent };
            }
            return enrichAgent(agent);
        }),
        history
    };
}

function getCurrentTaskBudget() {
    return Number(elements.taskBudget?.value || 0);
}

function getCurrentTaskCategory() {
    return elements.taskCategory?.value || 'legal';
}

function isAgentFitForCurrentTask(agent) {
    const budget = getCurrentTaskBudget();
    return agent.category === getCurrentTaskCategory()
        && isAgentOwnershipVerified(agent)
        && getAgentAvailableEscrowLimit(agent) >= budget
        && getAgentStake(agent) >= getRequiredStakeForBudget(budget);
}

function getAgentFitChecks(agent) {
    const budget = getCurrentTaskBudget();
    const taskCategory = getCurrentTaskCategory();
    const lockedCapacity = getAgentLockedCapacity(agent);
    const availableCapacity = getAgentAvailableEscrowLimit(agent);
    const stake = getAgentStake(agent);
    const ownership = getOwnershipStatus(agent);

    return [
        {
            label: '类型',
            ok: agent.category === taskCategory,
            detail: `${getCategoryLabel(agent.category)} / ${getCategoryLabel(taskCategory)}`
        },
        {
            label: '所有权',
            ok: ownership.status === 'verified',
            detail: ownership.status === 'verified' ? ownership.label : '待复核后入池'
        },
        {
            label: '可用',
            ok: availableCapacity >= budget,
            detail: `${formatUSDC(availableCapacity)} / ${formatUSDC(budget)}，已锁 ${formatUSDC(lockedCapacity)}`
        },
        {
            label: '质押',
            ok: stake >= getRequiredStakeForBudget(budget),
            detail: `${formatUSDC(stake)} / ${formatUSDC(getRequiredStakeForBudget(budget))}`
        }
    ];
}

function renderAgentFitChecks(agent) {
    const checks = getAgentFitChecks(agent);
    const passed = checks.filter(item => item.ok).length;

    return `
        <div class="agent-fit-panel">
            <div class="agent-fit-head">
                <span>当前任务适配</span>
                <strong>${passed}/${checks.length} 通过</strong>
            </div>
            <div class="agent-fit-list">
                ${checks.map(item => `
                    <div class="${item.ok ? 'pass' : 'warn'}">
                        <strong>${item.label}</strong>
                        <span>${item.detail}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getFilteredAgents() {
    let list = [...state.agents];

    if (state.filter !== 'all') {
        list = list.filter(agent => agent.category === state.filter);
    }

    if (state.ownershipFilter !== 'all') {
        list = list.filter(agent => {
            const status = getOwnershipStatus(agent);
            if (state.ownershipFilter === 'verified') {
                return status.status === 'verified';
            }
            if (state.ownershipFilter === 'review') {
                return status.reviewRequired;
            }
            return true;
        });
    }

    if (state.capacityFilter === 'budget') {
        const budget = getCurrentTaskBudget();
        list = list.filter(agent => getAgentAvailableEscrowLimit(agent) >= budget);
    }

    if (state.fitFilter === 'current') {
        list = list.filter(isAgentFitForCurrentTask);
    }

    if (state.query) {
        const query = state.query.toLowerCase();
        list = list.filter(agent =>
            agent.name.toLowerCase().includes(query) ||
            agent.owner.toLowerCase().includes(query) ||
            agent.summary.toLowerCase().includes(query) ||
            getOwnershipProof(agent).toLowerCase().includes(query) ||
            getServiceBoundary(agent).toLowerCase().includes(query) ||
            agent.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }

    switch (state.sort) {
        case 'price-low':
            list.sort((a, b) => a.price - b.price);
            break;
        case 'success':
            list.sort((a, b) => b.successRate - a.successRate);
            break;
        case 'tasks':
            list.sort((a, b) => b.tasks - a.tasks);
            break;
        default:
            list.sort((a, b) => b.reputation - a.reputation);
    }

    return list;
}

function renderMarketSafetySummary(list) {
    if (!elements.marketSafetySummary) return;

    const agents = Array.isArray(list) ? list : getFilteredAgents();
    const verifiedAgents = agents.filter(isAgentOwnershipVerified);
    const reviewAgents = agents.filter(agent => getOwnershipStatus(agent).reviewRequired);
    const totalStake = agents.reduce((sum, agent) => sum + getAgentStake(agent), 0);
    const totalEscrowLimit = agents.reduce((sum, agent) => sum + getAgentEscrowLimit(agent), 0);
    const totalLockedCapacity = agents.reduce((sum, agent) => sum + getAgentLockedCapacity(agent), 0);
    const totalAvailableCapacity = agents.reduce((sum, agent) => sum + getAgentAvailableEscrowLimit(agent), 0);
    const averageReputation = agents.length
        ? Math.round(agents.reduce((sum, agent) => sum + Number(agent.reputation || 0), 0) / agents.length)
        : 0;
    const trustedRatio = agents.length ? Math.round((verifiedAgents.length / agents.length) * 100) : 0;
    const selectedAgents = getSelectedAgentObjects();
    const selectedStats = getExecutionPlanStats(selectedAgents, getCurrentTaskBudget());
    const currentBudget = getCurrentTaskBudget();
    const budgetReadyAgents = agents.filter(agent => getAgentAvailableEscrowLimit(agent) >= currentBudget);
    const fitAgents = agents.filter(isAgentFitForCurrentTask);

    elements.marketSafetySummary.innerHTML = `
        <section class="market-safety-panel">
            <div class="market-safety-head">
                <div>
                    <span class="panel-kicker">可信供给池</span>
                    <h3>${verifiedAgents.length}/${agents.length} 个 Agent 可进入托管</h3>
                    <p>${reviewAgents.length ? `${reviewAgents.length} 个 Agent 仍待所有权复核；未校验 Agent 不能加入执行方案。` : '当前筛选池的 Agent 所有权状态可用于托管前风控判断。'}</p>
                </div>
                <span class="market-safety-score">${trustedRatio}%</span>
            </div>
            <div class="market-safety-grid">
                <div><strong>${formatUSDC(totalStake)}</strong><span>筛选池总质押</span></div>
                <div><strong>${formatUSDC(totalAvailableCapacity)}</strong><span>筛选池可用承接</span></div>
                <div><strong>${formatUSDC(totalLockedCapacity)}</strong><span>活跃任务已锁</span></div>
                <div><strong>${averageReputation}</strong><span>平均声誉</span></div>
                <div><strong>${fitAgents.length}</strong><span>适配当前任务</span></div>
            </div>
            <div class="market-safety-foot">
                <span>当前任务类型 ${getCategoryLabel(getCurrentTaskCategory())}</span>
                <span>当前任务预算 ${formatUSDC(currentBudget)}</span>
                <span>可承接预算 ${budgetReadyAgents.length}/${agents.length}</span>
                <span>已选 Agent ${selectedAgents.length}</span>
                <span>筛选池总上限 ${formatUSDC(totalEscrowLimit)}</span>
                <span>已选方案可用承接 ${formatUSDC(selectedStats.totalAvailableCapacity)}</span>
                <span>已选方案质押 ${formatUSDC(selectedStats.totalStake)}</span>
            </div>
        </section>
    `;
}

function renderAgents() {
    const list = getFilteredAgents();
    renderCreatorConsole();
    renderTrustDashboard();
    renderMarketSafetySummary(list);
    renderMarketPlanTray();
    renderAgentDetailPage();
    elements.resultCount.textContent = `${list.length} 个 Agent`;

    if (!list.length) {
        elements.agentGrid.innerHTML = '<div class="empty-state">没有找到匹配的 Agent。可以放宽筛选或发布任务等待平台推荐。</div>';
        return;
    }

    elements.agentGrid.innerHTML = list.map(agent => {
        const selected = state.selectedAgents.includes(agent.name);
        const canSelect = isAgentOwnershipVerified(agent);
        return `
        <article class="agent-card ${selected ? 'selected' : ''}" data-agent-id="${agent.id}">
            <div class="card-topline">
                <span class="category-badge">${getCategoryLabel(agent.category)}</span>
                <span class="verification">${agent.verification}</span>
            </div>
            <h3>${agent.name}</h3>
            <p class="owner">${agent.owner}</p>
            <p class="proof-line">所有权：${getOwnershipProof(agent)} ${renderOwnershipBadge(agent)}</p>
            <p class="summary">${agent.summary}</p>
            <div class="tag-row">
                ${agent.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
            <div class="agent-metrics">
                <div><strong>${agent.reputation}</strong><span>声誉</span></div>
                <div><strong>${agent.successRate}%</strong><span>成功率</span></div>
                <div><strong>${agent.tasks}</strong><span>成交</span></div>
            </div>
            ${renderAgentFitChecks(agent)}
            <div class="agent-footer">
                <div>
                    <span class="price">${formatUSDC(agent.price)}</span>
                    <span class="price-note">起 / 任务</span>
                </div>
                <div class="agent-card-actions">
                    <button
                        class="btn ${selected ? 'btn-primary' : 'btn-secondary'} btn-sm"
                        type="button"
                        data-agent-select="${agent.id}"
                        ${canSelect ? '' : 'disabled'}
                        title="${canSelect ? '' : '通过所有权校验后才能加入托管方案'}"
                    >${selected ? '已加入' : '加入方案'}</button>
                    <button class="btn btn-ghost btn-sm" type="button" data-agent-view="${agent.id}">查看</button>
                </div>
            </div>
        </article>
    `;
    }).join('');
}

function renderActorUI() {
    if (elements.actorIndicator) {
        elements.actorIndicator.textContent = `当前身份：${getActorLabel()} · ${actorHints[state.actor]}`;
    }

    elements.roleSwitch?.querySelectorAll('[data-actor]').forEach(button => {
        button.classList.toggle('active', button.dataset.actor === state.actor);
    });
}

function getDisputedTasks() {
    return state.tasks.filter(task => task.status === 'DISPUTED');
}

function renderEvidenceItems(evidence) {
    if (!evidence.length) return '<small>暂无证据引用</small>';

    return evidence.map(item => `
        <small>${item.label || item.type || '证据引用'} · ${item.uri || '待上传'} · ${item.hash || '待生成哈希'}</small>
    `).join('');
}

function renderArbitrationCenter() {
    if (!elements.arbitrationSummary || !elements.arbitrationList) return;

    const disputes = getDisputedTasks();
    const evidenceCount = disputes.reduce((sum, task) => sum + getTaskEvidence(task).length, 0);
    const escrowAtRisk = disputes.reduce((sum, task) => sum + Number(task.budget || 0), 0);
    const creatorPoolAtRisk = disputes.reduce((sum, task) => {
        const escrow = task.escrow || {};
        return sum + Number(escrow.creatorPool || 0);
    }, 0);

    elements.arbitrationSummary.innerHTML = `
        <div class="arbitration-metric">
            <strong>${disputes.length}</strong>
            <span>待仲裁争议</span>
        </div>
        <div class="arbitration-metric">
            <strong>${formatUSDC(escrowAtRisk)}</strong>
            <span>争议托管金额</span>
        </div>
        <div class="arbitration-metric">
            <strong>${formatUSDC(creatorPoolAtRisk)}</strong>
            <span>待裁决创作者池</span>
        </div>
        <div class="arbitration-metric">
            <strong>${evidenceCount}</strong>
            <span>证据引用</span>
        </div>
    `;

    if (!disputes.length) {
        elements.arbitrationList.innerHTML = '<div class="empty-state">当前没有争议任务。用户发起争议后，仲裁材料会集中显示在这里。</div>';
        return;
    }

    elements.arbitrationList.innerHTML = disputes.map(task => {
        const disputeEvidence = task.dispute?.evidence || task.disputeEvidence || [];
        const deliverableEvidence = task.deliverableEvidence || [];
        const escrow = task.escrow || {};

        return `
            <article class="arbitration-case" data-task-id="${task.id}">
                <div>
                    <div class="task-title-row">
                        <span class="task-id">${task.id}</span>
                        <span class="status-pill">${getStatusLabel(task.status)}</span>
                    </div>
                    <h3>${getTaskTitle(task)}</h3>
                    <div class="case-meta">
                        <span>${getCategoryLabel(task.category)}</span>
                        <span>${formatUSDC(task.budget)}</span>
                        <span>${task.verification}</span>
                        <span>${getTaskAgents(task).join(' / ')}</span>
                    </div>
                    <div class="case-evidence-grid">
                        <div class="case-panel">
                            <span>验收契约</span>
                            <p>${task.acceptanceCriteria}</p>
                            <small>挑战窗口：${getChallengeWindowLabel(task)}</small>
                        </div>
                        <div class="case-panel">
                            <span>Agent 交付证据</span>
                            ${renderEvidenceItems(deliverableEvidence)}
                        </div>
                        <div class="case-panel warning">
                            <span>用户争议理由</span>
                            <p>${task.dispute?.reason || '用户已发起争议，等待补充理由。'}</p>
                            ${renderEvidenceItems(disputeEvidence)}
                        </div>
                        <div class="case-panel">
                            <span>托管分账</span>
                            <small>协议费 ${formatUSDC(escrow.protocolFee)} · 创作者池 ${formatUSDC(escrow.creatorPool)}</small>
                            <small>争议期间资金保持锁定，裁决后才结算或退款。</small>
                        </div>
                    </div>
                </div>
                <aside class="arbitration-side">
                    <strong>裁决入口</strong>
                    <p>仲裁员需要同时核对任务契约、Agent 交付证据、用户争议证据和审计链。</p>
                    <div class="task-actions">
                        ${renderTaskActions(task)}
                        <button class="btn btn-ghost btn-sm" type="button" data-task-detail="${task.id}">查看详情</button>
                    </div>
                </aside>
            </article>
        `;
    }).join('');
}

function getTaskActionItems(task) {
    return taskActionMap[task.status] || [];
}

function hasCurrentActorAction(task) {
    return getTaskActionItems(task).some(item => getRequiredActor(item.action) === state.actor
        && !getTaskActionBlockReason(task, item.action));
}

function getCurrentActorActions(task) {
    return getTaskActionItems(task).filter(item => getRequiredActor(item.action) === state.actor
        && !getTaskActionBlockReason(task, item.action));
}

function getActionQueueEmptyMessage() {
    const messages = {
        user: '用户身份当前没有待处理交易。可以发布新任务，或切到“全部”查看历史交易。',
        agent: '创作者身份当前没有待处理交易。可以去创作者入口注册 Agent，或等待新的接单任务。',
        arbitrator: '仲裁员身份当前没有待裁决争议。出现争议后会在这里进入裁决。',
        platform: '平台系统当前没有待处理自动结算或复核动作。'
    };
    return messages[state.actor] || '当前身份没有待处理交易。';
}

function renderTaskActionQueue() {
    if (!elements.taskActionQueue) return;

    const waitingTasks = state.tasks
        .filter(hasCurrentActorAction)
        .sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));

    if (!waitingTasks.length) {
        elements.taskActionQueue.innerHTML = `
            <section class="action-queue-panel empty">
                <div>
                    <span class="panel-kicker">当前身份行动队列</span>
                    <h3>${getActorLabel()}暂无待处理</h3>
                    <p>${getActionQueueEmptyMessage()}</p>
                </div>
            </section>
        `;
        return;
    }

    elements.taskActionQueue.innerHTML = `
        <section class="action-queue-panel">
            <div class="action-queue-head">
                <div>
                    <span class="panel-kicker">当前身份行动队列</span>
                    <h3>${getActorLabel()}需要处理 ${waitingTasks.length} 笔交易</h3>
                </div>
                <button class="btn btn-ghost btn-sm" type="button" data-task-filter-jump="action">只看待处理</button>
            </div>
            <div class="action-queue-list">
                ${waitingTasks.slice(0, 3).map(task => {
                    const actions = getCurrentActorActions(task).map(item => item.label).join(' / ');
                    return `
                        <article class="action-queue-item" data-task-id="${task.id}">
                            <div>
                                <span>${task.id} · ${getStatusLabel(task.status)}</span>
                                <strong>${getTaskTitle(task)}</strong>
                                <small>${getCategoryLabel(task.category)} · ${formatUSDC(task.budget)} · ${actions}</small>
                            </div>
                            <button class="btn btn-secondary btn-sm" type="button" data-task-detail="${task.id}">进入交易档案</button>
                        </article>
                    `;
                }).join('')}
            </div>
            ${waitingTasks.length > 3 ? `<p class="action-queue-more">还有 ${waitingTasks.length - 3} 笔待处理交易，可切到“${getActorLabel()}待处理”筛选查看。</p>` : ''}
        </section>
    `;
}

function getFilteredTasksForBoard() {
    const filters = {
        all: () => true,
        action: hasCurrentActorAction,
        active: task => ['MATCHED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED'].includes(task.status),
        submitted: task => task.status === 'SUBMITTED',
        disputed: task => task.status === 'DISPUTED',
        completed: task => ['SETTLED', 'REFUNDED', 'CANCELLED'].includes(task.status)
    };
    const predicate = filters[state.taskFilter] || filters.all;
    return state.tasks.filter(predicate);
}

function renderTaskBoardSummary() {
    if (!elements.taskBoardSummary) return;

    const activeEscrowStatuses = ['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'DISPUTED'];
    const activeTasks = state.tasks.filter(task => activeEscrowStatuses.includes(task.status));
    const waitingForActor = state.tasks.filter(hasCurrentActorAction);
    const disputedTasks = state.tasks.filter(task => task.status === 'DISPUTED');
    const settledTasks = state.tasks.filter(task => task.status === 'SETTLED');
    const escrowAmount = activeTasks.reduce((sum, task) => sum + Number(task.budget || 0), 0);
    const creatorPool = settledTasks.reduce((sum, task) => {
        const escrow = task.settlement?.escrow || task.escrow || {};
        return sum + Number(escrow.creatorPool || 0);
    }, 0);

    elements.taskBoardSummary.innerHTML = `
        <div>
            <strong>${state.tasks.length}</strong>
            <span>全部交易</span>
        </div>
        <div>
            <strong>${waitingForActor.length}</strong>
            <span>${getActorLabel()}待处理</span>
        </div>
        <div>
            <strong>${formatUSDC(escrowAmount)}</strong>
            <span>托管中资金</span>
        </div>
        <div>
            <strong>${disputedTasks.length}</strong>
            <span>争议中</span>
        </div>
        <div>
            <strong>${formatUSDC(creatorPool)}</strong>
            <span>已结算创作者池</span>
        </div>
    `;
}

function renderTaskStatusFilters() {
    if (!elements.taskStatusFilters) return;

    const count = predicate => state.tasks.filter(predicate).length;
    const filters = [
        { id: 'all', label: '全部', count: state.tasks.length },
        { id: 'action', label: `${getActorLabel()}待处理`, count: count(hasCurrentActorAction) },
        { id: 'active', label: '进行中', count: count(task => ['MATCHED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED'].includes(task.status)) },
        { id: 'submitted', label: '待验收', count: count(task => task.status === 'SUBMITTED') },
        { id: 'disputed', label: '争议中', count: count(task => task.status === 'DISPUTED') },
        { id: 'completed', label: '已完成', count: count(task => ['SETTLED', 'REFUNDED', 'CANCELLED'].includes(task.status)) }
    ];

    elements.taskStatusFilters.innerHTML = filters.map(filter => `
        <button
            class="task-filter ${state.taskFilter === filter.id ? 'active' : ''}"
            type="button"
            data-task-filter="${filter.id}"
            aria-pressed="${state.taskFilter === filter.id ? 'true' : 'false'}"
        >
            <span>${filter.label}</span>
            <strong>${filter.count}</strong>
        </button>
    `).join('');
}

function renderTasks() {
    renderActorUI();
    renderEarningsLedger();
    renderCreatorConsole();
    renderArbitrationCenter();
    renderTrustDashboard();
    renderTaskBoardSummary();
    renderTaskActionQueue();
    renderTaskStatusFilters();
    renderTaskDetailPage();

    if (!state.tasks.length) {
        elements.taskList.innerHTML = '<div class="empty-state">还没有托管任务。发布第一个任务后，它会出现在这里。</div>';
        return;
    }

    const visibleTasks = getFilteredTasksForBoard();

    if (!visibleTasks.length) {
        elements.taskList.innerHTML = '<div class="empty-state">当前筛选下没有任务，可以切换状态或发布新的托管任务。</div>';
        return;
    }

    elements.taskList.innerHTML = visibleTasks.map(task => {
        const progress = statusProgress[task.status] || task.progress || 10;
        return `
            <article class="task-item" data-task-id="${task.id}">
                <div class="task-main">
                    <div class="task-title-row">
                        <span class="task-id">${task.id}</span>
                        <span class="status-pill">${getStatusLabel(task.status)}</span>
                    </div>
                    <h3>${getTaskTitle(task)}</h3>
                    <p>${getCategoryLabel(task.category)} · ${formatUSDC(task.budget)} · ${task.verification}</p>
                    ${renderOutcomeContract(task, { compact: true })}
                    <div class="assigned-agents">
                        ${getTaskAgents(task).map(agent => `<span>${agent}</span>`).join('')}
                    </div>
                    ${renderRiskChecks(task)}
                    ${task.escrow ? `
                        <div class="escrow-line">
                            <span>协议费 ${formatUSDC(task.escrow.protocolFee)}</span>
                            <span>创作者池 ${formatUSDC(task.escrow.creatorPool)}</span>
                        </div>
                    ` : ''}
                    ${task.deliverable ? `<p class="deliverable">交付物：${task.deliverable}</p>` : ''}
                    ${renderEvidenceBundle(task)}
                    ${renderSettlementReceipt(task)}
                    ${renderAuditTrail(task)}
                    <div class="task-actions">
                        ${renderTaskActions(task)}
                        <button class="btn btn-ghost btn-sm" type="button" data-task-detail="${task.id}">查看详情</button>
                    </div>
                </div>
                <div class="progress-block">
                    <span>${progress}%</span>
                    <div class="progress-track"><div style="width:${progress}%"></div></div>
                    <small>${state.apiAvailable ? 'API 状态机' : '本地演示'}</small>
                </div>
            </article>
        `;
    }).join('');
}

function renderTaskActions(task) {
    const button = ({ action, label, style = 'secondary' }) => {
        const requiredActor = getRequiredActor(action);
        const actorBlocked = requiredActor !== state.actor;
        const ruleBlockedReason = getTaskActionBlockReason(task, action);
        const disabled = actorBlocked || Boolean(ruleBlockedReason);
        const title = actorBlocked ? `需要${getActorLabel(requiredActor)}身份操作` : ruleBlockedReason;
        return `
            <button
                class="btn btn-${style} btn-sm"
                type="button"
                data-task-action="${action}"
                ${disabled ? 'disabled' : ''}
                title="${title}"
            >${label}</button>
        `;
    };

    const actions = getTaskActionItems(task);
    return actions.length
        ? actions.map(button).join('')
        : '<span class="action-note">交易流程已结束</span>';
}

function getHistorySignatureId(item) {
    if (item.signature?.signatureId) return item.signature.signatureId;
    const match = String(item.note || '').match(/SIG-[A-Z0-9]{8,}/);
    return match ? match[0] : '';
}

function renderTaskDetailAgents(task) {
    const agents = task.selectedAgents || task.agents || [];
    if (!agents.length) {
        return '<div class="empty-state compact">当前任务还没有匹配 Agent。</div>';
    }

    return agents.map(agentItem => {
        const agent = typeof agentItem === 'string'
            ? state.agents.find(item => item.name === agentItem) || { name: agentItem, owner: '待确认创作者' }
            : agentItem;

        return `
            <article class="detail-agent">
                <div>
                    <strong>${agent.name || agent.agentName || agent.id || '未知 Agent'}</strong>
                    <span>${agent.owner || '待确认创作者'}</span>
                </div>
                ${renderOwnershipBadge(agent)}
                <small>质押 ${formatUSDC(agent.stake)} · 可用承接 ${formatUSDC(getAgentAvailableEscrowLimit(agent, { ignoreTaskId: task.id }))} / ${formatUSDC(agent.escrowLimit)}</small>
            </article>
        `;
    }).join('');
}

function renderTaskEscrowDetail(task) {
    const escrow = task.escrow || {};
    const splits = escrow.splits || [];

    return `
        <div class="detail-escrow-grid">
            <div><strong>${formatUSDC(task.budget)}</strong><span>托管预算</span></div>
            <div><strong>${formatUSDC(escrow.protocolFee)}</strong><span>协议费</span></div>
            <div><strong>${formatUSDC(escrow.creatorPool)}</strong><span>创作者池</span></div>
        </div>
        ${splits.length ? `
            <div class="detail-splits">
                ${splits.map(split => `
                    <div>
                        <span>${split.agentName || split.agentId || 'Agent'}</span>
                        <strong>${formatUSDC(split.amount)}</strong>
                    </div>
                `).join('')}
            </div>
        ` : '<p class="action-note">生成托管方案后会显示分账明细。</p>'}
    `;
}

function renderTaskSignatureSummary(task) {
    const signedItems = getAuditTimeline(task)
        .map(item => ({ ...item, signatureId: getHistorySignatureId(item) }))
        .filter(item => item.signatureId);

    if (!signedItems.length) {
        return '<p class="action-note">当前审计链还没有签名凭证。关键状态操作后会显示签名编号。</p>';
    }

    return `
        <div class="signature-list">
            ${signedItems.slice(-5).map(item => `
                <div>
                    <span>${getActorLabel(item.actor)} · ${getStatusLabel(item.status)}</span>
                    <strong>${item.signatureId}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

function taskIncludesAgent(task, agent) {
    const agentNames = new Set([agent.id, agent.name].filter(Boolean));
    const selected = task.selectedAgents || task.agents || [];
    const inSelected = selected.some(item => {
        if (typeof item === 'string') return agentNames.has(item);
        return agentNames.has(item.id) || agentNames.has(item.name) || agentNames.has(item.agentName);
    });
    const inSplits = (task.escrow?.splits || []).some(split =>
        agentNames.has(split.agentId) || agentNames.has(split.agentName)
    );

    return inSelected || inSplits;
}

function getAgentTaskSplit(task, agent) {
    const split = (task.escrow?.splits || []).find(item =>
        item.agentId === agent.id || item.agentName === agent.name
    );
    if (split) return Number(split.amount || 0);

    const count = Math.max(1, getTaskAgents(task).length);
    return Math.round((Number(task.escrow?.creatorPool || task.budget || 0) / count) * 100) / 100;
}

function getAgentAssetDossier(agent) {
    const tasks = state.tasks
        .filter(task => taskIncludesAgent(task, agent))
        .sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));

    const finalStatuses = new Set(['SETTLED', 'REFUNDED', 'CANCELLED']);
    const summary = {
        settledIncome: 0,
        pendingIncome: 0,
        disputedIncome: 0,
        refundedExposure: 0,
        activeTasks: 0,
        settledTasks: 0,
        disputedTasks: 0,
        totalTaskValue: 0
    };

    tasks.forEach(task => {
        const splitAmount = getAgentTaskSplit(task, agent);
        summary.totalTaskValue += splitAmount;

        if (task.status === 'SETTLED' && task.settlement) {
            summary.settledIncome += splitAmount;
            summary.settledTasks += 1;
        } else if (task.status === 'DISPUTED') {
            summary.disputedIncome += splitAmount;
            summary.disputedTasks += 1;
        } else if (task.status === 'REFUNDED') {
            summary.refundedExposure += splitAmount;
        } else if (!finalStatuses.has(task.status)) {
            summary.pendingIncome += splitAmount;
            summary.activeTasks += 1;
        }
    });

    const lockedCapacity = getAgentLockedCapacity(agent);
    const remainingCapacity = getAgentAvailableEscrowLimit(agent);

    return {
        tasks,
        summary: {
            ...summary,
            lockedCapacity,
            remainingCapacity
        }
    };
}

function renderAgentAssetTaskList(agent, tasks) {
    if (!tasks.length) {
        return '<div class="empty-state compact">这个 Agent 还没有进入任何托管任务。</div>';
    }

    return tasks.slice(0, 5).map(task => `
        <article class="asset-task-row">
            <div>
                <strong>${task.id} · ${getStatusLabel(task.status)}</strong>
                <span>${getTaskTitle(task)}</span>
            </div>
            <div>
                <strong>${formatUSDC(getAgentTaskSplit(task, agent))}</strong>
                <button class="btn btn-ghost btn-sm" type="button" data-task-detail="${task.id}">交易档案</button>
            </div>
        </article>
    `).join('');
}

function renderAgentAssetView(agent, options = {}) {
    const dossier = getAgentAssetDossier(agent);
    const ownershipStatus = getOwnershipStatus(agent);
    const capacity = Number(agent.escrowLimit || 0);
    const capacityUsage = capacity
        ? Math.min(100, Math.round((dossier.summary.lockedCapacity / capacity) * 100))
        : 0;
    const canJoinExecutionPlan = isAgentOwnershipVerified(agent);
    const headingId = options.modal ? ' id="modalTitle"' : '';

    return `
        <div class="asset-profile ${options.page ? 'page-asset' : ''}" data-agent-id="${agent.id}">
            <div class="asset-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(agent.category)}</span>
                    <h2${headingId}>${agent.name}</h2>
                    <p class="modal-owner">${agent.owner}</p>
                    <p class="modal-summary">${agent.summary}</p>
                </div>
                <div class="asset-trust-card">
                    ${renderOwnershipBadge(agent)}
                    <strong>${agent.verification}</strong>
                    <span>${ownershipStatus.reviewRequired ? '需要复核后提高匹配权重' : '可进入可信匹配池'}</span>
                </div>
            </div>

            <div class="asset-summary-grid">
                <div><strong>${formatUSDC(dossier.summary.settledIncome)}</strong><span>已结算收入</span></div>
                <div><strong>${formatUSDC(dossier.summary.pendingIncome)}</strong><span>待结算收入</span></div>
                <div><strong>${formatUSDC(dossier.summary.disputedIncome)}</strong><span>争议中收入</span></div>
                <div><strong>${dossier.tasks.length}</strong><span>平台任务</span></div>
            </div>

            <div class="asset-grid">
                <section class="detail-section">
                    <span>所有权证明</span>
                    <p>${getOwnershipProof(agent) || '未提交所有权证明'}</p>
                    ${renderOwnershipBadge(agent)}
                    ${renderOwnershipReviewPanel(agent)}
                </section>
                <section class="detail-section">
                    <span>服务边界</span>
                    <p>${getServiceBoundary(agent)}</p>
                </section>
            </div>

            <div class="asset-grid">
                <section class="detail-section">
                    <span>经济参数</span>
                    <div class="asset-metric-grid">
                        <div><strong>${formatUSDC(agent.price)}</strong><span>起步报价</span></div>
                        <div><strong>${formatUSDC(agent.stake)}</strong><span>质押保证金</span></div>
                        <div><strong>${formatUSDC(agent.escrowLimit)}</strong><span>总承接上限</span></div>
                    </div>
                </section>
                <section class="detail-section">
                    <span>承接容量</span>
                    <div class="asset-capacity">
                        <div><span>已锁定 ${formatUSDC(dossier.summary.lockedCapacity)}</span><strong>${capacityUsage}%</strong></div>
                        <div class="progress-track"><div style="width:${capacityUsage}%"></div></div>
                        <small>剩余可承接 ${formatUSDC(dossier.summary.remainingCapacity)}，争议中收入不会提前释放。</small>
                    </div>
                </section>
            </div>

            <section class="detail-section">
                <span>任务履历</span>
                <div class="asset-task-list">
                    ${renderAgentAssetTaskList(agent, dossier.tasks)}
                </div>
            </section>

            <div class="tag-row modal-tags">
                ${(agent.tags || []).map(tag => `<span>${tag}</span>`).join('')}
            </div>

            <button
                class="btn btn-primary btn-block"
                type="button"
                data-agent-add="${agent.id}"
                ${canJoinExecutionPlan ? '' : 'disabled'}
                title="${canJoinExecutionPlan ? '' : '通过所有权校验后才能进入托管方案'}"
            >${canJoinExecutionPlan ? '加入当前执行方案' : '通过所有权后可加入执行方案'}</button>
        </div>
    `;
}

function renderAgentDetailPage() {
    if (!elements.agentDetailPage) return;

    const agent = state.agents.find(item => item.id === state.activeAgentId);
    if (!agent) {
        elements.agentDetailPage.innerHTML = `
            <div class="agent-detail-shell">
                <div class="detail-page-toolbar">
                    <button class="btn btn-ghost btn-sm" type="button" data-page-target="market">返回 Agent 市场</button>
                    <span>Agent 资产档案</span>
                </div>
                <div class="empty-state">没有找到这个 Agent。可以返回市场重新选择。</div>
            </div>
        `;
        return;
    }

    elements.agentDetailPage.innerHTML = `
        <div class="agent-detail-shell">
            <div class="detail-page-toolbar">
                <button class="btn btn-ghost btn-sm" type="button" data-page-target="market">返回 Agent 市场</button>
                <span>Agent 资产档案 · ${agent.id}</span>
            </div>
            ${renderAgentAssetView(agent, { page: true })}
        </div>
    `;
}

function scrollModalToTop() {
    requestAnimationFrame(() => {
        elements.modalPanel?.scrollTo({ top: 0, behavior: 'auto' });
    });
}

function renderTaskDetailView(task, options = {}) {
    const progress = statusProgress[task.status] || task.progress || 10;
    const headingId = options.modal ? ' id="modalTitle"' : '';

    return `
        <div class="task-detail-view ${options.page ? 'page-detail' : ''}" data-task-id="${task.id}">
            <div class="detail-hero">
                <div>
                    <span class="category-badge">${getCategoryLabel(task.category)}</span>
                    <h2${headingId}>${task.description || task.title || task.id}</h2>
                    <p>${formatUSDC(task.budget)} · ${task.verification} · ${getStatusLabel(task.status)}</p>
                </div>
                <div class="detail-progress">
                    <strong>${progress}%</strong>
                    <span>${state.apiAvailable ? 'API 状态机' : '本地演示'}</span>
                </div>
            </div>

            ${renderOutcomeContract(task, { detail: true })}

            <div class="detail-grid">
                <section class="detail-section">
                    <span>执行 Agent</span>
                    <div class="detail-agent-list">${renderTaskDetailAgents(task)}</div>
                </section>
                <section class="detail-section">
                    <span>托管分账</span>
                    ${renderTaskEscrowDetail(task)}
                </section>
            </div>

            <div class="detail-section">
                <span>资金流水</span>
                ${renderEscrowLedger(task)}
            </div>

            <div class="detail-section">
                <span>交易风控</span>
                ${renderRiskChecks(task)}
            </div>

            ${task.deliverable ? `
                <div class="detail-section">
                    <span>交付物</span>
                    <p>${task.deliverable}</p>
                </div>
            ` : ''}

            <div class="detail-grid">
                <section class="detail-section">
                    <span>证据包</span>
                    ${renderEvidenceBundle(task) || '<p class="action-note">交付或争议后会显示证据引用。</p>'}
                </section>
                <section class="detail-section">
                    <span>签名凭证</span>
                    ${renderTaskSignatureSummary(task)}
                </section>
            </div>

            ${renderSettlementReceipt(task)}
            ${renderAuditTrail(task)}

            <div class="task-actions detail-actions">
                ${renderTaskActions(task)}
            </div>
        </div>
    `;
}

function renderTaskDetailPage() {
    if (!elements.taskDetailPage) return;

    const task = state.tasks.find(item => item.id === state.activeTaskId);
    if (!task) {
        elements.taskDetailPage.innerHTML = `
            <div class="task-detail-shell">
                <div class="detail-page-toolbar">
                    <button class="btn btn-ghost btn-sm" type="button" data-page-target="tasks">返回任务托管</button>
                    <span>交易档案</span>
                </div>
                <div class="empty-state">没有找到这笔任务。可以返回任务托管列表重新选择。</div>
            </div>
        `;
        return;
    }

    elements.taskDetailPage.innerHTML = `
        <div class="task-detail-shell">
            <div class="detail-page-toolbar">
                <button class="btn btn-ghost btn-sm" type="button" data-page-target="tasks">返回任务托管</button>
                <span>交易档案 · ${task.id}</span>
            </div>
            ${renderTaskDetailView(task, { page: true })}
        </div>
    `;
}

function openTaskModal(taskId) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    elements.modalContent.innerHTML = renderTaskDetailView(task, { modal: true });

    openModal(true);
}

function openAgentModal(agentId) {
    const agent = state.agents.find(item => item.id === agentId);
    if (!agent) return;

    elements.modalContent.innerHTML = renderAgentAssetView(agent, { modal: true });

    openModal(true);
}

function openModal(wide = false) {
    elements.modalPanel?.classList.toggle('modal-wide', wide);
    elements.agentModal.classList.add('open');
    elements.agentModal.setAttribute('aria-hidden', 'false');
    scrollModalToTop();
}

function closeModal() {
    elements.agentModal.classList.remove('open');
    elements.agentModal.setAttribute('aria-hidden', 'true');
    elements.modalPanel?.classList.remove('modal-wide');
}

async function createTask(event) {
    event.preventDefault();

    if (state.actor !== 'user') {
        showToast('只有用户身份可以发布托管任务', 'error');
        return;
    }

    const description = elements.taskDescription.value.trim();
    const acceptanceCriteria = elements.taskAcceptanceCriteria.value.trim();
    const budget = Number(elements.taskBudget.value);
    const challengeWindowHours = Number(elements.taskChallengeWindow.value);
    const category = elements.taskCategory.value;

    if (!description) {
        showToast('请先填写任务描述', 'error');
        elements.taskDescription.focus();
        return;
    }

    if (acceptanceCriteria.length < 8) {
        showToast('请写清楚结果验收标准，方便按结果结算', 'error');
        elements.taskAcceptanceCriteria.focus();
        return;
    }

    if (!budget || budget < 10) {
        showToast('预算至少需要 10 USDC', 'error');
        elements.taskBudget.focus();
        return;
    }

    const selectedAgentObjects = getSelectedAgentObjects();
    if (state.selectedAgents.length && !validateExecutionPlanBeforeSubmit(selectedAgentObjects, budget, { planName: '手选执行方案' })) {
        return;
    }

    const payload = {
        description,
        acceptanceCriteria,
        category,
        budget,
        challengeWindowHours,
        selectedAgentNames: [...state.selectedAgents],
        verification: elements.taskVerification.value === 'tee'
            ? 'TEE'
            : elements.taskVerification.value === 'zkml'
                ? 'zkML'
                : 'Optimistic'
    };

    try {
        if (state.apiAvailable) {
            const result = await apiRequest('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            state.tasks.unshift(normalizeTask(result.task));
            await refreshAgentsFromApi();
            await refreshCreatorLedgerFromApi();
            showToast('托管方案已由后端状态机生成');
        } else {
            state.creatorLedger = null;
            state.tasks.unshift(createLocalTask(payload));
            showToast('托管方案已在本地生成');
        }

        state.selectedAgents = [];
        state.taskFilter = 'all';
        renderTasks();
        renderAgents();
        elements.taskForm.reset();
        elements.taskBudget.value = 80;
        elements.taskChallengeWindow.value = 24;
        renderComposerPreview();
        setActivePage('tasks');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function createAgent(event) {
    event.preventDefault();

    if (state.actor !== 'agent') {
        showToast('请切换到创作者身份后注册 Agent', 'error');
        return;
    }

    const payload = {
        name: elements.agentName.value.trim(),
        owner: elements.agentOwner.value.trim(),
        ownershipProof: elements.agentOwnershipProof.value.trim(),
        category: elements.agentCategory.value,
        verification: elements.agentVerification.value,
        price: Number(elements.agentPrice.value),
        stake: Number(elements.agentStake.value),
        escrowLimit: Number(elements.agentEscrowLimit.value),
        summary: elements.agentSummary.value.trim(),
        serviceBoundary: elements.agentServiceBoundary.value.trim(),
        tags: elements.agentTags.value.split(',').map(tag => tag.trim()).filter(Boolean),
        creatorDeclaration: {
            ownsAgent: Boolean(elements.agentOwnsDeclaration?.checked),
            nonCustody: Boolean(elements.agentCustodyDeclaration?.checked),
            outcomePayout: Boolean(elements.agentOutcomeDeclaration?.checked)
        }
    };

    if (!payload.name || !payload.owner || !payload.ownershipProof || !payload.summary || !payload.serviceBoundary) {
        showToast('请填写 Agent 名称、创作者、所有权证明、能力说明和服务边界', 'error');
        return;
    }

    if (!Object.values(payload.creatorDeclaration).every(Boolean)) {
        showToast('请先确认创作者声明：所有权、非托管和按结果结算', 'error');
        return;
    }

    try {
        let agent;
        if (state.apiAvailable) {
            const result = await apiRequest('/api/agents', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            agent = enrichAgent(result.agent);
            await refreshCreatorLedgerFromApi();
            showToast('Agent 已注册到后端市场');
        } else {
            state.creatorLedger = null;
            agent = createLocalAgent(payload);
            showToast('Agent 已加入本地演示市场');
        }

        state.agents.unshift(agent);
        state.filter = 'all';
        document.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
        renderAgents();
        elements.agentForm.reset();
        elements.agentPrice.value = 30;
        elements.agentStake.value = 1000;
        elements.agentEscrowLimit.value = 300;
        elements.agentOwnsDeclaration.checked = false;
        elements.agentCustodyDeclaration.checked = false;
        elements.agentOutcomeDeclaration.checked = false;
        renderAgentOnboardPreview();
        setActivePage('market');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function createLocalAgent(payload) {
    return {
        id: `local-agent-${Date.now()}`,
        ...payload,
        reputation: 60,
        successRate: 0,
        tasks: 0
    };
}

function createLocalTask(payload) {
    const matchedAgents = state.selectedAgents.length
        ? state.selectedAgents.map(name => state.agents.find(agent => agent.name === name) || { name })
        : state.agents
            .filter(agent => agent.category === payload.category)
            .filter(isAgentOwnershipVerified)
            .filter(agent => getAgentAvailableEscrowLimit(agent) >= payload.budget)
            .sort((a, b) => b.reputation - a.reputation)
            .slice(0, 2);

    const blockingReason = getExecutionPlanBlockingReason(matchedAgents, payload.budget, {
        planName: state.selectedAgents.length ? '手选执行方案' : '自动推荐方案'
    });
    if (blockingReason) {
        throw new Error(blockingReason);
    }

    const protocolFee = Math.round(payload.budget * 5) / 100;
    const creatorPool = Math.round((payload.budget - protocolFee) * 100) / 100;

    return {
        id: `LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        status: 'MATCHED',
        selectedAgents: matchedAgents,
        deliverable: null,
        deliverableEvidence: [],
        escrowEvents: [],
        escrow: {
            protocolFee,
            creatorPool,
            splits: matchedAgents.map(agent => ({ agentName: agent.name, amount: creatorPool / matchedAgents.length }))
        },
        history: [{ status: 'MATCHED', actor: 'platform', note: '平台生成 Agent 执行方案' }]
    };
}

async function handleTaskAction(event) {
    const button = event.target.closest('[data-task-action]');
    if (!button) return;

    const taskItem = event.target.closest('[data-task-id]');
    const taskId = taskItem?.dataset.taskId;
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    const action = button.dataset.taskAction;

    if (!canCurrentActor(action)) {
        showToast(`当前操作需要${getActorLabel(getRequiredActor(action))}身份`, 'error');
        return;
    }

    const blockReason = getTaskActionBlockReason(task, action);
    if (blockReason) {
        showToast(blockReason, 'error');
        return;
    }

    if (action === 'fund') {
        openFundConfirmationModal(task.id, {
            reopenDetail: Boolean(button.closest('.task-detail-view'))
        });
        return;
    }

    if (action === 'start') {
        openStartConfirmationModal(task.id);
        return;
    }

    if (action === 'accept') {
        openAcceptanceConfirmationModal(task.id);
        return;
    }

    if (action === 'submit') {
        openSubmissionModal(task.id);
        return;
    }

    if (action === 'dispute') {
        openDisputeModal(task.id);
        return;
    }

    if (action === 'resolve-agent' || action === 'resolve-user') {
        openResolutionModal(task.id, action);
        return;
    }

    await commitTaskAction(task, action, {
        reopenDetail: Boolean(button.closest('.task-detail-view'))
    });
}

function handleTaskDetailOpen(event) {
    const button = event.target.closest('[data-task-detail]');
    if (!button) return;
    event.preventDefault();
    openTaskDetailPage(button.dataset.taskDetail);
}

function handleAgentDetailOpen(event) {
    const button = event.target.closest('[data-agent-view]');
    if (!button) return;
    event.preventDefault();
    openAgentDetailPage(button.dataset.agentView);
}

function handlePageTargetClick(event) {
    const button = event.target.closest('[data-page-target]');
    if (!button) return;
    event.preventDefault();
    closeModal();
    setActivePage(button.dataset.pageTarget || 'home');
}

function handleRoleEntryClick(event) {
    const entry = event.target.closest('[data-entry-page]');
    if (!entry) return;
    event.preventDefault();

    const targetPage = entry.dataset.entryPage || getPageIdFromHash(entry.hash);
    const targetActor = entry.dataset.entryActor || state.actor;
    const title = entry.querySelector('strong')?.textContent?.trim() || '对应页面';

    setActor(targetActor, { silent: true });
    setActivePage(targetPage);
    showToast(`已进入${getActorLabel()}身份 · ${title}`);
}

function handleAgentProfileAdd(event) {
    const button = event.target.closest('[data-agent-add]');
    if (!button) return;
    event.preventDefault();
    const agent = state.agents.find(item => item.id === button.dataset.agentAdd);
    if (!agent) return;
    addAgentToExecutionPlan(agent);
    closeModal();
}

async function handleWithdrawalRequest(event) {
    const button = event.target.closest('[data-withdraw-owner]');
    if (!button) return;

    if (state.actor !== 'agent') {
        showToast('需要切换到创作者身份后发起提现', 'error');
        return;
    }

    const owner = decodeURIComponent(button.dataset.withdrawOwner || '');
    const ledger = applyWithdrawalLocks(state.creatorLedger || getCreatorConsoleLedger());
    const row = ledger.rows.find(item => item.owner === owner);
    if (!row || row.withdrawable <= 0) {
        showToast('当前没有可提现余额', 'error');
        return;
    }

    const amount = Math.round(Number(row.withdrawable) * 100) / 100;
    const signature = await buildWithdrawalSignature(owner, amount);

    button.disabled = true;
    try {
        if (state.apiAvailable) {
            const result = await apiRequest('/api/withdrawals', {
                method: 'POST',
                body: JSON.stringify({ actor: state.actor, owner, amount, signature })
            });
            state.withdrawals.unshift(normalizeWithdrawal(result.withdrawal));
            await refreshCreatorLedgerFromApi();
        } else {
            state.withdrawals.unshift(normalizeWithdrawal({
                id: `WD-${Math.floor(1000 + Math.random() * 9000)}`,
                owner,
                amount,
                status: 'PENDING_REVIEW',
                requestedAt: Date.now(),
                signature,
                reviewNote: ''
            }));
        }

        showToast(`${owner} 已发起 ${formatUSDC(amount)} 提现审核`);
        renderCreatorConsole();
    } catch (error) {
        showToast(error.message, 'error');
        button.disabled = false;
    }
}

async function handleWithdrawalReview(event) {
    const button = event.target.closest('[data-withdraw-action]');
    if (!button) return;

    if (state.actor !== 'platform') {
        showToast('需要平台系统身份审核提现', 'error');
        return;
    }

    const row = button.closest('[data-withdrawal-id]');
    const request = state.withdrawals.find(item => item.id === row?.dataset.withdrawalId);
    if (!request || request.status !== 'PENDING_REVIEW') return;

    const action = button.dataset.withdrawAction;
    const signature = await buildWithdrawalSignature(request.owner, request.amount, `withdraw-${action}`, request.id);

    button.disabled = true;
    try {
        if (state.apiAvailable) {
            const result = await apiRequest(`/api/withdrawals/${request.id}/${action}`, {
                method: 'POST',
                body: JSON.stringify({ actor: state.actor, signature })
            });
            state.withdrawals = state.withdrawals.map(item =>
                item.id === request.id ? normalizeWithdrawal(result.withdrawal) : item
            );
            await refreshCreatorLedgerFromApi();
        } else {
            request.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
            request.reviewedAt = Date.now();
            request.reviewSignature = signature;
            request.reviewNote = action === 'approve'
                ? '平台已核对结算和争议风险，等待真实出账'
                : '平台拒绝提现，余额回到可提现池';
        }

        showToast(`${request.id} 已${action === 'approve' ? '批准' : '拒绝'}`);
        renderCreatorConsole();
    } catch (error) {
        showToast(error.message, 'error');
        button.disabled = false;
    }
}

async function handleOwnershipReview(event) {
    const button = event.target.closest('[data-ownership-action]');
    if (!button) return;

    if (state.actor !== 'platform') {
        showToast('需要平台系统身份复核 Agent 所有权', 'error');
        return;
    }

    const profile = button.closest('[data-agent-id]');
    const agent = state.agents.find(item => item.id === profile?.dataset.agentId);
    if (!agent) return;

    const action = button.dataset.ownershipAction;
    const signature = await buildOwnershipReviewSignature(agent, action);
    button.disabled = true;

    try {
        let reviewedAgent;
        if (state.apiAvailable) {
            const result = await apiRequest(`/api/agents/${agent.id}/ownership/${action}`, {
                method: 'POST',
                body: JSON.stringify({ actor: state.actor, signature })
            });
            reviewedAgent = replaceAgent(result.agent);
            await refreshCreatorLedgerFromApi();
        } else {
            reviewedAgent = replaceAgent({
                ...agent,
                ownershipStatus: action === 'approve'
                    ? {
                        status: 'verified',
                        label: '平台已校验',
                        method: '人工复核',
                        reviewRequired: false,
                        reviewNote: '平台已复核创作者证明，Agent 可进入可信匹配池',
                        reviewedAt: Date.now()
                    }
                    : {
                        status: 'rejected',
                        label: '已拒绝',
                        method: '平台复核未通过',
                        reviewRequired: true,
                        reviewNote: '平台复核未通过，需创作者补充所有权证明',
                        reviewedAt: Date.now()
                    },
                ownershipReviewSignature: signature
            });
        }

        renderAgents();
        renderCreatorConsole();
        renderComposerPreview();
        if (state.activePage === 'agent-detail' && state.activeAgentId === reviewedAgent.id) {
            renderAgentDetailPage();
        } else {
            openAgentModal(reviewedAgent.id);
        }
        showToast(`${reviewedAgent.name} 所有权已${action === 'approve' ? '通过' : '拒绝'}`);
    } catch (error) {
        showToast(error.message, 'error');
        button.disabled = false;
    }
}

function handleComposerPreviewClick(event) {
    const button = event.target.closest('[data-remove-agent]');
    if (!button) return;

    const name = button.dataset.removeAgent;
    state.selectedAgents = state.selectedAgents.filter(agentName => agentName !== name);
    renderComposerPreview();
    renderAgents();
    showToast(`${name} 已移出执行方案`);
}

function addAgentToExecutionPlan(agent) {
    if (!agent) return;
    if (!isAgentOwnershipVerified(agent)) {
        showToast('通过所有权校验后才能加入托管方案', 'error');
        return;
    }

    if (!state.selectedAgents.includes(agent.name)) {
        state.selectedAgents.push(agent.name);
        showToast(`${agent.name} 已加入执行方案`);
    } else {
        showToast(`${agent.name} 已经在执行方案中`);
    }

    renderComposerPreview();
    renderAgents();
}

function handleMarketPlanClick(event) {
    const removeButton = event.target.closest('[data-remove-agent]');
    if (removeButton) {
        const name = removeButton.dataset.removeAgent;
        state.selectedAgents = state.selectedAgents.filter(agentName => agentName !== name);
        renderComposerPreview();
        renderAgents();
        showToast(`${name} 已移出执行方案`);
        return;
    }

    if (event.target.closest('[data-market-plan-clear]')) {
        state.selectedAgents = [];
        renderComposerPreview();
        renderAgents();
        showToast('执行方案已清空');
        return;
    }

    if (event.target.closest('[data-market-plan-create]')) {
        setActivePage('home');
        requestAnimationFrame(() => elements.taskDescription?.focus());
    }
}

function handleEvidenceFormClick(event) {
    const addButton = event.target.closest('[data-add-evidence]');
    if (addButton) {
        const form = addButton.closest('[data-evidence-task-id]');
        const task = state.tasks.find(item => item.id === form?.dataset.evidenceTaskId);
        const list = form?.querySelector('[data-evidence-list]');
        if (!task || !list) return;

        list.insertAdjacentHTML('beforeend', renderEvidenceInputRow(task, {}, true));
        const row = list.lastElementChild;
        row?.querySelector('[data-evidence-label]')?.focus();
        return;
    }

    const registerButton = event.target.closest('[data-register-evidence]');
    if (registerButton) {
        const row = registerButton.closest('[data-evidence-row]');
        if (!row) return;

        registerButton.disabled = true;
        registerEvidenceFile(row)
            .catch(error => {
                setEvidenceVaultStatus(row, error.message, 'error');
                showToast(error.message, 'error');
            })
            .finally(() => {
                registerButton.disabled = false;
            });
        return;
    }

    const removeButton = event.target.closest('[data-remove-evidence]');
    if (!removeButton) return;

    const row = removeButton.closest('[data-evidence-row]');
    row?.remove();
}

function handleEvidenceFormInput(event) {
    const row = event.target.closest('[data-evidence-row]');
    if (!row) return;
    updateEvidenceRowHash(row);
}

async function handleSubmissionFormSubmit(event) {
    const form = event.target.closest('[data-submit-task-id]');
    if (!form) return;

    event.preventDefault();
    const task = state.tasks.find(item => item.id === form.dataset.submitTaskId);
    if (!task) {
        showToast('没有找到对应任务', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    try {
        const submission = collectSubmissionPayload(form, task);
        if (submitButton) submitButton.disabled = true;
        const committed = await commitTaskAction(task, 'submit', { submission, reopenDetail: true });
        if (!committed && submitButton) submitButton.disabled = false;
    } catch (error) {
        showToast(error.message, 'error');
        if (submitButton) submitButton.disabled = false;
    }
}

async function handleDisputeFormSubmit(event) {
    const form = event.target.closest('[data-dispute-task-id]');
    if (!form) return;

    event.preventDefault();
    const task = state.tasks.find(item => item.id === form.dataset.disputeTaskId);
    if (!task) {
        showToast('没有找到对应任务', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    try {
        const dispute = collectDisputePayload(form, task);
        if (submitButton) submitButton.disabled = true;
        const committed = await commitTaskAction(task, 'dispute', { dispute, reopenDetail: true });
        if (!committed && submitButton) submitButton.disabled = false;
    } catch (error) {
        showToast(error.message, 'error');
        if (submitButton) submitButton.disabled = false;
    }
}

async function handleResolutionFormSubmit(event) {
    const form = event.target.closest('[data-resolve-task-id]');
    if (!form) return;

    event.preventDefault();
    const task = state.tasks.find(item => item.id === form.dataset.resolveTaskId);
    if (!task) {
        showToast('没有找到对应任务', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    try {
        const resolution = collectResolutionPayload(form, task);
        if (submitButton) submitButton.disabled = true;
        const committed = await commitTaskAction(task, form.dataset.resolveAction, { resolution, reopenDetail: true });
        if (!committed && submitButton) submitButton.disabled = false;
    } catch (error) {
        showToast(error.message, 'error');
        if (submitButton) submitButton.disabled = false;
    }
}

async function handleFundConfirmationSubmit(event) {
    const form = event.target.closest('[data-fund-task-id]');
    if (!form) return;

    event.preventDefault();
    const task = state.tasks.find(item => item.id === form.dataset.fundTaskId);
    if (!task) {
        showToast('没有找到对应任务', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    try {
        const funding = collectFundingConfirmationPayload(form, task);
        if (submitButton) submitButton.disabled = true;
        const committed = await commitTaskAction(task, 'fund', {
            funding,
            reopenDetail: true
        });
        if (!committed && submitButton) submitButton.disabled = false;
    } catch (error) {
        showToast(error.message, 'error');
        if (submitButton) submitButton.disabled = false;
    }
}

async function handleStartCommitmentSubmit(event) {
    const form = event.target.closest('[data-start-task-id]');
    if (!form) return;

    event.preventDefault();
    const task = state.tasks.find(item => item.id === form.dataset.startTaskId);
    if (!task) {
        showToast('没有找到对应任务', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    try {
        const executionCommitment = collectExecutionCommitmentPayload(form, task);
        if (submitButton) submitButton.disabled = true;
        const committed = await commitTaskAction(task, 'start', {
            executionCommitment,
            reopenDetail: true
        });
        if (!committed && submitButton) submitButton.disabled = false;
    } catch (error) {
        showToast(error.message, 'error');
        if (submitButton) submitButton.disabled = false;
    }
}

async function handleAcceptanceConfirmationSubmit(event) {
    const form = event.target.closest('[data-accept-task-id]');
    if (!form) return;

    event.preventDefault();
    const task = state.tasks.find(item => item.id === form.dataset.acceptTaskId);
    if (!task) {
        showToast('没有找到对应任务', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    try {
        const acceptanceConfirmation = collectAcceptanceConfirmationPayload(form, task);
        if (submitButton) submitButton.disabled = true;
        const committed = await commitTaskAction(task, 'accept', {
            acceptanceConfirmation,
            reopenDetail: true
        });
        if (!committed && submitButton) submitButton.disabled = false;
    } catch (error) {
        showToast(error.message, 'error');
        if (submitButton) submitButton.disabled = false;
    }
}

async function commitTaskAction(task, action, options = {}) {
    try {
        const blockReason = getTaskActionBlockReason(task, action);
        if (blockReason) {
            throw new Error(blockReason);
        }

        const actionPayload = options.submission
            || options.dispute
            || options.resolution
            || options.funding
            || options.executionCommitment
            || options.acceptanceConfirmation
            || null;
        if (state.apiAvailable) {
            const result = await runApiTaskAction(task, action, actionPayload);
            replaceTask(result.task);
            await refreshAgentsFromApi();
            await refreshCreatorLedgerFromApi();
        } else {
            state.creatorLedger = null;
            replaceTask(await runLocalTaskAction(task, action, actionPayload));
        }
        renderAgents();
        renderTasks();
        if (options.reopenDetail) {
            if (state.activePage === 'task-detail') {
                closeModal();
                state.activeTaskId = task.id;
                renderTaskDetailPage();
            } else {
                openTaskModal(task.id);
            }
        }
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}

async function runApiTaskAction(task, action, actionPayload = null) {
    const signature = await buildActionSignature(task, action);

    if (action === 'resolve-agent') {
        const resolution = actionPayload || getDefaultResolutionPayload(task, action);
        return apiRequest(`/api/tasks/${task.id}/resolve`, {
            method: 'POST',
            body: JSON.stringify({ actor: state.actor, winner: 'agent', signature, resolution })
        });
    }

    if (action === 'resolve-user') {
        const resolution = actionPayload || getDefaultResolutionPayload(task, action);
        return apiRequest(`/api/tasks/${task.id}/resolve`, {
            method: 'POST',
            body: JSON.stringify({ actor: state.actor, winner: 'user', signature, resolution })
        });
    }

    if (action === 'submit') {
        const payload = actionPayload || getDefaultSubmissionPayload(task);
        return apiRequest(`/api/tasks/${task.id}/submit`, {
            method: 'POST',
            body: JSON.stringify({
                actor: state.actor,
                signature,
                deliverable: payload.deliverable,
                deliverableEvidence: payload.deliverableEvidence
            })
        });
    }

    if (action === 'dispute') {
        const payload = actionPayload || getDefaultDisputePayload(task);
        return apiRequest(`/api/tasks/${task.id}/dispute`, {
            method: 'POST',
            body: JSON.stringify({
                actor: state.actor,
                signature,
                reason: payload.reason,
                evidence: payload.evidence
            })
        });
    }

    if (action === 'fund') {
        const fundingConfirmation = actionPayload || null;
        return apiRequest(`/api/tasks/${task.id}/fund`, {
            method: 'POST',
            body: JSON.stringify({ actor: state.actor, signature, fundingConfirmation })
        });
    }

    if (action === 'start') {
        const executionCommitment = actionPayload || null;
        return apiRequest(`/api/tasks/${task.id}/start`, {
            method: 'POST',
            body: JSON.stringify({ actor: state.actor, signature, executionCommitment })
        });
    }

    if (action === 'accept') {
        const acceptanceConfirmation = actionPayload || null;
        return apiRequest(`/api/tasks/${task.id}/accept`, {
            method: 'POST',
            body: JSON.stringify({ actor: state.actor, signature, acceptanceConfirmation })
        });
    }

    if (action === 'auto-settle') {
        return apiRequest(`/api/tasks/${task.id}/auto-settle`, {
            method: 'POST',
            body: JSON.stringify({ actor: state.actor, signature })
        });
    }

    return apiRequest(`/api/tasks/${task.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ actor: state.actor, signature })
    });
}

async function runLocalTaskAction(task, action, actionPayload = null) {
    if (!canCurrentActor(action)) {
        throw new Error(`当前操作需要${getActorLabel(getRequiredActor(action))}身份`);
    }

    const next = structuredClone(task);
    const signature = await buildActionSignature(task, action);
    const addHistory = (status, note, actor = 'platform', actionSignature = null) => {
        next.history = next.history || [];
        const historyItem = { status, actor, note, at: Date.now() };
        if (actionSignature) {
            historyItem.signature = actionSignature;
        }
        next.history.push(historyItem);
    };
    const addSignedHistory = (status, note, actor) => {
        addHistory(status, note, actor, signature);
    };

    if (action === 'fund' && task.status === 'MATCHED') {
        const fundingNote = actionPayload?.summary || '用户确认结果契约、Agent 所有权、费用拆分和平台边界后托管预算';
        next.status = 'FUNDED';
        addSignedHistory('FUNDED', fundingNote, 'user');
        appendLocalEscrowEvents(next, [
            buildLocalEscrowEvent(next, 'escrow_deposit', 'user', next.budget, 'Escrow Vault', '用户确认清单后，预算进入托管金库')
        ]);
    } else if (action === 'start' && task.status === 'FUNDED') {
        const commitmentNote = actionPayload?.summary || 'Agent 确认服务边界、结果契约、证据责任和声誉风险后接单执行';
        next.status = 'IN_PROGRESS';
        addSignedHistory('IN_PROGRESS', commitmentNote, 'agent');
    } else if (action === 'submit' && task.status === 'IN_PROGRESS') {
        const payload = actionPayload || getDefaultSubmissionPayload(task);
        next.status = 'SUBMITTED';
        next.deliverable = payload.deliverable;
        next.deliverableEvidence = payload.deliverableEvidence;
        addSignedHistory('SUBMITTED', 'Agent 提交交付物', 'agent');
    } else if (action === 'accept' && task.status === 'SUBMITTED') {
        const acceptanceConfirmation = actionPayload || {
            summary: '用户验收通过，托管资金完成分账',
            evidenceCount: (task.deliverableEvidence || []).length,
            contractFingerprint: getTaskContractFingerprint(task),
            acceptedAt: Date.now()
        };
        const reputationEvents = applyAgentOutcomeToState(next, true);
        next.status = 'SETTLED';
        next.settlement = buildSettlement(next, 'accepted', reputationEvents, null, acceptanceConfirmation);
        appendLocalEscrowEvents(next, buildSettlementEscrowEvents(next, '用户验收通过'));
        addSignedHistory('SETTLED', acceptanceConfirmation.summary, 'user');
        addHistory('SETTLED', 'Agent 成交、声誉和成功率已更新');
    } else if (action === 'auto-settle' && task.status === 'SUBMITTED') {
        const blockReason = getTaskActionBlockReason(task, action);
        if (blockReason) {
            throw new Error(blockReason);
        }
        const reputationEvents = applyAgentOutcomeToState(next, true);
        next.status = 'SETTLED';
        next.settlement = buildSettlement(next, 'challenge_window_expired', reputationEvents);
        appendLocalEscrowEvents(next, buildSettlementEscrowEvents(next, '挑战窗口结束'));
        addSignedHistory('SETTLED', '挑战窗口结束，平台自动结算', 'platform');
        addHistory('SETTLED', 'Agent 成交、声誉和成功率已更新');
    } else if (action === 'dispute' && task.status === 'SUBMITTED') {
        const payload = actionPayload || getDefaultDisputePayload(task);
        next.status = 'DISPUTED';
        next.dispute = {
            reason: payload.reason,
            openedAt: Date.now(),
            evidence: payload.evidence
        };
        addSignedHistory('DISPUTED', '用户发起争议，等待仲裁', 'user');
    } else if (action === 'resolve-agent' && task.status === 'DISPUTED') {
        const decision = buildArbitrationDecision(next, action, actionPayload || {});
        const reputationEvents = applyAgentOutcomeToState(next, true);
        next.status = 'SETTLED';
        next.settlement = buildSettlement(next, 'agent_won_dispute', reputationEvents, decision);
        appendLocalEscrowEvents(next, buildSettlementEscrowEvents(next, '仲裁支持 Agent'));
        addSignedHistory('SETTLED', `仲裁支持 Agent：${decision.reason}`, 'arbitrator');
        addHistory('SETTLED', 'Agent 成交、声誉和成功率已更新');
    } else if (action === 'resolve-user' && task.status === 'DISPUTED') {
        const decision = buildArbitrationDecision(next, action, actionPayload || {});
        const reputationEvents = applyAgentOutcomeToState(next, false);
        next.status = 'REFUNDED';
        next.settlement = buildRefundSettlement(next, reputationEvents, decision);
        appendLocalEscrowEvents(next, [buildRefundEscrowEvent(next, '仲裁支持用户')]);
        addSignedHistory('REFUNDED', `仲裁支持用户：${decision.reason}`, 'arbitrator');
        addHistory('REFUNDED', 'Agent 声誉、成功率和质押风险已更新');
    } else if (action === 'cancel' && task.status === 'MATCHED') {
        next.status = 'CANCELLED';
        addSignedHistory('CANCELLED', '用户在托管前取消任务', 'user');
    } else {
        throw new Error('当前状态不允许执行这个操作');
    }

    return next;
}

function buildDeliverable(task) {
    return `${getTaskTitle(task)} 的结果已提交：包含执行摘要、风险点、修改建议和下一步行动清单。`;
}

function replaceTask(task) {
    const normalized = normalizeTask(task);
    state.tasks = state.tasks.map(item => item.id === normalized.id ? normalized : item);
    showToast(`${normalized.id} 已更新为「${getStatusLabel(normalized.status)}」`);
}

function replaceAgent(agent) {
    const normalized = enrichAgent(agent);
    state.agents = state.agents.map(item => item.id === normalized.id ? normalized : item);
    return normalized;
}

async function apiRequest(path, options = {}) {
    const response = await fetch(buildApiUrl(path), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        ...options
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `API 请求失败：${response.status}`);
    }
    return data;
}

function buildApiUrl(path) {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const base = String(appConfig.apiBase || '').replace(/\/$/, '');
    if (!base) {
        return path;
    }

    return `${base}${path}`;
}

function getEnvironmentStatus() {
    const mode = appConfig.apiMode || 'auto';
    const name = appConfig.environmentName || 'local';

    if (mode === 'off') {
        return {
            tone: 'demo',
            label: '静态演示',
            detail: '不连接后端，任务和资金状态只在浏览器本地演示'
        };
    }

    if (state.apiAvailable) {
        const service = state.apiHealth?.service || '';
        const isMock = service.includes('mock') || name.toLowerCase() === 'local';
        return {
            tone: isMock ? 'mock' : 'live',
            label: isMock ? '本地 Mock API' : `${name} API`,
            detail: isMock
                ? '状态机和资金流水由本机演示后端校验'
                : '交易状态、证据和结算由真实后端校验'
        };
    }

    if (mode === 'required') {
        return {
            tone: 'error',
            label: 'API 必连失败',
            detail: state.apiError || '当前没有接入可用的真实业务后端'
        };
    }

    return {
        tone: 'demo',
        label: '本地演示',
        detail: 'API 未连接，当前使用前端演示数据'
    };
}

function renderEnvironmentStatus() {
    if (!elements.environmentBanner) return;
    const status = getEnvironmentStatus();
    elements.environmentBanner.className = `environment-banner ${status.tone}`;
    elements.environmentBanner.innerHTML = `
        <span>${status.label}</span>
        <strong>${status.detail}</strong>
    `;
}

async function hydrateFromApi() {
    if (appConfig.apiMode === 'off') {
        state.apiAvailable = false;
        state.apiHealth = null;
        state.backendReadiness = null;
        state.apiError = '';
        state.creatorLedger = null;
        renderAgents();
        renderTasks();
        renderEnvironmentStatus();
        return;
    }

    try {
        const health = await apiRequest('/api/health');
        if (!health.ok) {
            state.apiAvailable = false;
            state.apiHealth = health;
            state.apiError = 'API health 未返回 ok';
            renderEnvironmentStatus();
            return;
        }

        state.apiAvailable = true;
        state.apiHealth = health;
        state.apiError = '';
        const [agentsResult, tasksResult, readinessResult] = await Promise.all([
            apiRequest('/api/agents'),
            apiRequest('/api/tasks'),
            apiRequest('/api/readiness').catch(() => null)
        ]);
        state.agents = agentsResult.agents.map(enrichAgent);
        state.tasks = tasksResult.tasks.map(normalizeTask);
        state.backendReadiness = readinessResult && Array.isArray(readinessResult.capabilities)
            ? readinessResult
            : null;
        await refreshCreatorLedgerFromApi();
        await refreshWithdrawalsFromApi();
        renderAgents();
        renderTasks();
        renderEnvironmentStatus();
        showToast(`已连接${appConfig.environmentName} API，交易状态由后端校验`);
    } catch (error) {
        state.apiAvailable = false;
        state.apiHealth = null;
        state.backendReadiness = null;
        state.apiError = error.message;
        state.creatorLedger = null;
        renderAgents();
        renderTasks();
        renderEnvironmentStatus();
        if (appConfig.apiMode === 'required') {
            showToast(`API 不可用：${error.message}`, 'error');
        }
    }
}

async function refreshAgentsFromApi() {
    if (!state.apiAvailable) return;

    const result = await apiRequest('/api/agents');
    state.agents = result.agents.map(enrichAgent);
}

async function refreshCreatorLedgerFromApi() {
    if (!state.apiAvailable) {
        state.creatorLedger = null;
        return;
    }

    try {
        const result = await apiRequest('/api/creators');
        state.creatorLedger = result.summary && Array.isArray(result.rows) ? result : null;
    } catch (error) {
        state.creatorLedger = null;
    }
}

async function refreshWithdrawalsFromApi() {
    if (!state.apiAvailable) return;

    try {
        const result = await apiRequest('/api/withdrawals');
        state.withdrawals = Array.isArray(result.withdrawals)
            ? result.withdrawals.map(normalizeWithdrawal)
            : [];
    } catch (error) {
        state.withdrawals = [];
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('hide'), 2600);
    setTimeout(() => toast.remove(), 3000);
}

function applyTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('qianzhi-theme', nextTheme);
    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.textContent = nextTheme === 'light' ? '浅色' : '深色';
        elements.themeToggleBtn.setAttribute(
            'aria-label',
            nextTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'
        );
    }
}

function updateWalletButton() {
    if (!elements.walletBtn) return;

    if (state.connected && state.walletAddress) {
        const label = `${shortenAddress(state.walletAddress)} 已连接`;
        elements.walletBtn.textContent = label;
        elements.walletBtn.title = `真实钱包已连接：${state.walletAddress}`;
        elements.walletBtn.setAttribute('aria-label', `断开钱包 ${state.walletAddress}`);
        elements.walletBtn.classList.add('connected');
        return;
    }

    elements.walletBtn.textContent = '连接钱包';
    elements.walletBtn.title = '连接浏览器钱包；未连接时仍会使用 demo 签名演示流程';
    elements.walletBtn.setAttribute('aria-label', '连接钱包');
    elements.walletBtn.classList.remove('connected');
}

function setWalletAccount(account) {
    const address = String(account || '').trim();
    state.connected = Boolean(address);
    state.walletAddress = address;
    updateWalletButton();
    renderEnvironmentStatus();
    renderTrustDashboard();
}

async function connectBrowserWallet() {
    if (!window.ethereum?.request) {
        setWalletAccount('');
        showToast('未检测到浏览器钱包，当前继续使用 demo 签名演示。', 'error');
        return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = Array.isArray(accounts) ? accounts[0] : '';
    if (!account) {
        throw new Error('钱包没有返回可用账户');
    }
    setWalletAccount(account);
    showToast(`钱包已连接：${shortenAddress(account)}`);
}

function disconnectBrowserWallet() {
    setWalletAccount('');
    showToast('钱包已从当前页面断开，后续操作使用 demo 签名演示。');
}

async function handleWalletButtonClick() {
    try {
        if (state.connected) {
            disconnectBrowserWallet();
            return;
        }
        await connectBrowserWallet();
    } catch (error) {
        setWalletAccount('');
        showToast(`钱包连接失败：${error.message}`, 'error');
    }
}

function getPageIdFromHash(hash) {
    const id = String(hash || '').replace(/^#/, '');
    if (id.startsWith(agentDetailHashPrefix)) {
        state.activeAgentId = decodeURIComponent(id.slice(agentDetailHashPrefix.length));
        state.activeTaskId = '';
        return 'agent-detail';
    }
    if (id.startsWith(taskDetailHashPrefix)) {
        state.activeTaskId = decodeURIComponent(id.slice(taskDetailHashPrefix.length));
        state.activeAgentId = '';
        return 'task-detail';
    }
    if (id !== 'agent-detail') {
        state.activeAgentId = '';
    }
    if (id !== 'task-detail') {
        state.activeTaskId = '';
    }
    return pageIds.includes(id) ? id : 'home';
}

function getAgentDetailHash(agentId) {
    return `#${agentDetailHashPrefix}${encodeURIComponent(agentId)}`;
}

function getTaskDetailHash(taskId) {
    return `#${taskDetailHashPrefix}${encodeURIComponent(taskId)}`;
}

function setActivePage(pageId, options = {}) {
    const nextPage = pageIds.includes(pageId) ? pageId : 'home';
    const {
        updateHash = true,
        replaceHash = false,
        scroll = true
    } = options;

    state.activePage = nextPage;
    document.body.dataset.activePage = nextPage;

    document.querySelectorAll('[data-page-section]').forEach(section => {
        const isActive = section.dataset.pageSection === nextPage;
        section.hidden = !isActive;
        section.classList.toggle('active-page', isActive);
    });

    if (nextPage === 'task-detail') {
        renderTaskDetailPage();
    }
    if (nextPage === 'agent-detail') {
        renderAgentDetailPage();
    }

    if (updateHash) {
        let nextHash = `#${nextPage}`;
        if (nextPage === 'task-detail' && state.activeTaskId) {
            nextHash = getTaskDetailHash(state.activeTaskId);
        } else if (nextPage === 'agent-detail' && state.activeAgentId) {
            nextHash = getAgentDetailHash(state.activeAgentId);
        }
        const method = replaceHash ? 'replaceState' : 'pushState';
        if (window.location.hash !== nextHash) {
            window.history[method](null, '', nextHash);
        }
    }

    updateActiveNav();

    if (scroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function navigateToHash(hash, options = {}) {
    setActivePage(getPageIdFromHash(hash), options);
}

function openTaskDetailPage(taskId, options = {}) {
    state.activeTaskId = taskId;
    state.activeAgentId = '';
    closeModal();
    setActivePage('task-detail', options);
    renderTaskDetailPage();
}

function openAgentDetailPage(agentId, options = {}) {
    state.activeAgentId = agentId;
    state.activeTaskId = '';
    closeModal();
    setActivePage('agent-detail', options);
    renderAgentDetailPage();
}

function updateActiveNav() {
    const links = [...elements.navMenu.querySelectorAll('a[href^="#"]')];
    if (!links.length) return;

    const activeHash = state.activePage === 'task-detail'
        ? '#tasks'
        : state.activePage === 'agent-detail'
            ? '#market'
            : `#${state.activePage}`;

    links.forEach(link => {
        const isActive = link.hash === activeHash;
        link.classList.toggle('active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function bindEvents() {
    window.addEventListener('scroll', () => {
        elements.siteHeader.classList.toggle('scrolled', window.scrollY > 8);
        updateActiveNav();
    });

    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.navMenu.classList.toggle('open');
    });

    window.addEventListener('hashchange', () => {
        navigateToHash(window.location.hash, { updateHash: false });
    });

    window.addEventListener('popstate', () => {
        navigateToHash(window.location.hash, { updateHash: false });
    });

    elements.themeToggleBtn?.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        showToast(`已切换为${next === 'light' ? '浅色简约' : '深色'}模式`);
    });

    elements.roleSwitch.addEventListener('click', event => {
        const button = event.target.closest('[data-actor]');
        if (!button) return;
        setActor(button.dataset.actor);
    });

    elements.walletBtn.addEventListener('click', handleWalletButtonClick);

    if (window.ethereum?.on) {
        window.ethereum.on('accountsChanged', accounts => {
            const account = Array.isArray(accounts) ? accounts[0] : '';
            setWalletAccount(account || '');
            showToast(account ? `钱包账户已切换：${shortenAddress(account)}` : '钱包已从当前页面断开');
        });
    }

    elements.publishTaskBtn.addEventListener('click', () => {
        setActor('user', { silent: true });
        setActivePage('home');
        requestAnimationFrame(() => elements.taskDescription.focus());
    });

    elements.taskForm.addEventListener('submit', createTask);
    elements.agentForm.addEventListener('submit', createAgent);
    [
        elements.agentName,
        elements.agentOwner,
        elements.agentOwnershipProof,
        elements.agentCategory,
        elements.agentVerification,
        elements.agentPrice,
        elements.agentStake,
        elements.agentEscrowLimit,
        elements.agentSummary,
        elements.agentServiceBoundary,
        elements.agentTags,
        elements.agentOwnsDeclaration,
        elements.agentCustodyDeclaration,
        elements.agentOutcomeDeclaration
    ].forEach(element => {
        element?.addEventListener('input', renderAgentOnboardPreview);
        element?.addEventListener('change', renderAgentOnboardPreview);
    });
    elements.taskList.addEventListener('click', handleTaskAction);
    elements.taskList.addEventListener('click', handleTaskDetailOpen);
    elements.appMain?.addEventListener('click', handleRoleEntryClick);
    elements.taskActionQueue?.addEventListener('click', handleTaskDetailOpen);
    elements.agentDetailPage?.addEventListener('click', handleAgentProfileAdd);
    elements.agentDetailPage?.addEventListener('click', handleOwnershipReview);
    elements.agentDetailPage?.addEventListener('click', handleTaskDetailOpen);
    elements.agentDetailPage?.addEventListener('click', handlePageTargetClick);
    elements.taskDetailPage?.addEventListener('click', handleTaskAction);
    elements.taskDetailPage?.addEventListener('click', handlePageTargetClick);
    elements.taskStatusFilters?.addEventListener('click', event => {
        const button = event.target.closest('[data-task-filter]');
        if (!button) return;
        state.taskFilter = button.dataset.taskFilter;
        renderTasks();
    });
    elements.taskActionQueue?.addEventListener('click', event => {
        const button = event.target.closest('[data-task-filter-jump]');
        if (!button) return;
        state.taskFilter = button.dataset.taskFilterJump || 'action';
        renderTasks();
    });
    elements.arbitrationList?.addEventListener('click', handleTaskAction);
    elements.arbitrationList?.addEventListener('click', handleTaskDetailOpen);
    elements.modalContent.addEventListener('click', handleTaskAction);
    elements.modalContent.addEventListener('click', handleAgentProfileAdd);
    elements.modalContent.addEventListener('click', handlePageTargetClick);
    elements.modalContent.addEventListener('click', handleOwnershipReview);
    elements.modalContent.addEventListener('click', handleEvidenceFormClick);
    elements.modalContent.addEventListener('input', handleEvidenceFormInput);
    elements.modalContent.addEventListener('change', handleEvidenceFormInput);
    elements.modalContent.addEventListener('submit', handleSubmissionFormSubmit);
    elements.modalContent.addEventListener('submit', handleDisputeFormSubmit);
    elements.modalContent.addEventListener('submit', handleResolutionFormSubmit);
    elements.modalContent.addEventListener('submit', handleFundConfirmationSubmit);
    elements.modalContent.addEventListener('submit', handleStartCommitmentSubmit);
    elements.modalContent.addEventListener('submit', handleAcceptanceConfirmationSubmit);
    elements.creatorList?.addEventListener('click', handleWithdrawalRequest);
    elements.withdrawalList?.addEventListener('click', handleWithdrawalReview);
    elements.composerPreview?.addEventListener('click', handleComposerPreviewClick);
    elements.marketPlanTray?.addEventListener('click', handleMarketPlanClick);

    [
        elements.taskBudget,
        elements.taskCategory,
        elements.taskVerification,
        elements.taskChallengeWindow,
        elements.taskAcceptanceCriteria
    ].forEach(element => {
        element?.addEventListener('input', () => {
            renderComposerPreview();
            if (element === elements.taskBudget || element === elements.taskCategory) {
                renderAgents();
            }
        });
        element?.addEventListener('change', () => {
            renderComposerPreview();
            if (element === elements.taskBudget || element === elements.taskCategory) {
                renderAgents();
            }
        });
    });

    elements.searchInput.addEventListener('input', event => {
        state.query = event.target.value.trim();
        renderAgents();
    });

    elements.sortSelect.addEventListener('change', event => {
        state.sort = event.target.value;
        renderAgents();
    });

    elements.categoryFilters.addEventListener('click', event => {
        const button = event.target.closest('.filter-btn');
        if (!button) return;
        state.filter = button.dataset.filter;
        elements.categoryFilters.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderAgents();
    });

    elements.ownershipFilters?.addEventListener('click', event => {
        const button = event.target.closest('[data-ownership-filter]');
        if (!button) return;
        state.ownershipFilter = button.dataset.ownershipFilter || 'all';
        elements.ownershipFilters.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderAgents();
    });

    elements.capacityFilters?.addEventListener('click', event => {
        const button = event.target.closest('[data-capacity-filter]');
        if (!button) return;
        state.capacityFilter = button.dataset.capacityFilter || 'all';
        elements.capacityFilters.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderAgents();
    });

    elements.fitFilters?.addEventListener('click', event => {
        const button = event.target.closest('[data-fit-filter]');
        if (!button) return;
        state.fitFilter = button.dataset.fitFilter || 'all';
        elements.fitFilters.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderAgents();
    });

    elements.agentGrid.addEventListener('click', event => {
        const selectButton = event.target.closest('[data-agent-select]');
        if (selectButton) {
            const agent = state.agents.find(item => item.id === selectButton.dataset.agentSelect);
            addAgentToExecutionPlan(agent);
            return;
        }

        const viewButton = event.target.closest('[data-agent-view]');
        if (viewButton) {
            openAgentDetailPage(viewButton.dataset.agentView);
            return;
        }

        const card = event.target.closest('.agent-card');
        if (!card) return;
        openAgentDetailPage(card.dataset.agentId);
    });

    elements.modalClose.addEventListener('click', closeModal);
    elements.agentModal.addEventListener('click', event => {
        if (event.target === elements.agentModal) closeModal();
    });
    elements.modalContent.addEventListener('click', handleTaskDetailOpen);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModal();
            elements.navMenu.classList.remove('open');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const targetPage = getPageIdFromHash(link.hash);
            if (!targetPage) return;
            event.preventDefault();
            elements.navMenu.classList.remove('open');
            setActivePage(targetPage);
        });
    });
}

function init() {
    applyTheme(document.documentElement.dataset.theme || 'light');
    navigateToHash(window.location.hash, { updateHash: true, replaceHash: true, scroll: false });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    setTimeout(() => window.scrollTo(0, 0), 120);
    renderAgents();
    renderTasks();
    renderComposerPreview();
    renderChangeLog();
    renderAgentOnboardPreview();
    updateWalletButton();
    renderEnvironmentStatus();
    bindEvents();
    hydrateFromApi();
}

document.addEventListener('DOMContentLoaded', init);
