/** 學習流程嘅網址，集中喺度砌，避免各頁面自己拼字串 */
export const routes = {
  home: () => "/",
  module: (moduleId: string) => `/learn/${moduleId}`,
  writingType: (moduleId: string, writingTypeId: string) =>
    `/learn/${moduleId}/${writingTypeId}`,
  questionType: (moduleId: string, writingTypeId: string, questionTypeId: string) =>
    `/learn/${moduleId}/${writingTypeId}/${questionTypeId}`,
  topic: (moduleId: string, writingTypeId: string, questionTypeId: string, topicId: string) =>
    `/learn/${moduleId}/${writingTypeId}/${questionTypeId}/${topicId}`,
};

/** 英文作文：English Writing → 類別 → 圖片格式 → 題目 */
export const englishRoutes = {
  home: () => "/english-writing",
  category: (categoryId: string) => `/english-writing/${categoryId}`,
  format: (categoryId: string, formatId: string) => `/english-writing/${categoryId}/${formatId}`,
  lesson: (categoryId: string, formatId: string, lessonId: string) =>
    `/english-writing/${categoryId}/${formatId}/${lessonId}`,
};
