/**
 * Sample person records for preview / fallback use.
 * Extracted from apps/host/src/data/data.js
 */

export type PersonRecord = {
  id: number | string;
  name: string;
  authorSlug?: string | null;
  slug?: string | null;
  title?: string;
  type?: string;
  avatar?: string;
  bio?: string;
  popularity?: number;
  storyCount?: number;
  lifeEvents?: Array<{ year: number; title: string; description: string }>;
};

export type PersonPostRecord = {
  id: number | string;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  date: string;
  personId: number | string;
  readCount?: number;
};

export const people: PersonRecord[] = [
  {
    id: 1,
    name: "王明远",
    authorSlug: "wang-mingyuan",
    title: "退休教师",
    type: "real",
    avatar: "/images/people/02-people.png",
    bio: "40年教龄的语文教师，退休后致力于社区教育和传统文化传承",
    popularity: 95,
    storyCount: 12,
    lifeEvents: [
      { year: 1965, title: "出生", description: "出生于书香门第" },
      { year: 1985, title: "开始教书", description: "成为一名中学语文教师" },
      { year: 2005, title: "获得省级优秀教师", description: "因教学成果显著获得表彰" },
      { year: 2020, title: "退休", description: "结束40年教学生涯" },
      { year: 2021, title: "社区教育", description: "开始在社区免费教授书法和古诗词" },
    ],
  },
  {
    id: 2,
    name: "张秀英",
    authorSlug: "zhang-xiuying",
    title: "退休护士",
    type: "real",
    avatar: "/images/people/03-people.png",
    bio: "30年护理经验，退休后成为社区健康顾问和志愿者",
    popularity: 87,
    storyCount: 8,
    lifeEvents: [
      { year: 1968, title: "出生", description: "出生在医疗世家" },
      { year: 1990, title: "成为护士", description: "开始在市级医院工作" },
      { year: 2008, title: "抗震救灾", description: "参与汶川地震医疗救援" },
      { year: 2018, title: "退休", description: "结束30年护理生涯" },
      { year: 2019, title: "社区服务", description: "成为社区健康顾问" },
    ],
  },
  {
    id: 3,
    name: "李大勇",
    authorSlug: "li-dayong",
    title: "退休工程师",
    type: "real",
    avatar: "/images/people/04-people.png",
    bio: "机械工程师，退休后转型为园艺爱好者和社区活动组织者",
    popularity: 78,
    storyCount: 6,
    lifeEvents: [
      { year: 1962, title: "出生", description: "出生在工人家庭" },
      { year: 1984, title: "成为工程师", description: "进入机械制造厂工作" },
      { year: 2010, title: "项目负责人", description: "负责大型工业项目" },
      { year: 2017, title: "退休", description: "结束工程师生涯" },
      { year: 2018, title: "园艺生活", description: "开始专注于园艺和社区活动" },
    ],
  },
  {
    id: 4,
    name: "刘奶奶",
    authorSlug: "liu-nainai",
    title: "社区活动家",
    type: "real",
    avatar: "/images/people/05-people.png",
    bio: "退休纺织工人，现在是社区舞蹈队领队和活动组织者",
    popularity: 92,
    storyCount: 10,
    lifeEvents: [
      { year: 1955, title: "出生", description: "出生在纺织工人家庭" },
      { year: 1975, title: "纺织工人", description: "进入纺织厂工作" },
      { year: 2005, title: "退休", description: "结束30年纺织工作" },
      { year: 2006, title: "组建舞蹈队", description: "成立社区第一支老年舞蹈队" },
      { year: 2015, title: "社区活动家", description: "成为社区活动主要组织者" },
    ],
  },
  {
    id: 5,
    name: "陈爷爷",
    authorSlug: "chen-yeye",
    title: "退休木匠",
    type: "real",
    avatar: "/images/people/06-people.png",
    bio: "传统木匠，退休后致力于木工技艺传承和手工艺品制作",
    popularity: 83,
    storyCount: 7,
    lifeEvents: [
      { year: 1958, title: "出生", description: "出生在手工艺人家庭" },
      { year: 1978, title: "学徒", description: "开始学习木工技艺" },
      { year: 1985, title: "独立木匠", description: "开设自己的木工作坊" },
      { year: 2018, title: "退休", description: "结束40年木工生涯" },
      { year: 2019, title: "技艺传承", description: "开始教授年轻人传统木工技艺" },
    ],
  },
  {
    id: 6,
    name: "孙悟空",
    slug: "sun-wukong",
    title: "齐天大圣",
    type: "fictional",
    avatar: "/images/people/07-wukong.png",
    bio: "《西游记》中的神话人物，历经九九八十一难取得真经",
    popularity: 99,
    storyCount: 15,
    lifeEvents: [
      { year: -500, title: "诞生", description: "从石头中诞生" },
      { year: -480, title: "学艺", description: "拜师菩提老祖学习法术" },
      { year: -460, title: "大闹天宫", description: "因不满天庭封官而反抗" },
      { year: -450, title: "被压五行山", description: "被如来佛祖压在五行山下" },
      { year: -400, title: "保护唐僧", description: "被唐僧救出，保护其西天取经" },
    ],
  },
];

export const authors: PersonRecord[] = [
  {
    id: 1,
    name: "王明远",
    authorSlug: "wang-mingyuan",
    title: "退休教师",
    type: "real",
    avatar: "/images/people/02-people.png",
    bio: "40年教龄的语文教师，退休后致力于社区教育和传统文化传承",
    popularity: 95,
    storyCount: 12,
    lifeEvents: [
      { year: 1965, title: "出生", description: "出生于书香门第" },
      { year: 1985, title: "开始教书", description: "成为一名中学语文教师" },
      { year: 2005, title: "获得省级优秀教师", description: "因教学成果显著获得表彰" },
      { year: 2020, title: "退休", description: "结束40年教学生涯" },
      { year: 2021, title: "社区教育", description: "开始在社区免费教授书法和古诗词" },
    ],
  },
  {
    id: 2,
    name: "张月",
    authorSlug: "zhang-yue",
    title: "退休护士",
    type: "real",
    avatar: "/images/people/03-people.png",
    bio: "30年护理经验，退休后成为社区健康顾问和志愿者",
    popularity: 87,
    storyCount: 8,
    lifeEvents: [
      { year: 1968, title: "出生", description: "出生在医疗世家" },
      { year: 1990, title: "成为护士", description: "开始在市级医院工作" },
      { year: 2008, title: "抗震救灾", description: "参与汶川地震医疗救援" },
      { year: 2018, title: "退休", description: "结束30年护理生涯" },
      { year: 2019, title: "社区服务", description: "成为社区健康顾问" },
    ],
  },
  {
    id: 3,
    name: "李大",
    authorSlug: "li-da",
    title: "退休工程师",
    type: "real",
    avatar: "/images/people/04-people.png",
    bio: "机械工程师，退休后转型为园艺爱好者和社区活动组织者",
    popularity: 78,
    storyCount: 6,
    lifeEvents: [
      { year: 1962, title: "出生", description: "出生在工人家庭" },
      { year: 1984, title: "成为工程师", description: "进入机械制造厂工作" },
      { year: 2010, title: "项目负责人", description: "负责大型工业项目" },
      { year: 2017, title: "退休", description: "结束工程师生涯" },
      { year: 2018, title: "园艺生活", description: "开始专注于园艺和社区活动" },
    ],
  },
];

export const posts: PersonPostRecord[] = [
  { id: 1, title: "我的四十年教学生涯", excerpt: "回顾四十年的教学生涯，从青涩的新教师到经验丰富的老教师，见证了中国教育的巨大变迁。", image: "/images/stories/01-story.png", date: "2023-05-15", personId: 1, readCount: 1245 },
  { id: 2, title: "从护士到社区健康顾问", excerpt: "退休后如何将专业护理知识应用到社区服务中，帮助更多老年人关注健康问题。", image: "/images/stories/02-story.png", date: "2023-04-22", personId: 2, readCount: 892 },
  { id: 3, title: "工程师的园艺人生", excerpt: "从精密机械到花花草草，退休生活的美丽转变。", image: "/images/stories/03-story.jpg", date: "2023-03-10", personId: 3, readCount: 756 },
  { id: 4, title: "社区舞蹈队的二十年", excerpt: "如何通过舞蹈让退休生活充满活力和快乐。", image: "/images/stories/04-story.jpg", date: "2023-02-18", personId: 4, readCount: 1103 },
  { id: 5, title: "传统木工技艺的传承", excerpt: "退休木匠如何将传统技艺传授给年轻一代。", image: "/images/stories/05-story.jpg", date: "2023-01-05", personId: 5, readCount: 678 },
  { id: 6, title: "大闹天宫的背后故事", excerpt: "孙悟空大闹天宫的真实原因和心理变化。", image: "/images/stories/06-story.jpg", date: "2022-12-20", personId: 6, readCount: 2156 },
  { id: 7, title: "退休生活的心理调适", excerpt: "如何从忙碌的工作状态过渡到悠闲的退休生活。", image: "/images/stories/07-story.jpg", date: "2022-11-30", personId: 1, readCount: 943 },
  { id: 8, title: "社区志愿服务心得", excerpt: "参与社区志愿服务的心得体会。", image: "/images/stories/08-story.jpg", date: "2022-10-15", personId: 2, readCount: 721 },
  { id: 9, title: "拜师学艺的开端", excerpt: "从石猴到学徒，第一次真正理解责任与边界的章节。", image: "/images/stories/06-story.jpg", date: "2022-09-20", personId: 6, readCount: 1820 },
  { id: 10, title: "取经路上的心路转折", excerpt: "走入取经旅程后，如何与同伴协作、如何面对自我。", image: "/images/stories/06-story.jpg", date: "2022-07-15", personId: 6, readCount: 1674 },
  { id: 11, title: "五行山下的静默修行", excerpt: "在沉静与等待里，重新理解力量与耐心的章节。", image: "/images/stories/06-story.jpg", date: "2022-05-10", personId: 6, readCount: 1398 },
  { id: 12, title: "师徒同行的伙伴关系", excerpt: "从单打独斗到并肩前行，重新看见团队协作的意义。", image: "/images/stories/06-story.jpg", date: "2022-03-01", personId: 6, readCount: 1502 },
];
