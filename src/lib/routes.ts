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
