/**
 * AI engine for extracting key information from field feedback messages
 * and generating confirmation responses.
 *
 * Behavior: analyze -> confirm -> wait for instruction (never auto-execute)
 */

export interface ExtractedInfo {
  hasKeyInfo: boolean;
  category: 'obstacle' | 'resource' | 'condition' | 'progress' | null;
  keywords: string[];
  extracted: string;
  confidence: number;
}

export interface AIConfirmation {
  confirmation: string;
  impactAssessment: string;
  question: string;
  options: { label: string; action: string }[];
}

// Pattern matching rules for key information extraction
const OBSTACLE_PATTERNS = [
  { pattern: /限高|限宽|限重/, keyword: '通行限制' },
  { pattern: /事故|碰撞|追尾/, keyword: '交通事故' },
  { pattern: /施工|封路|断路/, keyword: '道路施工' },
  { pattern: /积水|塌方|落石/, keyword: '道路损坏' },
  { pattern: /不走|不愿|拒绝|抗拒/, keyword: '司机不配合' },
];

const RESOURCE_PATTERNS = [
  { pattern: /到达|到位|到岗/, keyword: '资源到位' },
  { pattern: /不够|不足|缺少|没有/, keyword: '资源不足' },
  { pattern: /故障|坏了|失灵/, keyword: '设备故障' },
  { pattern: /撤离|离开|调走/, keyword: '资源撤离' },
];

const CONDITION_PATTERNS = [
  { pattern: /大雾|能见度/, keyword: '能见度变化' },
  { pattern: /下雨|暴雨|雨/, keyword: '降雨' },
  { pattern: /大风|风力/, keyword: '风力变化' },
  { pattern: /大货车|重卡|货车/, keyword: '大货车' },
  { pattern: /车流|车多|排队/, keyword: '车流变化' },
];

const PROGRESS_PATTERNS = [
  { pattern: /开始|已经|正在/, keyword: '执行进展' },
  { pattern: /完成|结束|撤收/, keyword: '执行完成' },
  { pattern: /顺畅|通畅|好转/, keyword: '效果好转' },
  { pattern: /恶化|加重|更堵/, keyword: '效果恶化' },
];

export function extractKeyInfo(message: string): ExtractedInfo {
  const results: { category: ExtractedInfo['category']; keywords: string[]; confidence: number }[] = [];

  const obstacleHits = OBSTACLE_PATTERNS.filter((p) => p.pattern.test(message));
  if (obstacleHits.length > 0) {
    results.push({
      category: 'obstacle',
      keywords: obstacleHits.map((h) => h.keyword),
      confidence: 0.85 + obstacleHits.length * 0.05,
    });
  }

  const resourceHits = RESOURCE_PATTERNS.filter((p) => p.pattern.test(message));
  if (resourceHits.length > 0) {
    results.push({
      category: 'resource',
      keywords: resourceHits.map((h) => h.keyword),
      confidence: 0.8 + resourceHits.length * 0.05,
    });
  }

  const conditionHits = CONDITION_PATTERNS.filter((p) => p.pattern.test(message));
  if (conditionHits.length > 0) {
    results.push({
      category: 'condition',
      keywords: conditionHits.map((h) => h.keyword),
      confidence: 0.75 + conditionHits.length * 0.05,
    });
  }

  const progressHits = PROGRESS_PATTERNS.filter((p) => p.pattern.test(message));
  if (progressHits.length > 0) {
    results.push({
      category: 'progress',
      keywords: progressHits.map((h) => h.keyword),
      confidence: 0.7 + progressHits.length * 0.05,
    });
  }

  if (results.length === 0) {
    return { hasKeyInfo: false, category: null, keywords: [], extracted: '', confidence: 0 };
  }

  results.sort((a, b) => b.confidence - a.confidence);
  const best = results[0];

  return {
    hasKeyInfo: true,
    category: best.category,
    keywords: best.keywords,
    extracted: best.keywords.join('、'),
    confidence: Math.min(best.confidence, 0.95),
  };
}

export function generateAIConfirmation(info: ExtractedInfo, _message: string): AIConfirmation {
  const { category, keywords } = info;

  switch (category) {
    case 'obstacle':
      return {
        confirmation: `确认：现场存在${keywords.join('/')}问题`,
        impactAssessment: `影响评估：该障碍可能导致分流效率下降 20-40%，需要调整执行方案`,
        question: '是否需要调整预期并推荐备用方案？',
        options: [
          { label: '是，给我方案', action: 'recommend_alternative' },
          { label: '暂不需要', action: 'dismiss' },
          { label: '我有其他想法', action: 'custom' },
        ],
      };

    case 'resource':
      if (keywords.includes('资源到位')) {
        return {
          confirmation: `确认：现场资源已到位`,
          impactAssessment: `策略执行条件已满足，预期效果曲线开始计算`,
          question: '是否更新资源到位时间？',
          options: [
            { label: '确认到位', action: 'confirm_arrival' },
            { label: '部分到位', action: 'partial_arrival' },
          ],
        };
      }
      return {
        confirmation: `确认：现场${keywords.join('/')}`,
        impactAssessment: `资源问题可能影响策略执行效率，建议补充调度`,
        question: '是否需要增派资源？',
        options: [
          { label: '是，增派资源', action: 'dispatch_more' },
          { label: '暂时够用', action: 'dismiss' },
        ],
      };

    case 'condition':
      return {
        confirmation: `确认：现场环境条件变化（${keywords.join('、')}）`,
        impactAssessment: `环境变化可能影响策略预期效果，建议重新评估`,
        question: '是否需要调整预期效果？',
        options: [
          { label: '调整预期', action: 'adjust_expectation' },
          { label: '继续观察', action: 'dismiss' },
        ],
      };

    case 'progress':
      if (keywords.includes('效果好转') || keywords.includes('执行完成')) {
        return {
          confirmation: `确认：策略执行进展顺利`,
          impactAssessment: `当前效果符合或优于预期`,
          question: '策略执行正常，是否继续监控？',
          options: [
            { label: '继续监控', action: 'continue' },
            { label: '提前结束', action: 'end_early' },
          ],
        };
      }
      return {
        confirmation: `确认：策略执行中，${keywords.join('、')}`,
        impactAssessment: `执行进展已记录`,
        question: '是否需要进一步操作？',
        options: [
          { label: '继续执行', action: 'continue' },
          { label: '查看偏差', action: 'check_deviation' },
        ],
      };

    default:
      return {
        confirmation: '已收到现场反馈',
        impactAssessment: '信息已记录',
        question: '是否需要进一步分析？',
        options: [
          { label: '分析', action: 'analyze' },
          { label: '忽略', action: 'dismiss' },
        ],
      };
  }
}
